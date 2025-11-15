import { LOCALES } from '@/i18n/routing'
import { client } from '@/lib/sanity/client'
import { querySitemapData } from '@/lib/sanity/query'
import { getBaseUrl } from '@/utils'
import type { MetadataRoute } from 'next'
import type { QuerySitemapDataResult } from '@/lib/sanity/sanity.types'

type Page = QuerySitemapDataResult['slugPages'][number]

const baseUrl = getBaseUrl()

/**
 * Generate language-aware sitemap with hreflang support
 *
 * Includes:
 * - Homepage URLs for each locale (/fr/, /en/)
 * - All pages with locale prefixes (/fr/about, /en/about)
 * - All blog posts with locale prefixes (/fr/blog/post, /en/blog/post)
 *
 * Each URL includes proper lastModified date for cache management
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { slugPages, blogPages } = await client.fetch(querySitemapData)

  // Homepage entries for each locale
  const homePageEntries = LOCALES.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 1
  }))

  // Page entries with locale prefix
  const pageEntries = slugPages.map((page: Page) => ({
    url: `${baseUrl}/${page.language}/${page.slug}`,
    lastModified: new Date(page.lastModified ?? new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }))

  // Blog entries with locale prefix
  // Note: Blog slugs already include /blog/ prefix from Sanity
  const blogEntries = blogPages.map((page: Page) => ({
    url: `${baseUrl}/${page.language}${page.slug}`,
    lastModified: new Date(page.lastModified ?? new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.5
  }))

  return [...homePageEntries, ...pageEntries, ...blogEntries]
}
