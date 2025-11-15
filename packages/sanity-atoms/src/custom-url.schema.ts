/**
 * Custom URL Definition Schema
 *
 * PURPOSE:
 * Flexible link configuration that supports both internal page references and external
 * URLs with validation. Used throughout the site for all link types (buttons, navigation,
 * cards) to maintain consistency and ensure proper link handling.
 */

import { defineField, defineType } from "sanity";

const allLinkableTypes = [
  { type: "blog" },
  { type: "blogIndex" },
  { type: "page" },
];

export const customUrlSchema = defineType({
  name: "customUrl",
  type: "object",
  description:
    "Configure a link that can point to either an internal page or external website",
  fields: [
    defineField({
      name: "type",
      type: "string",
      description:
        "Choose whether this link points to another page on your site (internal) or to a different website (external)",
      options: {
        layout: "radio",
        list: [
          { title: "Internal", value: "internal" },
          { title: "External", value: "external" },
        ],
      },
      initialValue: () => "external",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "openInNewTab",
      title: "Open in new tab",
      type: "boolean",
      description:
        "When enabled, clicking this link will open the destination in a new browser tab instead of navigating away from the current page",
      initialValue: () => false,
    }),
    defineField({
      name: "external",
      type: "string",
      title: "URL",
      description:
        "Enter either a full web address (URL) starting with https:// for external sites, or a relative path like /about for internal pages",
      hidden: ({ parent }) => parent?.type !== "external",
      validation: (Rule) => [
        Rule.custom((value, { parent }) => {
          const type = (parent as { type?: string })?.type;
          if (type === "external") {
            if (!value) {
              return "URL can't be empty";
            }
            // Inline isValidUrl logic
            try {
              new URL(value);
              return true;
            } catch {
              // Check if it's a relative URL
              const isRelative =
                value.startsWith("/") ||
                value.startsWith("#") ||
                value.startsWith("?");
              if (!isRelative) {
                return "Invalid URL";
              }
            }
          }
          return true;
        }),
      ],
    }),
    defineField({
      name: "href",
      type: "string",
      description:
        "Technical field used internally to store the complete URL - you don't need to modify this",
      initialValue: () => "#",
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: "internal",
      type: "reference",
      description:
        "Select which page on your website this link should point to",
      options: { disableNew: true },
      hidden: ({ parent }) => parent?.type !== "internal",
      to: allLinkableTypes,
      validation: (rule) => [
        rule.custom((value, { parent }) => {
          const type = (parent as { type?: string })?.type;
          if (type === "internal" && !value?._ref) {
            return "internal can't be empty";
          }
          return true;
        }),
      ],
    }),
  ],
  preview: {
    select: {
      externalUrl: "external",
      urlType: "type",
      internalUrl: "internal.slug.current",
      openInNewTab: "openInNewTab",
    },
    prepare({ externalUrl, urlType, internalUrl, openInNewTab }) {
      const url = urlType === "external" ? externalUrl : `${internalUrl}`;
      const newTabIndicator = openInNewTab ? " ↗" : "";
      return {
        title: `${urlType === "external" ? "External" : "Internal"} Link`,
        subtitle: `${url}${newTabIndicator}`,
      };
    },
  },
});
