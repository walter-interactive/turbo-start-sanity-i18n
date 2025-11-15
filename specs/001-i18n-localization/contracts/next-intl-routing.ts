/**
 * CONTRACT FILE - NOT FOR DIRECT EXECUTION
 *
 * Contract: next-intl Routing Configuration
 * Location: apps/web/src/i18n/routing.ts
 *
 * This file defines the central routing configuration for next-intl.
 * All locale-aware routing logic references this configuration.
 *
 * NOTE: This is a reference/template file. Implement in actual source location.
 */

/* eslint-disable */
// @ts-nocheck

import { defineRouting } from 'next-intl/routing'

// ============================================================================
// Routing Configuration
// ============================================================================

/**
 * Central routing configuration for the application
 *
 * This configuration is used by:
 * - src/middleware.ts (for locale detection and routing)
 * - src/i18n/navigation.ts (for type-safe navigation APIs)
 * - src/i18n/request.ts (for server-side locale access)
 * - All pages and layouts (for static generation)
 */
export const routing = defineRouting({
  /**
   * List of all supported locales
   *
   * MUST match Sanity plugin configuration in apps/studio
   * Order matters: first locale is the default fallback
   */
  locales: ['fr', 'en'] as const,

  /**
   * Default locale (Quebec compliance)
   *
   * Used when:
   * - Browser language cannot be determined
   * - Requested locale is not supported
   * - Root path (/) is accessed
   */
  defaultLocale: 'fr',

  /**
   * Locale prefix strategy
   *
   * Options:
   * - 'always': Always show locale in URL (/fr/about, /en/about)
   * - 'as-needed': Only show non-default locales (/about for fr, /en/about for en)
   * - 'never': Never show locale (not recommended for multi-language sites)
   *
   * Recommendation: Use 'always' for:
   * - Clear SEO signals
   * - Consistent URL structure
   * - Better hreflang tag generation
   * - Avoids confusion about which language is default
   */
  localePrefix: 'always' as const

  /**
   * Pathnames configuration (optional)
   *
   * Allows different pathname patterns per locale
   * Useful for localized slug structures
   *
   * @example
   * pathnames: {
   *   '/about': {
   *     en: '/about',
   *     fr: '/a-propos'
   *   }
   * }
   */
  // pathnames: {} // Leave empty to use slug-based routing from Sanity
})

// ============================================================================
// Type Exports for Type Safety
// ============================================================================

/**
 * Export routing config type for use across the application
 */
export type Routing = typeof routing

/**
 * Locale type derived from routing configuration
 * Ensures type safety when working with locales
 */
export type Locale = (typeof routing.locales)[number] // 'fr' | 'en'

/**
 * Helper type for pathname objects
 */
export type Pathname =
  | string
  | { pathname: string; params?: Record<string, string> }

// ============================================================================
// Constants for Convenience
// ============================================================================

/**
 * Array of locales for iteration
 * Useful in generateStaticParams and mapping operations
 */
export const locales = [...routing.locales] // ['fr', 'en']

/**
 * Default locale constant
 * Used throughout the app for fallback logic
 */
export const defaultLocale = routing.defaultLocale // 'fr'

/**
 * Type guard to check if a string is a valid locale
 *
 * @example
 * if (isValidLocale(userInput)) {
 *   // TypeScript knows userInput is 'fr' | 'en'
 *   const t = await getTranslations({locale: userInput})
 * }
 */
export function isValidLocale(locale: string): locale is Locale {
  return routing.locales.includes(locale as Locale)
}

/**
 * Get locale from string with fallback
 *
 * @example
 * const locale = getValidLocale(params.locale) // Always returns valid locale
 */
export function getValidLocale(locale: string | undefined): Locale {
  if (locale && isValidLocale(locale)) {
    return locale
  }
  return defaultLocale
}

// ============================================================================
// Locale Display Configuration
// ============================================================================

