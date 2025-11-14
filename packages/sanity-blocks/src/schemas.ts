/**
 * Sanity Schema Exports
 *
 * This file exports Sanity schema definitions which include React components and UI dependencies.
 * Only import these in the Sanity Studio app, NOT in Next.js server-side code.
 */

// Import block schemas
import { heroSectionSchema } from "./hero-section.schema";
import { ctaSchema } from "./cta.schema";
// Note: faq-accordion schema file exists but is empty (0 bytes) - not imported

// Re-export block schemas for individual imports
export { heroSectionSchema, ctaSchema };

// Convenience array for Sanity Studio registration
export const allBlockSchemas = [heroSectionSchema, ctaSchema];
