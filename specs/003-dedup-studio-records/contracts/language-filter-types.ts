/**
 * Contract: Language Filter Types
 *
 * TypeScript contracts for language-based document filtering in Sanity Studio.
 * These types define the interfaces for filtering document lists to show only
 * default language versions while maintaining access to all translations.
 *
 * Location: apps/studio/components/language-filter.ts (implementation)
 */

import type { SanityClient } from "@sanity/client";
import type { Locale } from "@workspace/i18n-config";

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

/**
 * Minimal document data structure with language information
 * Represents a Sanity document fetched for list display
 */
export interface DocumentWithLanguage {
  /** Unique document identifier */
  _id: string;
  /** Document title for display */
  title: string;
  /** URL slug (without _type wrapper) */
  slug: string;
  /** ISO language code */
  language: Locale;
}

/**
 * Document data with optional orphaned status
 * Extends base document with metadata about translation completeness
 */
export interface DocumentWithStatus extends DocumentWithLanguage {
  /** Whether this document lacks a default language version */
  isOrphaned?: boolean;
}

/**
 * Translation metadata reference
 * Represents a single language version in translation.metadata document
 */
export interface TranslationReference {
  /** Language code (matches Locale type) */
  _key: Locale;
  /** Reference object containing document ID */
  value: {
    _ref: string;
  };
}

/**
 * Translation metadata document structure
 * Links all language versions of the same content
 */
export interface TranslationMetadata {
  /** Always "translation.metadata" */
  _type: "translation.metadata";
  /** Unique metadata document ID */
  _id: string;
  /** Array of references to language versions */
  translations: TranslationReference[];
}

// ============================================================================
// FILTER CONFIGURATION
// ============================================================================

/**
 * Options for filtering documents by language
 * Configure behavior of language filter functions
 */
export interface LanguageFilterOptions {
  /** Language code to filter by (defaults to DEFAULT_LOCALE) */
  language?: Locale;
  /** Include documents without language field (legacy support) */
  includeLegacy?: boolean;
  /** Check for orphaned status (requires additional query) */
  checkOrphaned?: boolean;
}

/**
 * Result of a language-filtered document fetch
 * Includes documents and optional metadata
 */
export interface FilteredDocuments<T extends DocumentWithLanguage> {
  /** Array of filtered documents */
  documents: T[];
  /** Total count (before filtering, if known) */
  totalCount?: number;
  /** Applied filter language */
  appliedLanguage: Locale;
}

// ============================================================================
// FUNCTION SIGNATURES
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
 * const docs = await fetchDocumentsByLanguage(client, "page", {
 *   language: "fr",
 *   includeLegacy: true
 * });
 */
export type FetchDocumentsByLanguage = (
  client: SanityClient,
  schemaType: string,
  options?: LanguageFilterOptions
) => Promise<DocumentWithLanguage[]>;

/**
 * Check if a document is orphaned (lacks default language version)
 *
 * @param client - Sanity client instance
 * @param documentId - ID of document to check
 * @param documentLanguage - Language of the document
 * @returns Promise resolving to true if orphaned
 *
 * @example
 * const orphaned = await isDocumentOrphaned(client, "page-en-123", "en");
 * if (orphaned) {
 *   console.warn("Document lacks default language version");
 * }
 */
export type IsDocumentOrphaned = (
  client: SanityClient,
  documentId: string,
  documentLanguage: Locale
) => Promise<boolean>;

/**
 * Create GROQ filter expression for language filtering
 *
 * @param language - Language to filter by
 * @param includeLegacy - Include documents without language field
 * @returns GROQ filter string
 *
 * @example
 * const filter = createLanguageFilter("fr", true);
 * // Returns: "language == $language || !defined(language)"
 */
export type CreateLanguageFilter = (
  language: Locale,
  includeLegacy?: boolean
) => string;

// ============================================================================
// BADGE/INDICATOR TYPES
// ============================================================================

/**
 * Props for orphaned translation badge component
 * Used in schema preview.prepare() to render warning badges
 */
export interface OrphanedBadgeProps {
  /** Document language code */
  language: Locale;
  /** Whether to show badge (document is orphaned) */
  showBadge: boolean;
  /** Optional custom label */
  label?: string;
}

/**
 * Badge configuration for different document states
 * Defines visual appearance of badges/indicators
 */
export interface BadgeConfig {
  /** Badge color tone */
  tone: "critical" | "caution" | "positive" | "primary";
  /** Badge label text */
  label: string;
  /** Icon component (optional) */
  icon?: React.ComponentType;
  /** ARIA label for accessibility */
  ariaLabel: string;
}

