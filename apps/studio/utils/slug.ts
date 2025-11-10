import type { SanityDocument } from "@sanity/client";
import {
  defineField,
  type FieldDefinition,
  getDraftId,
  getPublishedId,
  type SlugifierFn,
  type SlugValidationContext,
} from "sanity";
import slugify from "slugify";

import type { PathnameParams } from "./types";

function hasLanguageField(
  doc: SanityDocument | null | undefined
): doc is SanityDocument & { language: string } {
  return (
    doc !== null &&
    doc !== undefined &&
    "language" in doc &&
    typeof doc.language === "string"
  );
}

export function defineSlug(
  schema: PathnameParams = { name: "slug" }
): FieldDefinition<"slug"> {
  const slugOptions = schema?.options;

  return defineField({
    ...schema,
    name: schema.name ?? "slug",
    title: schema?.title ?? "URL",
    type: "slug",
    components: {
      ...schema.components,
      // field: schema.components?.field ?? PathnameFieldComponent,
    },
    options: {
      ...(slugOptions ?? {}),
      isUnique: slugOptions?.isUnique ?? isUnique,
    },
  });
}

export async function isUnique(
  slug: string,
  context: SlugValidationContext
): Promise<boolean> {
  const { document, getClient } = context;
  const client = getClient({ apiVersion: "2025-02-10" });
  const id = getPublishedId(document?._id ?? "");
  const draftId = getDraftId(id);

  // Extract language from document if it exists (for i18n documents)
  const language = hasLanguageField(document) ? document.language : undefined;

  const params = {
    draft: draftId,
    published: id,
    slug,
    ...(language && { language }),
  };

  // If the document has a language field, check uniqueness per language
  // Otherwise, check globally (for backwards compatibility with non-i18n documents)
  const query = language
    ? "*[!(_id in [$draft, $published]) && slug.current == $slug && language == $language]"
    : "*[!(_id in [$draft, $published]) && slug.current == $slug]";

  const result = await client.fetch(query, params);
  return result.length === 0;
}

export const getDocTypePrefix = (type: string) => {
  if (["page"].includes(type)) {
    return "";
  }
  return type;
};

const slugMapper = {
  homePage: "/",
  blogIndex: "/blog",
} as Record<string, string>;

export const createSlug: SlugifierFn = (input, _, { parent }) => {
  const { _type } = parent as {
    _type: string;
  };

  if (slugMapper[_type]) {
    return slugMapper[_type];
  }

  const prefix = getDocTypePrefix(_type);

  const slug = slugify(input, {
    lower: true,
    remove: /[^a-zA-Z0-9 ]/g,
  });

  return `/${[prefix, slug].filter(Boolean).join("/")}`;
};
