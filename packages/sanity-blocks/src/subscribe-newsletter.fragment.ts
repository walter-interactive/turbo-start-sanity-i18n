import { customUrlFragment } from '@walter/sanity-atoms/fragments/custom-url'

export const subscribeNewsletterFragment = /* groq */ `
  _type == "subscribeNewsletter" => {
    title,
    "subTitle": subTitle[]{
      ...,
      markDefs[]{
        ...,
        _type == "customLink" => {
          ${customUrlFragment}
        }
      }
    },
    "helperText": helperText[]{
      ...,
      markDefs[]{
        ...,
        _type == "customLink" => {
          ${customUrlFragment}
        }
      }
    }
  }
`
