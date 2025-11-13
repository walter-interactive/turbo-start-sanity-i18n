/**
 * API Contract: LocaleContext
 *
 * This contract defines the TypeScript interfaces for the LocaleContext feature,
 * which provides translation navigation capabilities for the language switcher.
 *
 * **Purpose**: Enable O(1) lookup of translated slugs for language switching
 * **Scope**: Client-side React components (apps/web/src/contexts/locale-context.tsx)
 * **Dependencies**: @workspace/i18n-config (Locale type)
 *
 * @packageDocumentation
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Supported locale codes for the application
 *
 * @remarks
 * Imported from @workspace/i18n-config for consistency across the monorepo.
 * Extend this type in i18n-config if adding new languages.
 *
 * @example
 * ```typescript
 * const locale: Locale = 'en'; // ✓ Valid
 * const locale: Locale = 'es'; // ✗ Type error
 * ```
 */
export type Locale = "en" | "fr";

/**
 * Sanity document types that support internationalization
 *
 * @remarks
 * Only these document types are included in the locale mapping.
 * Documents of other types (e.g., 'settings', 'navbar') do not support
 * translation navigation.
 *
 * @example
 * ```typescript
 * const type: DocumentType = 'blog'; // ✓ Valid
 * const type: DocumentType = 'settings'; // ✗ Type error
 * ```
 */
export type DocumentType = "page" | "blog" | "homePage" | "blogIndex";

// ============================================================================
// Data Structures
// ============================================================================

/**
 * Metadata for a single language version of a document
 *
 * @remarks
 * Contains minimal information needed for navigation and display.
 * Full document content is NOT included (fetched separately when rendering page).
 *
 * @example
 * ```typescript
 * const translation: TranslationMetadata = {
 *   slug: '/fr/blog/guide-complet',
 *   title: 'Guide Complet de Next.js',
 *   _id: 'blog-def456',
 *   _type: 'blog'
 * };
 * ```
 */
export interface TranslationMetadata {
  /**
   * Normalized slug without document type or locale prefixes
   *
   * @remarks
   * - Slugs are stored WITHOUT prefixes (e.g., `my-post` not `/blog/my-post`)
   * - Legacy slugs with `/blog/` prefix are normalized during mapping creation
   * - Use with next-intl's pathname patterns for navigation
   * - Document type determines pathname pattern (e.g., blog → `/blog/[slug]`)
   *
   * **Migration support**: During transition, Sanity may store slugs as:
   * - New format: `my-post` (preferred)
   * - Legacy format: `/blog/my-post` (automatically normalized)
   *
   * @example
   * ```typescript
   * // Blog post slug (normalized)
   * slug: 'mon-article'
   * // Used with pathname pattern: '/blog/[slug]'
   * // next-intl generates: /fr/blogue/mon-article
   *
   * // Regular page slug
   * slug: 'about-us'
   * // Used with pathname pattern: '/[slug]'
   * // next-intl generates: /en/about-us
   *
   * // Homepage (empty slug)
   * slug: ''
   * // Used with pathname pattern: '/'
   * // next-intl generates: /fr
   * ```
   */
  slug: string;

  /**
   * Document title in this language
   *
   * @remarks
   * Used for display purposes (e.g., showing title in language switcher dropdown).
   * Not required for navigation logic.
   */
  title: string;

  /**
   * Sanity document ID
   *
   * @remarks
   * Unique identifier for the document in Sanity Content Lake.
   * Used for traceability and debugging.
   *
   * @example
   * ```typescript
   * _id: 'blog-abc123-en'
   * ```
   */
  _id: string;

  /**
   * Sanity document type
   *
   * @remarks
   * One of the internationalized document types.
   * Used for URL prefix generation and analytics.
   */
  _type: DocumentType;
}

/**
 * Collection of all language versions of a single document
 *
 * @remarks
 * Indexed by locale code. May not contain entries for all languages
 * if document is only partially translated.
 *
 * **Important**: Consumers MUST handle missing translations gracefully.
 *
 * @example
 * ```typescript
 * const translations: LocaleTranslations = {
 *   'en': { slug: '/blog/guide', title: 'Guide', _id: '...', _type: 'blog' },
 *   'fr': { slug: '/fr/blog/guide-fr', title: 'Guide FR', _id: '...', _type: 'blog' }
 * };
 *
 * // Safe access (handles missing translation)
 * const frenchVersion = translations['fr'];
 * if (frenchVersion) {
 *   router.push(frenchVersion.slug);
 * } else {
 *   // Handle missing translation (404 or fallback)
 * }
 * ```
 */
