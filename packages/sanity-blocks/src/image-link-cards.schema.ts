/**
 * Image Link Cards Block Schema
 *
 * PURPOSE:
 * Displays a collection of clickable cards with images, titles, descriptions, and links.
 * Used for showcasing related content, categories, or navigation sections with visual appeal.
 *
 * KEY FEATURES:
 * - Header section: Optional eyebrow, title, rich text intro, and buttons
 * - Card grid: Array of card objects with image, title, description, and customUrl
 * - Link indicators: Preview shows internal/external link and new tab indicator (↗)
 * - Flexible linking: Uses customUrl for internal page or external URL links
 *
 * I18N SUPPORT: No - This is a page builder block, not a standalone document
 * ORDERING: No - Positioned within pageBuilder array
 * SINGLETON: No - Multiple instances allowed per page
 *
 * SPECIAL BEHAVIORS:
 * - Preview metadata: Shows card count in preview subtitle
 * - Link preview: Displays URL and new tab indicator in card preview
 * - Nested object structure: imageLinkCard is defined inline, not as separate schema
 *
 * RELATED TYPES:
 * - customUrl: Used for internal/external link configuration
 *
 * USAGE LOCATIONS:
 * - Available in pageBuilder array for any page/document type
 * - Commonly used for resource sections, category navigation, and related content
 */

import { ImageIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { buttonsGroupSchema } from "@walter/sanity-atoms/schemas/buttons";
import { customRichText } from "@walter/sanity-atoms/schemas/rich-text";

const imageLinkCard = defineField({
  name: "imageLinkCard",
  type: "object",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "title",
      title: "Card Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Card Description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Card Image",
      type: "image",
      description: "Add an image or illustration for this card",
    }),
    defineField({
      name: "url",
      title: "Link URL",
      type: "customUrl",
    }),
  ],
  preview: {
    select: {
      title: "title",
      description: "description",
      media: "image",
      externalUrl: "url.external",
      urlType: "url.type",
      internalUrl: "url.internal.slug.current",
      openInNewTab: "url.openInNewTab",
    },
    prepare: ({
      title,
      description,
      media,
      externalUrl,
      urlType,
      internalUrl,
      openInNewTab,
    }) => {
      const url = urlType === "external" ? externalUrl : internalUrl;
      const newTabIndicator = openInNewTab ? " ↗" : "";

      return {
        title: title || "Untitled Card",
        subtitle: description + (url ? ` • ${url}${newTabIndicator}` : ""),
        media,
      };
    },
  },
});

export const imageLinkCardsSchema = defineType({
  name: "imageLinkCards",
  type: "object",
  icon: ImageIcon,
  title: "Image Link Cards",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow Text",
      type: "string",
      description: "Optional text displayed above the title",
    }),
    defineField({
      name: "title",
      title: "Section Title",
      type: "string",
      description: "The main heading for this cards section",
      validation: (Rule) => Rule.required(),
    }),
    customRichText(["block"]),
    buttonsGroupSchema,
    defineField({
      name: "cards",
      title: "Cards",
      type: "array",
      of: [imageLinkCard],
    }),
  ],
  preview: {
    select: {
      title: "title",
      eyebrow: "eyebrow",
      cards: "cards",
    },
    prepare: ({ title, eyebrow, cards = [] }) => ({
      title: title || "Image Link Cards",
      subtitle: `${eyebrow ? `${eyebrow} • ` : ""}${cards.length} card${cards.length === 1 ? "" : "s"}`,
    }),
  },
});
