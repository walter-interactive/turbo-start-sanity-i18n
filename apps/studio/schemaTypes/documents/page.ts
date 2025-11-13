/**
 * Page Document Schema
 *
 * PURPOSE:
 * Represents flexible content pages with modular page builder sections. Used for
 * standard website pages like "About Us", "Contact", "Services", etc. Each page
 * has its own URL slug and supports customizable content blocks.
 *
 * KEY FEATURES:
 * - Page builder integration for modular content sections (hero, CTA, features, etc.)
 * - SEO fields (meta title, description, keywords)
 * - Open Graph fields for social media sharing
 * - Custom slug validation to prevent duplicates per language
 * - Image field with hotspot support for cropping
 *
 * I18N SUPPORT: Yes - Fully translatable (French, English, Spanish)
 * ORDERING: No - Pages are accessed by slug, not ordered lists
 * SINGLETON: No - Multiple pages allowed
 *
 * SPECIAL BEHAVIORS:
 * - Slug validation: Must be unique per language, cannot use reserved paths
 *   (see utils/slug-validation.ts for implementation)
 * - Template filtering: Only `page-fr` template shown by default in global menu
 *   (see sanity.config.ts:264-270 for newDocumentOptions filter)
 * - Language filtering in sidebar: Shows only French (default) pages in sidebar
 *   (see structure.ts:342-353 for language filter implementation)
 *
 * RELATED TYPES:
 * - pageBuilder (definition): Array field containing all available page builder blocks
 * - seo fields (utility): Reusable SEO metadata fields
 * - og fields (utility): Reusable Open Graph social sharing fields
 *
 * USAGE LOCATIONS:
 * - Studio sidebar: apps/studio/structure.ts:342-353 (Pages section with language filter)
 * - Frontend queries: apps/web likely queries by slug + language for page rendering
 */

import { DocumentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { GROUP, GROUPS } from "../../utils/constant";
import { ogFields } from "../../utils/og-fields";
import { seoFields } from "../../utils/seo-fields";
import { documentSlugField, languageField, pageBuilderField } from "../common";

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: DocumentIcon,
  description:
    "Create a new page for your website, like an 'About Us' or 'Contact' page. Each page has its own web address and content that you can customize.",
  groups: GROUPS,
  fields: [
    languageField,
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description:
        "The main heading that appears at the top of your page and in browser tabs",
      group: GROUP.MAIN_CONTENT,
      validation: (Rule) => Rule.required().error("A page title is required"),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description:
        "A brief summary of what this page is about. This text helps search engines understand your page and may appear in search results.",
      rows: 3,
      group: GROUP.MAIN_CONTENT,
      validation: (rule) => [
        rule
          .min(140)
          .warning(
            "The meta description should be at least 140 characters for optimal SEO visibility in search results"
          ),
        rule
          .max(160)
          .warning(
            "The meta description should not exceed 160 characters as it will be truncated in search results"
          ),
      ],
    }),
    documentSlugField("page", {
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "image",
      type: "image",
      title: "Image",
      description:
        "A main picture for this page that can be used when sharing on social media or in search results",
      group: GROUP.MAIN_CONTENT,
      options: {
        hotspot: true,
      },
    }),
    pageBuilderField,
    ...seoFields.filter((field) => field.name !== "seoHideFromLists"),
    ...ogFields,
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      media: "image",
      isPrivate: "seoNoIndex",
      hasPageBuilder: "pageBuilder",
    },
    prepare: ({ title, slug, media, isPrivate, hasPageBuilder }) => {
      return {
        title: `${title || "Untitled Page"}`,
        subtitle: `${slug || "no-slug"}`,
        media,
      };
    },
  },
});
