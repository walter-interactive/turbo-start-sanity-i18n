/**
 * Slug Field Configuration and Validation
 *
 * Provides utilities for creating and validating slug fields with i18n support.
 * Slugs are URL-safe identifiers for documents (e.g., "/blog/my-post-title").
 *
 * Key features:
 * - Per-language slug uniqueness for i18n documents
 * - Global slug uniqueness for non-i18n documents
 * - Automatic slug generation from input text
 * - Document type prefixes (e.g., /blog/ for blog posts)
 *
 * @remarks
 * The validation logic checks for duplicate slugs across both draft and published
 * versions of documents. For i18n documents, uniqueness is scoped per language,
 * allowing the same slug in French and English (e.g., /fr/about vs /en/about).
 */

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

/**
 * Type guard to check if document has a language field
 *
 * Used to determine whether to apply per-language or global slug uniqueness.
 *
 * @param doc - The document to check
 * @returns True if document has a valid language field
 */
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

/**
 * Creates a slug field definition with i18n-aware validation
 *
 * This is the primary function for adding slug fields to schemas. It automatically
 * configures uniqueness validation that respects language boundaries for i18n documents.
 *
 * @param schema - Optional configuration (name, title, validation options)
 * @returns Configured slug field definition
 *
 * @example
 * ```typescript
 * // In a schema definition
 * defineType({
 *   name: "page",
 *   fields: [
 *     defineSlug({ name: "slug" }), // Default configuration
 *     // or
 *     defineSlug({ name: "pathname", title: "Page URL" }),
 *   ]
 * })
 * ```
 *
 * @remarks
 * The function uses the custom `isUnique` validator by default, which checks
 * for duplicates per-language for i18n documents or globally for regular documents.
 */
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

/**
 * Validates slug uniqueness with i18n support
 *
 * Checks if a slug is already in use by another document, with special handling
 * for multi-language documents:
 * - For i18n documents (with language field): Checks uniqueness per language
 * - For regular documents: Checks uniqueness globally
 *
 * @param slug - The slug value to validate
 * @param context - Sanity validation context with document and client
 * @returns True if slug is unique (can be used), false if duplicate
 *
 * @example
 * ```typescript
 * // I18n document example:
 * // French doc with slug "/about" can exist alongside
 * // English doc with slug "/about" - both are valid
 *
 * // Regular document example:
 * // Only one document with slug "/contact" can exist globally
 * ```
 *
 * @remarks
 * The validator excludes the current document's draft and published versions
 * from the uniqueness check, allowing you to save changes without conflicts.
 */
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

/**
 * Get document type prefix for slug generation
 *
 * Determines the URL prefix based on document type. For example, blog posts
 * get "/blog/" prefix, while regular pages get no prefix.
 *
 * @param type - The document type name (_type field)
 * @returns URL prefix string (empty for pages, type name for others)
 *
 * @example
 * ```typescript
 * getDocTypePrefix("page") // Returns ""
 * getDocTypePrefix("blog") // Returns "blog"
 * ```
 */
export const getDocTypePrefix = (type: string) => {
  if (["page"].includes(type)) {
    return "";
  }
  return type;
};

/**
 * Special slug mappings for specific document types
 *
 * Some document types should always have fixed slugs (e.g., homepage is always "/").
 * This mapper defines those special cases.
 */
const slugMapper = {
  homePage: "/",
  blogIndex: "/blog",
} as Record<string, string>;

/**
 * Automatically generates slugs from input text
 *
 * This slugifier function is used by Sanity's slug field "Generate" button.
 * It converts input text (usually the document title) into a URL-safe slug.
 *
 * @param input - The text to convert to a slug (usually document title)
 * @param _ - Unused schema type parameter
 * @param context - Contains parent document data including _type
 * @returns Generated slug with proper prefix
 *
 * @example
 * ```typescript
 * // For a blog post titled "My Great Post":
 * createSlug("My Great Post") // Returns "/blog/my-great-post"
 *
 * // For a page titled "About Us":
 * createSlug("About Us") // Returns "/about-us"
 *
 * // For homepage (homePage type):
 * createSlug("Home") // Returns "/" (from slugMapper)
 * ```
 *
 * @remarks
 * - Removes all special characters except alphanumerics and spaces
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Adds document type prefix automatically (e.g., /blog/, /faq/)
 * - Respects special mappings in slugMapper for fixed URLs
 */
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
