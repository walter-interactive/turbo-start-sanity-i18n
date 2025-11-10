import { groq } from "next-sanity";
import type { Locale } from "@/i18n/routing";

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
`;

/**
 * Fragment for SEO metadata with language support
 *
 * Provides SEO fields with fallback logic for partial translations.
 * Falls back from seo-specific fields to general content fields.
 *
 * @example
 * ${seoFragment}
 * // Adds: { seo: { title, description, ogImage } }
 */
export const seoFragment = groq`
  "seo": {
    "title": coalesce(seoTitle, ogTitle, title),
    "description": coalesce(seoDescription, ogDescription, description),
    "ogImage": coalesce(
      seoImage.asset->url,
      ogImage.asset->url,
      image.asset->url
    )
  }
`;

/**
 * Fragment for basic document metadata
 *
 * Standard fields needed for most document queries.
 *
 * @example
 * ${documentMetadataFragment}
 * // Adds: { _id, _type, _createdAt, _updatedAt, language }
 */
export const documentMetadataFragment = groq`
  _id,
  _type,
  _createdAt,
  _updatedAt,
  language
`;

// ============================================================================
// Query Helpers
// ============================================================================

/**
 * Create a GROQ filter for language matching
 *
 * Generates a language filter condition that can be used in GROQ queries.
 * Supports both literal locale values and GROQ parameters.
 *
 * @param locale - Locale code as literal string or GROQ parameter
 * @returns GROQ filter condition
 *
 * @example
 * // With parameter
 * createLocaleFilter('$locale')
 * // Returns: "language == $locale"
 *
 * // With literal
 * createLocaleFilter('"fr"')
 * // Returns: 'language == "fr"'
 */
export function createLocaleFilter(locale: string): string {
  return `language == ${locale}`;
}

/**
 * Create a GROQ filter combining type and language
 *
 * Generates a compound filter for document type and language.
 * Useful for filtering specific document types by locale.
 *
 * @param docType - Sanity document type
 * @param locale - Locale code as literal or parameter
 * @returns GROQ filter condition
 *
 * @example
 * createDocumentFilter('page', '$locale')
 * // Returns: '_type == "page" && language == $locale'
 */
export function createDocumentFilter(docType: string, locale: string): string {
  return `_type == "${docType}" && ${createLocaleFilter(locale)}`;
}

/**
 * Create a GROQ filter for slug and language
 *
 * Generates a filter for finding documents by slug in a specific language.
 *
 * @param slugParam - GROQ parameter name for slug (default: '$slug')
 * @param localeParam - GROQ parameter name for locale (default: '$locale')
 * @returns GROQ filter condition
 *
 * @example
 * createSlugLocaleFilter()
 * // Returns: 'slug.current == $slug && language == $locale'
 *
 * createSlugLocaleFilter('$pageSlug', '$lang')
 * // Returns: 'slug.current == $pageSlug && language == $lang'
 */
export function createSlugLocaleFilter(
  slugParam = "$slug",
  localeParam = "$locale"
): string {
  return `slug.current == ${slugParam} && language == ${localeParam}`;
}

// ============================================================================
// Singleton Document Helpers
// ============================================================================

/**
 * Create singleton document filter with locale support
 *
 * For documents that have one instance per language (navbar, footer, settings).
 * Filters by document ID pattern and language.
 *
 * @param docType - Document type (e.g., 'navbar', 'footer')
 * @param locale - Locale code as literal or parameter
 * @returns GROQ filter condition
 *
 * @example
 * createSingletonFilter('navbar', '$locale')
 * // Returns: '_type == "navbar" && language == $locale'
 *
 * // For documents without language field (non-translated singletons)
 * createSingletonFilter('settings', null)
 * // Returns: '_type == "settings"'
 */
export function createSingletonFilter(
  docType: string,
  locale: string | null
): string {
  if (locale === null) {
    return `_type == "${docType}"`;
  }
  return createDocumentFilter(docType, locale);
}

// ============================================================================
// Translation Utilities
// ============================================================================

/**
 * Get alternate language version of a document
 *
 * Helper for generating hreflang links and language switcher data.
 * Returns null if translation doesn't exist.
 *
 * @param translations - Array of translation objects from translationsFragment
 * @param targetLocale - Target locale to find
 * @returns Translation object or null
 *
 * @example
 * const frenchVersion = getAlternateLanguage(document._translations, 'fr')
 * if (frenchVersion) {
 *   console.log(`French version: /${frenchVersion.slug}`)
 * }
 */
export function getAlternateLanguage<
  T extends { language: string; slug: string },
>(translations: T[] | undefined, targetLocale: Locale): T | null {
  if (!translations) return null;
  return translations.find((t) => t.language === targetLocale) ?? null;
}

/**
 * Check if document has translation in target locale
 *
 * @param translations - Array of translation objects
 * @param targetLocale - Locale to check for
 * @returns True if translation exists
 *
 * @example
 * if (hasTranslation(document._translations, 'en')) {
 *   // Show "Available in English" badge
 * }
 */
export function hasTranslation(
  translations: { language: string }[] | undefined,
  targetLocale: Locale
): boolean {
  return getAlternateLanguage(translations as any, targetLocale) !== null;
}

/**
 * Get all available locales for a document
 *
 * Extracts unique language codes from translation metadata.
 *
 * @param translations - Array of translation objects
 * @returns Array of locale codes
 *
 * @example
 * const availableLocales = getAvailableLocales(document._translations)
 * // Returns: ['fr', 'en']
 */
export function getAvailableLocales(
  translations: { language: string }[] | undefined
): Locale[] {
  if (!translations) return [];
  return translations
    .map((t) => t.language)
    .filter((lang): lang is Locale => Boolean(lang));
}

// ============================================================================
// Query Parameter Types
// ============================================================================

/**
 * Standard query parameters for locale-aware queries
 *
 * Use this type for queries that filter by locale.
 *
 * @example
 * import type { LocaleQueryParams } from '@/lib/sanity/i18n'
 *
 * const params: LocaleQueryParams = { locale: 'fr' }
 * const data = await client.fetch(query, params)
 */
export interface LocaleQueryParams {
  locale: Locale;
}

/**
 * Query parameters for slug + locale queries
 *
 * Use this type for queries that filter by both slug and locale.
 *
 * @example
 * import type { SlugLocaleQueryParams } from '@/lib/sanity/i18n'
 *
 * const params: SlugLocaleQueryParams = {
 *   slug: 'about',
 *   locale: 'en'
 * }
 */
export interface SlugLocaleQueryParams extends LocaleQueryParams {
  slug: string;
}

// ============================================================================
// Common Query Patterns
// ============================================================================

/**
 * Example: Get page by slug and locale
 *
 * @example
 * import { defineQuery } from 'next-sanity'
 * import {
 *   createSlugLocaleFilter,
 *   translationsFragment,
 *   seoFragment
 * } from '@/lib/sanity/i18n'
 *
 * export const getPageBySlugQuery = defineQuery(groq`
 *   *[_type == "page" && ${createSlugLocaleFilter()}][0]{
 *     _id,
 *     title,
 *     "slug": slug.current,
 *     content,
 *     ${seoFragment},
 *     ${translationsFragment}
 *   }
 * `)
 */

/**
 * Example: Get all pages in a locale
 *
 * @example
 * import { defineQuery } from 'next-sanity'
 * import { createLocaleFilter } from '@/lib/sanity/i18n'
 *
 * export const getAllPagesQuery = defineQuery(groq`
 *   *[_type == "page" && ${createLocaleFilter('$locale')}] | order(title asc){
 *     _id,
 *     title,
 *     "slug": slug.current
 *   }
 * `)
 */

/**
 * Example: Get singleton with locale
 *
 * @example
 * import { defineQuery } from 'next-sanity'
 * import { createSingletonFilter } from '@/lib/sanity/i18n'
 *
 * export const getNavbarQuery = defineQuery(groq`
 *   *[${createSingletonFilter('navbar', '$locale')}][0]{
 *     _id,
 *     menuItems[]
 *   }
 * `)
 */
