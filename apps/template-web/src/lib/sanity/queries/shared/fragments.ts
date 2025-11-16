import {
  ctaFragment,
  faqSectionFragment,
  featureCardsIconFragment,
  heroSectionFragment,
  imageLinkCardsFragment,
  subscribeNewsletterFragment,
} from '@workspace/sanity-blocks/fragments'
import { groq } from 'next-sanity'

/**
 * Page builder fragment
 * Used across homePage, page, blog, blogIndex schemas
 */
export const pageBuilderFragment = /* groq */ `
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
 * Open Graph fields fragment
 * Used for OG metadata across multiple document types
 */
export const ogFieldsFragment = /* groq */ `
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
