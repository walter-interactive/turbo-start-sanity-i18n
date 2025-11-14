import { imageFragment } from "@walter/sanity-atoms/fragments/image";
import { buttonsFragment } from "@walter/sanity-atoms/fragments/buttons";
import { richTextFragment } from "@walter/sanity-atoms/fragments/rich-text";

export const heroSectionFragment = /* groq */ `
  _type == "hero" => {
    ...,
    ${imageFragment},
    ${buttonsFragment},
    ${richTextFragment}
  }
`;
