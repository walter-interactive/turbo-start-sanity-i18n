/**
 * Feature Cards with Icon Block Schema
 *
 * PURPOSE:
 * Displays a grid of feature cards, each with an icon, title, and rich text description.
 * Used to showcase product features, service offerings, or key benefits in a visually
 * organized layout.
 *
 * KEY FEATURES:
 * - Header section: Optional eyebrow, title, and rich text intro
 * - Icon picker: Uses sanity-plugin-icon-picker for visual icons
 * - Nested cards: Array of card objects with icon, title, and description
 * - Flexible layout: Frontend determines grid columns (typically 2-4 columns)
 *
 * I18N SUPPORT: No - This is a page builder block, not a standalone document
 * ORDERING: No - Positioned within pageBuilder array
 * SINGLETON: No - Multiple instances allowed per page
 *
 * SPECIAL BEHAVIORS:
 * - Icon preview: Shows icon visual in Studio preview using preview() helper
 * - Nested object structure: featureCardIcon is defined inline, not as separate schema
 *
 * USAGE LOCATIONS:
 * - Available in pageBuilder array for any page/document type
 * - Commonly used on landing pages, product pages, and service pages
 */

import { LayoutGrid } from "lucide-react";
import { defineField, defineType } from "sanity";
import { preview } from "sanity-plugin-icon-picker";

import { customRichText } from "@walter/sanity-atoms/schemas/rich-text";

const featureCardIcon = defineField({
  name: "featureCardIcon",
  type: "object",
  fields: [
    defineField({
      name: "icon",
      title: "Icon",
      options: {
        storeSvg: true,
        providers: ["fi"],
      },
      type: "iconPicker",
      description:
        "Choose a small picture symbol to represent this item, like a home icon or shopping cart",
    }),
    defineField({
      name: "title",
      type: "string",
      description: "The heading text for this feature card",
    }),
    customRichText(["block"]),
  ],
  preview: {
    select: {
      title: "title",
      icon: "icon",
    },
    prepare: ({ title, icon }) => ({
      title: `${title ?? "Untitled"}`,
      media: icon ? preview(icon) : null,
    }),
  },
});

export const featureCardsIconSchema = defineType({
  name: "featureCardsIcon",
  type: "object",
  icon: LayoutGrid,
  description:
    "A grid of feature cards, each with an icon, title and description",
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional text that appears above the main title",
    }),
    defineField({
      name: "title",
      type: "string",
      description: "The main heading for this feature section",
    }),
    customRichText(["block"]),
    defineField({
      name: "cards",
      type: "array",
      description: "The individual feature cards to display in the grid",
      of: [featureCardIcon],
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title,
      subtitle: "Feature Cards with Icon",
    }),
  },
});
