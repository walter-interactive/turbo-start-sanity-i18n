import { richTextFragment } from "@walter/sanity-atoms/fragments/rich-text";
import { buttonsFragment } from "@walter/sanity-atoms/fragments/buttons";

export const ctaBlock = /* groq */ `
  _type == "cta" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
  }
`;
