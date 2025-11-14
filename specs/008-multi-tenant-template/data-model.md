# Data Model: Multi-Tenant Agency Template Architecture

**Feature**: 008-multi-tenant-template
**Date**: 2025-11-14
**Status**: Complete

## Overview

This feature is a **code organization refactor** that restructures how Sanity schemas are packaged and imported. It does not modify the Sanity Content Lake data structure or schema definitions themselves (per constraint C-005).

The "data model" in this context describes:
1. **Package Organization Model**: How schemas and fragments are organized into packages
2. **Schema Composition Hierarchy**: How atomic types compose into blocks and documents
3. **Dependency Graph Model**: How packages depend on each other

**Important**: This is NOT a traditional data model (entities, fields, relationships, validation rules) because:
- No new Sanity document types are created (blocks already exist)
- No schema field definitions are modified (backward compatible per C-001)
- No database schema changes (Sanity Content Lake unchanged)
- Pure file/directory reorganization

## Package Organization Model

### Package Hierarchy

```
┌─────────────────────────────────────┐
│  Apps (Template & Future Clients)   │
│  - template-studio                   │
│  - template-web                      │
│  - (future: client-a-studio, etc.)   │
└──────────────┬──────────────────────┘
               │ depends on
               ▼
┌─────────────────────────────────────┐
│  @walter/sanity-blocks               │
│  - Page builder block schemas        │
│  - GROQ fragments for blocks         │
│  - allBlockSchemas[] array           │
└──────────────┬──────────────────────┘
               │ depends on
               ▼
┌─────────────────────────────────────┐
│  @walter/sanity-atoms                │
│  - Primitive field definitions       │
│  - Reusable atomic content types     │
│  - No dependencies                   │
└─────────────────────────────────────┘
```

**Dependency Rules**:
- **Apps** may import from **blocks** and **atoms** (but typically only blocks)
- **Blocks** MUST import atoms from **atoms** package (FR-036)
- **Atoms** have no internal dependencies (self-contained)
- **Circular dependencies** are prohibited (FR-046)

### Package Exports API

Each package exposes a controlled API surface through `package.json` exports:

**@walter/sanity-atoms**:
```json
{
  "exports": {
    "./schemas": "./src/schemas.ts"
  }
}
```

**@walter/sanity-blocks**:
```json
{
  "exports": {
    "./schemas": "./src/schemas.ts",
    "./fragments": "./src/fragments.ts"
  }
}
```

**Import Patterns**:
```typescript
// In apps/template-studio/
import { buttonsSchema, imageSchema, richTextSchema } from '@walter/sanity-atoms/schemas'
import { heroSectionSchema, ctaSchema, allBlockSchemas } from '@walter/sanity-blocks/schemas'

// In apps/template-web/
import { heroSectionFragment, ctaFragment } from '@walter/sanity-blocks/fragments'

// In packages/sanity-blocks/src/heroSection.schema.ts
import { buttonsSchema } from '@walter/sanity-atoms/schemas'
```

## Schema Composition Hierarchy

### Atomic Content Types (Atoms)

**Location**: `packages/sanity-atoms/src/`

**Purpose**: Smallest reusable field definitions used across multiple blocks and documents.

**Entities**:

| Atom | File | Description | Used By |
|------|------|-------------|---------|
| **Buttons** | `buttons.schema.ts` | Array of CTA buttons with text, link, style | Hero sections, CTAs, feature cards |
| **Image** | `image.schema.ts` | Image field with alt text, hotspot, metadata | Hero sections, image cards, blog posts |
| **Rich Text** | `richText.schema.ts` | Portable text editor with formatting, links | Content blocks, blog posts, FAQs |

**Characteristics**:
- **Self-contained**: No dependencies on other atoms
- **Highly reusable**: Used by multiple blocks
- **Consistent**: Single source of truth for each field type
- **Versioned**: Changes propagate to all consumers through dependency updates

