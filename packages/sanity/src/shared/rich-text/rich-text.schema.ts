/**
 * Rich Text (Portable Text) Definition Schema
 *
 * PURPOSE:
 * Configurable rich text editor that supports headings, lists, links, images, and
 * custom formatting. Powers all long-form content across the site with a standardized
 * editing experience.
 *
 * KEY FEATURES:
 * - Block styles: Normal text, H2-H6 headings, inline text
 * - Lists: Numbered and bulleted lists
 * - Text formatting: Bold, italic, code decorators
 * - Custom links: Internal/external links using customUrl
 * - Inline images: Images with optional captions and hotspot support
 *
 * I18N SUPPORT: No - This is a reusable definition, not a standalone document
 * ORDERING: No - Used as a field within other schemas
 * SINGLETON: No - Multiple instances allowed per parent document
 *
 * SPECIAL BEHAVIORS:
 * - customRichText helper: Factory function to create custom rich text fields with
 *   selective block types (e.g., only "block" without images)
 * - Type filtering: memberTypes array exports available types for filtering
 * - Portable Text: Uses Sanity's Portable Text specification for structured content
 *
 * EXPORTS:
 * - richText: Full rich text definition with all features
 * - customRichText: Helper function to create custom rich text fields
 * - memberTypes: Array of available member type names for filtering
 *
 * USAGE LOCATIONS:
 * - blog.ts: Body field for blog post content
 * - CTA blocks: Description fields with customRichText(["block"])
 * - Hero blocks: Description fields with customRichText(["block"])
 * - Any schema needing formatted text content
 */

import { ImageIcon, LinkIcon } from "@sanity/icons";
import {
  type ConditionalProperty,
  defineArrayMember,
  defineField,
  defineType,
} from "sanity";

const richTextMembers = [
  defineArrayMember({
    name: "block",
    type: "block",
    styles: [
      { title: "Normal", value: "normal" },
      { title: "H2", value: "h2" },
      { title: "H3", value: "h3" },
      { title: "H4", value: "h4" },
      { title: "H5", value: "h5" },
      { title: "H6", value: "h6" },
      { title: "Inline", value: "inline" },
    ],
    lists: [
      { title: "Numbered", value: "number" },
      { title: "Bullet", value: "bullet" },
    ],
    marks: {
      annotations: [
        {
          name: "customLink",
          type: "object",
          title: "Internal/External Link",
          icon: LinkIcon,
          fields: [
            defineField({
              name: "customLink",
              type: "customUrl",
            }),
          ],
        },
      ],
      decorators: [
        { title: "Strong", value: "strong" },
        { title: "Emphasis", value: "em" },
        { title: "Code", value: "code" },
      ],
    },
  }),
  defineArrayMember({
    name: "image",
    title: "Image",
    type: "image",
    icon: ImageIcon,
    options: {
      hotspot: true,
    },
    fields: [
      defineField({
        name: "caption",
        type: "string",
        title: "Caption Text",
      }),
    ],
  }),
];

export const richText = defineType({
  name: "richText",
  type: "array",
  of: richTextMembers,
});

export const memberTypes = richTextMembers.map((member) => member.name);

type Type = NonNullable<(typeof memberTypes)[number]>;

export const customRichText = (
  type: Type[],
  options?: {
    name?: string;
    title?: string;
    group?: string[] | string;
    description?: string;
    hidden?: ConditionalProperty;
  }
) => {
  const { name, description, hidden } = options ?? {};
  const customMembers = richTextMembers.filter(
    (member) => member.name && type.includes(member.name)
  );
  return defineField({
    ...options,
    name: name ?? "richText",
    type: "array",
    description: description ?? "",
    hidden,
    of: customMembers,
  });
};