// ============================================================================
// GROQ QUERY PARAMETERS
// ============================================================================

/**
 * Parameters for language filter GROQ queries
 * Used with SanityClient.fetch() parameterized queries
 */
export interface LanguageQueryParams {
  /** Document schema type */
  schemaType: string;
  /** Language code to filter by */
  language: Locale;
}

/**
 * Parameters for orphaned document check query
 */
export interface OrphanedCheckParams {
  /** Document ID to check */
  documentId: string;
  /** Default language to check for */
  defaultLanguage: Locale;
}

// ============================================================================
// STRUCTURE BUILDER TYPES
// ============================================================================

/**
 * Enhanced document data for structure builder
 * Extends DocumentWithLanguage with structure-specific metadata
 */
export interface StructureDocument extends DocumentWithLanguage {
  /** Document type */
  _type: string;
  /** Whether document is a draft */
  _isDraft?: boolean;
  /** Publishing status */
  _publishedAt?: string;
}

/**
 * Options for creating filtered structure lists
 * Configure structure builder list behavior
 */
export interface StructureListOptions {
  /** Schema type for the list */
  schemaType: string;
  /** Filter language (defaults to DEFAULT_LOCALE) */
  filterLanguage?: Locale;
  /** Show orphaned documents with warnings */
  showOrphaned?: boolean;
  /** Custom list title */
  title?: string;
  /** Custom list icon */
  icon?: React.ComponentType;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Error thrown when language filtering fails
 */
export class LanguageFilterError extends Error {
  constructor(
    message: string,
    public schemaType: string,
    public language: Locale,
    public cause?: Error
  ) {
    super(message);
    this.name = "LanguageFilterError";
  }
}

/**
 * Error thrown when orphaned check fails
 */
export class OrphanedCheckError extends Error {
  constructor(
    message: string,
    public documentId: string,
    public cause?: Error
  ) {
    super(message);
    this.name = "OrphanedCheckError";
  }
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract language from document (type guard)
 *
 * @example
 * function hasLanguage(doc: unknown): doc is DocumentWithLanguage {
 *   return typeof doc === "object" && doc !== null && "language" in doc;
 * }
 */
export type HasLanguage<T> = T extends { language: Locale } ? T : never;

/**
 * Document list grouped by language
 * Useful for debugging or displaying language distribution
 */
export type DocumentsByLanguage = Record<Locale, DocumentWithLanguage[]>;

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * GROQ query fragments for reuse
 */
export const GROQ_FRAGMENTS = {
  /** Basic document fields */
  DOCUMENT_FIELDS: `
    _id,
    title,
    "slug": slug.current,
    language
  `,

  /** Language filter (parameterized) */
  LANGUAGE_FILTER: "language == $language",

  /** Language filter with legacy fallback */
  LANGUAGE_FILTER_WITH_LEGACY: "(!defined(language) || language == $language)",

  /** Translation metadata lookup */
  TRANSLATION_METADATA: `
    *[_type == "translation.metadata" && $documentId in translations[].value._ref][0]
  `,
} as const;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: Fetching filtered documents
 *
 * import { fetchDocumentsByLanguage } from './language-filter';
 * import { DEFAULT_LOCALE } from '@workspace/i18n-config';
 *
 * const documents = await fetchDocumentsByLanguage(client, "page", {
 *   language: DEFAULT_LOCALE,
 *   includeLegacy: true
 * });
 */

/**
 * EXAMPLE 2: Checking orphaned status
 *
 * import { isDocumentOrphaned } from './language-filter';
 * import { DEFAULT_LOCALE } from '@workspace/i18n-config';
 *
 * if (document.language !== DEFAULT_LOCALE) {
 *   const orphaned = await isDocumentOrphaned(
 *     client,
 *     document._id,
 *     document.language
 *   );
 *   if (orphaned) {
 *     // Show warning badge
 *   }
 * }
 */

/**
 * EXAMPLE 3: Schema preview with badge
 *
 * import type { OrphanedBadgeProps } from './language-filter-types';
 * import { DEFAULT_LOCALE } from '@workspace/i18n-config';
 *
 * preview: {
 *   select: {
 *     title: 'title',
 *     language: 'language',
 *   },
 *   prepare({ title, language }) {
 *     const isOrphaned = language !== DEFAULT_LOCALE;
 *     return {
 *       title,
 *       media: isOrphaned ? <OrphanedBadge language={language} showBadge /> : undefined
 *     };
 *   }
 * }
 */
