/**
 * CONTRACT FILE - NOT FOR DIRECT EXECUTION
 *
 * Contract: next-intl Navigation APIs
 * Location: apps/web/src/i18n/navigation.ts
 *
 * This file creates locale-aware navigation APIs that wrap Next.js navigation.
 * Use these instead of next/navigation to ensure locale handling.
 *
 * NOTE: This is a reference/template file. Implement in actual source location.
 */

/* eslint-disable */
// @ts-nocheck

import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// ============================================================================
// Navigation API Creation
// ============================================================================

/**
 * Creates locale-aware navigation APIs
 *
 * These are lightweight wrappers around Next.js navigation APIs that:
 * - Automatically handle locale prefixes
 * - Maintain current locale when navigating
 * - Allow explicit locale switching
 * - Provide type-safe navigation
 */
export const {
  /**
   * Locale-aware Link component
   * Drop-in replacement for next/link
   *
   * @example
   * import {Link} from '@/i18n/navigation'
   *
   * <Link href="/about">About</Link>
   * // Renders: <a href="/fr/about"> (if current locale is fr)
   *
   * // Switch locale explicitly
   * <Link href="/about" locale="en">English Version</Link>
   */
  Link,

  /**
   * Locale-aware redirect function
   * Use in Server Components and Server Actions
   *
   * @example
   * import {redirect} from '@/i18n/navigation'
   *
   * redirect('/dashboard')
   * // Redirects to: /fr/dashboard (maintains current locale)
   *
   * // Explicit locale
   * redirect({pathname: '/dashboard', locale: 'en'})
   */
  redirect,

  /**
   * Get current pathname without locale prefix
   * Use in Server Components
   *
   * @example
   * import {getPathname} from '@/i18n/navigation'
   *
   * const pathname = await getPathname()
   * // Current URL: /fr/about → returns '/about'
   * // Current URL: /en/blog/post-1 → returns '/blog/post-1'
   */
  getPathname,

  /**
   * Locale-aware usePathname hook
   * Use in Client Components
   *
   * @example
   * 'use client'
   * import {usePathname} from '@/i18n/navigation'
   *
   * export function MyComponent() {
   *   const pathname = usePathname()
   *   // Current URL: /fr/about → returns '/about'
   *   return <div>Current: {pathname}</div>
   * }
   */
  usePathname,

  /**
   * Locale-aware useRouter hook
   * Use in Client Components
   *
   * @example
   * 'use client'
   * import {useRouter} from '@/i18n/navigation'
   *
   * export function MyComponent() {
   *   const router = useRouter()
   *
   *   const handleNavigate = () => {
   *     router.push('/contact')
   *     // Navigates to: /fr/contact (maintains locale)
   *   }
   *
   *   const handleSwitchLanguage = () => {
   *     router.replace('/contact', {locale: 'en'})
   *     // Navigates to: /en/contact (switches locale)
   *   }
   *
   *   return <button onClick={handleNavigate}>Navigate</button>
   * }
   */
  useRouter,
} = createNavigation(routing);

// ============================================================================
// Usage Examples by Component Type
// ============================================================================

/**
 * CLIENT COMPONENT EXAMPLE
 */

/*
'use client'

import {Link, usePathname, useRouter} from '@/i18n/navigation'
import {useLocale} from 'next-intl'

export function ClientNavigationExample() {
  const pathname = usePathname() // e.g., '/about'
  const router = useRouter()
  const locale = useLocale() // e.g., 'fr'

  return (
    <nav>
      {/_ Simple link (maintains locale) _/}
      <Link href="/about">About</Link>

      {/_ Link with explicit locale switch _/}
      <Link href="/about" locale="en">
        Switch to English
      </Link>

      {/_ Programmatic navigation _/}
      <button onClick={() => router.push('/contact')}>
        Go to Contact
      </button>

      {/_ Current pathname (without locale) _/}
      <p>Current: {pathname}</p>
    </nav>
  )
}
*/

/**
 * SERVER COMPONENT EXAMPLE
 */

/*
import {Link, getPathname} from '@/i18n/navigation'
import {getLocale} from 'next-intl/server'

export async function ServerNavigationExample() {
  const pathname = await getPathname()
  const locale = await getLocale()

  return (
    <nav>
      {/_ Links work the same in Server Components _/}
      <Link href="/about">About</Link>
      <Link href="/blog">Blog</Link>

      <p>Current: {pathname} ({locale})</p>
    </nav>
  )
}
*/

/**
 * SERVER ACTION EXAMPLE
 */

/*
'use server'

import {redirect} from '@/i18n/navigation'
import {revalidatePath} from 'next/cache'

export async function submitForm(formData: FormData) {
  // Process form...

  // Redirect maintaining current locale
  redirect('/success')
}

export async function switchLanguageAndRedirect(targetLocale: string) {
  // Redirect with explicit locale change
  redirect({
    pathname: '/dashboard',
    locale: targetLocale as 'fr' | 'en'
  })
}
*/

// ============================================================================
// Advanced Navigation Patterns
// ============================================================================

