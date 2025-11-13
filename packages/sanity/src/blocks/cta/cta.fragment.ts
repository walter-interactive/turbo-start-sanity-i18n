import { richTextFragment } from "@workspace/sanity/shared/rich-text";
import { buttonsFragment } from "@workspace/sanity/shared/buttons";

export const ctaBlock = /* groq */ `
  _type == "cta" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
  }
`;