export interface LocaleTranslations {
  [locale: Locale]: TranslationMetadata;
}

/**
 * Bidirectional lookup table mapping pathnames to translations
 *
 * @remarks
 * **Bidirectional**: Each document has multiple keys (one per translated slug).
 * This enables lookup from any language without knowing the source language.
 *
 * **Example bidirectional structure**:
 * ```
 * {
 *   '/blog/guide': { en: {...}, fr: {...} },
 *   '/fr/blog/guide-fr': { en: {...}, fr: {...} }
 * }
 * ```
 * Both English and French slugs point to the same translations object.
 *
 * **Performance**: O(1) lookup time via hash map.
 *
 * @example
 * ```typescript
 * const mapping: LocaleMapping = {
 *   '/blog/complete-guide': {
 *     'en': { slug: '/blog/complete-guide', ... },
 *     'fr': { slug: '/fr/blog/guide-complet', ... }
 *   },
 *   '/fr/blog/guide-complet': {
 *     'en': { slug: '/blog/complete-guide', ... },
 *     'fr': { slug: '/fr/blog/guide-complet', ... }
 *   }
 * };
 *
 * // Lookup from English slug
 * const translationsFromEn = mapping['/blog/complete-guide'];
 * const frenchSlug = translationsFromEn['fr'].slug; // '/fr/blog/guide-complet'
 *
 * // Lookup from French slug (same result!)
 * const translationsFromFr = mapping['/fr/blog/guide-complet'];
 * const englishSlug = translationsFromFr['en'].slug; // '/blog/complete-guide'
 * ```
 */
export interface LocaleMapping {
  [pathname: string]: LocaleTranslations;
}

// ============================================================================
// React Context API
// ============================================================================

/**
 * React Context value providing access to locale mapping and utilities
 *
 * @remarks
 * Provided by `LocaleProvider` component, consumed via `useLocale()` hook.
 * This context is immutable after initialization (read-only).
 *
 * **Thread-safety**: Immutable data, safe for concurrent access.
 *
 * @example
 * ```typescript
 * import { useLocale } from '@/contexts/locale-context';
 *
 * function LanguageSwitcher() {
 *   const { getTranslations } = useLocale();
 *   const pathname = usePathname();
 *   const translations = getTranslations(pathname);
 *
 *   if (!translations) {
 *     return <div>No translations available</div>;
 *   }
 *
 *   return (
 *     <div>
 *       {Object.entries(translations).map(([locale, meta]) => (
 *         <a key={locale} href={meta.slug}>
 *           {locale.toUpperCase()}
 *         </a>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export interface LocaleContextValue {
  /**
   * Complete locale mapping (all documents, all languages)
   *
   * @remarks
   * Direct access to the full mapping. Use `getTranslations()` method for
   * safer access with pathname normalization.
   *
   * **Size**: Approximately 200-300 KB for ~500 documents.
   *
   * **Immutable**: Never mutate this object. All lookups are read-only.
   */
  localeMapping: LocaleMapping;

  /**
   * Lookup translations for a given pathname
   *
   * @param pathname - Full pathname with locale prefix (e.g., "/fr/blog/slug")
   * @returns Translations for all languages, or undefined if not found
   *
   * @remarks
   * **Pathname format**: Must include locale prefix for non-English pages.
   * Use `usePathname()` from `@/i18n/navigation` for correct format.
   *
   * **Return value**:
   * - `LocaleTranslations` object if document exists and has translations
   * - `undefined` if pathname not found in mapping
   *
   * **Missing translations**: Even if a `LocaleTranslations` object is returned,
   * it may not contain entries for all languages. Always check if target
   * language exists before accessing.
   *
   * @example
   * ```typescript
   * import { usePathname } from '@/i18n/navigation';
   * import { useLocale } from '@/contexts/locale-context';
   *
   * function LanguageSwitcher() {
   *   const pathname = usePathname(); // "/fr/blog/guide-complet"
   *   const { getTranslations } = useLocale();
   *   const translations = getTranslations(pathname);
   *
   *   if (!translations) {
   *     console.warn('Page not found in locale mapping:', pathname);
   *     return null;
   *   }
   *
   *   const targetLocale = 'en';
   *   const targetTranslation = translations[targetLocale];
   *
   *   if (!targetTranslation) {
   *     console.warn('Translation not available for locale:', targetLocale);
   *     // Navigate anyway - Next.js will render 404
   *     return <a href={`/${targetLocale}`}>English (unavailable)</a>;
   *   }
   *
   *   return <a href={targetTranslation.slug}>English</a>;
   * }
   * ```
   */
  getTranslations(pathname: string): LocaleTranslations | undefined;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Raw document structure returned from Sanity GROQ query
 *
 * @remarks
 * This is an intermediate type used during `createLocaleMapping()` construction.
 * Not exposed to React components (internal to locale-mapper.ts).
 *
 * **Source**: `queryAllLocalizedPages` GROQ query in `query.ts`
 *
 * @internal
 */
