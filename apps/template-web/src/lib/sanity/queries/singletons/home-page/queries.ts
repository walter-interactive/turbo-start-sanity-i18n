import { defineQuery } from 'next-sanity'
import { ogFieldsFragment, pageBuilderFragment, translationsFragment } from '../../shared/fragments'

/**
 * Fetch homepage data
 *
 * @param locale - Current locale
 */
export const queryHomePageData =
  defineQuery(`*[_type == "homePage" && language == $locale][0]{
    ...,
    _id,
    _type,
    language,
    "slug": slug.current,
    title,
    description,
    ${pageBuilderFragment},
    ${translationsFragment}
  }`)

/**
 * Fetch homepage OG image metadata
 *
 * @param id - Homepage _id
 */
export const queryHomePageOGData = defineQuery(`
  *[_type == "homePage" && _id == $id][0]{
    ${ogFieldsFragment}
  }
  `)
