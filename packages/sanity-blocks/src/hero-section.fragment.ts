import { buttonsFragment } from '@workspace/sanity-atoms/fragments'
import { imageFragment } from '@workspace/sanity-atoms/fragments'
import { richTextFragment } from '@workspace/sanity-atoms/fragments'

export const heroSectionFragment = /* groq */ `
  _type == "hero" => {
    ...,
    ${imageFragment},
    ${buttonsFragment},
    ${richTextFragment}
  }
`
