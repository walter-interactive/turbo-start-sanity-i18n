/**
 * Contract: @workspace/i18n-config Package
 *
 * This file defines the TypeScript contracts for the centralized i18n configuration package.
 * The package will be created at packages/i18n-config/ and consumed by both apps/web and apps/studio.
 *
 * Purpose: Single source of truth for locale configuration across the entire monorepo
 */

// ============================================================================
// EXPORTED CONSTANTS
// ============================================================================

/**
 * Array of supported locale codes
 * Order matters: First locale is the default
 *
 * Type: readonly ["fr", "en"]
 *
 * @example
 * import { LOCALES } from '@workspace/i18n-config';
 * console.log(LOCALES); // ["fr", "en"]
 * console.log(LOCALES[0]); // "fr"
 */
export declare const LOCALES: readonly ['fr', 'en']

/**
 * Default locale for the application
 * Derived from LOCALES[0]
 *
 * Type: "fr"
 *
 * @example
 * import { DEFAULT_LOCALE } from '@workspace/i18n-config';
 * console.log(DEFAULT_LOCALE); // "fr"
 */
export declare const DEFAULT_LOCALE: 'fr'

// ============================================================================
// EXPORTED TYPES
// ============================================================================

/**
 * Union type of all supported locale codes
 * Derived from LOCALES array for type safety
 *
 * Type: "fr" | "en"
 *
 * @example
 * import type { Locale } from '@workspace/i18n-config';
 * const validLocale: Locale = "fr"; // ✅
 * const invalidLocale: Locale = "es"; // ❌ Type error
 */
export type Locale = (typeof LOCALES)[number]

/**
 * Language configuration object for Sanity plugin
 * Maps locale codes to human-readable titles
 *
 * @example
 * const lang: LanguageConfig = { id: "fr", title: "Français" };
 */
export interface LanguageConfig {
  /** Locale code matching Locale type */
  id: Locale
  /** Human-readable language name (in native language) */
  title: string
}

/**
 * Locale metadata for UI display
 * Contains display names and text direction
 */
export interface LocaleMetadata {
  /** English name of the language */
  name: string
  /** Native name of the language */
  nativeName: string
  /** Text direction for the locale */
  direction: 'ltr' | 'rtl'
}

// ============================================================================
// EXPORTED DATA STRUCTURES
// ============================================================================

/**
 * Metadata for each supported locale
 * Used for language switchers and locale selectors
 *
 * Type: Record<Locale, LocaleMetadata>
 *
 * @example
 * import { LOCALE_METADATA } from '@workspace/i18n-config';
 * console.log(LOCALE_METADATA.fr.nativeName); // "Français"
 * console.log(LOCALE_METADATA.en.direction); // "ltr"
 */
export declare const LOCALE_METADATA: Record<Locale, LocaleMetadata>

/**
 * Language configurations for Sanity document-internationalization plugin
 * Ready to use in plugin configuration
 *
 * Type: LanguageConfig[]
 *
 * @example
 * import { SANITY_LANGUAGES } from '@workspace/i18n-config';
 *
 * documentInternationalization({
 *   supportedLanguages: SANITY_LANGUAGES,
 *   schemaTypes: ['page', 'blog']
 * })
 */
export declare const SANITY_LANGUAGES: LanguageConfig[]

// ============================================================================
// EXPORTED FUNCTIONS
// ============================================================================

/**
 * Type guard to check if a string is a valid locale
 * Narrows type from string to Locale
 *
 * @param locale - String to validate
 * @returns True if locale is valid, with type narrowing
 *
 * @example
 * import { isValidLocale } from '@workspace/i18n-config';
 *
 * const userInput = "fr";
 * if (isValidLocale(userInput)) {
 *   // TypeScript knows userInput is Locale type here
 *   const t = await getTranslations({ locale: userInput });
 * }
 */
export declare function isValidLocale(locale: string): locale is Locale

/**
 * Get valid locale with fallback to default
 * Never returns undefined
 *
 * @param locale - Optional locale string to validate
 * @returns Valid locale or DEFAULT_LOCALE
 *
 * @example
 * import { getValidLocale } from '@workspace/i18n-config';
 *
 * getValidLocale("fr"); // "fr"
 * getValidLocale("invalid"); // "fr" (fallback)
 * getValidLocale(undefined); // "fr" (fallback)
 */
