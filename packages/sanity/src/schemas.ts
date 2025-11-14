/**
 * Sanity Schema Exports
 *
 * This file exports Sanity schema definitions which include React components and UI dependencies.
 * Only import these in the Sanity Studio app, NOT in Next.js server-side code.
 */

// Export shared schemas - import directly from schema files
export { buttonsFieldSchema } from "./shared/buttons/buttons.schema";
export { customRichText } from "./shared/rich-text/rich-text.schema";

// Export block schemas - import directly from schema files
export { heroSectionSchema } from "./blocks/hero-section/hero-section.schema";
export { cta } from "./blocks/cta/cta.schema";
// Note: faq-section schema not yet implemented