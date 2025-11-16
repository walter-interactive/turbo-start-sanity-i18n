import { imageFragment } from '@workspace/sanity-atoms/fragments'

/**
 * Blog author reference fragment
 * Used in blog post queries to include author data
 */
export const blogAuthorFragment = /* groq */ `
  authors[0]->{
    _id,
    name,
    position,
    ${imageFragment}
  }
`
