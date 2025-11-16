import { imageFragment } from '@workspace/sanity-atoms/fragments'
import { blogAuthorFragment } from '../author/fragments'

/**
 * Blog card fragment for list views
 * Used in blog index and related posts
 */
export const blogCardFragment = /* groq */ `
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
