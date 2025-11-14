import {
  DEFAULT_LOCALE,
  getLocaleName as getLocaleNameBase,
  getStaticLocaleParams as getStaticLocaleParamsBase,
  isValidLocale as isValidLocaleBase,
  LOCALE_METADATA,
  LOCALES,
  type Locale,
  PATHNAMES,
} from "@workspace/i18n-config";
import { defineRouting } from "next-intl/routing";
import { logger } from "@/lib/logger";

/**
 * Re-export core configuration from shared package
 * This maintains backward compatibility for existing imports
 */
export { LOCALES, DEFAULT_LOCALE };
export type { Locale };

/**
 * Re-export pathnames from shared config
 * Maintains single source of truth for pathname mappings
 */
export const pathnames = PATHNAMES;

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
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  /**
   * Always show locale in URL for clear SEO signals
   */
  localePrefix: "always" as const,
  /**
   * Localized pathname mappings for different routes
   * Enables language-specific URLs (e.g., /blog → /blogue for French)
   */
  pathnames,
});

/**
 * Export routing config type for use across the application
 */
export type Routing = typeof routing;

/**
 * Helper type for pathname objects
 */
export type Pathname =
  | string
  | { pathname: string; params?: Record<string, string> };

/**
 * Type guard to check if a string is a valid locale
 * Re-exported from shared config for convenience
 */
export const isValidLocale = isValidLocaleBase;

/**
 * Get locale from string with fallback to default locale
 * Enhanced version with logging for web app
 *
 * @param locale - Optional locale string to validate
 * @returns Valid locale or default locale
 * @example
 * const locale = getValidLocale(params.locale) // Always returns valid locale
 */
export function getValidLocale(locale: string | undefined): Locale {
  if (locale && isValidLocale(locale)) {
    return locale;
  }

  // Log when falling back to default locale
  if (locale) {
    logger.warn("Invalid locale detected, falling back to default", {
      requested: locale,
      fallback: DEFAULT_LOCALE,
      validLocales: LOCALES.join(", "),
    });
  }

  return DEFAULT_LOCALE;
}

/**
 * Locale metadata for UI display
 * Re-exported from shared config for backward compatibility
 */
export const localeMetadata = LOCALE_METADATA;

/**
 * Get display name for a locale
 * Re-exported from shared config for convenience
 */
export const getLocaleName = getLocaleNameBase;

/**
 * Generate static params for all locales
 * Re-exported from shared config for convenience
 */
export const getStaticLocaleParams = getStaticLocaleParamsBase;
