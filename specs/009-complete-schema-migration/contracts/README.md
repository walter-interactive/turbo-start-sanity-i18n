# GROQ Fragment Contracts

This directory contains GROQ query fragment contracts for migrated schemas.

## Purpose

These contracts define the expected query structure and response format for:
- Atom schemas (`button`, `customUrl`)
- Block schemas (`faqAccordion`, `featureCardsIcon`, `imageLinkCards`, `subscribeNewsletter`)

## Files

- **atoms.groq**: Fragment contracts for atomic types (button, customUrl, richText, image)
- **blocks.groq**: Fragment contracts for page builder blocks (with usage examples)
- **README.md**: This file

## Implementation

The fragments defined here will be implemented in:
- `packages/sanity-atoms/src/fragments.ts` (atom fragments)
- `packages/sanity-blocks/src/fragments.ts` (block fragments)

## Usage

Frontend queries import fragments from packages:
```typescript
import {
  buttonFragment,
  customUrlFragment,
  richTextFragment
} from '@walter/sanity-atoms/fragments'

import {
  faqAccordionFragment,
  featureCardsIconFragment,
  imageLinkCardsFragment,
  subscribeNewsletterFragment
} from '@walter/sanity-blocks/fragments'
```

## Testing

1. Open Sanity Studio Vision tab
2. Use test queries from `blocks.groq`
3. Verify all fields are populated correctly
4. Check no undefined values in nested fields

## Fragment Composition Pattern

Blocks compose atom fragments:
```groq
// Block fragment
_type == "imageLinkCards" => {
  title,
  ${richTextFragment},      // Composed from atoms
  ${buttonsFragment},        // Composed from atoms
  "cards": cards[]{
    title,
    ${customUrlFragment}     // Composed from atoms
  }
}
```

This pattern ensures:
- DRY (Don't Repeat Yourself) - atom fragments defined once
- Consistency - same query structure across all blocks
- Maintainability - update atom fragment in one place
