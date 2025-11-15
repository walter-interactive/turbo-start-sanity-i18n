import { buttonsFragment } from '@workspace/sanity-atoms/fragments/buttons'
import {
  imageFields,
  imageFragment
} from '@workspace/sanity-atoms/fragments/image'
import { richTextFragment } from '@workspace/sanity-atoms/fragments/rich-text'
import { ctaFragment } from '@workspace/sanity-blocks/fragments/cta'
import { faqSectionFragment } from '@workspace/sanity-blocks/fragments/faq-accordion'
import { featureCardsIconFragment } from '@workspace/sanity-blocks/fragments/feature-cards-icon'
import { heroSectionFragment } from '@workspace/sanity-blocks/fragments/hero-section'
import { imageLinkCardsFragment } from '@workspace/sanity-blocks/fragments/image-link-cards'
import { subscribeNewsletterFragment } from '@workspace/sanity-blocks/fragments/subscribe-newsletter'
import { defineQuery } from 'next-sanity'
import { translationsFragment } from './i18n'

const blogAuthorFragment = /* groq */ `
  authors[0]->{
    _id,
    name,
    position,
    ${imageFragment}
  }
`

const blogCardFragment = /* groq */ `
  _type,
  _id,
  title,
  description,
  "slug":slug.current,
  orderRank,
  ${imageFragment},
  publishedAt,
  ${blogAuthorFragment}
`

const pageBuilderFragment = /* groq */ `
  pageBuilder[]{
    ...,
    _type,
    ${ctaFragment},
    ${heroSectionFragment},
    ${faqSectionFragment},
    ${featureCardsIconFragment},
    ${subscribeNewsletterFragment},
    ${imageLinkCardsFragment}
  }
`

/**
 * Query to extract a single image from a page document
 * This is used as a type reference only and not for actual data fetching
 * Helps with TypeScript inference for image objects
 */
export const queryImageType = defineQuery(`
  *[_type == "page" && defined(image)][0]{
    ${imageFragment}
  }.image
`)

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

export const querySlugPageData = defineQuery(`
  *[_type == "page" && slug.current == $slug && language == $locale][0]{
    ...,
    "slug": slug.current,
    language,
    ${pageBuilderFragment},
    ${translationsFragment}
  }
  `)

export const querySlugPagePaths = defineQuery(`
  *[_type == "page" && defined(slug.current) && language == $locale]{
    "slug": slug.current,
    language
  }
`)

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

export const queryBlogPaths = defineQuery(`
  *[_type == "blog" && defined(slug.current) && language == $locale]{
    "slug": slug.current,
    language
  }
`)

const ogFieldsFragment = /* groq */ `
  _id,
  _type,
  "title": select(
    defined(ogTitle) => ogTitle,
    defined(seoTitle) => seoTitle,
    title
  ),
  "description": select(
    defined(ogDescription) => ogDescription,
    defined(seoDescription) => seoDescription,
    description
  ),
  "image": image.asset->url + "?w=566&h=566&dpr=2&fit=max",
  "dominantColor": image.asset->metadata.palette.dominant.background,
  "seoImage": seoImage.asset->url + "?w=1200&h=630&dpr=2&fit=max", 
  "logo": *[_type == "settings"][0].logo.asset->url + "?w=80&h=40&dpr=3&fit=max&q=100",
  "date": coalesce(date, _createdAt)
`

export const queryHomePageOGData = defineQuery(`
  *[_type == "homePage" && _id == $id][0]{
    ${ogFieldsFragment}
  }
  `)

export const querySlugPageOGData = defineQuery(`
  *[_type == "page" && _id == $id][0]{
    ${ogFieldsFragment}
  }
`)

export const queryBlogPageOGData = defineQuery(`
  *[_type == "blog" && _id == $id][0]{
    ${ogFieldsFragment}
  }
`)

export const queryGenericPageOGData = defineQuery(`
  *[ defined(slug.current) && _id == $id][0]{
    ${ogFieldsFragment}
  }
`)

export const queryFooterData = defineQuery(`
  *[_type == "footer" && _id == "footer"][0]{
    _id,
    subtitle,
    columns[]{
      _key,
      title,
      links[]{
        _key,
        name,
        "openInNewTab": url.openInNewTab,
        "href": select(
          url.type == "internal" => url.internal->slug.current,
          url.type == "external" => url.external,
          url.href
        ),
        "internalType": select(
          url.type == "internal" => url.internal->_type,
          null
        ),
      }
    }
  }
`)

export const queryNavbarData = defineQuery(`
  *[_type == "navbar" && language == $locale][0]{
    _id,
    language,
    columns[]{
      _key,
      _type == "navbarColumn" => {
        "type": "column",
        title,
        links[]{
          _key,
          name,
          icon,
          description,
          "openInNewTab": url.openInNewTab,
          "href": select(
            url.type == "internal" => url.internal->slug.current,
            url.type == "external" => url.external,
            url.href
          ),
          "internalType": select(
            url.type == "internal" => url.internal->_type,
            null
          )
        }
      },
      _type == "navbarLink" => {
        "type": "link",
        name,
        description,
        "openInNewTab": url.openInNewTab,
        "href": select(
          url.type == "internal" => url.internal->slug.current,
          url.type == "external" => url.external,
          url.href
        ),
        "internalType": select(
          url.type == "internal" => url.internal->_type,
          null
        )
      }
    },
    ${buttonsFragment},
  }
`)

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
export const queryGlobalSeoSettings = defineQuery(`
  *[_type == "settings"][0]{
    _id,
    _type,
    siteTitle,
    logo {
      ${imageFields}
    },
    siteDescription,
    socialLinks{
      linkedin,
      facebook,
      twitter,
      instagram,
      youtube
    }
  }
`)

export const querySettingsData = defineQuery(`
  *[_type == "settings"][0]{
    _id,
    _type,
    siteTitle,
    siteDescription,
    "logo": logo.asset->url + "?w=80&h=40&dpr=3&fit=max",
    "socialLinks": socialLinks,
    "contactEmail": contactEmail,
  }
`)

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
