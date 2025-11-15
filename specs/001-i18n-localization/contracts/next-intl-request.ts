/**
 * CONTRACT FILE - NOT FOR DIRECT EXECUTION
 *
 * Contract: next-intl Request Configuration
 * Location: apps/web/src/i18n/request.ts
 *
 * This file configures how next-intl handles incoming requests and loads messages.
 * It's called for every request to set up the translation context.
 *
 * NOTE: This is a reference/template file. Implement in actual source location.
 */

/* eslint-disable */
// @ts-nocheck

import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

/**
 * Request configuration for next-intl
 *
 * This function is called for every request (both server and client)
 * to set up the translation context with the appropriate locale and messages.
 *
 * @param requestLocale - The locale determined by middleware from the URL or headers
 * @returns Configuration object with locale, messages, and optional settings
 */
export default getRequestConfig(async ({ requestLocale }) => {
  /**
   * Get the requested locale
   * In App Router, this typically corresponds to the [locale] segment
   *
   * IMPORTANT: requestLocale is a Promise in Next.js 15+
   */
  const requested = await requestLocale

  /**
   * Validate and sanitize the locale
   * If the requested locale is not supported, fall back to default
   *
   * This prevents errors from invalid/malicious locale values
   */
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  /**
   * Load translation messages for the locale
   *
   * Messages are loaded dynamically to avoid bundling all languages
   * in the initial JavaScript bundle
   */
  const messages = (await import(`../../messages/${locale}.json`)).default

  /**
   * Optional: Load global/shared messages
   * Useful if you have messages split across multiple files
   *
   * @example
   * const commonMessages = (await import(`../../messages/common/${locale}.json`)).default;
   * const pageMessages = (await import(`../../messages/pages/${locale}.json`)).default;
   *
   * return {
   *   locale,
   *   messages: {
   *     ...commonMessages,
   *     ...pageMessages
   *   }
   * };
   */

  return {
    /**
     * The validated locale for this request
     */
    locale,

    /**
     * Translation messages for the locale
     */
    messages,

    /**
     * Optional: Time zone for date/time formatting
     * Can be determined from user preferences or request headers
     *
     * @example
     * timeZone: 'America/Montreal' // Quebec time zone
     */
    timeZone: 'America/Montreal'

    /**
     * Optional: Configure date/time formatting defaults
     *
     * @example
     * now: new Date(), // For relative time calculations
     */

    /**
     * Optional: Custom formatter functions
     * Allows overriding default formatting behavior
     *
     * @example
     * formats: {
     *   dateTime: {
     *     short: {
     *       day: 'numeric',
     *       month: 'short',
     *       year: 'numeric'
     *     }
     *   }
     * }
     */
  }
})

// ============================================================================
// Advanced Configuration Examples
// ============================================================================

/**
 * EXAMPLE: Multiple message file sources
 */

/*
export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Load messages from multiple sources
  const [commonMessages, pageMessages, errorMessages] = await Promise.all([
    import(`../../messages/common/${locale}.json`),
    import(`../../messages/pages/${locale}.json`),
    import(`../../messages/errors/${locale}.json`)
  ]);

  return {
    locale,
    messages: {
      ...commonMessages.default,
      ...pageMessages.default,
      ...errorMessages.default
    }
  };
});
*/

/**
 * EXAMPLE: User-specific locale (from database/session)
 */

/*
import {cookies} from 'next/headers';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;

  // Check for user preference cookie
  const cookieStore = await cookies();
  const userPreference = cookieStore.get('user_locale')?.value;

  // Priority: user preference > URL locale > default
  let locale = routing.defaultLocale;

  if (userPreference && hasLocale(routing.locales, userPreference)) {
    locale = userPreference;
  } else if (hasLocale(routing.locales, requested)) {
    locale = requested;
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {locale, messages};
});
*/

/**
 * EXAMPLE: Dynamic time zone from request headers
 */

/*
import {headers} from 'next/headers';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default;

  // Get time zone from Cloudflare header or default to Montreal
  const headersList = await headers();
  const timeZone = headersList.get('cf-timezone') || 'America/Montreal';

  return {
    locale,
    messages,
    timeZone
  };
});
*/

/**
 * EXAMPLE: Message caching and validation
 */

