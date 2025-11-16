import {
  buttonsFragment,
  richTextFragment
} from '@workspace/sanity-atoms/fragments'

export const ctaFragment = /* groq */ `
  _type == "cta" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
  }
`
