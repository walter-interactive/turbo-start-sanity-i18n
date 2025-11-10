import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Create middleware with routing configuration
 *
 * The middleware handles:
 * 1. Locale detection from URL, cookie, and Accept-Language header
 * 2. Automatic redirects to add/change locale prefix
 * 3. Setting NEXT_LOCALE cookie for persistence
 * 4. Adding x-next-intl-locale header for server components
 */
export default createMiddleware(routing);

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
