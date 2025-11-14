import {
  richTextFragment,
  buttonsFragment,
} from "@walter/sanity-atoms/fragments";

export const ctaBlock = /* groq */ `
  _type == "cta" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
  }
`;
