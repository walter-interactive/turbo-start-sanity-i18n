import { imageFields } from "./image.fragment";

const customLinkFragment = /* groq */ `
  ...customLink{
    openInNewTab,
    "href": select(
      type == "internal" => internal->slug.current,
      type == "external" => external,
      "#"
    ),
    "internalType": select(
      type == "internal" => internal->_type,
      null
    ),
  }
`;

const markDefsFragment = /* groq */ `
  markDefs[]{
    ...,
    ${customLinkFragment}
  }
`;

export const richTextFragment = /* groq */ `
  richText[]{
    ...,
    _type == "block" => {
      ...,
      ${markDefsFragment}
    },
    _type == "image" => {
      ${imageFields},
      "caption": caption
    }
  }
`;