**Schema Structure** (Example: Buttons):
```typescript
// File: packages/sanity-atoms/src/buttons.schema.ts
import { defineType } from 'sanity'

export const buttonsSchema = defineType({
  name: 'buttons',        // Schema name (unchanged from current)
  type: 'array',
  title: 'Buttons',
  of: [{
    type: 'object',
    fields: [
      { name: 'text', type: 'string', title: 'Button Text' },
      { name: 'link', type: 'string', title: 'Link URL' },
      { name: 'style', type: 'string', options: { list: ['primary', 'secondary'] }}
    ]
  }]
})
```

### Page Builder Blocks (Molecules)

**Location**: `packages/sanity-blocks/src/`

**Purpose**: Reusable page sections that compose atomic types into functional blocks.

**Entities**:

| Block | Files | Composes Atoms | Description |
|-------|-------|----------------|-------------|
| **Hero Section** | `heroSection.schema.ts`<br>`heroSection.fragment.ts` | image, buttons, richText | Page header with headline, image, CTA |
| **CTA** | `cta.schema.ts`<br>`cta.fragment.ts` | buttons, richText | Call-to-action section |
| **FAQ Accordion** | `faqAccordion.schema.ts`<br>`faqAccordion.fragment.ts` | richText | Expandable Q&A list |
| **Feature Cards Icon** | `featureCardsIcon.schema.ts`<br>`featureCardsIcon.fragment.ts` | image, richText | Grid of feature highlights |
| **Image Link Cards** | `imageLinkCards.schema.ts`<br>`imageLinkCards.fragment.ts` | image, buttons | Card grid with images and links |
| **Subscribe Newsletter** | `subscribeNewsletter.schema.ts`<br>`subscribeNewsletter.fragment.ts` | richText | Email subscription form |

**Characteristics**:
- **Composed**: Import and use atom schemas
- **Self-contained sections**: Each block is a complete page section
- **Queryable**: Have corresponding GROQ fragments for data fetching
- **Reusable**: Used across multiple pages/documents

**Schema Structure** (Example: Hero Section):
```typescript
// File: packages/sanity-blocks/src/heroSection.schema.ts
import { defineType } from 'sanity'
import { buttonsSchema, imageSchema, richTextSchema } from '@walter/sanity-atoms/schemas'

export const heroSectionSchema = defineType({
  name: 'heroSection',    // Schema name (unchanged from current)
  type: 'object',
  title: 'Hero Section',
  fields: [
    { name: 'headline', type: 'string', title: 'Headline' },
    { name: 'subheadline', type: 'richText', title: 'Subheadline' },
    { name: 'image', type: 'image', title: 'Background Image' },
    { name: 'buttons', type: 'buttons', title: 'Call-to-Action Buttons' }
  ]
})
```

**GROQ Fragment** (Example: Hero Section):
```typescript
// File: packages/sanity-blocks/src/heroSection.fragment.ts
export const heroSectionFragment = /* groq */ `
  _type == "heroSection" => {
    _type,
    headline,
    subheadline,
    image {
      asset -> { _id, url, metadata }
    },
    buttons[] {
      text,
      link,
      style
    }
  }
`
```

### Aggregated Exports

**Location**: `packages/sanity-blocks/src/schemas.ts` and `fragments.ts`

**Purpose**: Provide convenient re-exports for consuming apps.

**schemas.ts**:
```typescript
// Re-export all block schemas
export { heroSectionSchema } from './heroSection.schema'
export { ctaSchema } from './cta.schema'
export { faqAccordionSchema } from './faqAccordion.schema'
export { featureCardsIconSchema } from './featureCardsIcon.schema'
export { imageLinkCardsSchema } from './imageLinkCards.schema'
export { subscribeNewsletterSchema } from './subscribeNewsletter.schema'

// Convenience array for Sanity Studio registration (FR-035)
export const allBlockSchemas = [
  heroSectionSchema,
  ctaSchema,
  faqAccordionSchema,
  featureCardsIconSchema,
  imageLinkCardsSchema,
  subscribeNewsletterSchema
]
```

**fragments.ts**:
```typescript
// Re-export all block fragments
export { heroSectionFragment } from './heroSection.fragment'
export { ctaFragment } from './cta.fragment'
export { faqAccordionFragment } from './faqAccordion.fragment'
export { featureCardsIconFragment } from './featureCardsIcon.fragment'
export { imageLinkCardsFragment } from './imageLinkCards.fragment'
export { subscribeNewsletterFragment } from './subscribeNewsletter.fragment'
```

