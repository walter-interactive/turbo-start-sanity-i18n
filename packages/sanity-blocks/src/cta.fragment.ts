import { buttonsFragment } from '@workspace/sanity-atoms/fragments/buttons'
import { richTextFragment } from '@workspace/sanity-atoms/fragments/rich-text'

export const ctaFragment = /* groq */ `
  _type == "cta" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
  }
`
