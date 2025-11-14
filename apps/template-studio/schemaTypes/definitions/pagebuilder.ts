/**
 * Page Builder Definition Schema
 *
 * PURPOSE:
 * Core array field configuration that enables drag-and-drop page composition using
 * predefined content blocks. Provides flexible page layouts without custom code.
 *
 * KEY FEATURES:
 * - Block selection: All blocks from pageBuilderBlocks array (hero, CTA, etc.)
 * - Drag-and-drop ordering: Visual arrangement of content sections
 * - Type-safe configuration: Maps block names to Sanity array members
 * - Centralized block registry: Single source of truth for available blocks
 *
 * I18N SUPPORT: No - This is a reusable definition, not a standalone document
 * ORDERING: Yes - Array items support drag-and-drop reordering
 * SINGLETON: No - Multiple instances per parent document (though typically one)
 *
 * SPECIAL BEHAVIORS:
 * - Dynamic block loading: Automatically includes all blocks from pageBuilderBlocks
 * - Type mapping: Converts block objects to Sanity array member definitions
 * - No validation: Allows empty arrays (pages can have zero blocks)
 *
 * RELATED TYPES:
 * - pageBuilderBlocks: Imported from blocks/index.ts, defines available blocks
 * - All block schemas: cta, hero, faq-accordion, feature-cards-icon, etc.
 *
 * USAGE LOCATIONS:
 * - pageBuilderField in common.ts: Used in page, home-page, and blog-index schemas
 * - Any document type needing flexible content composition
 */

import { defineArrayMember, defineType } from "sanity";
import { ctaSchema } from "@walter/sanity-blocks/schemas/cta";
import { faqAccordionSchema } from "@walter/sanity-blocks/schemas/faq-accordion";
import { featureCardsIconSchema } from "@walter/sanity-blocks/schemas/feature-cards-icon";
import { heroSectionSchema } from "@walter/sanity-blocks/schemas/hero-section";
import { imageLinkCardsSchema } from "@walter/sanity-blocks/schemas/image-link-cards";
import { subscribeNewsletterSchema } from "@walter/sanity-blocks/schemas/subscribe-newsletter";

const pageBuilderBlocks = [
  heroSectionSchema,
  ctaSchema,
  featureCardsIconSchema,
  faqAccordionSchema,
  imageLinkCardsSchema,
  subscribeNewsletterSchema,
];

export const pagebuilderBlockTypes = pageBuilderBlocks.map(({ name }) => ({
  type: name,
}));

export const pageBuilder = defineType({
  name: "pageBuilder",
  type: "array",
  of: pagebuilderBlockTypes.map((block) => defineArrayMember(block)),
});