## Package Dependency Graph

### Dependency Matrix

| Package | Depends On | Depended On By |
|---------|------------|----------------|
| **@walter/sanity-atoms** | (none) | @walter/sanity-blocks, apps |
| **@walter/sanity-blocks** | @walter/sanity-atoms | apps (template-studio, template-web, future clients) |
| **apps/template-studio** | @walter/sanity-blocks, @walter/sanity-atoms | (none - leaf node) |
| **apps/template-web** | @walter/sanity-blocks | (none - leaf node) |

### Dependency Rules (Enforced)

**Rule 1: Acyclic Dependencies** (FR-046)
- No package may depend on a package that depends on it (directly or transitively)
- Verification: `pnpm` will error on circular dependencies

**Rule 2: Workspace References** (FR-018, FR-019, FR-022, FR-039, FR-040)
- All dependencies use workspace protocol: `"@walter/sanity-atoms": "workspace:*"`
- Ensures latest version of shared packages always used during development

**Rule 3: Explicit Imports** (FR-036)
- Blocks MUST import atoms from package (`@walter/sanity-atoms/schemas`)
- Blocks MUST NOT use relative imports to atoms (`../../sanity-atoms/src/buttons.schema`)

**Rule 4: No Deep Imports**
- Apps MUST import from package export paths (`@walter/sanity-blocks/schemas`)
- Apps MUST NOT import internal files (`@walter/sanity-blocks/src/heroSection.schema`)

## File Organization Model

### Flat File Structure (FR-025, C-004)

**Pattern**: All source files at same directory level with camelCase naming

**Before (Nested)**:
```
packages/sanity/src/
├── blocks/
│   ├── hero-section/
│   │   ├── hero-section.schema.ts
│   │   └── hero-section.fragment.ts
│   ├── cta/
│   │   ├── cta.schema.ts
│   │   └── cta.fragment.ts
│   └── faq-section/
│       ├── faq-section.schema.ts
│       └── faq-section.fragment.ts
└── shared/
    ├── buttons/
    │   └── buttons.schema.ts
    ├── image/
    │   └── image.schema.ts
    └── rich-text/
        └── rich-text.schema.ts
```

**After (Flat)**:
```
packages/sanity-blocks/src/
├── heroSection.schema.ts
├── heroSection.fragment.ts
├── cta.schema.ts
├── cta.fragment.ts
├── faqAccordion.schema.ts
├── faqAccordion.fragment.ts
├── schemas.ts          # Aggregated exports
└── fragments.ts        # Aggregated exports

packages/sanity-atoms/src/
├── buttons.schema.ts
├── image.schema.ts
├── richText.schema.ts
└── schemas.ts          # Aggregated exports
```

**Benefits**:
- All files visible in single directory listing (SC-004: <5 second file location)
- Import paths simpler: `'./heroSection.schema'` vs `'./hero-section/hero-section.schema'`
- No "which subdirectory?" cognitive overhead
- Easier refactoring (no nested path updates)

### Naming Convention (A-011, C-004)

**Pattern**: `[blockName].[type].ts` where:
- `[blockName]` = camelCase block identifier (heroSection, faqAccordion)
- `[type]` = `schema` or `fragment`

**Examples**:
- ✅ `heroSection.schema.ts` (camelCase)
- ✅ `faqAccordion.fragment.ts` (camelCase)
- ❌ `hero-section.schema.ts` (kebab-case - rejected)
- ❌ `HeroSection.schema.ts` (PascalCase - reserved for classes/components)

**Rationale**: Aligns with TypeScript conventions where exported values use camelCase:
```typescript
export const heroSectionSchema = defineType({ name: 'heroSection', ... })
```

## Schema Name Preservation

### Backward Compatibility (C-001)

**Critical Constraint**: Sanity schema `name` fields MUST NOT change during reorganization.

**Before and After Comparison**:

