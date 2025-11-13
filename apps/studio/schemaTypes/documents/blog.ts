/**
 * Blog Post Document Schema
 *
 * PURPOSE:
 * Represents individual blog posts with author attribution, rich text content,
 * and manual ordering support. Used for the main blog section of the website.
 * Blog posts are displayed on a blog index page and have their own detail pages.
 *
 * KEY FEATURES:
 * - Rich text editor with custom marks (links, highlights) and blocks
 * - Author reference for attribution (links to author document)
 * - SEO fields (meta description, OG image, keywords)
 * - Open Graph fields for social media sharing
 * - Custom slug validation to prevent duplicates per language
 * - Manual ordering via drag-and-drop in Studio (orderableDocumentList plugin)
 * - Published date field for chronological display
 *
 * I18N SUPPORT: Yes - Fully translatable (French, English, Spanish)
 * ORDERING: Yes - Uses orderableDocumentList plugin for manual drag-and-drop ordering
 * SINGLETON: No - Multiple blog posts allowed
 *
 * SPECIAL BEHAVIORS:
 * - orderRank field quirk: Only updates on dragged document, NOT translations
 *   Frontend queries must use: order(coalesce(__i18n_base->orderRank, orderRank))
 *   (see structure.ts:106-132 remarks for detailed explanation)
 * - Slug validation: Must be unique per language, cannot use reserved paths
 *   (see utils/slug-validation.ts for implementation)
 * - Template filtering: Only `blog-fr` template shown by default in global menu
 *   (see sanity.config.ts:264-270 for newDocumentOptions filter)
 * - Author reference: Cannot create new authors inline (disableNew: true)
 * - Preview with emoji indicators: Shows visibility status, author, and date
 *
 * RELATED TYPES:
 * - blogIndex (document): Landing page for blog section
 * - author (document): Referenced for author attribution
 * - richText (definition): Used for body field with custom formatting
 * - seo fields (utility): Reusable SEO metadata fields
 * - og fields (utility): Reusable Open Graph social sharing fields
 *
 * USAGE LOCATIONS:
 * - Studio sidebar: apps/studio/structure.ts:364-369 (Blog section with orderable items)
 * - Frontend queries: apps/web likely queries by language + orderRank for blog listing
 */

import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import { FileTextIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { GROUP, GROUPS } from "../../utils/constant";
import { ogFields } from "../../utils/og-fields";
import { seoFields } from "../../utils/seo-fields";
import { documentSlugField, languageField } from "../common";

export const blog = defineType({
  name: "blog",
  title: "Blog",
  type: "document",
  icon: FileTextIcon,
  groups: GROUPS,
  orderings: [orderRankOrdering],
  description:
    "A blog post that will be published on the website. Add a title, description, author, and content to create a new article for readers.",
  fields: [
    orderRankField({ type: "blog" }),
    languageField,
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "The headline of your blog post that readers will see first",
      group: GROUP.MAIN_CONTENT,
      validation: (Rule) => Rule.required().error("A blog title is required"),
    }),
    defineField({
      title: "Description",
      name: "description",
      type: "text",
      rows: 3,
      description:
        "A short summary of what your blog post is about (appears in search results)",
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
    documentSlugField("blog", {
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "authors",
      type: "array",
      title: "Authors",
      description: "Who wrote this blog post (select from existing authors)",
      of: [
        defineArrayMember({
          type: "reference",
          to: [
            {
              type: "author",
              options: {
                disableNew: true,
              },
            },
          ],
          options: {
            disableNew: true,
          },
        }),
      ],
      validation: (Rule) => [
        Rule.required(),
        Rule.max(1),
        Rule.min(1),
        Rule.unique(),
      ],
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "publishedAt",
      type: "date",
      initialValue: () => new Date().toISOString().split("T")[0],
      title: "Published At",
      description:
        "The date when your blog post will appear to have been published",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "image",
      title: "Image",
      description:
        "The main picture that will appear at the top of your blog post and in previews",
      type: "image",
      group: GROUP.MAIN_CONTENT,
      validation: (Rule) => Rule.required(),
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "richText",
      type: "richText",
      description:
        "The main content of your blog post with text, images, and formatting",
      group: GROUP.MAIN_CONTENT,
    }),
    ...seoFields,
    ...ogFields,
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
      isPrivate: "seoNoIndex",
      isHidden: "seoHideFromLists",
      slug: "slug.current",
      author: "authors.0.name",
      publishDate: "publishedAt",
    },
    prepare: ({
      title,
      media,
      isPrivate,
      isHidden,
      author,
      slug,
      publishDate,
    }) => {
      // Status indicators
      let visibility = "🌎 Public";
      if (isPrivate) {
        visibility = "🔒 Private";
      } else if (isHidden) {
        visibility = "🙈 Hidden";
      }

      // Author and date
      const authorInfo = author ? `✍️ ${author}` : "👻 No author";
      const dateInfo = publishDate
        ? `📅 ${new Date(publishDate).toLocaleDateString()}`
        : "⏳ Draft";

      return {
        title: title || "Untitled Blog",
        media,
        subtitle: `🔗 ${slug} | ${visibility} | ${authorInfo} | ${dateInfo}`,
      };
    },
  },
});
