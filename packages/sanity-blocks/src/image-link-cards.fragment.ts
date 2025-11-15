import { buttonsFragment } from '@workspace/sanity-atoms/fragments/buttons'
import { imageFragment } from '@workspace/sanity-atoms/fragments/image'
import { richTextFragment } from '@workspace/sanity-atoms/fragments/rich-text'

export const imageLinkCardsFragment = /* groq */ `
  _type == "imageLinkCards" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
    "cards": array::compact(cards[]{
      ...,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => url.internal->slug.current,
        url.type == "external" => url.external,
        url.href
      ),
      "internalType": select(
        url.type == "internal" => url.internal->_type,
        null
      ),
      ${imageFragment},
    })
  }
`
