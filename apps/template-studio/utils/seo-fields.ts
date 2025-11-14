/**
 * SEO Field Definitions
 *
 * Provides a reusable array of SEO-related fields for document schemas.
 * These fields allow content editors to override default SEO metadata
 * (title, description, image, indexing) on a per-document basis.
 *
 * All fields are optional overrides - if left blank, the system falls back to
 * the document's primary fields (title, description, image).
 *
 * @example
 * ```typescript
 * // In a page schema
 * defineType({
 *   name: "page",
 *   type: "document",
 *   groups: GROUPS,
 *   fields: [
 *     ...seoFields, // Adds all SEO fields with proper grouping
 *     // other fields...
 *   ]
 * })
 * ```
 *
 * @remarks
 * These fields are grouped under GROUP.SEO, which displays them in a
 * separate "SEO" tab in the Studio editor for better organization.
 */

import { defineField } from "sanity";

import { GROUP } from "./constant";

/**
 * Array of SEO field definitions
 *
 * Fields included:
 * - seoTitle: Meta title override (inherits from document title if blank)
 * - seoDescription: Meta description override (max 160 chars)
 * - seoImage: OG/Twitter image override
 * - seoNoIndex: Exclude from search engine indexing
 * - seoHideFromLists: Exclude from archive/list pages
 */
export const seoFields = [
  defineField({
    name: "seoTitle",
    title: "SEO meta title override",
    description:
      "This will override the meta title. If left blank it will inherit the page title.",
    type: "string",
    validation: (rule) => rule.warning("A page title is required"),
    group: GROUP.SEO,
  }),
  defineField({
    name: "seoDescription",
    title: "SEO meta description override",
    description:
      "This will override the meta description. If left blank it will inherit the description from the page description.",
    type: "text",
    rows: 2,
    validation: (rule) => [
      rule.warning("A description is required"),
      rule.max(160).warning("No more than 160 characters"),
    ],
    group: GROUP.SEO,
  }),
  defineField({
    name: "seoImage",
    title: "SEO image override",
    description:
      "This will override the main image. If left blank it will inherit the image from the main image.",
    type: "image",
    group: GROUP.SEO,
    options: {
      hotspot: true,
    },
  }),
  defineField({
    name: "seoNoIndex",
    title: "Do not index this page",
    description: "If checked, this content won't be indexed by search engines.",
    type: "boolean",
    initialValue: () => false,
    group: GROUP.SEO,
  }),
  defineField({
    name: "seoHideFromLists",
    title: "Hide from lists",
    description: "If checked, this content won't appear in any list pages.",
    type: "boolean",
    initialValue: () => false,
    group: GROUP.SEO,
  }),
];
