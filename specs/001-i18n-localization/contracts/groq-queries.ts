/**
 * CONTRACT FILE - NOT FOR DIRECT EXECUTION
 *
 * Contract: GROQ Query Patterns for Language-Aware Content Fetching
 *
 * This file demonstrates query patterns for fetching localized content from Sanity.
 * All queries include language filtering and translation metadata resolution.
 *
 * NOTE: This is a reference/template file. Copy patterns to actual source files.
 */

/* eslint-disable */
// @ts-nocheck

import { defineQuery, groq } from 'next-sanity'

// ============================================================================
// Query Fragments
// ============================================================================

/**
 * Common fragment for fetching document with translations
 * Resolves the translation.metadata document and all language versions
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
`

/**
 * SEO fields fragment
 */
export const seoFragment = groq`
  "seo": {
    "title": coalesce(seo.title, title),
    "description": seo.description,
    "ogImage": seo.ogImage.asset->url
  }
`

/**
 * Image fragment with proper asset resolution
 */
export const imageFragment = groq`
  "image": {
    "url": image.asset->url,
    "alt": image.alt,
    "hotspot": image.hotspot,
    "crop": image.crop
  }
`

// ============================================================================
// Single Document Queries
// ============================================================================

/**
 * Get a single page by slug and language
 *
 * @param slug - Page slug (e.g., "about", "a-propos")
 * @param language - ISO language code (e.g., "en", "fr")
 * @returns Single page document with translations or null
 */
export const getPageBySlugQuery = defineQuery(groq`
  *[
    _type == "page" 
    && slug.current == $slug 
    && language == $language
  ][0]{
    _id,
    _type,
    _createdAt,
    _updatedAt,
    language,
    title,
    "slug": slug.current,
    content,
    ${seoFragment},
    ${translationsFragment}
  }
`)

/**
 * Get a blog post by slug and language
 */
export const getBlogPostQuery = defineQuery(groq`
  *[
    _type == "blog" 
    && slug.current == $slug 
    && language == $language
  ][0]{
    _id,
    _type,
    _createdAt,
    _updatedAt,
    publishedAt,
    language,
    title,
    "slug": slug.current,
    excerpt,
    content,
    "author": author->{
      name,
      ${imageFragment}
    },
    ${seoFragment},
    ${translationsFragment}
  }
`)

/**
 * Get navbar for specific language (singleton pattern)
 */
export const getNavbarQuery = defineQuery(groq`
  *[_type == "navbar" && language == $language][0]{
    _id,
    language,
    menuItems[]{
      _key,
      title,
      "href": link->slug.current,
      "linkLanguage": link->language
    }
  }
`)

// ============================================================================
// List Queries
// ============================================================================

/**
 * Get all pages in a specific language
 * Ordered by title
 */
export const getAllPagesQuery = defineQuery(groq`
  *[_type == "page" && language == $language] | order(title asc){
    _id,
    _type,
    language,
    title,
    "slug": slug.current,
    ${translationsFragment}
  }
`)

/**
 * Get all blog posts in a specific language
 * Ordered by publish date (newest first)
 */
export const getAllBlogPostsQuery = defineQuery(groq`
  *[_type == "blog" && language == $language] | order(publishedAt desc){
    _id,
    _type,
    publishedAt,
    language,
    title,
    "slug": slug.current,
    excerpt,
    "author": author->{
      name,
      ${imageFragment}
    },
    ${translationsFragment}
  }
`)

/**
 * Get paginated blog posts
 */
export const getPaginatedBlogPostsQuery = defineQuery(groq`
  *[_type == "blog" && language == $language] 
  | order(publishedAt desc) [$start...$end]{
    _id,
    _type,
    publishedAt,
    language,
    title,
    "slug": slug.current,
    excerpt,
    ${translationsFragment}
  }
`)

// ============================================================================
// Translation-Aware Queries
// ============================================================================

/**
 * Get document with fallback to default language
 * If document not found in requested language, return default language version
 *
 * @param slug - Document slug
 * @param language - Preferred language
 * @param defaultLanguage - Fallback language (typically 'fr')
 */
export const getPageWithFallbackQuery = defineQuery(groq`
  coalesce(
    *[_type == "page" && slug.current == $slug && language == $language][0],
    *[_type == "page" && slug.current == $slug && language == $defaultLanguage][0]
  ){
    _id,
    _type,
    language,
    "isDefaultLanguageFallback": language != $language,
    title,
    "slug": slug.current,
    content,
    ${seoFragment},
    ${translationsFragment}
  }
`)

/**
 * Get all translations for a document
 * Given a document ID, find its metadata and return all language versions
 */
export const getDocumentTranslationsQuery = defineQuery(groq`
  *[_type == "translation.metadata" && references($docId)][0]{
    _id,
    schemaType,
    translations[]{
      _key,
      "document": value->{
        _id,
        _type,
        language,
        title,
        "slug": slug.current
      }
    }
  }
`)

/**
 * Check if translation exists for a document
 */
export const hasTranslationQuery = defineQuery(groq`
  count(*[
    _type == "translation.metadata" 
    && references($docId)
  ][0].translations[_key == $language]) > 0
`)

// ============================================================================
// Sitemap Generation Queries
// ============================================================================

/**
 * Get all pages in all languages for sitemap
 */
export const getAllPagesForSitemapQuery = defineQuery(groq`
  *[_type == "page"]{
    "slug": slug.current,
    language,
    _updatedAt,
    ${translationsFragment}
  }
`)

