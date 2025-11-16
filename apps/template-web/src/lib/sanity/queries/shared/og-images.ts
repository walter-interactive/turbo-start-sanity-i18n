import { defineQuery } from 'next-sanity'
import { imageFragment } from '@workspace/sanity-atoms/fragments'

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

/**
 * Fetch OG metadata for any document type by ID
 * Generic query that works across homePage, page, blog, etc.
 *
 * @param id - Document _id
 */
export const queryGenericPageOGData = defineQuery(`
  *[ defined(slug.current) && _id == $id][0]{
    ${ogFieldsFragment}
  }
`)
