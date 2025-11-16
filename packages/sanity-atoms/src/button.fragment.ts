/**
 * GROQ Fragment - Button
 *
 * Queries individual button with variant, text, and URL.
 * Composes customUrlFragment for complete link data.
 *
 * Used by: buttonsFragment, blocks with single button fields
 *
 * @example
 * ```groq
 * *[_type == "page"][0]{
 *   ${buttonFragment}
 * }
 * ```
 */

import { customUrlFragment } from '@workspace/sanity-atoms/fragments/custom-url'

export const buttonFragment = /* groq */ `
  variant,
  text,
  ${customUrlFragment}
`
