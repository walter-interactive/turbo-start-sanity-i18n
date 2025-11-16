import {
  ctaFragment,
  faqSectionFragment,
  featureCardsIconFragment,
  heroSectionFragment,
  imageLinkCardsFragment,
  subscribeNewsletterFragment,
} from '@workspace/sanity-blocks/fragments'

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
