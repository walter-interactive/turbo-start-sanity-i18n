# Research: Complete Schema Migration to Monorepo Packages

**Phase**: 0 - Research & Discovery
**Date**: 2025-11-14
**Related**: [plan.md](./plan.md) | [spec.md](./spec.md)

## Overview

This document captures research findings for migrating remaining Sanity schema definitions (atoms and blocks) from `apps/template-studio` to shared workspace packages. The migration follows the established pattern from spec 007/008.

## Research Questions & Findings

### Q1: How should helper utility dependencies be handled when migrating schemas?

**Decision**: Use the **3+ usage criterion** - Extract to shared package ONLY if 3 or more schemas use the SAME function signature and implementation; otherwise inline

**Rationale**:
- Migrated schemas (e.g., `heroSection.schema.ts`) successfully import from `@walter/sanity-atoms/schemas`
- Helper functions like `createRadioListLayout`, `capitalize`, `isValidUrl` exist in `apps/template-studio/utils/helper.ts`
- These are Studio-specific utilities, NOT schema logic
- The 3+ usage threshold balances code reuse (DRY principle) with avoiding premature abstraction

**Options Evaluated**:

1. **Extract ALL utilities to shared packages** (REJECTED)
   - Pros: Maximum reuse
   - Cons: Over-engineering for rarely-used utilities; pollutes package with Studio-specific code

2. **Keep utilities in template-studio, import via relative path** (REJECTED)
   - Pros: No duplication
   - Cons: Creates reverse dependency (package → app), violates monorepo boundaries

3. **3+ usage criterion: Extract if ≥3 schemas use identical function; otherwise inline** (SELECTED)
   - Pros: Keeps packages focused on schema contracts; simple logic is self-documenting; prevents premature abstraction
   - Cons: Minor code duplication for utilities used 1-2 times (acceptable tradeoff)

**Implementation**:
- `createRadioListLayout`: Used by <3 schemas → inline `options` configuration in each schema where needed
- `capitalize`: Used by <3 schemas → inline in each schema (3-5 lines)
- `isValidUrl`: Used by <3 schemas → inline in each schema (3-5 lines)
- `customRichText`: Already exported from `@walter/sanity-atoms/schemas/rich-text` (used by 3+ blocks) ✅

### Q2: How should `iconField` and `buttonsField` from `common.ts` be handled?

**Decision**: Apply the **3+ usage criterion** - `buttonsField` is used by 3+ blocks (extract to sanity-atoms), `iconField` is used by only 1 block (inline)

**Rationale**:
- `buttonsField` is a reusable field definition referencing `button` atom type, used by multiple blocks (hero, cta, imageLinkCards, etc.)
- `iconField` is used by only 1 block (featureCardsIcon) and is a Studio-specific UI configuration using `sanity-plugin-icon-picker`
- The 3+ usage criterion clearly dictates extraction vs. inlining decision

**Evidence from Existing Migration**:
- `buttonsFieldSchema` already exported from `@walter/sanity-atoms/schemas/buttons` (packages/sanity-atoms/src/buttons.schema.ts)
- `heroSectionSchema` successfully imports and uses `buttonsFieldSchema`
- No `iconField` export exists in packages (correctly kept Studio-specific due to single usage)

**Implementation** (applying 3+ criterion):
- `button` schema: No `buttonsField` dependency (already migrated as `buttonsFieldSchema`)
- `customUrl` schema: No common.ts dependencies
- `faqAccordion`: Uses `customUrl` (will import from sanity-atoms)
- `featureCardsIcon`: Uses `iconField` (1 usage) → **inline the definition** (7 lines)
- `imageLinkCards`: Uses `buttonsField` (3+ usages across blocks) → **import `buttonsFieldSchema`** from sanity-atoms
- `subscribeNewsletter`: No common.ts dependencies

### Q3: How should `customRichText` helper from `rich-text.ts` be migrated?

**Decision**: Already solved - `customRichText` is exported from `@walter/sanity-atoms/schemas/rich-text` (established in spec 008)

**Evidence**:
- File exists: `packages/sanity-atoms/src/rich-text.schema.ts`
- Exports: `richText`, `customRichText`, `memberTypes`
- Existing migrated blocks (hero, cta) successfully import and use `customRichText`
- Confirmed in spec clarifications: Export already exists from spec 008

**Implementation**:
- All blocks using `customRichText` will import from `@walter/sanity-atoms/schemas/rich-text`
- No migration work required for this utility (verification only)

