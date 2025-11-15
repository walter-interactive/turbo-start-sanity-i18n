/**
 * GROQ Fragment - Custom URL
 *
 * Queries customUrl object with internal/external link data.
 * Supports both external URLs and internal page references.
 *
 * Used by: button, faqAccordion, imageLinkCards
 *
 * @example
 * ```groq
 * *[_type == "page"][0]{
 *   ${customUrlFragment}
 * }
 * ```
 */

export const customUrlFragment = /* groq */ `
  "url": {
    type,
    openInNewTab,
    external,
    href,
    "internal": internal->{
      _type,
      "slug": slug.current
    }
  }
`
