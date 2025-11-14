import { customUrlFragment } from "@walter/sanity-atoms/fragments/custom-url";
import { buttonsFragment } from "@walter/sanity-atoms/fragments/buttons";
import { richTextFragment } from "@walter/sanity-atoms/fragments/rich-text";
import { imageFragment } from "@walter/sanity-atoms/fragments/image";

export const imageLinkCardsFragment = /* groq */ `
  _type == "imageLinkCards" => {
    eyebrow,
    title,
    ${richTextFragment},
    ${buttonsFragment},
    "cards": cards[]{
      title,
      description,
      "image": image {
        ${imageFragment}
      },
      ${customUrlFragment}
    }
  }
`;