### Q4: What GROQ fragment patterns should be used for the new atoms and blocks?

**Decision**: Follow established pattern from hero/cta fragments with atom composition

**Pattern from `heroSection.fragment.ts`**:
```typescript
import { buttonsFragment } from '@walter/sanity-atoms/fragments/buttons'
import { richTextFragment } from '@walter/sanity-atoms/fragments/rich-text'

export const heroSectionFragment = /* groq */ `
  _type == "hero" => {
    badge,
    title,
    ${richTextFragment},
    "image": image.asset->{...},
    ${buttonsFragment}
  },
`
```

**Key Principles**:
1. Fragment files export named string constants (e.g., `faqAccordionFragment`)
2. Use `/* groq */` template tag for syntax highlighting
3. Import and compose atom fragments for nested types (buttons, customUrl, richText)
4. Use GROQ join syntax for image assets (`image.asset->{...}`)
5. Use GROQ join syntax for references (`faqs[]->{...}`)

---

### Q5: Should we use barrel exports or direct file imports for workspace packages?

**Decision**: **DIRECT FILE IMPORTS ONLY** - Remove all barrel exports, use wildcard package exports

**Date**: 2025-11-14
**Priority**: CRITICAL - Affects entire monorepo architecture

**Problem Discovered**:
Sanity's typegen worker uses `esbuild-register` which doesn't properly resolve **relative imports within files loaded via TypeScript path mappings**. When a barrel export file (`fragments.ts`) imported via path mapping tried to use relative imports (`./image.fragment`), esbuild-register resolved them relative to the working directory instead of the file's actual location, causing "Cannot find module" errors.

**Failed Solutions Attempted**:
1. ❌ **Consolidating all fragments into single file** - Works but terrible DX, no file separation
2. ❌ **Creating babel.config.json with module-resolver plugin** - Sanity uses its own internal babel config, ignores ours
3. ❌ **Installing babel dependencies** - Completely unused, Sanity doesn't load external babel configs

**Winning Solution: Wildcard Package Exports + Direct Imports**

**Package Configuration**:
```json
{
  "exports": {
    "./schemas/*": "./src/*.schema.ts",
    "./fragments/*": "./src/*.fragment.ts"
  }
}
```

**TypeScript Path Mappings** (both root and studio tsconfig.json):
```json
{
  "baseUrl": ".",
  "paths": {
    "@walter/sanity-atoms/schemas/*": ["./packages/sanity-atoms/src/*.schema.ts"],
    "@walter/sanity-atoms/fragments/*": ["./packages/sanity-atoms/src/*.fragment.ts"],
    "@walter/sanity-blocks/schemas/*": ["./packages/sanity-blocks/src/*.schema.ts"],
    "@walter/sanity-blocks/fragments/*": ["./packages/sanity-blocks/src/*.fragment.ts"]
  }
}
```

**Import Pattern** (everywhere):
```typescript
// Schemas - direct imports only
import { heroSectionSchema } from "@walter/sanity-blocks/schemas/hero-section"
import { buttonsFieldSchema } from "@walter/sanity-atoms/schemas/buttons"

// Fragments - direct imports only
import { heroSectionFragment } from "@walter/sanity-blocks/fragments/hero-section"
import { imageFragment } from "@walter/sanity-atoms/fragments/image"
```

**Benefits**:
1. **No relative imports in resolution chain** - Each import goes directly to target file
2. **Works with Sanity typegen** - tsconfig-paths (built into Sanity) resolves wildcards correctly
3. **Uniform pattern** - No confusion about import styles, always import from source file
4. **Low mental overhead** - Clear what depends on what, easy to find source
5. **Better tree-shaking** - Import only what you need, no barrel file overhead
6. **Prevents future issues** - Eliminates entire class of module resolution bugs

**Files Removed**:
- ❌ `packages/sanity-atoms/src/schemas.ts` (barrel export)
- ❌ `packages/sanity-atoms/src/fragments.ts` (barrel export)
- ❌ `packages/sanity-blocks/src/schemas.ts` (barrel export)
- ❌ `packages/sanity-blocks/src/fragments.ts` (barrel export)

**Why This Works**:
- Wildcard exports (`./schemas/*`) map directly to source files
- TypeScript path mappings (`@walter/sanity-atoms/schemas/*`) resolve the wildcards
- Sanity's `getResolver()` uses `tsconfig-paths` library internally (transitive dep of @sanity/codegen)
- No barrel files = no relative imports = no resolution issues

