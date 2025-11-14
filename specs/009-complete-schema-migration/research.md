# Research: Complete Schema Migration to Monorepo Packages

**Phase**: 0 - Research & Discovery
**Date**: 2025-11-14
**Related**: [plan.md](./plan.md) | [spec.md](./spec.md)

## Overview

This document captures research findings for migrating remaining Sanity schema definitions (atoms and blocks) from `apps/template-studio` to shared workspace packages. The migration follows the established pattern from spec 007/008.

## Research Questions & Findings

### Q1: How should helper utility dependencies be handled when migrating schemas?

**Decision**: Export utilities from shared packages OR inline them if simple

**Rationale**:
- Migrated schemas (e.g., `heroSection.schema.ts`) successfully import from `@walter/sanity-atoms/schemas`
- Helper functions like `createRadioListLayout`, `capitalize`, `isValidUrl` exist in `apps/template-studio/utils/helper.ts`
- These are Studio-specific utilities, NOT schema logic

**Options Evaluated**:

1. **Export from sanity-atoms package** (REJECTED)
   - Pros: Single source of truth, reusable
   - Cons: Utilities are for Studio UI configuration (radio layouts), not schema definition; would pollute package with Studio-specific code

2. **Keep utilities in template-studio, import via relative path** (REJECTED)
   - Pros: No duplication
   - Cons: Creates reverse dependency (package → app), violates monorepo boundaries

3. **Inline simple logic, extract complex helpers to shared package** (SELECTED)
   - Pros: Keeps packages focused on schema contracts, simple logic is self-documenting
   - Cons: Minor code duplication for trivial functions

**Implementation**:
- `createRadioListLayout`: Keep in template-studio, use inline `options` configuration in migrated schemas
- `capitalize`, `isValidUrl`: Inline in migrated schemas where needed (3-5 lines each)
- `customRichText`: Already exported from `@walter/sanity-atoms/schemas` ✅

### Q2: How should `iconField` and `buttonsField` from `common.ts` be handled?

**Decision**: Migrate `buttonsField` to sanity-atoms, inline `iconField` in blocks that need it

**Rationale**:
- `buttonsField` is a reusable field definition referencing `button` atom type
- `iconField` is a Studio-specific UI configuration using `sanity-plugin-icon-picker`

**Evidence from Existing Migration**:
- `buttonsFieldSchema` already exported from `@walter/sanity-atoms/schemas` (packages/sanity-atoms/src/buttons.schema.ts)
- `heroSectionSchema` successfully imports and uses `buttonsFieldSchema`
- No `iconField` export exists in packages (still Studio-specific)

**Implementation**:
- `button` schema: No `buttonsField` dependency (already migrated as `buttonsFieldSchema`)
- `customUrl` schema: No common.ts dependencies
- `faqAccordion`: Uses `customUrl` (will import from sanity-atoms)
- `featureCardsIcon`: Uses `iconField` → inline the definition (7 lines)
- `imageLinkCards`: Uses `buttonsField` → import `buttonsFieldSchema` from sanity-atoms
- `subscribeNewsletter`: No common.ts dependencies

### Q3: How should `customRichText` helper from `rich-text.ts` be migrated?

**Decision**: Already solved - `customRichText` is exported from `@walter/sanity-atoms/schemas`

**Evidence**:
- File exists: `packages/sanity-atoms/src/richText.schema.ts`
- Exports: `richText`, `customRichText`, `memberTypes`
- Existing migrated blocks (hero, cta) successfully import and use `customRichText`

**Implementation**:
- All blocks using `customRichText` will import from `@walter/sanity-atoms/schemas`
- No migration work required for this utility

### Q4: What GROQ fragment patterns should be used for the new atoms and blocks?

**Decision**: Follow established pattern from hero/cta fragments with atom composition

**Pattern from `heroSection.fragment.ts`**:
```typescript
import { buttonsFragment, richTextFragment } from '@walter/sanity-atoms/fragments'

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
