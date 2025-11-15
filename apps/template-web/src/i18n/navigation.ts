import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * Creates locale-aware navigation APIs
 *
 * These are lightweight wrappers around Next.js navigation APIs that:
 * - Automatically handle locale prefixes
 * - Maintain current locale when navigating
 * - Allow explicit locale switching
 * - Provide type-safe navigation
 */
export const { Link, redirect, getPathname, usePathname, useRouter } =
  createNavigation(routing)

/**
 * Define route constants for type safety
 */
export const routes = {
  home: '/',
  about: '/about',
  blog: '/blog',
  blogPost: (slug: string) => `/blog/${slug}`,
  contact: '/contact'
} as const