/**
 * Locale metadata for UI display
 * Used in language switcher and meta tags
 */
export const localeMetadata: Record<
  Locale,
  {
    name: string
    nativeName: string
    direction: 'ltr' | 'rtl'
    flag?: string
  }
> = {
  fr: {
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    flag: '🇫🇷'
  },
  en: {
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    flag: '🇬🇧'
  }
}

/**
 * Get display name for locale
 *
 * @param locale - ISO locale code
 * @param native - Return native name (default: true)
 * @example
 * getLocaleName('fr') // 'Français'
 * getLocaleName('fr', false) // 'French'
 */
export function getLocaleName(locale: Locale, native = true): string {
  return native
    ? localeMetadata[locale].nativeName
    : localeMetadata[locale].name
}

// ============================================================================
// Static Generation Helpers
// ============================================================================

/**
 * Generate static params for all locales
 * Use in generateStaticParams() functions
 *
 * @example
 * export function generateStaticParams() {
 *   return getStaticLocaleParams();
 * }
 */
export function getStaticLocaleParams() {
  return locales.map((locale) => ({ locale }))
}

/**
 * Generate static params for all locales with additional params
 *
 * @example
 * export function generateStaticParams() {
 *   const slugs = ['about', 'contact'];
 *   return getStaticLocaleParamsWithSlugs(slugs);
 * }
 * // Returns: [{locale: 'fr', slug: 'about'}, {locale: 'en', slug: 'about'}, ...]
 */
export function getStaticLocaleParamsWithSlugs(slugs: string[]) {
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

// ============================================================================
// URL Helpers
// ============================================================================

/**
 * Build URL with locale prefix
 *
 * @example
 * buildLocalizedUrl('en', '/about') // '/en/about'
 * buildLocalizedUrl('fr', '/blog/post-1') // '/fr/blog/post-1'
 */
export function buildLocalizedUrl(locale: Locale, pathname: string): string {
  // Ensure pathname starts with /
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`

  if (routing.localePrefix === 'always') {
    return `/${locale}${normalizedPath}`
  }

  // as-needed: only add prefix for non-default locales
  if (routing.localePrefix === 'as-needed' && locale !== defaultLocale) {
    return `/${locale}${normalizedPath}`
  }

  return normalizedPath
}

/**
 * Parse locale from URL pathname
 *
 * @example
 * parseLocaleFromPathname('/en/about') // 'en'
 * parseLocaleFromPathname('/about') // 'fr' (default)
 */
export function parseLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length > 0 && isValidLocale(segments[0])) {
    return segments[0] as Locale
  }

  return defaultLocale
}

// ============================================================================
// Configuration Notes
// ============================================================================

/**
 * IMPLEMENTATION CHECKLIST:
 *
 * 1. [ ] Create this file at apps/web/src/i18n/routing.ts
 * 2. [ ] Ensure locales match Sanity plugin configuration
 * 3. [ ] Set correct defaultLocale (fr for Quebec compliance)
 * 4. [ ] Choose appropriate localePrefix strategy
 * 5. [ ] Update localeMetadata if adding new languages
 * 6. [ ] Import in middleware.ts
 * 7. [ ] Import in navigation.ts
 * 8. [ ] Import in request.ts
 * 9. [ ] Use getStaticLocaleParams() in all layouts/pages
 * 10. [ ] Add new locales to messages/ directory
 *
 * CONFIGURATION VALIDATION:
 * - locales array is not empty: ✓
 * - defaultLocale is in locales array: ✓
 * - locales match Sanity supportedLanguages: TODO
 * - Message files exist for all locales: TODO
 *
 * IMPORTANT CONSTRAINTS:
 * - MUST NOT modify locales array at runtime (static config)
 * - defaultLocale determines fallback behavior throughout app
 * - localePrefix='always' recommended for SEO and clarity
 * - Adding new locale requires: routing config + message file + Sanity config
 */
