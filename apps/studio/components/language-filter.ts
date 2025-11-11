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
 * Check if a document is orphaned (lacks default language version)
 *
 * @param client - Sanity client instance
 * @param documentId - ID of document to check
 * @param documentLanguage - Language of the document
 * @returns Promise resolving to true if orphaned
 *
 * @example
 * const isOrphaned = await isDocumentOrphaned(client, "page-en-123", "en");
 * if (isOrphaned) {
 *   console.warn("Document lacks default language version");
 * }
 */
export async function isDocumentOrphaned(
  client: SanityClient,
  documentId: string,
  documentLanguage: Locale
): Promise<boolean> {
  // If document is in default language, it cannot be orphaned
  if (documentLanguage === DEFAULT_LOCALE) {
    return false;
  }

  try {
    // Check if translation metadata exists with a default language version
    const defaultVersionRef = await client.fetch<string | null>(
      `*[_type == "translation.metadata" && $documentId in translations[].value._ref][0]
        .translations[_key == $defaultLanguage][0].value._ref`,
      { documentId, defaultLanguage: DEFAULT_LOCALE }
    );

    // If no default version exists, document is orphaned
    return defaultVersionRef === null;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(
      `Unable to check orphaned status for document ${documentId}: ${errorMessage}`
    );
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
