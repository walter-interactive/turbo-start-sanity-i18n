// ============================================================================
// Shared Atoms (from @walter/sanity-atoms)
// ============================================================================
import { buttonSchema } from "@walter/sanity-atoms/schemas/button";
import { customUrlSchema } from "@walter/sanity-atoms/schemas/custom-url";
import { richText } from "@walter/sanity-atoms/schemas/rich-text";

// ============================================================================
// Shared Blocks (from @walter/sanity-blocks)
// ============================================================================
import { ctaSchema } from "@walter/sanity-blocks/schemas/cta";
import { faqAccordionSchema } from "@walter/sanity-blocks/schemas/faq-accordion";
import { featureCardsIconSchema } from "@walter/sanity-blocks/schemas/feature-cards-icon";
import { heroSectionSchema } from "@walter/sanity-blocks/schemas/hero-section";
import { imageLinkCardsSchema } from "@walter/sanity-blocks/schemas/image-link-cards";
import { subscribeNewsletterSchema } from "@walter/sanity-blocks/schemas/subscribe-newsletter";

// ============================================================================
// Local Definitions (studio-specific)
// ============================================================================
import { pageBuilder } from "./definitions/pagebuilder";

// ============================================================================
// Collections (multi-instance documents)
// ============================================================================
import { author } from "./collections/author";
import { blog } from "./collections/blog";
import { faq } from "./collections/faq";
import { page } from "./collections/page";
import { redirect } from "./collections/redirect";

// ============================================================================
// Singletons (single-instance documents)
// ============================================================================
import { blogIndex } from "./singletons/blog-index";
import { footer } from "./singletons/footer";
import { homePage } from "./singletons/home-page";
import { navbar } from "./singletons/navbar";
import { settings } from "./singletons/settings";

// ============================================================================
// Schema Registration
// ============================================================================

// Collections array for reference
export const collections = [blog, page, faq, author, redirect];

// Singletons array for reference
export const singletons = [homePage, blogIndex, settings, footer, navbar];

// All documents (collections + singletons)
const documents = [...collections, ...singletons];

// All definitions (atoms + local definitions)
const definitions = [customUrlSchema, richText, buttonSchema, pageBuilder];

// All page builder blocks
const pageBuilderBlocks = [
  heroSectionSchema,
  ctaSchema,
  featureCardsIconSchema,
  faqAccordionSchema,
  imageLinkCardsSchema,
  subscribeNewsletterSchema,
];

// Main schema types array (registered with Sanity)
export const schemaTypes = [...documents, ...definitions, ...pageBuilderBlocks];

// ============================================================================
// Type Utilities
// ============================================================================

// Array of all document schema names
export const schemaNames = [...documents].map((doc) => doc.name);

// Union type of all schema names
export type SchemaType = (typeof schemaNames)[number];

// Array of singleton schema names
export const singletonType = singletons.map(({ name }) => name);

// Union type of singleton names
export type SingletonType = (typeof singletonType)[number];

// Default export for Sanity config
export default schemaTypes;
