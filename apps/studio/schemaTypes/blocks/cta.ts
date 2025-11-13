/**
 * Call-to-Action (CTA) Block Schema
 *
 * PURPOSE:
 * Displays a promotional or action-focused section with an optional eyebrow text,
 * title, rich text description, and actionable buttons. Commonly used to drive
 * user engagement or conversions.
 *
 * KEY FEATURES:
 * - Eyebrow text: Small contextual text above the title
 * - Title: Primary heading for the CTA
 * - Rich text content: Flexible description with formatting support
 * - Multiple buttons: Supports various button styles and links (via buttonsField)
 *
 * I18N SUPPORT: No - This is a page builder block, not a standalone document
 * ORDERING: No - Positioned within pageBuilder array
 * SINGLETON: No - Multiple instances allowed per page
 *
 * USAGE LOCATIONS:
 * - Available in pageBuilder array for any page/document type
 * - Commonly used on landing pages, marketing pages, and conversion funnels
 */

import { PhoneIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { buttonsField } from "../common";
import { customRichText } from "../definitions/rich-text";

export const cta = defineType({
  name: "cta",
  type: "object",
  icon: PhoneIcon,
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description:
        "The smaller text that sits above the title to provide context",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The large text that is the primary focus of the block",
    }),
    customRichText(["block"]),
    buttonsField,
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title,
      subtitle: "CTA Block",
    }),
  },
});
