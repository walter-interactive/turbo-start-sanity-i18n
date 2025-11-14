import {
  imageFragment,
  buttonsFragment,
  richTextFragment,
} from "@walter/sanity-atoms/fragments";

export const heroSectionFragment = /* groq */ `
  _type == "hero" => {
    ...,
    ${imageFragment},
    ${buttonsFragment},
    ${richTextFragment}
  }
`;