/**
 * Get all blog posts in all languages for sitemap
 */
export const getAllBlogPostsForSitemapQuery = defineQuery(groq`
  *[_type == "blog"]{
    "slug": slug.current,
    language,
    _updatedAt,
    publishedAt,
    ${translationsFragment}
  }
`)

// ============================================================================
// Search Queries
// ============================================================================

/**
 * Search across content in specific language
 * Uses Sanity's score() function for relevance
 */
export const searchQuery = defineQuery(groq`
  *[
    _type in ["page", "blog"]
    && language == $language
    && (
      title match $searchTerm + "*"
      || pt::text(content) match $searchTerm + "*"
    )
  ] | score(
    boost(title match $searchTerm + "*", 3),
    boost(pt::text(content) match $searchTerm + "*", 1)
  ) | order(_score desc)[0...10]{
    _type,
    _id,
    language,
    title,
    "slug": slug.current,
    "excerpt": pt::text(content)[0...200],
    _score
  }
`)

// ============================================================================
// Related Content Queries
// ============================================================================

/**
 * Get related blog posts in same language
 * Excludes current post, limited to 3 results
 */
export const getRelatedBlogPostsQuery = defineQuery(groq`
  *[
    _type == "blog" 
    && language == $language 
    && _id != $currentId
  ] | order(publishedAt desc)[0...3]{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt
  }
`)

// ============================================================================
// Admin/Dashboard Queries
// ============================================================================

/**
 * Get translation status for all documents
 * Useful for dashboard/admin view
 */
export const getTranslationStatusQuery = defineQuery(groq`
  *[_type == "translation.metadata"]{
    _id,
    schemaType,
    "totalTranslations": count(translations),
    "languages": translations[]._key,
    translations[]{
      _key,
      "document": value->{
        _id,
        title,
        "slug": slug.current,
        _updatedAt
      }
    }
  }
`)

/**
 * Find documents missing translations
 * Documents that exist in default language but not target language
 */
export const getMissingTranslationsQuery = defineQuery(groq`
  *[_type in $types && language == $defaultLanguage]{
    _id,
    _type,
    title,
    "slug": slug.current,
    "hasTranslation": count(*[
      _type == "translation.metadata" 
      && references(^._id)
    ][0].translations[_key == $targetLanguage]) > 0
  }[hasTranslation == false]
`)

// ============================================================================
// TypeScript Types for Query Results
// ============================================================================

/**
 * Example type definitions for query results
 * These should match your Sanity typegen output
 */
export type PageQueryResult = {
  _id: string
  _type: 'page'
  _createdAt: string
  _updatedAt: string
  language: 'en' | 'fr'
  title: string
  slug: string
  content: any[] // Portable Text blocks
  seo: {
    title: string
    description: string
    ogImage?: string
  }
  _translations?: Array<{
    _id: string
    _type: string
    language: 'en' | 'fr'
    slug: string
    title: string
  }>
}

export type BlogPostQueryResult = {
  _id: string
  _type: 'blog'
  _createdAt: string
  _updatedAt: string
  publishedAt: string
  language: 'en' | 'fr'
  title: string
  slug: string
  excerpt: string
  content: any[] // Portable Text blocks
  author: {
    name: string
    image: {
      url: string
      alt: string
    }
  }
  seo: {
    title: string
    description: string
  }
  _translations?: Array<{
    _id: string
    language: 'en' | 'fr'
    slug: string
    title: string
  }>
}

// ============================================================================
// Query Helper Functions
// ============================================================================

/**
 * Helper to execute query with type safety
 *
 * @example
 * const page = await fetchWithLanguage<PageQueryResult>(
 *   client,
 *   getPageBySlugQuery,
 *   { slug: 'about', language: 'en' }
 * )
 */
export async function fetchWithLanguage<T>(
  client: any,
  query: string,
  params: Record<string, any>
): Promise<T | null> {
  try {
    const result = await client.fetch<T>(query, params)
    return result
  } catch (_error) {
    return null
  }
}

/**
 * Helper to fetch with fallback to default language
 */
export async function fetchWithFallback<T>(
  client: any,
  query: string,
  params: { slug: string; language: string; defaultLanguage: string }
): Promise<{ data: T | null; isFallback: boolean }> {
  const result = await client.fetch<T>(query, params)

  if (!result) {
    return { data: null, isFallback: false }
  }

  // Check if we got fallback content
  const isFallback = (result as any).isDefaultLanguageFallback === true

  return { data: result, isFallback }
}

// ============================================================================
// Notes for Implementation
// ============================================================================

/**
 * IMPLEMENTATION NOTES:
 *
 * 1. All queries include language filter: && language == $language
 * 2. Use translationsFragment to get all language versions
 * 3. Always project specific fields rather than returning entire documents
 * 4. Use coalesce() for fallback logic
 * 5. For performance, limit translations to needed fields only
 * 6. Cache heavily-accessed queries (navbar, settings)
 * 7. Use ISR (Incremental Static Regeneration) for dynamic content
 * 8. Add query parameters validation in route handlers
 *
 * GROQ BEST PRACTICES:
 * - Use projections {} to limit returned data
 * - Use references -> to resolve related documents
 * - Use | order() for sorted results
 * - Use [0...n] for pagination
 * - Use count() for existence checks
 * - Use pt::text() for portable text content search
 */
