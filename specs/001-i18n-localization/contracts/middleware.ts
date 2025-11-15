/**
 * CONTRACT FILE - NOT FOR DIRECT EXECUTION
 *
 * Contract: Middleware for Locale Detection and Routing
 * Location: apps/web/src/middleware.ts
 *
 * This middleware handles automatic locale detection and URL routing.
 * It runs on every request to ensure proper locale handling.
 *
 * NOTE: This is a reference/template file. Implement in actual source location.
 */

/* eslint-disable */
// @ts-nocheck

import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

/**
 * Create middleware with routing configuration
 *
 * The middleware handles:
 * 1. Locale detection from URL, cookie, and Accept-Language header
 * 2. Automatic redirects to add/change locale prefix
 * 3. Setting NEXT_LOCALE cookie for persistence
 * 4. Adding x-next-intl-locale header for server components
 */
export default createMiddleware(routing)

/**
 * Middleware configuration
 *
 * Defines which routes the middleware should run on
 */
export const config = {
  /**
   * Match all pathnames except for:
   * - API routes (/api/*)
   * - Static files (favicon.ico, images, etc.)
   * - Next.js internals (/_next/*)
   * - Vercel deployment files (/_vercel/*)
   *
   * This pattern is recommended by next-intl documentation
   */
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}

// ============================================================================
// Middleware Flow Diagram
// ============================================================================

/**
 * REQUEST FLOW:
 *
 * 1. User requests: /about
 *    ↓
 * 2. Middleware runs
 *    ↓
 * 3. Check for locale in URL → Not found
 *    ↓
 * 4. Check NEXT_LOCALE cookie → 'fr'
 *    ↓
 * 5. Redirect to: /fr/about
 *    ↓
 * 6. Page renders with locale='fr'
 *
 * ---
 *
 * 1. User requests: /en/about
 *    ↓
 * 2. Middleware runs
 *    ↓
 * 3. Check for locale in URL → 'en' found
 *    ↓
 * 4. Validate 'en' is supported → Yes
 *    ↓
 * 5. Set NEXT_LOCALE cookie → 'en'
 *    ↓
 * 6. Set x-next-intl-locale header → 'en'
 *    ↓
 * 7. Continue to page (no redirect)
 *    ↓
 * 8. Page renders with locale='en'
 *
 * ---
 *
 * 1. User requests: /de/about (unsupported locale)
 *    ↓
 * 2. Middleware runs
 *    ↓
 * 3. Check for locale in URL → 'de' found
 *    ↓
 * 4. Validate 'de' is supported → No
 *    ↓
 * 5. Redirect to: /fr/about (default locale)
 *    ↓
 * 6. Page renders with locale='fr'
 */

// ============================================================================
// Custom Middleware Configuration
// ============================================================================

/**
 * EXAMPLE: Custom middleware with additional logic
 *
 * If you need to run custom logic alongside locale detection,
 * you can compose middlewares:
 */

/*
import createIntlMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {routing} from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 1. Run custom logic BEFORE locale detection
  // Example: Authentication check
  const token = request.cookies.get('auth_token')?.value;
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Run locale detection middleware
  const response = intlMiddleware(request);

  // 3. Run custom logic AFTER locale detection
  // Example: Add custom headers
  response.headers.set('X-Custom-Header', 'value');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
*/

// ============================================================================
// Matcher Pattern Examples
// ============================================================================

/**
 * EXAMPLE: Match specific paths only
 *
 * Only run middleware on certain routes:
 */

/*
export const config = {
  matcher: [
    // Match all routes EXCEPT static files
    '/((?!api|_next|_vercel|.*\\..*).*)',

    // ALSO explicitly match specific routes with dots
    // (e.g., /users/jane.doe)
    '/([\\w-]+)?/users/(.+)'
  ]
};
*/

/**
 * EXAMPLE: Exclude additional paths
 *
 * Don't run middleware on webhooks or specific API routes:
 */

/*
export const config = {
  matcher: [
    // Exclude: api, webhooks, _next, _vercel, and files with extensions
    '/((?!api|webhooks|_next|_vercel|.*\\..*).*)'
  ]
};
*/

/**
 * EXAMPLE: Include only specific language-aware routes
 */

/*
export const config = {
  matcher: [
    '/',
    '/(fr|en)/:path*' // Only match localized routes
  ]
};
*/

// ============================================================================
// Advanced Middleware Patterns
// ============================================================================

/**
 * PATTERN: Conditional locale detection
 *
 * Different behavior for different route segments:
 */

/*
import createIntlMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {routing} from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  // Skip locale detection for admin routes (force English)
  if (pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Normal locale detection for other routes
  return intlMiddleware(request);
}
*/

/**
 * PATTERN: Locale-based redirects
 *
 * Redirect to different domains based on locale:
 */

/*
export default function middleware(request: NextRequest) {
  const locale = request.cookies.get('NEXT_LOCALE')?.value || 'fr';

  // Redirect English users to .com domain
  if (locale === 'en' && request.nextUrl.hostname.endsWith('.ca')) {
    const url = new URL(request.url);
    url.hostname = url.hostname.replace('.ca', '.com');
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}
*/

