/**
 * Centralized i18n configuration for the entire monorepo
 *
 * This is the SINGLE SOURCE OF TRUTH for:
 * - Supported locales/languages
 * - Default locale/language
 * - Locale types and metadata
 *
 * Used by:
 * - apps/web (Next.js routing, translations)
 * - apps/studio (Sanity document filtering, plugin config)
 */

// ============================================================================
// CORE CONFIGURATION (EDIT HERE TO CHANGE LOCALES)
// ============================================================================

/**
 * List of all supported locales
 * Order matters: First locale is treated as default for Quebec compliance (Bill 101)
 *
 * @example
 * import { LOCALES } from '@workspace/i18n-config';
 * console.log(LOCALES); // ["fr", "en"]
 */
export const LOCALES = ["fr", "en"] as const;

/**
 * Default locale for the application
 * Derived from LOCALES[0] for single source of truth
 *
 * French is default for Quebec compliance (Bill 101)
 *
 * @example
 * import { DEFAULT_LOCALE } from '@workspace/i18n-config';
 * console.log(DEFAULT_LOCALE); // "fr"
 */
export const DEFAULT_LOCALE = LOCALES[0];

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Locale type derived from LOCALES array
 * Ensures type safety across the monorepo
 *
 * @example
 * import type { Locale } from '@workspace/i18n-config';
 * const locale: Locale = "fr"; // ✅ Valid
 * const invalid: Locale = "es"; // ❌ Type error
 */
export type Locale = (typeof LOCALES)[number];

/**
 * Language configuration for Sanity plugin
 * Maps locale codes to human-readable titles
 */
export interface LanguageConfig {
  id: Locale;
  title: string;
}

// ============================================================================
// LOCALE METADATA
// ============================================================================

/**
 * Display metadata for each locale
 * Used for UI components (language switchers, locale selectors)
 */
export const LOCALE_METADATA: Record<
  Locale,
  {
    name: string;
    nativeName: string;
    direction: "ltr" | "rtl";
  }
> = {
  fr: {
    name: "French",
    nativeName: "Français",
    direction: "ltr",
  },
  en: {
    name: "English",
    nativeName: "English",
    direction: "ltr",
  },
} as const;

/**
 * Language configurations for Sanity document-internationalization plugin
 * Matches the structure required by @sanity/document-internationalization
 *
 * @example
 * import { SANITY_LANGUAGES } from '@workspace/i18n-config';
 *
 * documentInternationalization({
 *   supportedLanguages: SANITY_LANGUAGES,
 *   // ...
 * })
 */
export const SANITY_LANGUAGES: LanguageConfig[] = LOCALES.map((locale) => ({
  id: locale,
  title: LOCALE_METADATA[locale].nativeName,
}));

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Type guard to check if a string is a valid locale
 *
 * @param locale - String to validate as a locale
 * @returns True if the locale is valid
 *
 * @example
 * import { isValidLocale } from '@workspace/i18n-config';
 *
 * if (isValidLocale(userInput)) {
 *   // TypeScript knows userInput is 'fr' | 'en'
 *   const t = await getTranslations({ locale: userInput });
 * }
 */
export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

/**
 * Get locale from string with fallback to default locale
 *
 * @param locale - Optional locale string to validate
 * @returns Valid locale or default locale
 *
 * @example
 * import { getValidLocale } from '@workspace/i18n-config';
 *
 * const locale = getValidLocale(params.locale); // Always returns valid locale
 */
