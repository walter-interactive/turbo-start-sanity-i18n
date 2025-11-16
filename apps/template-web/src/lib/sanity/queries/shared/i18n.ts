import { groq, defineQuery } from 'next-sanity'

/**
 * Translation metadata fragment
 * Used across all i18n-enabled document types
 */
// @sanity-typegen-ignore
export const translationsFragment = groq`
  "_translations": *[
    _type == "translation.metadata" && references(^._id)
  ][0].translations[].value->{
    _id,
    _type,
    language,
    "slug": slug.current,
    title
  }
`

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