/**
 * Prefetch locale-aware routes
 *
 * @example
 * <Link href="/about" prefetch={true}>About</Link>
 */

/**
 * Navigate with query parameters
 *
 * @example
 * router.push({
 *   pathname: '/search',
 *   query: {q: 'hello'}
 * })
 * // Results in: /fr/search?q=hello
 */

/**
 * Navigate with hash
 *
 * @example
 * <Link href="/about#team">About Our Team</Link>
 * // Results in: /fr/about#team
 */

/**
 * Check if link is active
 *
 * @example
 * 'use client'
 * import {usePathname} from '@/i18n/navigation'
 *
 * function NavLink({href, children}) {
 *   const pathname = usePathname()
 *   const isActive = pathname === href
 *
 *   return (
 *     <Link
 *       href={href}
 *       className={isActive ? 'active' : ''}
 *     >
 *       {children}
 *     </Link>
 *   )
 * }
 */

// ============================================================================
// Type-Safe Navigation Patterns
// ============================================================================

/**
 * Define route constants for type safety
 */
export const routes = {
  home: "/",
  about: "/about",
  blog: "/blog",
  blogPost: (slug: string) => `/blog/${slug}`,
  contact: "/contact",
} as const;

/**
 * Usage with type safety
 *
 * @example
 * import {Link} from '@/i18n/navigation'
 * import {routes} from '@/i18n/navigation'
 *
 * <Link href={routes.about}>About</Link>
 * <Link href={routes.blogPost('my-post')}>Read Post</Link>
 */

// ============================================================================
// Performance Considerations
// ============================================================================

/**
 * BEST PRACTICES:
 *
 * 1. USE LINK COMPONENT FOR NAVIGATION
 *    - Enables Next.js prefetching
 *    - Client-side navigation (no full page reload)
 *    - Automatic locale handling
 *
 * 2. AVOID FULL PAGE RELOADS
 *    - Don't use <a> tags for internal navigation
 *    - Don't use window.location for navigation
 *    - Use router.push() for programmatic navigation
 *
 * 3. PREFETCH IMPORTANT ROUTES
 *    - Add prefetch={true} to critical navigation links
 *    - Next.js automatically prefetches visible <Link> components
 *
 * 4. USE SHALLOW ROUTING FOR STATE CHANGES
 *    - router.replace() with {shallow: true} for URL state updates
 *    - Doesn't trigger data fetching
 *
 * 5. HANDLE LOCALE SWITCHING EFFICIENTLY
 *    - Use router.replace() instead of router.push() for language switcher
 *    - Prevents adding language switches to browser history
 */

// ============================================================================
// Common Patterns
// ============================================================================

/**
 * Language Switcher Component
 */

/*
'use client'

import {usePathname, useRouter} from '@/i18n/navigation'
import {useLocale} from 'next-intl'
import {locales, getLocaleName} from './routing'

export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = useLocale()

  const handleLocaleChange = (newLocale: string) => {
    // Use replace to avoid polluting browser history
    router.replace(pathname, {locale: newLocale})
  }

  return (
    <div>
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLocaleChange(locale)}
          disabled={locale === currentLocale}
        >
          {getLocaleName(locale)}
        </button>
      ))}
    </div>
  )
}
*/

/**
 * Breadcrumbs with Locale Support
 */

/*
'use client'

import {Link, usePathname} from '@/i18n/navigation'
import {useLocale} from 'next-intl'

export function Breadcrumbs() {
  const pathname = usePathname() // e.g., '/blog/my-post'
  const locale = useLocale()

  const segments = pathname.split('/').filter(Boolean)

  return (
    <nav>
      <Link href="/">Home</Link>
      {segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/')
        return (
          <span key={segment}>
            {' / '}
            <Link href={href}>{segment}</Link>
          </span>
        )
      })}
    </nav>
  )
}
*/

// ============================================================================
// Implementation Notes
// ============================================================================

/**
 * IMPLEMENTATION CHECKLIST:
 *
 * 1. [ ] Create this file at apps/web/src/i18n/navigation.ts
 * 2. [ ] Import routing config from ./routing
 * 3. [ ] Export navigation APIs
 * 4. [ ] Update all imports from 'next/navigation' to '@/i18n/navigation'
 * 5. [ ] Test Link component with locale switching
 * 6. [ ] Test useRouter navigation
 * 7. [ ] Test redirect in Server Actions
 * 8. [ ] Verify prefetching works
 * 9. [ ] Create language switcher component
 * 10. [ ] Update breadcrumbs/navigation components
 *
 * MIGRATION GUIDE:
 *
 * Before:
 * import {Link} from 'next/link'
 * import {useRouter} from 'next/navigation'
 *
 * After:
 * import {Link, useRouter} from '@/i18n/navigation'
 *
 * No other code changes needed!
 *
 * IMPORTANT CONSTRAINTS:
 * - MUST use these APIs instead of next/navigation for internal links
 * - External links can still use <a> tags
 * - Programmatic navigation MUST use router from this module
 * - Server-side redirects MUST use redirect from this module
 */
