import { defineQuery } from 'next-sanity'
import { imageFragment } from '@workspace/sanity-atoms/fragments'
import { ogFieldsFragment } from './fragments'

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
