import {
  buttonsFragment,
  imageFragment,
  richTextFragment
} from '@workspace/sanity-atoms/fragments'

export const heroSectionFragment = /* groq */ `
  _type == "hero" => {
    ...,
    ${imageFragment},
    ${buttonsFragment},
    ${richTextFragment}
  }
`
