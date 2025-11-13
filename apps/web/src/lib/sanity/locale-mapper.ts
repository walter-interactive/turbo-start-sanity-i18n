/**
 * Locale Mapping Utility
 *
 * This module provides utilities for creating a bidirectional lookup map
 * that enables instant navigation between translated versions of documents.
 *
 * **Pattern**: Based on conciliainc.com implementation, adapted for next-intl
 * **Performance**: O(1) lookup time via hash map, ~260KB memory for 500 documents
 *
 * @module locale-mapper
 * @see {@link https://github.com/conciliainc/conciliainc.com|Reference Implementation}
 */

import {
  type DocumentType,
  getPathnameForDocType,
  LOCALES,
  PATHNAMES,
} from "@workspace/i18n-config";
import type { Locale } from "@/i18n/routing";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Individual translation item for a single language version of a document
 *
 * Contains minimal information needed for navigation and display.
 * Full document content is NOT included (fetched separately when rendering page).
 *
 * Note: This is NOT the same as the Sanity schema `TranslationMetadata` type,
 * which represents the full translation.metadata document. This represents a
 * single derived translation item from the GROQ query results.
 */
export interface TranslationItem {
  /** Document slug WITH leading slash (e.g., "/my-post") */
  slug: string;
  /** Document title in this language */
  title: string;
  /** Sanity document ID */
  _id: string;
  /** Sanity document type */
  _type: DocumentType;
}

/**
 * Collection of all language versions of a single document
 *
 * Indexed by locale code. May not contain entries for all languages
 * if document is only partially translated.
 */
export interface LocaleTranslations {
  [locale: string]: TranslationItem;
}

/**
 * Bidirectional lookup table mapping pathnames to translations
 *
 * **Bidirectional**: Each document has multiple keys (one per translated slug).
 * This enables lookup from any language without knowing the source language.
 *
 * **Performance**: O(1) lookup time via hash map.
 */
export interface LocaleMapping {
  [pathname: string]: LocaleTranslations;
}

/**
 * Raw document structure from Sanity query
 *
 * Represents the data returned from queryAllLocalizedPages.
 * The _translations array contains all language versions of the document.
 */