export function getValidLocale(locale: string | undefined): Locale {
  if (locale && isValidLocale(locale)) {
    return locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Get display name for a locale
 *
 * @param params - Configuration object
 * @param params.locale - ISO locale code to get name for
 * @param params.native - Whether to return native name (default: true)
 * @returns Display name for the locale
 *
 * @example
 * import { getLocaleName } from '@workspace/i18n-config';
 *
 * getLocaleName({ locale: 'fr' }); // 'Français'
 * getLocaleName({ locale: 'fr', native: false }); // 'French'
 */
export function getLocaleName(params: {
  locale: Locale;
  native?: boolean;
}): string {
  const { locale, native = true } = params;
  return native
    ? LOCALE_METADATA[locale].nativeName
    : LOCALE_METADATA[locale].name;
}

/**
 * Generate static params for all locales
 * Used in Next.js generateStaticParams
 *
 * @returns Array of locale params for generateStaticParams
 *
 * @example
 * import { getStaticLocaleParams } from '@workspace/i18n-config';
 *
 * export function generateStaticParams() {
 *   return getStaticLocaleParams();
 * }
 */
export function getStaticLocaleParams(): Array<{ locale: Locale }> {
  return LOCALES.map((locale) => ({ locale }));
}

// ============================================================================
// PATHNAME CONFIGURATION
// ============================================================================

/**
 * Localized pathname mappings for next-intl routing
 *
 * This is the SINGLE SOURCE OF TRUTH for all pathname translations.
 * Defines how routes map between languages (e.g., /blog → /blogue for French).
 *
 * Used by:
 * - apps/web/src/i18n/routing.ts (next-intl routing configuration)
 * - apps/web/src/lib/sanity/locale-mapper.ts (pathname pattern generation)
 * - apps/web/src/components/language-switcher.tsx (navigation)
 *
 * @example
 * import { PATHNAMES } from '@workspace/i18n-config';
 *
 * // Access pathname mappings
 * console.log(PATHNAMES['/blog']); // { en: '/blog', fr: '/blogue' }
 */
export const PATHNAMES = {
  // Homepage
  "/": {
    en: "/",
    fr: "/",
  },
  // Blog index
  "/blog": {
    en: "/blog",
    fr: "/blogue",
  },
  // Blog posts (dynamic route)
  "/blog/[slug]": {
    en: "/blog/[slug]",
    fr: "/blogue/[slug]",
  },
  // Regular pages (no prefix)
  "/[slug]": {
    en: "/[slug]",
    fr: "/[slug]",
  },
} as const;

/**
 * Type for pathname keys
 * Derived from PATHNAMES object keys
 */
export type PathnameKey = keyof typeof PATHNAMES;

/**
 * Sanity document types that support internationalization
 * Must match document types defined in Sanity Studio schemas
 */
export type DocumentType = "page" | "blog" | "homePage" | "blogIndex";

/**
 * Map Sanity document types to pathname patterns
 *
 * This mapping enables dynamic pathname generation from document types
 * without hardcoding routes in multiple places.
 *
 * @example
 * import { DOCUMENT_TYPE_TO_PATHNAME } from '@workspace/i18n-config';
 *
 * const pathname = DOCUMENT_TYPE_TO_PATHNAME['blog']; // '/blog/[slug]'
 */
export const DOCUMENT_TYPE_TO_PATHNAME: Record<DocumentType, PathnameKey> = {
  homePage: "/",
  blogIndex: "/blog",
  blog: "/blog/[slug]",
  page: "/[slug]",
} as const;

/**
 * Get pathname pattern for a document type
 *
 * Helper function to retrieve the pathname pattern for a given Sanity
 * document type. Uses the centralized mapping to ensure consistency.
 *
 * @param docType - Sanity document type
 * @returns Pathname pattern from routing config
 *
 * @example
 * import { getPathnameForDocType } from '@workspace/i18n-config';
 *
 * getPathnameForDocType('blog')      // '/blog/[slug]'
 * getPathnameForDocType('page')      // '/[slug]'
 * getPathnameForDocType('homePage')  // '/'
 * getPathnameForDocType('blogIndex') // '/blog'
 */
export function getPathnameForDocType(docType: DocumentType): PathnameKey {
  return DOCUMENT_TYPE_TO_PATHNAME[docType];
}
