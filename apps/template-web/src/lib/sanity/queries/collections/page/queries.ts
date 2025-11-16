import { defineQuery } from 'next-sanity'
import { ogFieldsFragment } from '../../shared/og-images'
import { translationsFragment } from '../../shared/i18n'
import { pageBuilderFragment } from '../../shared/page-builder'

/**
 * Fetch a single page by slug
 *
 * @param slug - Page slug
 * @param locale - Current locale
 */
export const querySlugPageData = defineQuery(`
  *[_type == "page" && slug.current == $slug && language == $locale][0]{
    ...,
    "slug": slug.current,
    language,
    ${pageBuilderFragment},
    ${translationsFragment}
  }
  `)

/**
 * Get all page paths for static generation
 *
 * @param locale - Current locale
 */
export const querySlugPagePaths = defineQuery(`
  *[_type == "page" && defined(slug.current) && language == $locale]{
    "slug": slug.current,
    language
  }
`)

/**
 * Fetch page OG image metadata
 *
 * @param id - Page _id
 */
export const querySlugPageOGData = defineQuery(`
  *[_type == "page" && _id == $id][0]{
    ${ogFieldsFragment}
  }
`)
