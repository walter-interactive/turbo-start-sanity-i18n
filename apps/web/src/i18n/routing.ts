import { defineRouting } from "next-intl/routing";
import { logger } from "@/lib/logger";

/**
 * List of all supported locales
 * MUST match Sanity plugin configuration in apps/studio
 *
 * Note: French is first for Quebec compliance (Bill 101)
 */
export const LOCALES = ["fr", "en"] as const;

/**
 * Default locale (Quebec compliance)
 */
export const DEFAULT_LOCALE = LOCALES[0];

/**
 * Locale type derived from locales array
 */
export type Locale = (typeof LOCALES)[number];

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
 *
 * @param locale - String to validate as a locale
 * @returns True if the locale is valid
 * @example
 * if (isValidLocale(userInput)) {
 *   // TypeScript knows userInput is 'fr' | 'en'
 *   const t = await getTranslations({locale: userInput})
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
 */
export const localeMetadata: Record<
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
};

/**
 * Get display name for a locale
 *
 * @param params - Configuration object
 * @param params.locale - ISO locale code to get name for
 * @param params.native - Whether to return native name (default: true)
 * @returns Display name for the locale
 * @example
 * getLocaleName({locale: 'fr'}) // 'Français'
 * getLocaleName({locale: 'fr', native: false}) // 'French'
 */
export function getLocaleName(params: {
  locale: Locale;
  native?: boolean;
}): string {
  const { locale, native = true } = params;
  return native
    ? localeMetadata[locale].nativeName
    : localeMetadata[locale].name;
}

/**
 * Generate static params for all locales
 *
 * @returns Array of locale params for generateStaticParams
 * @example
 * export function generateStaticParams() {
 *   return getStaticLocaleParams();
 * }
 */
export function getStaticLocaleParams() {
  return LOCALES.map((locale) => ({ locale }));
}
