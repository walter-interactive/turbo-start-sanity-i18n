/**
 * GROQ Fragment Exports
 *
 * This file exports only GROQ query fragments - pure strings with no React/UI dependencies.
 * Safe for use in server-side code (Next.js API routes, sitemap generation, etc.)
 *
 * IMPORTANT: Import directly from fragment files to avoid loading schema dependencies.
 */

// Export shared fragments - import directly from fragment files
export { imageFields, imageFragment } from "./shared/image/image.fragment";
export { buttonsFragment } from "./shared/buttons/buttons.fragment";
export { richTextFragment } from "./shared/rich-text/rich-text.fragment";

// Export block fragments - import directly from fragment files
export { heroSectionFragment } from "./blocks/hero-section/hero-section.fragment";
export { ctaBlock } from "./blocks/cta/cta.fragment";
export { faqSectionFragment } from "./blocks/faq-section/faq-section.fragment";