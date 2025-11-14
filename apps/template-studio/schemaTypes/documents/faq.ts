/**
 * FAQ (Frequently Asked Question) Document Schema
 *
 * PURPOSE:
 * Represents a simple question and answer pair for FAQ sections. Used to create
 * searchable, organized lists of common questions that help visitors find information
 * quickly. FAQs are typically displayed in FAQ accordion blocks on pages.
 *
 * KEY FEATURES:
 * - Simple title (question) and rich text (answer) structure
 * - Rich text editor for formatted answers with links and basic styling
 * - Preview with truncated answer text for quick scanning in Studio
 * - Emoji-enhanced preview (❓ prefix) for visual identification
 *
 * I18N SUPPORT: Yes - Fully translatable (French, English, Spanish)
 * ORDERING: No - FAQs are typically ordered manually in page builder blocks or by query
 * SINGLETON: No - Multiple FAQs allowed
 *
 * SPECIAL BEHAVIORS:
 * - Template filtering: Only `faq-fr` template shown by default in global menu
 *   (see sanity.config.ts:264-270 for newDocumentOptions filter)
 * - Language filtering in sidebar: Shows only French (default) FAQs in sidebar
 *   (see structure.ts:375-386 for language filter implementation)
 * - Rich text limited to basic blocks: Only "block" type enabled (no custom blocks)
 * - Preview truncates answer to 20 words for readability in Studio lists
 *
 * RELATED TYPES:
 * - richText (definition): Used for answer field with custom formatting
 * - faqAccordion (block): Page builder block that references and displays FAQ documents
 *
 * USAGE LOCATIONS:
 * - Studio sidebar: apps/studio/structure.ts:375-386 (FAQs section with language filter)
 * - Page builder: Referenced in faqAccordion block for accordion-style FAQ sections
 * - Frontend queries: apps/web likely queries by language for FAQ display
 */

import { MessageCircle } from "lucide-react";
import { defineField, defineType } from "sanity";

import { customRichText } from "@walter/sanity-atoms/schemas/rich-text";
import { parseRichTextToString } from "../../utils/helper";
import { languageField } from "../common";

export const faq = defineType({
  name: "faq",
  type: "document",
  title: "Frequently Asked Question",
  description:
    "A simple question and answer pair that helps visitors find information quickly. Think of it like writing down the questions customers often ask, along with clear answers.",
  icon: MessageCircle,
  fields: [
    languageField,
    defineField({
      name: "title",
      title: "Question",
      type: "string",
      description:
        "Write the question exactly as someone might ask it. For example: 'How do I reset my password?'",
      validation: (Rule) => Rule.required(),
    }),
    customRichText(["block"], {
      title: "Answer",
      description:
        "Write a friendly, clear answer that directly addresses the question. Keep it simple enough that anyone can understand it.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      richText: "richText",
    },
    prepare: ({ title, richText }) => {
      const subtitle = parseRichTextToString(richText, 20);

      return {
        title: `❓ ${title || "Untitled Question"}`,
        subtitle,
      };
    },
  },
});
