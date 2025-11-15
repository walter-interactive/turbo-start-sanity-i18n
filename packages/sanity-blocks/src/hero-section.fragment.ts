import { buttonsFragment } from '@workspace/sanity-atoms/fragments/buttons'
import { imageFragment } from '@workspace/sanity-atoms/fragments/image'
import { richTextFragment } from '@workspace/sanity-atoms/fragments/rich-text'

export const heroSectionFragment = /* groq */ `
  _type == "hero" => {
    ...,
    ${imageFragment},
    ${buttonsFragment},
    ${richTextFragment}
  }
`