export interface SanityLocalizedDocument {
  /** Sanity document ID */
  _id: string;

  /** Document type */
  _type: DocumentType;

  /** Document language (always 'en' for base query) */
  language: Locale;

  /** Document slug (without locale prefix) */
  slug: string;

  /** Document title */
  title: string;

  /**
   * Joined translations from translation.metadata
   *
   * @remarks
   * Array contains the base document PLUS all translations.
   * Length = number of available languages for this document.
   */
  _translations: Array<{
    _id: string;
    _type: DocumentType;
    language: Locale;
    slug: string;
    title: string;
  }>;
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Props for LocaleProvider component
 *
 * @remarks
 * Used to wrap the app tree and provide locale mapping to all child components.
 *
 * @example
 * ```tsx
 * // In root layout (Server Component)
 * import { LocaleProvider } from '@/contexts/locale-context';
 * import { createLocaleMapping } from '@/lib/sanity/locale-mapper';
 *
 * export default async function RootLayout({ children }) {
 *   const documents = await fetchAllLocalizedPages();
 *   const localeMapping = createLocaleMapping(documents);
 *
 *   return (
 *     <html>
 *       <body>
 *         <LocaleProvider localeMapping={localeMapping}>
 *           {children}
 *         </LocaleProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export interface LocaleProviderProps {
  /**
   * Locale mapping to provide to child components
   *
   * @remarks
   * Created by `createLocaleMapping()` in root layout.
   * Must be serializable (passed from Server to Client Component).
   */
  localeMapping: LocaleMapping;

  /**
   * Child components that will have access to locale context
   */
  children: React.ReactNode;
}

// ============================================================================
// Validation & Error Handling
// ============================================================================

/**
 * Error thrown when useLocale() is called outside LocaleProvider
 *
 * @remarks
 * This error indicates a component tree configuration issue.
 *
 * **Resolution**: Ensure the component using `useLocale()` is wrapped
 * in `<LocaleProvider>` higher up in the tree.
 *
 * @example
 * ```typescript
 * // ✗ ERROR: useLocale() called outside provider
 * function App() {
 *   return <LanguageSwitcher />; // Throws error!
 * }
 *
 * // ✓ CORRECT: Wrapped in LocaleProvider
 * function App({ localeMapping }) {
 *   return (
 *     <LocaleProvider localeMapping={localeMapping}>
 *       <LanguageSwitcher />
 *     </LocaleProvider>
 *   );
 * }
 * ```
 */
export class LocaleContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocaleContextError";
  }
}

// ============================================================================
// Usage Guidelines
// ============================================================================

/**
 * @remarks
 * **Provider Setup (Server Component)**:
 * ```tsx
 * // apps/web/src/app/[locale]/layout.tsx
 * import { LocaleProvider } from '@/contexts/locale-context';
 * import { createLocaleMapping } from '@/lib/sanity/locale-mapper';
 * import { fetchAllLocalizedPages } from '@/lib/sanity/query';
 *
 * export default async function LocaleLayout({ children }) {
 *   const documents = await fetchAllLocalizedPages();
 *   const localeMapping = createLocaleMapping(documents);
 *
 *   return (
 *     <LocaleProvider localeMapping={localeMapping}>
 *       {children}
 *     </LocaleProvider>
 *   );
 * }
 * ```
 *
 * **Consumer (Client Component)**:
 * ```tsx
 * // apps/web/src/components/language-switcher.tsx
 * 'use client';
 *
 * import { useLocale } from '@/contexts/locale-context';
 * import { usePathname } from 'next/navigation';
 * import { Link } from '@/i18n/navigation';
 * import type { Locale } from '@workspace/i18n-config';
 *
 * // Helper to get pathname pattern for document type
 * function getPathnamePattern(docType: string): string {
 *   switch (docType) {
 *     case 'homePage': return '/';
 *     case 'blogIndex': return '/blog';
 *     case 'blog': return '/blog/[slug]';
 *     case 'page': return '/[slug]';
 *     default: return '/[slug]';
 *   }
 * }
 *
 * export function LanguageSwitcher() {
 *   const pathname = usePathname(); // Full pathname with locale prefix
 *   const { getTranslations } = useLocale();
 *   const translations = getTranslations(pathname);
 *
 *   if (!translations) {
 *     return null; // Page not in mapping
 *   }
 *
 *   return (
 *     <div>
 *       {(['en', 'fr'] as Locale[]).map((locale) => {
 *         const translation = translations[locale];
 *         if (!translation) {
 *           // Translation doesn't exist, but still show option
 *           // Clicking will navigate to 404 page
 *           return (
 *             <button key={locale} disabled>
 *               {locale.toUpperCase()} (unavailable)
 *             </button>
 *           );
 *         }
 *
 *         const pattern = getPathnamePattern(translation._type);
 *         const hasSlugParam = pattern.includes('[slug]');
 *
 *         return (
 *           <Link
 *             key={locale}
 *             href={hasSlugParam
 *               ? { pathname: pattern, params: { slug: translation.slug } }
 *               : pattern
 *             }
 *             locale={locale}
 *           >
 *             {locale.toUpperCase()}
 *           </Link>
 *         );
 *       })}
 *     </div>
 *   );
 * }
 * // Example: User on /fr/blogue/mon-article, clicks English
 * // translation.slug = 'complete-guide'
 * // pattern = '/blog/[slug]'
 * // Link generates: /en/blog/complete-guide
 * ```
 *
 * **Testing**:
 * ```typescript
 * import { renderHook } from '@testing-library/react';
 * import { LocaleProvider, useLocale } from '@/contexts/locale-context';
 * import type { LocaleMapping } from './locale-context-api';
 *
 * describe('useLocale', () => {
 *   const mockMapping: LocaleMapping = {
 *     // English blog post lookup key
 *     '/en/blog/test': {
 *       'en': { slug: 'test', title: 'Test', _id: '1', _type: 'blog' },
 *       'fr': { slug: 'test-fr', title: 'Test FR', _id: '2', _type: 'blog' }
 *     },
 *     // French blog post lookup key (bidirectional)
 *     '/fr/blogue/test-fr': {
 *       'en': { slug: 'test', title: 'Test', _id: '1', _type: 'blog' },
 *       'fr': { slug: 'test-fr', title: 'Test FR', _id: '2', _type: 'blog' }
 *     }
 *   };
 *
 *   it('should return translations for valid pathname', () => {
 *     const wrapper = ({ children }) => (
 *       <LocaleProvider localeMapping={mockMapping}>{children}</LocaleProvider>
 *     );
 *
 *     const { result } = renderHook(() => useLocale(), { wrapper });
 *     const translations = result.current.getTranslations('/en/blog/test');
 *
 *     expect(translations).toBeDefined();
 *     expect(translations!['en'].slug).toBe('test');
 *     expect(translations!['fr'].slug).toBe('test-fr');
 *   });
 *
 *   it('should support bidirectional lookup', () => {
 *     const wrapper = ({ children }) => (
 *       <LocaleProvider localeMapping={mockMapping}>{children}</LocaleProvider>
 *     );
 *
 *     const { result } = renderHook(() => useLocale(), { wrapper });
 *
 *     // Lookup from English URL
 *     const fromEn = result.current.getTranslations('/en/blog/test');
 *     // Lookup from French URL
 *     const fromFr = result.current.getTranslations('/fr/blogue/test-fr');
 *
 *     // Both should return same translations
 *     expect(fromEn).toEqual(fromFr);
 *   });
 *
 *   it('should return undefined for invalid pathname', () => {
 *     const wrapper = ({ children }) => (
 *       <LocaleProvider localeMapping={mockMapping}>{children}</LocaleProvider>
 *     );
 *
 *     const { result } = renderHook(() => useLocale(), { wrapper });
 *     const translations = result.current.getTranslations('/nonexistent');
 *
 *     expect(translations).toBeUndefined();
 *   });
 *
 *   it('should throw error when used outside provider', () => {
 *     expect(() => {
 *       renderHook(() => useLocale());
 *     }).toThrow(LocaleContextError);
 *   });
 * });
 * ```
 */

// ============================================================================
// Contract Versioning
// ============================================================================

/**
 * Contract Version: 1.0.0
 *
 * **Breaking Changes**:
 * - None (initial version)
 *
 * **Change Log**:
 * - 2025-11-13: Initial contract definition
 *
 * **Compatibility**:
 * - Next.js: 15.x
 * - React: 19.x
 * - TypeScript: 5.9.2+
 * - @workspace/i18n-config: 1.0.0+
 */
export const CONTRACT_VERSION = "1.0.0" as const;
