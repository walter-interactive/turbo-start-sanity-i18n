/**
 * Home Page Document Schema
 *
 * PURPOSE:
 * Defines the main landing page (/) for the website with flexible page builder content,
 * SEO fields, and Open Graph metadata. Only one home page exists per language.
 *
 * KEY FEATURES:
 * - Title and description: Main heading and meta description
 * - Page builder: Flexible content composition using drag-and-drop blocks
 * - SEO fields: Meta description, keywords, robots directives (excluding noIndex/hideFromLists)
 * - Open Graph: Social sharing metadata for Facebook, Twitter, etc.
 * - Custom slug: Must be exactly "/" (enforced by validation)
 * - Field groups: Organized into Main Content, SEO, and Open Graph tabs
 *
 * I18N SUPPORT: Yes - Fully translatable (French, English, Spanish)
 * ORDERING: No - Singleton per language (only one home page per language)
 * SINGLETON: Yes - One instance per language
 *
 * SPECIAL BEHAVIORS:
 * - Slug validation: Home page slug must be exactly "/" (see documentSlugField)
 * - Meta description validation: Warns if < 140 or > 160 characters for SEO
 * - SEO field filtering: Excludes seoNoIndex and seoHideFromLists (not applicable to home)
 * - Field groups: Uses GROUPS constant for consistent tab organization
 *
 * RELATED TYPES:
 * - pageBuilder: Defines available content blocks (hero, CTA, etc.)
 * - languageField: Language selection for i18n support
 *
 * USAGE LOCATIONS:
 * - Studio sidebar: apps/studio/structure.ts (Home section)
 * - Frontend queries: apps/web likely queries by language for / route
 */

import { HomeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { GROUP, GROUPS } from "../../utils/constant";
import { ogFields } from "../../utils/og-fields";
import { seoFields } from "../../utils/seo-fields";
import { documentSlugField, languageField, pageBuilderField } from "../common";

export const homePage = defineType({
  name: "homePage",
  type: "document",
  title: "Home Page",
  icon: HomeIcon,
  description:
    "This is where you create the main page visitors see when they first come to your website. Think of it like the front door to your online home - you can add a welcoming title, a short description, and build the page with different sections like pictures, text, and buttons.",
  groups: GROUPS,
  fields: [
    languageField,
    defineField({
      name: "title",
      type: "string",
      description:
        "The main heading that will appear at the top of your home page",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description:
        "A short summary that tells visitors what your website is about. This text also helps your page show up in Google searches.",
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
    documentSlugField("homePage", {
      group: GROUP.MAIN_CONTENT,
    }),
    pageBuilderField,
    ...seoFields.filter(
      (field) => !["seoNoIndex", "seoHideFromLists"].includes(field.name)
    ),
    ...ogFields,
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
    },
    prepare: ({ title, slug }) => ({
      title: title || "Untitled Home Page",
      media: HomeIcon,
      subtitle: slug || "Home Page",
    }),
  },
});
