import { groq } from 'next-sanity'

/**
 * Locale-aware GROQ query utilities
 *
 * This module provides reusable query fragments and helper functions
 * for fetching localized content from Sanity. All utilities handle
 * language filtering and translation metadata resolution.
 *
 * @example
 * import { translationsFragment, createLocaleFilter } from '@/lib/sanity/i18n'
 *
 * const query = groq`
 *   *[_type == "page" && ${createLocaleFilter('$locale')}][0]{
 *     _id,
 *     title,
 *     ${translationsFragment}
 *   }
 * `
 */

// ============================================================================
// Query Fragments
// ============================================================================

/**
 * Fragment for fetching translation metadata and all language versions
 *
 * Resolves the translation.metadata document created by the
 * @sanity/document-internationalization plugin and returns all
 * available language versions with their basic metadata.
 *
 * @returns GROQ fragment that adds `_translations` field to document
 *
 * @example
 * const query = groq`
 *   *[_type == "page" && language == $locale][0]{
 *     _id,
 *     title,
 *     ${translationsFragment}
 *   }
 * `
 * // Result includes: { ..., _translations: [{_id, language, slug, title}] }
 */
// @sanity-typegen-ignore
export const translationsFragment = groq`
  "_translations": *[
    _type == "translation.metadata" && references(^._id)
  ][0].translations[].value->{
    _id,
    _type,
    language,
    "slug": slug.current,
    title
  }
`
