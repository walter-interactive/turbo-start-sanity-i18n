# Import Statements Contract

**Date**: 2025-11-15
**Feature**: 011-rename-package-aliases

## Expected Import Patterns

After the rename is complete, all TypeScript/JavaScript import statements must use the new `@workspace/*` prefix.

### ✅ Valid Import Patterns (REQUIRED)

```typescript
// Named imports from schemas
import { imageSchema } from '@workspace/sanity-atoms/schemas/image'
import { heroSectionSchema } from '@workspace/sanity-blocks/schemas/hero-section'

// Named imports from fragments
import { imageFragment } from '@workspace/sanity-atoms/fragments/image'
import { heroSectionFragment } from '@workspace/sanity-blocks/fragments/hero-section'

// Type-only imports
import type { ImageFieldsType } from '@workspace/sanity-atoms/schemas/image'

// Re-exports
export { imageSchema } from '@workspace/sanity-atoms/schemas/image'
export * from '@workspace/sanity-atoms/schemas/image'

// Dynamic imports
const schema = await import('@workspace/sanity-atoms/schemas/image')
```

### ❌ Forbidden Import Patterns (MUST NOT EXIST)

```typescript
// Old @walter prefix - FORBIDDEN
import { imageSchema } from '@walter/sanity-atoms/schemas/image'
import { heroSectionSchema } from '@walter/sanity-blocks/schemas/hero-section'

// Any variant with old prefix - FORBIDDEN
import type { ImageFieldsType } from '@walter/sanity-atoms/schemas/image'
export { imageSchema } from '@walter/sanity-atoms/schemas/image'
const schema = await import('@walter/sanity-atoms/schemas/image')
```

---

## Validation Rules

1. **Zero Old Imports**: No files may contain `@walter/sanity-atoms` or `@walter/sanity-blocks` in import statements
2. **Complete Coverage**: All 52+ identified files must be updated
3. **No Partial Renames**: A file cannot have mixed imports (some `@walter`, some `@workspace`)
4. **All Import Variants**: Covers `import`, `import type`, `export ... from`, dynamic `import()`

---

## Validation Command

```bash
# Search for forbidden patterns
grep -rn '@walter/sanity-atoms\|@walter/sanity-blocks' \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=dist \
  --exclude-dir=.turbo

# Expected output: 0 matches (exit code 1)
```

**Success Criteria**: Command exits with code 1 (no matches found)

---

## Affected File Categories

Based on grep analysis, the following file categories contain import statements to update:

### 1. Schema Files (`packages/sanity-blocks/src/*.schema.ts`)
Files that import from `@walter/sanity-atoms/schemas/*` to compose block schemas

**Example files**:
- `packages/sanity-blocks/src/hero-section.schema.ts`
- `packages/sanity-blocks/src/cta.schema.ts`
- `packages/sanity-blocks/src/feature-cards-icon.schema.ts`

**Pattern**:
```typescript
// BEFORE
import { imageSchema } from '@walter/sanity-atoms/schemas/image'

// AFTER
import { imageSchema } from '@workspace/sanity-atoms/schemas/image'
```

---

### 2. Fragment Files (`packages/sanity-blocks/src/*.fragment.ts`)
Files that import from `@walter/sanity-atoms/fragments/*` to compose block fragments

**Example files**:
- `packages/sanity-blocks/src/hero-section.fragment.ts`
- `packages/sanity-blocks/src/subscribe-newsletter.fragment.ts`
- `packages/sanity-blocks/src/image-link-cards.fragment.ts`

**Pattern**:
```typescript
// BEFORE
import { imageFragment } from '@walter/sanity-atoms/fragments/image'

// AFTER
import { imageFragment } from '@workspace/sanity-atoms/fragments/image'
```

---

### 3. Studio Schema Files (`apps/template-studio/schemaTypes/**/*.ts`)
Files that import schemas from both packages to build Sanity Studio schema

**Example files**:
- `apps/template-studio/schemaTypes/index.ts`
- `apps/template-studio/schemaTypes/definitions/pagebuilder.ts`
- `apps/template-studio/schemaTypes/collections/faq.ts`

**Pattern**:
```typescript
// BEFORE
import { imageSchema } from '@walter/sanity-atoms/schemas/image'
import { heroSectionSchema } from '@walter/sanity-blocks/schemas/hero-section'

// AFTER
import { imageSchema } from '@workspace/sanity-atoms/schemas/image'
import { heroSectionSchema } from '@workspace/sanity-blocks/schemas/hero-section'
```

---

### 4. Web Query Files (`apps/template-web/src/lib/sanity/**/*.ts`)
Files that import GROQ fragments for data fetching

**Example files**:
- `apps/template-web/src/lib/sanity/query.ts`

**Pattern**:
```typescript
// BEFORE
import { imageFragment } from '@walter/sanity-atoms/fragments/image'
import { heroSectionFragment } from '@walter/sanity-blocks/fragments/hero-section'

// AFTER
import { imageFragment } from '@workspace/sanity-atoms/fragments/image'
import { heroSectionFragment } from '@workspace/sanity-blocks/fragments/hero-section'
```

---

## Edge Cases

### Case 1: Multi-line imports
```typescript
// BEFORE
import {
  imageSchema,
  videoSchema
} from '@walter/sanity-atoms/schemas/image'

// AFTER
import {
  imageSchema,
  videoSchema
} from '@workspace/sanity-atoms/schemas/image'
```

**Validation**: Grep pattern matches across multiple lines (default behavior)

---

### Case 2: String literals in comments
```typescript
// This imports from @walter/sanity-atoms - old comment
import { imageSchema } from '@workspace/sanity-atoms/schemas/image'
```

**Decision**: Update comments to reflect new alias for consistency

---

### Case 3: Template strings or concatenated imports
```typescript
// Unlikely but possible
const pkg = '@walter/sanity-atoms'
const path = `${pkg}/schemas/image`
```

**Detection**: Grep will catch string literals
**Resolution**: Update to `@workspace/sanity-atoms`

---

## Post-Rename Verification

After bulk find-replace, verify import statements are correct:

```bash
# 1. Verify no old imports remain
grep -rn '@walter/sanity' \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules

# 2. Verify new imports exist
grep -rn '@workspace/sanity-atoms\|@workspace/sanity-blocks' \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules \
  | wc -l
# Expected: 52+ matches

# 3. Run type checking to catch unresolved imports
pnpm check-types
# Expected: Success with 0 errors
```

---

## Success Mapping

| Contract Requirement | Success Criteria | Validation Method |
|---------------------|------------------|-------------------|
| Zero old imports | SC-004 (100% use new alias) | Grep returns 0 matches for `@walter/sanity-*` |
| All imports updated | SC-001 (type checking passes) | `pnpm check-types` succeeds |
| IDE autocomplete works | SC-005 (autocomplete features) | Manual IDE test (import statement autocomplete) |

---

## Rollback Contract

If rollback is needed, the inverse patterns apply:

- Replace all `@workspace/sanity-atoms` → `@walter/sanity-atoms`
- Replace all `@workspace/sanity-blocks` → `@walter/sanity-blocks`
- Validate with grep for `@workspace/sanity-*` (should be 0 matches after rollback)
