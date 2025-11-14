/**
 * GROQ Fragment Exports
 *
 * This file exports only GROQ query fragments - pure strings with no React/UI dependencies.
 * Safe for use in server-side code (Next.js API routes, sitemap generation, etc.)
 *
 * IMPORTANT: Import directly from fragment files to avoid loading schema dependencies.
 *
 * NOTE: Atomic fragments (buttons, image, richText) are now in @walter/sanity-atoms/fragments
 */

// Import block fragments
import { heroSectionFragment } from "./heroSection.fragment";
import { ctaBlock } from "./cta.fragment";
import { faqSectionFragment } from "./faqAccordion.fragment";

// Re-export block fragments for individual imports
export { heroSectionFragment, ctaBlock, faqSectionFragment };

// Convenience array for GROQ query construction
export const allBlockFragments = [
  heroSectionFragment,
  ctaBlock,
  faqSectionFragment,
];