**Implementation Rule**:
> **Every import must reference the actual source file directly. No exceptions.**
>
> ✅ `import { x } from "@walter/sanity-atoms/schemas/button"`
> ❌ `import { x } from "@walter/sanity-atoms/schemas"`

**Atom Fragments to Create**:

1. **buttonFragment** (singular button):
```typescript
export const buttonFragment = /* groq */ `
  variant,
  text,
  ${customUrlFragment}
`
```

2. **customUrlFragment**:
```typescript
export const customUrlFragment = /* groq */ `
  "url": {
    type,
    openInNewTab,
    external,
    href,
    "internal": internal->{ _type, slug }
  }
`
```

**Block Fragments to Create**:

1. **faqAccordionFragment**: References FAQ documents
2. **featureCardsIconFragment**: Nested cards with icons (note: icon stored as SVG string)
3. **imageLinkCardsFragment**: Nested cards with images, buttons, customUrl
4. **subscribeNewsletterFragment**: Multiple customRichText fields with custom names

### Q5: How are icon fields queried in GROQ fragments?

**Decision**: Icons stored as objects with SVG string - query the full icon object

**Research**:
- `sanity-plugin-icon-picker` stores icons as `{ provider, name, svg }` objects when `storeSvg: true`
- No special GROQ syntax needed - query the field directly

**Implementation**:
```typescript
// In featureCardsIcon fragment
"cards": cards[]{
  icon,  // Stored as { provider: "fi", name: "FiCheck", svg: "<svg>...</svg>" }
  title,
  ${richTextFragment}
}
```

### Q6: What is the correct import path structure for package exports?

**Decision**: Use package subpath exports as configured in package.json

**Current Package Structure**:
- `@walter/sanity-atoms/schemas` → `packages/sanity-atoms/src/schemas.ts`
- `@walter/sanity-atoms/fragments` → `packages/sanity-atoms/src/fragments.ts`
- `@walter/sanity-blocks/schemas` → `packages/sanity-blocks/src/schemas.ts`
- `@walter/sanity-blocks/fragments` → `packages/sanity-blocks/src/fragments.ts`

**Why This Structure**:
- Separates schema definitions (React components, Studio-specific) from fragments (pure GROQ strings)
- Prevents accidental import of Studio code into Next.js server components
- Follows Sanity best practices for separating concerns

**Implementation**:
- Template-studio imports schemas: `import { button, customUrl } from '@walter/sanity-atoms/schemas'`
- Template-web imports fragments: `import { buttonFragment } from '@walter/sanity-atoms/fragments'`

### Q7: Should inline nested objects (like `imageLinkCard`, `featureCardIcon`) be extracted to separate schemas?

**Decision**: Keep inline nested objects as-is (do not extract)

**Rationale**:
- These nested objects are block-specific and not reused elsewhere
- Extracting would create unnecessary complexity (more files, imports, exports)
- Current pattern (inline `defineField` for nested objects) works well
- Only extract if reused across 3+ locations (DRY principle)

**Evidence**:
- `featureCardsIcon` defines `featureCardIcon` inline (lines 35-57)
- `imageLinkCards` defines `imageLinkCard` inline (lines 37-95)
- No other blocks use these exact structures

**Implementation**:
- Migrate entire block files as-is, including inline nested object definitions
- Do NOT create separate schema files for `featureCardIcon` or `imageLinkCard`

## Technology Decisions

### Selected Approach: Atom-First Migration

**Migration Order**:
1. Migrate atoms first (button, customUrl) - P1
2. Migrate blocks (faqAccordion, featureCardsIcon, imageLinkCards, subscribeNewsletter) - P2
3. Create GROQ fragments - P3
4. Update template-studio imports and delete duplicates - P4

**Rationale**:
- Atoms are dependencies for blocks (customUrl used in button, faqAccordion, imageLinkCards)
- Blocks reference atom types, so atoms must exist in package first
- Prevents circular dependencies and import errors during migration

### Alternative: Parallel Migration (REJECTED)

**Why Rejected**:
- Risk of import errors if block references atom type before it's exported from package
- TypeScript type checking would fail if dependencies not available
- More complex coordination between file changes

## Best Practices from Existing Migrations

### Schema Naming Convention
- File name: camelCase with `.schema.ts` suffix (e.g., `heroSection.schema.ts`)
- Export name: camelCase with `Schema` suffix (e.g., `export const heroSectionSchema`)
- Schema `name` property: camelCase without suffix (e.g., `name: "heroSection"`)

