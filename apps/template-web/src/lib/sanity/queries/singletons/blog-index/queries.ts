import { defineQuery } from 'next-sanity'
import { blogCardFragment } from '../../collections/blog/fragments'
import { pageBuilderFragment, translationsFragment } from '../../shared/fragments'

/**
 * Fetch blog index page data with all blog posts
 *
 * @param locale - Current locale
 */
export const queryBlogIndexPageData = defineQuery(`
  *[_type == "blogIndex" && language == $locale][0]{
    ...,
    _id,
    _type,
    language,
    title,
    description,
    "displayFeaturedBlogs" : displayFeaturedBlogs == "yes",
    "featuredBlogsCount" : featuredBlogsCount,
    ${pageBuilderFragment},
    "slug": slug.current,
    ${translationsFragment},
    "blogs": *[_type == "blog" && language == $locale && (seoHideFromLists != true)] | order(orderRank asc){
      ${blogCardFragment}
    }
  }
`)