export declare function getValidLocale(locale: string | undefined): Locale

/**
 * Get display name for a locale
 *
 * @param params - Configuration object
 * @param params.locale - Locale to get name for
 * @param params.native - Return native name if true (default: true)
 * @returns Display name string
 *
 * @example
 * import { getLocaleName } from '@workspace/i18n-config';
 *
 * getLocaleName({ locale: "fr" }); // "Français"
 * getLocaleName({ locale: "fr", native: false }); // "French"
 */
export declare function getLocaleName(params: {
  locale: Locale
  native?: boolean
}): string

/**
 * Generate static params for Next.js generateStaticParams
 *
 * @returns Array of locale param objects
 *
 * @example
 * import { getStaticLocaleParams } from '@workspace/i18n-config';
 *
 * export function generateStaticParams() {
 *   return getStaticLocaleParams();
 * }
 * // Returns: [{ locale: "fr" }, { locale: "en" }]
 */
export declare function getStaticLocaleParams(): Array<{ locale: Locale }>

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: Web App (Next.js) Usage
 *
 * File: apps/web/src/i18n/routing.ts
 *
 * import { LOCALES, DEFAULT_LOCALE, type Locale } from '@workspace/i18n-config';
 * import { defineRouting } from 'next-intl/routing';
 *
 * export const routing = defineRouting({
 *   locales: LOCALES,
 *   defaultLocale: DEFAULT_LOCALE,
 *   localePrefix: 'always' as const,
 * });
 *
 * export type { Locale };
 */

/**
 * EXAMPLE 2: Sanity Studio Plugin Config
 *
 * File: apps/studio/sanity.config.ts
 *
 * import { SANITY_LANGUAGES } from '@workspace/i18n-config';
 * import { documentInternationalization } from '@sanity/document-internationalization';
 *
 * export default defineConfig({
 *   plugins: [
 *     documentInternationalization({
 *       supportedLanguages: SANITY_LANGUAGES,
 *       schemaTypes: ['page', 'blog', 'faq'],
 *     }),
 *   ],
 * });
 */

/**
 * EXAMPLE 3: Studio Document Filtering
 *
 * File: apps/studio/components/language-filter.ts
 *
 * import { DEFAULT_LOCALE, type Locale } from '@workspace/i18n-config';
 * import type { SanityClient } from '@sanity/client';
 *
 * export async function fetchDocumentsByLanguage(
 *   client: SanityClient,
 *   schemaType: string,
 *   language: Locale = DEFAULT_LOCALE
 * ) {
 *   return client.fetch(`
 *     *[_type == $schemaType && language == $language] {
 *       _id, title, "slug": slug.current
 *     }
 *   `, { schemaType, language });
 * }
 */

/**
 * EXAMPLE 4: Type-Safe Language Validation
 *
 * File: Any file needing locale validation
 *
 * import { isValidLocale, getValidLocale, type Locale } from '@workspace/i18n-config';
 *
 * function handleUserInput(input: string) {
 *   if (isValidLocale(input)) {
 *     // TypeScript knows input is Locale type here
 *     console.log(`Valid locale: ${input}`);
 *   } else {
 *     const fallback: Locale = getValidLocale(input);
 *     console.log(`Invalid locale, using fallback: ${fallback}`);
 *   }
 * }
 */

// ============================================================================
// PACKAGE METADATA
// ============================================================================

/**
 * Package Name: @workspace/i18n-config
 * Location: packages/i18n-config/
 * Main Entry: src/index.ts
 *
 * Dependencies: None (pure TypeScript)
 * Dev Dependencies: @workspace/typescript-config, typescript
 *
 * Consumers:
 * - apps/web (Next.js routing, translations)
 * - apps/studio (Sanity plugin config, document filtering)
 *
 * Benefits:
 * - Single source of truth for locale configuration
 * - Type-safe locale handling across monorepo
 * - Easy to add/remove languages (one file change)
 * - No runtime overhead (compile-time constants)
 * - Follows TurboRepo workspace patterns
 */
