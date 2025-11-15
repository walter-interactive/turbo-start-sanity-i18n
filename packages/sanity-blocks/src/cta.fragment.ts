import { buttonsFragment } from '@walter/sanity-atoms/fragments/buttons'
import { richTextFragment } from '@walter/sanity-atoms/fragments/rich-text'

export const ctaFragment = /* groq */ `
  _type == "cta" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
  }
`
