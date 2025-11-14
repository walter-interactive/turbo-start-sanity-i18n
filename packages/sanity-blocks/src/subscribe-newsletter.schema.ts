/**
 * Subscribe Newsletter Block Schema
 *
 * PURPOSE:
 * Creates a newsletter subscription section with a title, subtitle, and helper text.
 * Frontend integrates with email marketing service (e.g., Mailchimp, ConvertKit) to
 * collect email addresses for marketing campaigns.
 *
 * KEY FEATURES:
 * - Title: Main heading for the subscription section
 * - SubTitle: Rich text supporting formatting for additional context
 * - Helper text: Rich text for form instructions, privacy policy, or disclaimers
 * - Minimal fields: Focuses on content; form submission handled by frontend
 *
 * I18N SUPPORT: No - This is a page builder block, not a standalone document
 * ORDERING: No - Positioned within pageBuilder array
 * SINGLETON: No - Multiple instances allowed per page
 *
 * SPECIAL BEHAVIORS:
 * - Frontend integration: Block provides content only; email capture logic in frontend
 * - Multiple rich text fields: subTitle and helperText use customRichText with custom names
 *
 * USAGE LOCATIONS:
 * - Available in pageBuilder array for any page/document type
 * - Commonly placed in footers, blog sidebars, or dedicated landing page sections
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
