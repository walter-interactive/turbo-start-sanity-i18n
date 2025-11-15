/**
 * Slug Translation Context
 *
 * Provides translation navigation capabilities for the language switcher.
 * This context enables O(1) lookup of translated slugs without additional API calls.
 *
 * **Pattern**: Based on conciliainc.com implementation with React Context
 * **Usage**: Wrap app tree in SlugTranslationProvider, access via useSlugTranslation() hook
 *
 * @module slug-translation-context
 * @see {@link /specs/006-fix-language-switcher/contracts/locale-context-api.ts|API Contract}
 */

'use client'

import { createContext, useContext, useMemo } from 'react'
import type {
  LocaleMapping,
  LocaleTranslations
} from '@/lib/sanity/locale-mapper'

// ============================================================================
// Context Definition
// ============================================================================

/**
 * Context value providing access to slug translation mapping and utility functions
 *
 * @remarks
 * Provided by SlugTranslationProvider, consumed via useSlugTranslation() hook.
 * The context value is immutable after initialization (read-only).
 */
interface SlugTranslationContextValue {
  /**
   * Complete locale mapping (all documents, all languages)
   *
   * @remarks
   * Direct access to the full mapping. Prefer using getTranslations()
   * for safer access with better error handling.
   */
  localeMapping: LocaleMapping

  /**
   * Lookup translations for a given pathname
   *
   * @param pathname - Full pathname with locale prefix (e.g., "/fr/blog/slug")
   * @returns Translations for all languages, or undefined if not found
   *
   * @example
   * ```typescript
   * const translations = getTranslations('/en/blog/my-post');
   * if (translations?.fr) {
   *   // Navigate to French version
   *   router.push(translations.fr.slug);
   * }
   * ```
   */
  getTranslations(pathname: string): LocaleTranslations | undefined
}

/**
 * React Context for slug translation mapping
 *
 * @internal
 */
const SlugTranslationContext = createContext<
  SlugTranslationContextValue | undefined
>(undefined)

// ============================================================================
// Provider Component
// ============================================================================

/**
 * Props for SlugTranslationProvider component
 */
interface SlugTranslationProviderProps {
  /**
   * Locale mapping to provide to child components
   *
   * @remarks
   * Created by createLocaleMapping() in root layout.
   * Must be serializable (passed from Server to Client Component).
   */
  localeMapping: LocaleMapping

  /**
   * Child components that will have access to slug translation context
   */
  children: React.ReactNode
}

/**
 * SlugTranslationProvider Component
 *
 * Provides slug translation mapping context to all child components.
 * Must be placed high in the component tree (typically in root layout).
 *
 * @remarks
 * This is a Client Component that receives server-fetched data via props.
 * The context value is memoized to prevent unnecessary re-renders.
 *
 * **Note**: This is separate from next-intl's locale context. This provider
 * specifically handles slug translation mapping for language switching.
 *
 * @example
 * ```tsx
 * // In root layout (Server Component)
 * import { SlugTranslationProvider } from '@/contexts/slug-translation-context';
 * import { createLocaleMapping } from '@/lib/sanity/locale-mapper';
 *
 * export default async function RootLayout({ children }) {
 *   const documents = await fetchAllLocalizedPages();
 *   const localeMapping = createLocaleMapping(documents);
 *
 *   return (
 *     <html>
 *       <body>
 *         <SlugTranslationProvider localeMapping={localeMapping}>
 *           {children}
 *         </SlugTranslationProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function SlugTranslationProvider({
  localeMapping,
  children
}: SlugTranslationProviderProps) {
  /**
   * Memoized context value
   *
   * @remarks
   * Prevents re-renders when parent re-renders but localeMapping hasn't changed.
   * Since localeMapping is immutable, this is safe and efficient.
   */
  const value = useMemo<SlugTranslationContextValue>(
    () => ({
      localeMapping,
      getTranslations: (pathname: string) => localeMapping[pathname]
    }),
    [localeMapping]
  )

  return (
    <SlugTranslationContext.Provider value={value}>
      {children}
    </SlugTranslationContext.Provider>
  )
}

// ============================================================================
// Custom Hook
// ============================================================================

/**
 * Custom hook to access slug translation context
 *
 * @returns Slug translation context value with mapping and utility functions
 * @throws {Error} If called outside SlugTranslationProvider
 *
 * @remarks
 * Use this hook in any Client Component that needs access to translation data.
 * The hook provides type-safe access with automatic error handling.
 *
 * **Note**: This is separate from next-intl's useLocale() hook. This hook
 * specifically provides access to the slug translation mapping.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useSlugTranslation } from '@/contexts/slug-translation-context';
 * import { usePathname } from 'next/navigation';
 *
 * export function LanguageSwitcher() {
 *   const pathname = usePathname();
 *   const { getTranslations } = useSlugTranslation();
 *   const translations = getTranslations(pathname);
 *
 *   if (!translations) {
 *     return null; // Page not in mapping
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
 *
 * @example
 * ```tsx
 * // Error handling example
 * try {
 *   const { localeMapping } = useSlugTranslation();
 *   // Use localeMapping...
 * } catch (error) {
 *   // Handle missing provider
 *   console.error('useSlugTranslation must be used within SlugTranslationProvider');
 * }
 * ```
 */
export function useSlugTranslation(): SlugTranslationContextValue {
  const context = useContext(SlugTranslationContext)

  if (context === undefined) {
    throw new Error(
      'useSlugTranslation must be used within a SlugTranslationProvider. Ensure your component is wrapped in <SlugTranslationProvider> higher in the tree.'
    )
  }

  return context
}