/**
 * PATTERN: A/B testing with locales
 */

/*
import {NextResponse} from 'next/server';

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // 50% of French users see experimental variant
  if (response.headers.get('x-next-intl-locale') === 'fr' && Math.random() < 0.5) {
    response.cookies.set('ab_variant', 'experimental');
  }

  return response;
}
*/

// ============================================================================
// Debugging Middleware
// ============================================================================

/**
 * DEBUG: Log middleware execution
 *
 * Useful for understanding middleware behavior in development:
 */

/*
export default function middleware(request: NextRequest) {
  console.log('🌐 Middleware executing for:', request.nextUrl.pathname);
  console.log('  Cookie locale:', request.cookies.get('NEXT_LOCALE')?.value);
  console.log('  Accept-Language:', request.headers.get('accept-language'));

  const response = intlMiddleware(request);

  console.log('  Final locale:', response.headers.get('x-next-intl-locale'));
  console.log('  Response status:', response.status);

  return response;
}
*/

// ============================================================================
// Performance Considerations
// ============================================================================

/**
 * OPTIMIZATION TIPS:
 *
 * 1. MATCHER SPECIFICITY:
 *    - Keep matcher patterns as specific as possible
 *    - Exclude static assets to reduce middleware runs
 *    - Avoid overly broad patterns
 *
 * 2. MIDDLEWARE EXECUTION:
 *    - Middleware runs on EVERY matched request
 *    - Keep custom logic lightweight
 *    - Avoid database queries or external API calls
 *    - Use Edge Runtime for better performance
 *
 * 3. CACHING:
 *    - Middleware responses are cached by Next.js
 *    - Cookie values affect cache keys
 *    - Use vary headers appropriately
 *
 * 4. EDGE RUNTIME:
 *    - next-intl middleware is Edge-compatible
 *    - Runs closer to users (lower latency)
 *    - Limited Node.js APIs available
 */

// ============================================================================
// Common Issues and Solutions
// ============================================================================

/**
 * ISSUE: Middleware not running
 * SOLUTION: Check matcher pattern, verify file is at src/middleware.ts
 *
 * ISSUE: Infinite redirect loop
 * SOLUTION: Ensure locale validation logic doesn't conflict with routing config
 *
 * ISSUE: Locale not persisting
 * SOLUTION: Verify NEXT_LOCALE cookie is being set, check cookie settings
 *
 * ISSUE: Static files returning 404
 * SOLUTION: Update matcher to exclude file extensions: '/((?!.*\\..*).*)'
 *
 * ISSUE: API routes getting locale prefix
 * SOLUTION: Exclude /api from matcher pattern
 */

// ============================================================================
// Testing Middleware
// ============================================================================

/**
 * MANUAL TESTING CHECKLIST:
 *
 * 1. [ ] Request /about → redirects to /fr/about (default locale)
 * 2. [ ] Request /en/about → stays at /en/about
 * 3. [ ] Request /fr/about → stays at /fr/about
 * 4. [ ] Request /de/about → redirects to /fr/about (unsupported)
 * 5. [ ] Set NEXT_LOCALE cookie to 'en', request /about → /en/about
 * 6. [ ] Accept-Language: en → redirects to /en/about
 * 7. [ ] Accept-Language: fr → redirects to /fr/about
 * 8. [ ] Static files accessible: /favicon.ico works
 * 9. [ ] API routes work: /api/test returns 200
 * 10. [ ] Cookie persists across requests
 *
 * AUTOMATED TESTING:
 *
 * ```typescript
 * import {NextRequest} from 'next/server';
 * import middleware from './middleware';
 *
 * describe('Middleware', () => {
 *   it('should redirect root to default locale', () => {
 *     const request = new NextRequest(new URL('http://localhost/about'));
 *     const response = middleware(request);
 *
 *     expect(response.status).toBe(307);
 *     expect(response.headers.get('location')).toBe('/fr/about');
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
 * 1. [ ] Create this file at apps/web/src/middleware.ts
 * 2. [ ] Import routing configuration
 * 3. [ ] Create middleware with createMiddleware()
 * 4. [ ] Configure matcher pattern
 * 5. [ ] Test locale detection from URL
 * 6. [ ] Test locale detection from cookie
 * 7. [ ] Test Accept-Language header fallback
 * 8. [ ] Verify redirects work correctly
 * 9. [ ] Ensure static files are accessible
 * 10. [ ] Verify API routes are not affected
 *
 * IMPORTANT CONSTRAINTS:
 * - File MUST be named middleware.ts (not middleware.js)
 * - File MUST be at root of src/ directory
 * - Default export MUST be the middleware function
 * - Named export 'config' MUST define matcher
 * - Middleware runs on Edge Runtime (limited APIs)
 * - MUST NOT use Node.js-specific APIs
 * - Keep execution time minimal (< 50ms recommended)
 *
 * DEPLOYMENT CONSIDERATIONS:
 * - Middleware runs on every matched request
 * - Consider Vercel Edge Network for global deployment
 * - Monitor middleware execution time
 * - Test in production-like environment
 * - Verify cookie settings work with your domain
 */
