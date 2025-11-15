# @workspace/sanity-atoms

Atomic Sanity content types (primitive field definitions) used across blocks and documents.

## Contents

- **buttons**: CTA button field definition
- **image**: Image field with alt text and metadata
- **richText**: Portable text editor configuration

## Usage

```typescript
import { buttonsSchema, imageSchema, richTextSchema } from '@workspace/sanity-atoms/schemas'
```

## Package Structure

Flat file structure for easy discovery:

```
src/
├── buttons.schema.ts
├── image.schema.ts
├── richText.schema.ts
└── schemas.ts  # Re-exports
```

## Design Principles

This package follows atomic design principles:
- **Atoms are primitive**: Single-purpose field definitions
- **Highly reusable**: Used by multiple blocks and documents
- **No dependencies**: Atoms don't import from other atoms
- **Consistent**: Single source of truth for each field type