| Block | Old File | New File | Schema Name |
|-------|----------|----------|-------------|
| Hero | `blocks/hero-section/hero-section.schema.ts` | `heroSection.schema.ts` | `"heroSection"` ✅ Same |
| CTA | `blocks/cta/cta.schema.ts` | `cta.schema.ts` | `"cta"` ✅ Same |
| FAQ | `blocks/faq-section/faq-section.schema.ts` | `faqAccordion.schema.ts` | `"faqSection"` or `"faqAccordion"` ⚠️ Must match existing |

**Verification Strategy**:
1. Before migration: Document all current schema names
2. After migration: Verify schema names unchanged
3. Test Sanity Studio: All existing content renders correctly

**Why This Matters**:
- Sanity Content Lake references schemas by `name` field
- Changing schema names would orphan existing content
- No data migration capabilities in Phase 1 (pure code refactor)

## Implementation Checklist

### Pre-Migration Verification
- [ ] Document all current Sanity schema names (run Studio, inspect schema registry)
- [ ] Verify which blocks currently exist in `packages/sanity/src/blocks/`
- [ ] Confirm atoms currently in `packages/sanity/src/shared/`

### Atoms Package Creation
- [ ] Create `packages/sanity-atoms/` directory structure (FR-009)
- [ ] Migrate `buttons.schema.ts` from shared (FR-012)
- [ ] Migrate `image.schema.ts` from shared (FR-013)
- [ ] Migrate `richText.schema.ts` from shared (FR-014)
- [ ] Create `schemas.ts` re-export file (FR-015)
- [ ] Create `package.json` with `@walter/sanity-atoms` name (FR-010)
- [ ] Create `tsconfig.json` (FR-017)

### Blocks Package Reorganization
- [ ] Rename `packages/sanity/` → `packages/sanity-blocks/` using `git mv` (FR-020)
- [ ] Update `package.json` name to `@walter/sanity-blocks` (FR-021)
- [ ] Add `@walter/sanity-atoms` dependency (FR-022)
- [ ] Migrate all blocks to flat structure with `git mv` (FR-025 to FR-030)
- [ ] Update block imports to use atoms package (FR-036)
- [ ] Create aggregated `schemas.ts` with `allBlockSchemas` (FR-033, FR-035)
- [ ] Create aggregated `fragments.ts` (FR-034)
- [ ] Remove old nested directories (FR-041)

### App Updates
- [ ] Rename `apps/studio/` → `apps/template-studio/` (FR-001)
- [ ] Rename `apps/web/` → `apps/template-web/` (FR-002)
- [ ] Update template-studio imports (FR-037)
- [ ] Update template-web imports (FR-038)
- [ ] Update template-studio package.json dependencies (FR-018, FR-039)
- [ ] Update template-web package.json dependencies (FR-019, FR-040)

### Verification
- [ ] Run `pnpm check-types` (FR-042)
- [ ] Run `pnpm build` (FR-043)
- [ ] Start template-studio dev server (FR-044)
- [ ] Start template-web dev server (FR-044)
- [ ] Verify no schema name changes (C-001)
- [ ] Verify dependency graph (FR-046)
- [ ] Test file discoverability (<5 seconds per SC-004)

## Validation Rules

Since this is a refactor, validation is primarily build-time verification:

**TypeScript Compilation** (FR-042):
- All imports resolve correctly
- No type errors
- Workspace references work

**Build Success** (FR-043):
- All packages build without errors
- Apps build without errors
- Turbo cache works correctly

**Runtime Validation** (FR-044, FR-045):
- Sanity Studio loads all schemas
- Studio interface displays all blocks correctly
- Web app queries work with new fragments
- No console errors
- Functional equivalence to pre-migration state

**Manual Checks**:
- File location test (SC-004): Time how long to find `heroSection.schema.ts`
- Dependency graph verification (SC-011): Check package.json files
- Code duplication check (SC-012): Grep for duplicate schema definitions

## Future Extensions

**Phase 2: Documents Package** (OS-002):
```
packages/sanity-documents/src/
├── page.schema.ts
├── blogPost.schema.ts
├── faqDocument.schema.ts
└── schemas.ts
```

**Phase 4: Client Projects** (OS-001):
```
apps/
├── template-studio/
├── template-web/
├── client-a-studio/
├── client-a-web/
├── client-b-studio/
└── client-b-web/
```

All future packages will follow the same organizational patterns established in Phase 1.
