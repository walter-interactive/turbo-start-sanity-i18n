import { richTextFragment } from '@workspace/sanity-atoms/fragments/rich-text'

export const featureCardsIconFragment = /* groq */ `
  _type == "featureCardsIcon" => {
    eyebrow,
    title,
    ${richTextFragment},
    "cards": cards[]{
      _key,
      icon,
      title,
      ${richTextFragment}
    }
  }
`
