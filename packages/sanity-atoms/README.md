# @workspace/sanity-atoms

Atomic Sanity content types (primitive field definitions) used across blocks and documents.

## Usage

```typescript
import { buttonsSchema, imageSchema, richTextSchema } from '@workspace/sanity-atoms/schemas'
```

## Package Structure

Flat file structure for easy discovery:

```
src/
├── buttons.schema.ts
├── buttons.fragment.ts
├── image.schema.ts
├── richText.schema.ts
├── richText.fragment.ts
├── //...
```

## Design Principles

This package follows atomic design principles:
- **Atoms are primitive**: Single-purpose field definitions
- **Highly reusable**: Used by multiple blocks and documents
- **Consistent**: Single source of truth for each field type

## Common Gotchas

### Sanity TypeGen & Import Paths

Sanity CLI `typegen` uses package.json exports to resolve imports. When importing atoms into other atoms within this package, **you must use workspace alias paths** (not relative imports) for typegen to work correctly.

#### File Structure vs. Import Paths

**Actual file structure** (flat):
```
src/
├── custom-url.fragment.ts   ← actual file location
├── button.fragment.ts
└── fragments.ts              ← barrel export file
```

**Import paths** (virtual, created by package.json exports):
```json
// package.json
{
  "exports": {
    "./fragments/*": "./src/*.fragment.ts"
  }
}
```

This mapping means `@workspace/sanity-atoms/fragments/custom-url` resolves to `src/custom-url.fragment.ts`.

#### Usage Example

```typescript
// button.fragment.ts

// ✅ Correct - uses package.json export path
import { customUrlFragment } from '@workspace/sanity-atoms/fragments/custom-url'

// ❌ Incorrect - breaks Sanity typegen (bypasses exports resolution)
import { customUrlFragment } from './custom-url.fragment'

// ❌ Incorrect - imports barrel file, not individual fragment
import { customUrlFragment } from '@workspace/sanity-atoms/fragments'
```

#### Why This Matters

Sanity typegen relies on package.json exports to resolve module paths. Using relative imports (`./custom-url.fragment`) bypasses this resolution system, causing typegen to fail with module resolution errors.

**Rule**: Always use `@workspace/sanity-atoms/fragments/*` or `@workspace/sanity-atoms/schemas/*` paths when importing fragments within this package.
