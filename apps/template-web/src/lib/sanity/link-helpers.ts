/**
 * Link Helper Utilities
 *
 * Provides utilities for constructing proper URLs from Sanity internal links.
 * Handles document type-specific path prefixes (e.g., /blog/, /blogue/) using
 * the centralized i18n-config package.
 *
 * @module link-helpers
 */

import {
  type DocumentType,
  getPathnameForDocType,
  PATHNAMES
} from '@workspace/i18n-config'
import type { Locale } from '@/i18n/routing'

/**
 * Construct localized path from document type and slug
 *
 * Takes a Sanity document type and slug, and constructs the proper URL path
 * for the current locale. This ensures that:
 * - Blog posts get the correct prefix (/blog/ or /blogue/)
 * - Pages work without prefixes
 * - Homepage and blog index routes work correctly
 *
 * **Key behaviors**:
 * - Uses centralized PATHNAMES config for localization
 * - Removes leading slash from slugs for path construction
 * - Handles special cases for homepage and blog index
 * - Returns paths WITHOUT locale prefix (e.g., "/blog/my-post" not "/en/blog/my-post")
 *
 * @param slug - Document slug WITH or WITHOUT leading slash (e.g., "/my-post" or "my-post")
 * @param docType - The Sanity document type
 * @param locale - Current locale
 * @returns Path without locale prefix (e.g., "/blog/my-post" or "/blogue/mon-article")
 *
 * @example
 * ```typescript
 * // Blog post in English
 * constructLocalizedPath('/my-post', 'blog', 'en')
 * // Returns: '/blog/my-post'
 *
 * // Blog post in French
 * constructLocalizedPath('/mon-article', 'blog', 'fr')
 * // Returns: '/blogue/mon-article'
 *
 * // Regular page (no prefix)
 * constructLocalizedPath('/about-us', 'page', 'en')
 * // Returns: '/about-us'
 *
 * // Homepage
 * constructLocalizedPath('/', 'homePage', 'en')
 * // Returns: '/'
 *
 * // Blog index
 * constructLocalizedPath('/blog', 'blogIndex', 'fr')
 * // Returns: '/blogue'
 * ```
 */
export function constructLocalizedPath(
  slug: string,
  docType: DocumentType,
  locale: Locale
): string {
  // Remove leading slash from slug for path construction
  const slugContent = slug.replace(/^\//, '')

  // Get the pathname pattern for this document type
  const pathnameKey = getPathnameForDocType(docType)

  // Get localized path from PATHNAMES config
  const localizedPath = PATHNAMES[pathnameKey]?.[locale]

  // Handle homepage (no slug)
  if (docType === 'homePage') {
    return '/'
  }

  // Handle blog index (no slug, just the prefix)
  if (docType === 'blogIndex') {
    // Extract the base path from localizedPath (e.g., "/blog" or "/blogue")
    const basePath = localizedPath?.replace(/\/\[slug\]$/, '') || ''
    return basePath
  }

  // For blog posts and pages, construct path with localized prefix
  // Extract the base path without [slug] placeholder
  const basePath = localizedPath?.replace(/\/\[slug\]$/, '') || ''

  if (basePath) {
    return `${basePath}/${slugContent}`
  }

  // Fallback for pages without prefix
  return `/${slugContent}`
}

/**
 * Type guard to check if a string is a valid DocumentType
 *
 * @param type - String to validate as a DocumentType
 * @returns True if the type is a valid DocumentType
 *
 * @example
 * ```typescript
 * if (isDocumentType(userInput)) {
 *   const path = constructLocalizedPath(slug, userInput, locale);
 * }
 * ```
 */
export function isDocumentType(type: string): type is DocumentType {
  return ['page', 'blog', 'homePage', 'blogIndex'].includes(type)
}

/**
 * Construct href for internal Sanity link
 *
 * Helper function that wraps constructLocalizedPath with type safety.
 * Returns "#" fallback for invalid inputs.
 *
 * @param slug - Document slug (optional)
 * @param docType - Document type (optional)
 * @param locale - Current locale
 * @returns Href string ready for Link component
 *
 * @example
 * ```typescript
 * // In a component
 * const href = getInternalLinkHref(link.slug, link._type, locale);
 * <Link href={href}>{link.name}</Link>
 * ```
 */
export function getInternalLinkHref(
  slug: string | null | undefined,
  docType: string | null | undefined,
  locale: Locale
): string {
  if (!(slug && docType && isDocumentType(docType))) {
    return '#'
  }

  return constructLocalizedPath(slug, docType, locale)
}
