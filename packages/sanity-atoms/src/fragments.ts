/**
 * Atomic Content Type Fragments (GROQ)
 *
 * Re-exports all atomic GROQ fragments for use in blocks and queries.
 * Fragments are reusable GROQ query snippets.
 *
 * USAGE:
 * import { buttonsFragment, imageFragment, richTextFragment } from '@walter/sanity-atoms/fragments'
 */

// Re-export buttons fragment
export { buttonsFragment } from "./buttons.fragment";

// Re-export image fragments
export { imageFields, imageFragment } from "./image.fragment";

// Re-export rich text fragment
export { richTextFragment } from "./richText.fragment";
