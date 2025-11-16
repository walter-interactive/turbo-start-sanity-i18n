import { defineQuery } from 'next-sanity'

/**
 * Query all pages and blogs for sitemap generation
 * Returns all pages and blog posts with their slugs, languages, and last modified dates
 */
export const querySitemapData = defineQuery(`{
  "slugPages": *[_type == "page" && defined(slug.current)]{
    "slug": slug.current,
    language,
    "lastModified": _updatedAt
  },
  "blogPages": *[_type == "blog" && defined(slug.current)]{
    "slug": slug.current,
    language,
    "lastModified": _updatedAt
  }
}`)
