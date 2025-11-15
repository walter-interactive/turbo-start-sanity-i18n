import { buttonsFragment } from "@walter/sanity-atoms/fragments/buttons";
import { richTextFragment } from "@walter/sanity-atoms/fragments/rich-text";
import { imageFragment } from "@walter/sanity-atoms/fragments/image";

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
`;