/*
const messageCache = new Map();

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Check cache first (per-request cache, not global)
  if (messageCache.has(locale)) {
    return {
      locale,
      messages: messageCache.get(locale)
    };
  }

  try {
    const messages = (await import(`../../messages/${locale}.json`)).default;

    // Validate message structure (development only)
    if (process.env.NODE_ENV === 'development') {
      validateMessages(messages);
    }

    messageCache.set(locale, messages);

    return {locale, messages};
  } catch (error) {
    console.error(`Failed to load messages for ${locale}:`, error);

    // Fallback to default locale messages
    const fallbackMessages = (await import(`../../messages/${routing.defaultLocale}.json`)).default;

    return {
      locale: routing.defaultLocale,
      messages: fallbackMessages
    };
  }
});

function validateMessages(messages: any) {
  // Check for missing required namespaces
  const requiredNamespaces = ['common', 'navigation', 'errors'];
  for (const ns of requiredNamespaces) {
    if (!messages[ns]) {
      console.warn(`Missing required namespace: ${ns}`);
    }
  }
}
*/

// ============================================================================
// Error Handling
// ============================================================================

/**
 * BEST PRACTICES FOR ERROR HANDLING:
 *
 * 1. Always validate locale with hasLocale()
 * 2. Always have a fallback to defaultLocale
 * 3. Handle message loading errors gracefully
 * 4. Log errors for monitoring
 * 5. Never throw errors - return fallback configuration
 *
 * @example
 * try {
 *   const messages = await import(`../../messages/${locale}.json`);
 *   return {locale, messages: messages.default};
 * } catch (error) {
 *   console.error('Message loading failed:', error);
 *   const fallback = await import(`../../messages/fr.json`);
 *   return {locale: 'fr', messages: fallback.default};
 * }
 */

// ============================================================================
// Performance Considerations
// ============================================================================

/**
 * OPTIMIZATION STRATEGIES:
 *
 * 1. MESSAGE FILE SIZE:
 *    - Keep message files under 50KB
 *    - Split large message files into namespaces
 *    - Load additional namespaces on-demand
 *
 * 2. DYNAMIC IMPORTS:
 *    - Message files are code-split automatically
 *    - Only the requested locale is loaded
 *    - Reduces initial bundle size
 *
 * 3. CACHING:
 *    - Message files are cached by Next.js build system
 *    - Request-level caching (Map) can reduce redundant imports
 *    - Don't cache globally (breaks per-request isolation)
 *
 * 4. PRELOADING:
 *    - Next.js automatically preloads locale files for visible routes
 *    - Use prefetch={true} on Links for better performance
 */

// ============================================================================
// Type Safety
// ============================================================================

/**
 * MESSAGE TYPE AUGMENTATION:
 *
 * Add to global.d.ts for type-safe translation keys:
 *
 * ```typescript
 * type Messages = typeof import('./messages/en.json');
 *
 * declare interface IntlMessages extends Messages {}
 * ```
 *
 * This enables autocomplete and type checking for:
 * - useTranslations('namespace')
 * - t('key')
 * - getTranslations({locale, namespace: 'key'})
 */

// ============================================================================
// Testing
// ============================================================================

/**
 * UNIT TEST EXAMPLE:
 *
 * ```typescript
 * import {getRequestConfig} from './request';
 *
 * describe('Request Config', () => {
 *   it('should return valid locale for supported language', async () => {
 *     const config = await getRequestConfig({
 *       requestLocale: Promise.resolve('en')
 *     });
 *
 *     expect(config.locale).toBe('en');
 *     expect(config.messages).toBeDefined();
 *   });
 *
 *   it('should fallback to default for unsupported language', async () => {
 *     const config = await getRequestConfig({
 *       requestLocale: Promise.resolve('de')
 *     });
 *
 *     expect(config.locale).toBe('fr'); // default
 *   });
 * });
 * ```
 */

// ============================================================================
// Implementation Notes
// ============================================================================

/**
 * IMPLEMENTATION CHECKLIST:
 *
 * 1. [ ] Create this file at apps/web/src/i18n/request.ts
 * 2. [ ] Import routing config
 * 3. [ ] Set up message loading with dynamic imports
 * 4. [ ] Configure time zone (America/Montreal for Quebec)
 * 5. [ ] Test with supported locales
 * 6. [ ] Test with unsupported locales (should fallback)
 * 7. [ ] Verify messages load correctly
 * 8. [ ] Add error handling for failed message loads
 * 9. [ ] Consider splitting large message files
 * 10. [ ] Set up type augmentation for message keys
 *
 * IMPORTANT CONSTRAINTS:
 * - MUST await requestLocale (Promise in Next.js 15+)
 * - MUST validate locale with hasLocale()
 * - MUST return fallback configuration on errors
 * - Message files MUST exist in messages/ directory
 * - Dynamic imports MUST use relative paths from this file
 * - Time zone SHOULD match Quebec/user location
 *
 * NEXT.JS INTEGRATION:
 * This file is referenced in next.config.ts:
 *
 * ```typescript
 * import createNextIntlPlugin from 'next-intl/plugin';
 *
 * const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
 *
 * export default withNextIntl({
 *   // ... other Next.js config
 * });
 * ```
 */
