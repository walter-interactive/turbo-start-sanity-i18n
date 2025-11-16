import { defineQuery } from 'next-sanity'
import { translationsFragment } from './fragments'

/**
 * Query all localized documents with their translation metadata
 *
 * Fetches all documents that support internationalization (page, blog, homePage, blogIndex)
 * filtered by the specified locale. This query is used to build the locale mapping
 * for language switcher navigation.
 *
 * @param locale - The locale to filter documents by (typically DEFAULT_LOCALE)
 * @returns Array of documents with their translations included
 *
 * @example
 * const documents = await sanityFetch({
 *   query: queryAllLocalizedPages,
 *   params: { locale: DEFAULT_LOCALE }
 * });
 */
export const queryAllLocalizedPages = defineQuery(`
  *[
    _type in ["page", "blog", "homePage", "blogIndex"] &&
    language == $locale
  ]{
    _id,
    _type,
    language,
    "slug": slug.current,
    title,
    ${translationsFragment}
  }
`)
