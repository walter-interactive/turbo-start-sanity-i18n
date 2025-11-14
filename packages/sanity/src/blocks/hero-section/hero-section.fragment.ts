import { imageFragment } from "../../shared/image/image.fragment";
import { buttonsFragment } from "../../shared/buttons/buttons.fragment";
import { richTextFragment } from "../../shared/rich-text/rich-text.fragment";

export const heroSectionFragment = /* groq */ `
  _type == "hero" => {
    ...,
    ${imageFragment},
    ${buttonsFragment},
    ${richTextFragment}
  }
`;