export interface SanityLocalizedDocument {
  _id: string;
  _type: DocumentType;
  language: string;
  slug: string;
  title: string | null;
  _translations?: Array<{
    _id: string;
    _type: DocumentType;
    language: string;
    slug: string;
    title: string | null;
  }> | null;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get next-intl pathname pattern for document type
 *
 * Maps document types to their corresponding route patterns as defined
 * in the next-intl routing configuration. These patterns are used by
 * next-intl's Link component for type-safe navigation.
 *
 * Uses the centralized DOCUMENT_TYPE_TO_PATHNAME mapping from @workspace/i18n-config
 * to ensure consistency across the application.
 *
 * @param docType - The Sanity document type
 * @returns Pathname pattern matching routing.ts configuration
 *
 * @example
 * ```typescript
 * getPathnamePattern('blog')      // Returns: '/blog/[slug]'
 * getPathnamePattern('page')      // Returns: '/[slug]'
 * getPathnamePattern('homePage')  // Returns: '/'
 * getPathnamePattern('blogIndex') // Returns: '/blog'
 * ```
 *
 * @see {@link @workspace/i18n-config} for pathname definitions
 */
export function getPathnamePattern(docType: DocumentType): string {
  return getPathnameForDocType(docType);
}

/**
 * Generate full pathname with locale and localized document type prefix
 *
 * Constructs the complete URL pathname for a document in a specific language,
 * including locale prefix and localized document type path. This matches
 * actual URLs users see in their browser.
 *
 * **Key behaviors**:
 * - Uses localized document type prefixes from PATHNAMES config
 * - Always includes locale prefix (e.g., `/en/`, `/fr/`)
 * - Handles special cases for homepage and blog index
 * - Removes leading slash from slug for path construction
 *
 * @param slug - Document slug WITH leading slash (e.g., "/my-post")
 * @param docType - The Sanity document type
 * @param locale - Target locale for pathname
 * @returns Complete pathname including locale and document type prefix
 *
 * @example
 * ```typescript
 * // Blog post in English
 * getLocalizedPathname('/my-post', 'blog', 'en')
 * // Returns: '/en/blog/my-post'
 *
 * // Blog post in French (localized "blogue")
 * getLocalizedPathname('/mon-article', 'blog', 'fr')
 * // Returns: '/fr/blogue/mon-article'
 *
 * // Regular page
 * getLocalizedPathname('/about-us', 'page', 'en')
 * // Returns: '/en/about-us'
 *
 * // Homepage
 * getLocalizedPathname('/', 'homePage', 'fr')
 * // Returns: '/fr'
 *
 * // Blog index
 * getLocalizedPathname('/blog', 'blogIndex', 'fr')
 * // Returns: '/fr/blogue'
 * ```
 *
 * @see {@link @workspace/i18n-config} PATHNAMES for pathname localization config
 */
function getLocalizedPathname(
  slug: string,
  docType: DocumentType,
  locale: Locale
): string {
  // Remove leading slash from slug for path construction
  const slugContent = slug.replace(/^\//, "");
  const localePrefix = locale;

  // Get localized document type prefix from PATHNAMES config
  // This ensures we use "blogue" for French blog posts
  const pathnameKey = getPathnamePattern(docType);
  const localizedPath =
    PATHNAMES[pathnameKey as keyof typeof PATHNAMES]?.[locale];

  // Handle homepage (no slug)
  if (docType === "homePage") {
    return `/${localePrefix}`;
  }

  // Handle blog index (no slug, just the prefix)
  if (docType === "blogIndex") {
    // Extract the base path from localizedPath (e.g., "/blog" or "/blogue")
    const basePath = localizedPath?.replace(/\/\[slug\]$/, "") || "";
    return `/${localePrefix}${basePath}`;
  }

  // For blog posts and pages, construct path with localized prefix
  // Extract the base path without [slug] placeholder
  const basePath = localizedPath?.replace(/\/\[slug\]$/, "") || "";

  if (basePath) {
    return `/${localePrefix}${basePath}/${slugContent}`;
  }

  // Fallback for pages without prefix
  return `/${localePrefix}/${slugContent}`;
}

// ============================================================================
// Main Mapping Function
// ============================================================================

/**
 * Create bidirectional locale mapping from Sanity documents
 *
 * Transforms an array of localized Sanity documents into a bidirectional
 * lookup map for instant O(1) translation navigation. The mapping enables
 * users to switch languages without additional API calls.
 *
 * **Bidirectional Structure**:
 * Each document creates multiple entries in the map - one for each language's
 * pathname. This allows lookups from any language without knowing the source.
 *
 * **Example Mapping Structure**:
 * ```typescript
 * {
 *   // English pathname as key
 *   "/en/blog/complete-guide": {
 *     "en": { slug: "/complete-guide", title: "Complete Guide", ... },
 *     "fr": { slug: "/guide-complet", title: "Guide Complet", ... }
 *   },
 *   // French pathname as key (same translations object!)
 *   "/fr/blogue/guide-complet": {
 *     "en": { slug: "/complete-guide", title: "Complete Guide", ... },
 *     "fr": { slug: "/guide-complet", title: "Guide Complet", ... }
 *   }
 * }
 * ```
 *
 * **Slug Format**:
 * - Sanity stores slugs WITH leading slash (e.g., "/my-post")
 * - Slugs are stored as-is in the mapping (no normalization)
 * - For next-intl params, remove leading slash when using
 *
 * **Performance Characteristics**:
 * - Time complexity: O(n * m) where n = documents, m = languages per document
 * - Space complexity: O(n * m * 2) for bidirectional entries
 * - Lookup time: O(1) via hash map
 * - Memory: ~260KB for 500 documents with 2 languages
 *
 * @param documents - Array of localized documents from Sanity query
 * @returns Bidirectional mapping from pathname to translations
 *
 * @example
 * ```typescript
 * // Fetch documents from Sanity
 * const documents = await sanityFetch({
 *   query: queryAllLocalizedPages,
 *   params: { locale: DEFAULT_LOCALE }
 * });
 *
 * // Create mapping
 * const mapping = createLocaleMapping(documents);
 *
 * // Lookup from English URL
 * const translations = mapping['/en/blog/my-post'];
 * const frenchSlug = translations['fr'].slug; // "/mon-article"
 *
 * // Lookup from French URL (bidirectional!)
 * const sameTranslations = mapping['/fr/blogue/mon-article'];
 * const englishSlug = sameTranslations['en'].slug; // "/my-post"
 * ```
 *
 * @throws Never throws - skips documents with missing translation metadata
 *
 * @see {@link LocaleMapping} for return type structure
 * @see {@link SanityLocalizedDocument} for input type structure
 * @see {@link apps/web/src/lib/sanity/query.ts} queryAllLocalizedPages for data source
 */
export function createLocaleMapping(
  documents: SanityLocalizedDocument[]
): LocaleMapping {
  const mapping: LocaleMapping = {};

  for (const doc of documents) {
    // Skip documents without translation metadata
    if (!doc._translations || doc._translations.length === 0) continue;

    // Build translations object for this document
    const translations: LocaleTranslations = {};

    for (const translation of doc._translations) {
      // Slugs are stored as-is (with leading slash, e.g., "/my-post")
      // Title might be null, default to empty string
      translations[translation.language] = {
        slug: translation.slug,
        title: translation.title || "",
        _id: translation._id,
        _type: translation._type,
      };
    }

    // Add bidirectional mappings (one for each language's pathname)
    // This enables O(1) lookups from any language URL
    for (const locale of LOCALES) {
      if (!translations[locale]) continue;

      const pathname = getLocalizedPathname(
        translations[locale].slug,
        translations[locale]._type,
        locale
      );

      mapping[pathname] = translations;
    }
  }

  return mapping;
}
