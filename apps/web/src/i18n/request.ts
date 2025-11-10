import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/**
 * Request configuration for next-intl
 *
 * This function is called for every request (both server and client)
 * to set up the translation context with the appropriate locale and messages.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  /**
   * Get the requested locale
   * IMPORTANT: requestLocale is a Promise in Next.js 15+
   */
  const requested = await requestLocale;

  /**
   * Validate and sanitize the locale
   * If the requested locale is not supported, fall back to default
   */
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  /**
   * Load translation messages for the locale
   * Messages are loaded dynamically to avoid bundling all languages
   */
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    /**
     * Time zone for date/time formatting (Quebec)
     */
    timeZone: "America/Montreal",
  };
});