### Fragment Naming Convention
- File name: matches schema with `.fragment.ts` suffix (e.g., `heroSection.fragment.ts`)
- Export name: camelCase with `Fragment` suffix (e.g., `export const heroSectionFragment`)

### Import Statements in Migrated Schemas
```typescript
// Correct: Import from shared packages
import { buttonsFieldSchema, customRichText } from '@walter/sanity-atoms/schemas'

// Incorrect: Relative imports to template-studio
import { buttonsField } from '../common'  // ❌ Wrong
```

### Helper Function Handling
```typescript
// Correct: Inline simple utilities
const buttonVariants = ["default", "secondary", "outline", "link"]
options: {
  layout: "radio",
  list: buttonVariants.map(v => ({ title: v.charAt(0).toUpperCase() + v.slice(1), value: v }))
}

// Incorrect: Import from template-studio utils
import { createRadioListLayout } from '../../utils/helper'  // ❌ Wrong
```

## Implementation Checklist

### Atoms (P1)
- [ ] Create `packages/sanity-atoms/src/button.schema.ts` (migrate from template-studio)
- [ ] Create `packages/sanity-atoms/src/button.fragment.ts` (new GROQ fragment)
- [ ] Create `packages/sanity-atoms/src/customUrl.schema.ts` (migrate from template-studio)
- [ ] Create `packages/sanity-atoms/src/customUrl.fragment.ts` (new GROQ fragment)
- [ ] Update `packages/sanity-atoms/src/schemas.ts` (export button, customUrl)
- [ ] Update `packages/sanity-atoms/src/fragments.ts` (export fragments)

### Blocks (P2)
- [ ] Complete `packages/sanity-blocks/src/faqAccordion.schema.ts` (currently empty)
- [ ] Create `packages/sanity-blocks/src/featureCardsIcon.schema.ts` (migrate from template-studio)
- [ ] Create `packages/sanity-blocks/src/featureCardsIcon.fragment.ts` (new)
- [ ] Create `packages/sanity-blocks/src/imageLinkCards.schema.ts` (migrate from template-studio)
- [ ] Create `packages/sanity-blocks/src/imageLinkCards.fragment.ts` (new)
- [ ] Create `packages/sanity-blocks/src/subscribeNewsletter.schema.ts` (migrate from template-studio)
- [ ] Create `packages/sanity-blocks/src/subscribeNewsletter.fragment.ts` (new)
- [ ] Update `packages/sanity-blocks/src/schemas.ts` (add 4 new blocks)
- [ ] Update `packages/sanity-blocks/src/fragments.ts` (add 4 new fragments)

### Template-Studio Updates (P4)
- [ ] Update `apps/template-studio/schemaTypes/definitions/index.ts` (import from packages)
- [ ] Update `apps/template-studio/schemaTypes/blocks/index.ts` (import from packages)
- [ ] Delete `apps/template-studio/schemaTypes/definitions/button.ts`
- [ ] Delete `apps/template-studio/schemaTypes/definitions/custom-url.ts`
- [ ] Delete `apps/template-studio/schemaTypes/blocks/faq-accordion.ts`
- [ ] Delete `apps/template-studio/schemaTypes/blocks/feature-cards-icon.ts`
- [ ] Delete `apps/template-studio/schemaTypes/blocks/image-link-cards.ts`
- [ ] Delete `apps/template-studio/schemaTypes/blocks/subscribe-newsletter.ts`

## Risk Assessment

### Low Risk
- Schema migration follows proven pattern from spec 007/008
- TypeScript type checking catches import errors immediately
- Build verification ensures no runtime errors

### Medium Risk
- Helper function inlining may miss edge cases (mitigation: manual review + type checking)
- Icon field GROQ fragment pattern not yet established (mitigation: reference existing projects, test with sample data)

### Mitigation Strategies
1. Migrate and test one atom schema at a time before proceeding to blocks
2. Run `pnpm check-types` after each file migration
3. Test Studio dev server after completing all migrations
4. Manual verification of block rendering in Studio UI

## References

- Spec 007: Colocate PageBuilder Modules (established schema/fragment pattern)
- Spec 008: Multi-tenant Template (completed hero/cta migration)
- CLAUDE.md: Page Builder Block Organization section
- Existing migrated files: `packages/sanity-blocks/src/heroSection.schema.ts`, `packages/sanity-atoms/src/buttons.schema.ts`
