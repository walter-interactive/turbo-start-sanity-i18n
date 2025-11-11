import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { logger } from "./lib/logger";

/**
 * Next-intl middleware with error logging
 *
 * The middleware handles:
 * 1. Locale detection from URL, cookie, and Accept-Language header
 * 2. Automatic redirects to add/change locale prefix
 * 3. Setting NEXT_LOCALE cookie for persistence
 * 4. Adding x-next-intl-locale header for server components
 * 5. Logging locale detection failures and fallbacks
 */
const intlMiddleware = createMiddleware(routing);

/**
 * Middleware wrapper with error logging
 */
export default function middleware(request: NextRequest) {
  try {
    // Call next-intl middleware
    const response = intlMiddleware(request);

    const pathname = request.nextUrl.pathname;
    const acceptLanguage = request.headers.get("accept-language");
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;

    // Log locale detection context
    logger.info("Locale detection", {
      pathname,
      acceptLanguage: acceptLanguage || "none",
      cookieLocale: cookieLocale || "none",
    });

    // Check if a redirect occurred
    if (
      response.status === 307 ||
      (response.status === 308 &&
        pathname !== response.headers.get("location"))
    ) {
      const redirectTo = response.headers.get("location");
      logger.info("Locale redirect applied", {
        from: pathname,
        to: redirectTo || "unknown",
        acceptLanguage: acceptLanguage || "none",
        cookieLocale: cookieLocale || "none",
      });
    }

    return response;
  } catch (error) {
    // Log middleware errors (always log errors regardless of environment)
    logger.error("Middleware error during locale detection", {
      pathname: request.nextUrl.pathname,
      error: error instanceof Error ? error.message : String(error),
    });

    // Re-throw to let Next.js handle the error
    throw error;
  }
}

/**
 * Middleware configuration
 *
 * Match all pathnames except for:
 * - API routes (/api/*)
 * - Static files (favicon.ico, images, etc.)
 * - Next.js internals (/_next/*)
 * - Vercel deployment files (/_vercel/*)
 */
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
