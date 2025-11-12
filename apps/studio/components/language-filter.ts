/**
 * Language Filter Utilities
 *
 * Provides functions for filtering Sanity Studio document lists by language.
 * Supports filtering to show only default language versions while maintaining
 * access to all translations through the document-internationalization plugin.
 *
 * @see specs/003-dedup-studio-records/contracts/language-filter-types.ts
 */

import type { SanityClient } from "@sanity/client";
import { DEFAULT_LOCALE, type Locale } from "@workspace/i18n-config";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Minimal document data structure with language information
 */
export interface DocumentWithLanguage {
  _id: string;
  title: string;
  slug: string;
  language: Locale;
}

/**
 * Options for filtering documents by language
 */
export interface LanguageFilterOptions {
  language?: Locale;
  includeLegacy?: boolean;
}

// ============================================================================
// GROQ QUERY FRAGMENTS
// ============================================================================

/**
 * Standard document fields for list display
 */
const DOCUMENT_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  language
`;

/**
 * Create GROQ filter expression for language filtering
 *
 * @param includeLegacy - Include documents without language field
 * @returns GROQ filter string for use in queries
 */
export function createLanguageFilter(includeLegacy = true): string {
  if (includeLegacy) {
    // Include documents without language field (legacy support)
    return "(!defined(language) || language == $language)";
  }
  // Strict filtering - only documents with matching language
  return "language == $language";
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Fetch documents filtered by language
 *
 * @param client - Sanity client instance
 * @param schemaType - Document type to fetch (e.g., "page", "blog")
 * @param options - Filter configuration options
 * @returns Promise resolving to filtered documents
 *
 * @example
 * const pages = await fetchDocumentsByLanguage(client, "page", {
 *   language: "fr",
 *   includeLegacy: true
 * });
 */
export async function fetchDocumentsByLanguage(
  client: SanityClient,
  schemaType: string,
  options: LanguageFilterOptions = {}
): Promise<DocumentWithLanguage[]> {
  const { language = DEFAULT_LOCALE, includeLegacy = true } = options;

  try {
    const languageFilter = createLanguageFilter(includeLegacy);

    const documents = await client.fetch<DocumentWithLanguage[]>(
      `*[_type == $schemaType && defined(slug.current) && ${languageFilter}] {
        ${DOCUMENT_FIELDS}
      }`,
      { schemaType, language }
    );

    if (!Array.isArray(documents)) {
      throw new Error("Invalid documents response from Sanity");
    }

    return documents;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Unable to load ${schemaType} documents: ${errorMessage}`);
  }
}

/**
 * Create GROQ parameters object for language filtering
 *
 * @param schemaType - Document type
 * @param language - Language to filter by
 * @returns Parameters object for Sanity client fetch
 */
export function createLanguageQueryParams(
  schemaType: string,
  language: Locale = DEFAULT_LOCALE
): { schemaType: string; language: Locale } {
  return { schemaType, language };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Type guard to check if a document has language information
 */
export function hasLanguage(doc: unknown): doc is DocumentWithLanguage {
  return (
    typeof doc === "object" &&
    doc !== null &&
    "language" in doc &&
    typeof (doc as DocumentWithLanguage).language === "string"
  );
}

/**
 * Get language from document with fallback
 */
export function getDocumentLanguage(
  doc: unknown,
  fallback: Locale = DEFAULT_LOCALE
): Locale {
  if (hasLanguage(doc)) {
    return doc.language;
  }
  return fallback;
}
