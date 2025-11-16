import { defineQuery } from 'next-sanity'
import { imageFragment, richTextFragment } from '@workspace/sanity-atoms/fragments'
import { blogAuthorFragment } from '../author/fragments'
import { ogFieldsFragment, pageBuilderFragment, translationsFragment } from '../../shared/fragments'

/**
 * Fetch a single blog post by slug
 *
 * @param slug - Blog post slug
 * @param locale - Current locale
 */
export const queryBlogSlugPageData = defineQuery(`
  *[_type == "blog" && slug.current == $slug && language == $locale][0]{
    ...,
    "slug": slug.current,
    language,
    ${blogAuthorFragment},
    ${imageFragment},
    ${richTextFragment},
    ${pageBuilderFragment},
    ${translationsFragment}
  }
`)

/**
 * Get all blog paths for static generation
 *
 * @param locale - Current locale
 */
export const queryBlogPaths = defineQuery(`
  *[_type == "blog" && defined(slug.current) && language == $locale]{
    "slug": slug.current,
    language
  }
`)

/**
 * Fetch blog OG image metadata
 *
 * @param id - Blog post _id
 */
export const queryBlogPageOGData = defineQuery(`
  *[_type == "blog" && _id == $id][0]{
    ${ogFieldsFragment}
  }
`)
