import { richTextFragment } from "../../shared/rich-text/rich-text.fragment";
import { buttonsFragment } from "../../shared/buttons/buttons.fragment";

export const ctaBlock = /* groq */ `
  _type == "cta" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
  }
`;
