/**
 * Call-to-Action (CTA) Block Schema
 *
 * PURPOSE:
 * Displays a promotional or action-focused section with an optional eyebrow text,
 * title, rich text description, and actionable buttons. Commonly used to drive
 * user engagement or conversions.
 */

import { PhoneIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { buttonsGroupSchema } from "@walter/sanity-atoms/schemas/buttons";
import { customRichText } from "@walter/sanity-atoms/schemas/rich-text";

export const ctaSchema = defineType({
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
    buttonsGroupSchema,
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
