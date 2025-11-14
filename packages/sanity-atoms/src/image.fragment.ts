export const imageFields = /* groq */ `
  "id": asset._ref,
  "preview": asset->metadata.lqip,
  hotspot {
    x,
    y
  },
  crop {
    bottom,
    left,
    right,
    top
  }
`;

// Base fragments for reusable query parts
export const imageFragment = /* groq */ `
  image {
    ${imageFields}
  }
`;
