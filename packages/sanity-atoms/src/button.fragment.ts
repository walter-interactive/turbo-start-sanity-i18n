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

import { customUrlFragment } from './custom-url.fragment'

export const buttonFragment = /* groq */ `
  variant,
  text,
  ${customUrlFragment}
`
