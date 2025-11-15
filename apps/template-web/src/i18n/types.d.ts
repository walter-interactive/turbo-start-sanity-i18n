/**
 * TypeScript type augmentation for next-intl translation keys
 *
 * This file provides compile-time type safety for all translation keys used
 * throughout the application. By augmenting next-intl's global IntlMessages
 * interface, we enable:
 *
 * 1. **Autocomplete**: IDE suggestions for all available translation keys
 * 2. **Type Safety**: Compile-time errors for typos or missing keys
 * 3. **Refactoring Support**: Safe renaming of translation keys across the codebase
 * 4. **Documentation**: Developers can discover available translations without opening JSON files
 *
 * ## How It Works
 *
 * - Imports the English message file (en.json) as the source of truth
 * - TypeScript automatically infers all nested key structures
 * - Augments next-intl's global IntlMessages interface with our message types
 * - All useTranslations() and getTranslations() calls become type-safe
 *
 * ## Usage Examples
 *
 * ```typescript
 * // Client Components
 * import { useTranslations } from 'next-intl';
 *
 * function MyComponent() {
 *   const t = useTranslations('common');
 *
 *   // ✅ TypeScript knows these are valid keys
 *   return <p>{t('readMore')}</p>;
 *
 *   // ❌ TypeScript error: Property 'invalidKey' does not exist
 *   return <p>{t('invalidKey')}</p>;
 * }
 *
 * // Server Components
 * import { getTranslations } from 'next-intl/server';
 *
 * async function Page() {
 *   const t = await getTranslations('errors');
 *
 *   // ✅ Full autocomplete and type checking
 *   return <h1>{t('pageNotFound')}</h1>;
 * }
 * ```
 *
 * ## Why English as Source of Truth?
 *
 * We use en.json as the canonical type definition because:
 * - English is typically the base language for development
 * - All other language files (fr.json, etc.) should mirror the same structure
 * - TypeScript will error if French translations are missing keys
 * - Ensures consistency across all language files
 *
 * ## Maintenance
 *
 * - **Adding new translations**: Update messages/en.json first, types auto-update
 * - **Removing translations**: Delete from messages/en.json, TypeScript will show usage errors
 * - **Renaming keys**: Use IDE refactoring to safely update all usages
 *
 * @see https://next-intl.dev/docs/workflows/typescript
 */

import en from '../../messages/en.json' with { type: 'json' }

type Messages = typeof en

declare global {
  /**
   * Augment next-intl's IntlMessages interface with our application's
   * translation structure. This enables type-safe translation key access
   * throughout the entire application.
   */
  interface IntlMessages extends Messages {}
}
