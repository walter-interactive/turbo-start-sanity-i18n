# API Contracts: Migrate Web Query Fragments to Shared Packages

**Date**: 2025-11-14
**Feature**: 010-migrate-web-fragments

## Overview

This feature is a **pure code organization refactor** with **zero API contract changes**. No external APIs, GraphQL schemas, REST endpoints, or public interfaces are modified.

## Internal Contracts (Package Exports)

While there are no external API changes, the internal package export contracts are being formalized.

### Package: @walter/sanity-blocks

**Export Contract** (package.json):
```json
{
  "exports": {
    "./schemas/*": "./src/*.schema.ts",
    "./fragments/*": "./src/*.fragment.ts"
  }
}
```

**Fragment Exports** (TypeScript):

```typescript
// Fragments exported from @walter/sanity-blocks/fragments/[name]

// Hero Section
export const heroSectionFragment: string;
// Usage: import { heroSectionFragment } from "@walter/sanity-blocks/fragments/hero-section";

// CTA (renamed from ctaBlock for consistency)
export const ctaFragment: string;
// Usage: import { ctaFragment } from "@walter/sanity-blocks/fragments/cta";

// FAQ Accordion (renamed from faqSectionFragment to match schema)
export const faqAccordionFragment: string;
// Usage: import { faqAccordionFragment } from "@walter/sanity-blocks/fragments/faq-accordion";

// Image Link Cards (updated implementation)
export const imageLinkCardsFragment: string;
// Usage: import { imageLinkCardsFragment } from "@walter/sanity-blocks/fragments/image-link-cards";

// Subscribe Newsletter
export const subscribeNewsletterFragment: string;
// Usage: import { subscribeNewsletterFragment } from "@walter/sanity-blocks/fragments/subscribe-newsletter";

// Feature Cards Icon
export const featureCardsIconFragment: string;
// Usage: import { featureCardsIconFragment } from "@walter/sanity-blocks/fragments/feature-cards-icon";
```

**Contract Guarantees**:
- All fragment exports are `const` strings containing GROQ syntax
- Fragment names follow `[schemaName]Fragment` convention
- Each fragment file exports exactly one main fragment
- Fragment composition (importing other fragments) is preserved

---

### Package: @walter/sanity-atoms

**Export Contract** (package.json):
```json
{
  "exports": {
    "./schemas/*": "./src/*.schema.ts",
    "./fragments/*": "./src/*.fragment.ts"
  }
}
```

**Fragment Exports** (TypeScript):

```typescript
// Fragments exported from @walter/sanity-atoms/fragments/[name]

// Image (primitive fields)
export const imageFields: string;
export const imageFragment: string;
// Usage: import { imageFields, imageFragment } from "@walter/sanity-atoms/fragments/image";

// Buttons
export const buttonsFragment: string;
// Usage: import { buttonsFragment } from "@walter/sanity-atoms/fragments/buttons";

// Button (individual)
export const buttonFragment: string;
// Usage: import { buttonFragment } from "@walter/sanity-atoms/fragments/button";

// Custom URL
export const customUrlFragment: string;
// Usage: import { customUrlFragment } from "@walter/sanity-atoms/fragments/custom-url";

// Rich Text (NEW: exposing hidden fragments)
export const richTextFragment: string;
export const customLinkFragment: string;  // ← Now public
export const markDefsFragment: string;    // ← Now public
// Usage: import { richTextFragment, customLinkFragment, markDefsFragment } from "@walter/sanity-atoms/fragments/rich-text";
```

**Contract Guarantees**:
- All fragment exports are `const` strings containing GROQ syntax
- Multiple exports per file are allowed (e.g., imageFields + imageFragment)
- Previously hidden fragments (customLinkFragment, markDefsFragment) are now public API
- Fragment dependencies are resolved through imports (not string concatenation)

---

## Breaking Changes

### None

This migration introduces **zero breaking changes** to existing consumers.

**Rationale**:
- All fragments already existed (duplicates or hidden)
- Template-web is the only current consumer
- Template-web imports will be updated atomically in the same PR
- No external packages depend on these fragments yet

---

## Deprecation Plan

### None Required

No fragments are being deprecated. Local template-web fragments are being **removed** (not deprecated) because:
1. They are internal implementation details (not public API)
2. Template-web will immediately use shared package versions
3. No migration period needed (atomic change in single PR)

---

## Contract Versioning

Since these are workspace packages (`workspace:*`) in a monorepo:
- **No semantic versioning** for workspace packages (always latest)
- **Atomic updates** across all workspaces via monorepo tooling
- **Breaking changes prevented** by TypeScript compilation and build checks

---

## Migration Impact Analysis

### Affected Consumers

| Consumer | Current State | After Migration | Impact |
|----------|--------------|-----------------|--------|
| template-web | Imports some fragments from shared packages, defines others locally | Imports all schema-coupled fragments from shared packages | Medium - requires import path updates |
| template-studio | No fragment imports (uses schemas only) | No change | None |
| External packages | N/A (workspace packages are private) | N/A | None |

### Import Path Changes (template-web)

**Before**:
```typescript
// Local definitions in query.ts
const imageLinkCardsBlock = /* groq */ `...`;
const subscribeNewsletterBlock = /* groq */ `...`;
const featureCardsIconBlock = /* groq */ `...`;
const customLinkFragment = /* groq */ `...`;
const markDefsFragment = /* groq */ `...`;
```

**After**:
```typescript
// Shared package imports
import { imageLinkCardsFragment } from "@walter/sanity-blocks/fragments/image-link-cards";
import { subscribeNewsletterFragment } from "@walter/sanity-blocks/fragments/subscribe-newsletter";
import { featureCardsIconFragment } from "@walter/sanity-blocks/fragments/feature-cards-icon";
import { customLinkFragment, markDefsFragment } from "@walter/sanity-atoms/fragments/rich-text";
```

**Breaking?**: No - changes are internal to template-web only.

---

## Validation Contract

### Query Result Equivalence

**Contract**: All GROQ queries must return identical results before and after migration.

**Validation Method**: Snapshot testing

**Test Queries**:
```typescript
// All queries must produce identical JSON output
queryHomePageData({ locale: "en" })
querySlugPageData({ slug: "about", locale: "en" })
queryBlogIndexPageData({ locale: "en" })
queryBlogSlugPageData({ slug: "example-post", locale: "en" })
queryNavbarData({ locale: "en" })
queryFooterData()
querySettingsData()
queryAllLocalizedPages({ locale: "en" })
```

**Pass Criteria**: JSON.stringify(before) === JSON.stringify(after) for all queries.

---

## Rollback Contract

If migration fails validation:

### Rollback Procedure

1. **Git Revert**: Revert migration commit (single atomic change)
2. **Verify Rollback**: Run same snapshot tests, confirm baseline match
3. **Deploy**: Push reverted branch to production

**Rollback SLA**: < 5 minutes (single git revert + push)

**Data Loss Risk**: None (no data migrations involved)

---

## Summary

This contract document confirms:

1. ✅ **Zero external API changes** - pure internal refactor
2. ✅ **Zero breaking changes** - all updates are atomic
3. ✅ **Internal contract formalization** - package exports are now explicit
4. ✅ **Query result equivalence** - validated through snapshot testing
5. ✅ **Fast rollback** - single git revert if issues arise

No OpenAPI, GraphQL, or REST contracts are needed because this is a backend query organization refactor with no user-facing API changes.
