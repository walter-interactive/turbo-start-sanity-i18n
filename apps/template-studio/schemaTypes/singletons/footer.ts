/**
 * Footer Document Schema
 *
 * PURPOSE:
 * Configures the site footer with subtitle text and multi-column link organization.
 * One footer document exists per language for localized content.
 *
 * KEY FEATURES:
 * - Subtitle: Text displayed beneath the logo in footer
 * - Column layout: Organize links into labeled sections
 * - Flexible structure: Multiple columns with multiple links per column
 * - Label field: Internal CMS identifier (typically "Footer")
 *
 * I18N SUPPORT: Yes - Fully translatable (French, English, Spanish)
 * ORDERING: No - Singleton per language
 * SINGLETON: Yes - One instance per language
 *
 * SPECIAL BEHAVIORS:
 * - Nested objects: footerColumn and footerColumnLink defined inline
 * - URL preview: Shows truncated URLs (30 chars) with new tab indicator (↗)
 * - Simple structure: Less complex than navbar (no icons or descriptions)
 *
 * NESTED TYPES:
 * - footerColumn: Group of links with a title
 * - footerColumnLink: Link with name and URL
 *
 * RELATED TYPES:
 * - customUrl: Used for internal/external link configuration
 * - languageField: Language selection for i18n support
 *
 * USAGE LOCATIONS:
 * - Studio sidebar: apps/studio/structure.ts (Footer section)
 * - Frontend: Footer component queries footer by language
 */

import { LayoutPanelLeft, Link, PanelBottom } from "lucide-react";
import { defineField, defineType } from "sanity";

import { languageField } from "../common";

const footerColumnLink = defineField({
  name: "footerColumnLink",
  type: "object",
  icon: Link,
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Name",
      description: "Name for the link",
    }),
    defineField({
      name: "url",
      type: "customUrl",
    }),
  ],
  preview: {
    select: {
      title: "name",
      externalUrl: "url.external",
      urlType: "url.type",
      internalUrl: "url.internal.slug.current",
      openInNewTab: "url.openInNewTab",
    },
    prepare({ title, externalUrl, urlType, internalUrl, openInNewTab }) {
      const url = urlType === "external" ? externalUrl : internalUrl;
      const newTabIndicator = openInNewTab ? " ↗" : "";
      const truncatedUrl =
        url?.length > 30 ? `${url.substring(0, 30)}...` : url;

      return {
        title: title || "Untitled Link",
        subtitle: `${urlType === "external" ? "External" : "Internal"} • ${truncatedUrl}${newTabIndicator}`,
        media: Link,
      };
    },
  },
});

const footerColumn = defineField({
  name: "footerColumn",
  type: "object",
  icon: LayoutPanelLeft,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "Title for the column",
    }),
    defineField({
      name: "links",
      type: "array",
      title: "Links",
      description: "Links for the column",
      of: [footerColumnLink],
    }),
  ],
  preview: {
    select: {
      title: "title",
      links: "links",
    },
    prepare({ title, links = [] }) {
      return {
        title: title || "Untitled Column",
        subtitle: `${links.length} link${links.length === 1 ? "" : "s"}`,
      };
    },
  },
});

export const footer = defineType({
  name: "footer",
  type: "document",
  title: "Footer",
  description: "Footer content for your website",
  fields: [
    languageField,
    defineField({
      name: "label",
      type: "string",
      initialValue: "Footer",
      title: "Label",
      description: "Label used to identify footer in the CMS",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subtitle",
      type: "text",
      rows: 2,
      title: "Subtitle",
      description: "Subtitle that sits beneath the logo in the footer",
    }),
    defineField({
      name: "columns",
      type: "array",
      title: "Columns",
      description: "Columns for the footer",
      of: [footerColumn],
    }),
  ],
  preview: {
    select: {
      title: "label",
    },
    prepare: ({ title }) => ({
      title: title || "Untitled Footer",
      media: PanelBottom,
    }),
  },
});
