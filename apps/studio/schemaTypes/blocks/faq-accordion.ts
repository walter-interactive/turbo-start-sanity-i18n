/**
 * FAQ Accordion Block Schema
 *
 * PURPOSE:
 * Displays frequently asked questions in an expandable accordion format with
 * optional header content (eyebrow, title, subtitle) and a related link. References
 * FAQ documents rather than inline content for better reusability.
 *
 * KEY FEATURES:
 * - Header section: Eyebrow, title, and subtitle for context
 * - Optional link: Additional resource or contact link with description
 * - FAQ references: Array of references to FAQ documents (not inline content)
 * - Unique validation: Prevents duplicate FAQ references
 *
 * I18N SUPPORT: No - This is a page builder block, not a standalone document
 * ORDERING: No - Positioned within pageBuilder array
 * SINGLETON: No - Multiple instances allowed per page
 *
 * SPECIAL BEHAVIORS:
 * - References FAQ documents: Uses reference field (not inline objects)
 * - Validation: Title is required, FAQ array is required and must have unique items
 * - Preview: Shows title with "FAQ Accordion" subtitle
 *
 * RELATED TYPES:
 * - faq: Referenced document type for individual FAQ items
 *
 * USAGE LOCATIONS:
 * - Available in pageBuilder array for any page/document type
 * - Commonly used on support pages, product pages, and help sections
 */

import { MessageCircle } from "lucide-react";
import { defineField, defineType } from "sanity";

export const faqAccordion = defineType({
  name: "faqAccordion",
  type: "object",
  icon: MessageCircle,
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      title: "Eyebrow",
      description:
        "The smaller text that sits above the title to provide context",
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "The large text that is the primary focus of the block",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      type: "string",
      title: "Subtitle",
      description: "Additional context below the main title",
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "object",
      description: "Optional link for additional content or actions",
      fields: [
        defineField({
          name: "title",
          type: "string",
          title: "Link Title",
          description: "The text to display for the link",
        }),
        defineField({
          name: "description",
          type: "string",
          title: "Link Description",
          description: "A brief description of where the link leads to",
        }),
        defineField({
          name: "url",
          type: "customUrl",
          title: "URL",
          description: "The destination URL for the link",
        }),
      ],
    }),
    defineField({
      name: "faqs",
      type: "array",
      title: "FAQs",
      description: "Select the FAQ items to display in this accordion",
      of: [
        {
          type: "reference",
          to: [{ type: "faq" }],
          options: { disableNew: true },
        },
      ],
      validation: (Rule) => [Rule.required(), Rule.unique()],
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title ?? "Untitled",
      subtitle: "FAQ Accordion",
    }),
  },
});
