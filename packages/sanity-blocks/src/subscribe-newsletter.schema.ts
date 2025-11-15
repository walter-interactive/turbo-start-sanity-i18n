/**
 * Subscribe Newsletter Block Schema
 *
 * PURPOSE:
 * Creates a newsletter subscription section with a title, subtitle, and helper text.
 * Frontend integrates with email marketing service (e.g., Mailchimp, ConvertKit) to
 * collect email addresses for marketing campaigns.
 */

import { Mail } from "lucide-react";
import { defineField, defineType } from "sanity";

import { customRichText } from "@walter/sanity-atoms/schemas/rich-text";

export const subscribeNewsletterSchema = defineType({
  name: "subscribeNewsletter",
  title: "Subscribe Newsletter",
  type: "object",
  icon: Mail,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    customRichText(["block"], {
      name: "subTitle",
      title: "SubTitle",
    }),
    customRichText(["block"], {
      name: "helperText",
      title: "Helper Text",
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title ?? "Untitled",
      subtitle: "Subscribe Newsletter",
    }),
  },
});
