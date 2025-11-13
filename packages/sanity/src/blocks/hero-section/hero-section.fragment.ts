import { imageFragment } from "@workspace/sanity/shared/image";
import { buttonsFragment } from "@workspace/sanity/shared/buttons";
import { richTextFragment } from "@workspace/sanity/shared/rich-text";

export const heroSectionFragment = /* groq */ `
  _type == "hero" => {
    ...,
    ${imageFragment},
    ${buttonsFragment},
    ${richTextFragment}
  }
`;
