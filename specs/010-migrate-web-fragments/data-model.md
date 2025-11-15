# Data Model: Migrate Web Query Fragments to Shared Packages

**Date**: 2025-11-14
**Feature**: 010-migrate-web-fragments

## Overview

This feature is a **pure code organization refactor** with **zero data model changes**. No schemas, fields, relationships, or database structures are modified. This document describes the **fragment organization model** rather than a traditional data model.

## Fragment Entity Model

### Entity: Query Fragment

A query fragment is a reusable GROQ query snippet that defines how to fetch data for a specific schema type or composition pattern.

**Attributes**:
- `name`: String - Fragment identifier (e.g., "heroSectionFragment")
- `type`: Enum - Fragment classification (Block | Atom | Composition)
- `location`: Path - File path in monorepo
- `exports`: Boolean - Whether fragment is publicly exported
- `dependencies`: Array<FragmentName> - Other fragments this fragment composes
- `schemaName`: String | null - Associated schema name (null for schema-less fragments)

**Relationships**:
- Fragment → Schema (0..1) - A fragment MAY correspond to exactly one schema
- Fragment → Fragment (0..n) - A fragment MAY compose multiple other fragments
- Package → Fragment (1..n) - A package contains one or more fragments

**States**:
- `migrated`: Fragment exists in shared package and is exported
- `duplicate`: Fragment exists in both template-web and shared package
- `hidden`: Fragment exists but is not exported (internal implementation)
- `local`: Fragment exists only in template-web (schema-less, application-specific)

---

## Fragment Organization Hierarchy

```text
┌─────────────────────────────────────────────────────────┐
│ Application Layer (template-web)                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Page-Level Aggregation Fragments                    │ │
│ │ - pageBuilderFragment (aggregates all blocks)       │ │
│ │ - blogCardFragment (UI projection)                  │ │
│ │ - blogAuthorFragment (query composition)            │ │
│ │ - ogFieldsFragment (SEO metadata)                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                          ▲                               │
│                          │ imports                       │
└──────────────────────────┼───────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────┐
│ Block Layer (@walter/sanity-blocks)                      │
│ ┌────────────────────────┴─────────────────────────────┐ │
│ │ Block Fragments (schema-coupled)                     │ │
│ │ - heroSectionFragment                                │ │
│ │ - ctaFragment                                        │ │
│ │ - faqAccordionFragment                               │ │
│ │ - imageLinkCardsFragment                             │ │
│ │ - subscribeNewsletterFragment                        │ │
│ │ - featureCardsIconFragment                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                          ▲                               │
│                          │ imports                       │
└──────────────────────────┼───────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────┐
│ Atom Layer (@walter/sanity-atoms)                        │
│ ┌────────────────────────┴─────────────────────────────┐ │
│ │ Atomic Fragments (schema-coupled & primitives)       │ │
│ │ - imageFragment (schema: image)                      │ │
│ │ - imageFields (primitive)                            │ │
│ │ - buttonsFragment (schema: buttons)                  │ │
│ │ - buttonFragment (schema: button)                    │ │
│ │ - richTextFragment (schema: richText)                │ │
│ │ - customLinkFragment (schema: customLink)            │ │
│ │ - markDefsFragment (schema: markDefs)                │ │
│ │ - customUrlFragment (schema: customUrl)              │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Fragment State Transitions (Migration Process)

### State 1: Before Migration (Current State)

```text
template-web/query.ts:
├── imageFields (duplicate - exact match with sanity-atoms)
├── imageFragment (duplicate - wrapper difference)
├── customLinkFragment (duplicate - hidden in sanity-atoms)
├── markDefsFragment (duplicate - hidden in sanity-atoms)
├── imageLinkCardsBlock (duplicate - different implementation)
├── subscribeNewsletterBlock (duplicate - different implementation)
├── featureCardsIconBlock (duplicate - different implementation)
├── blogAuthorFragment (local - schema-less)
├── blogCardFragment (local - schema-less)
├── ogFieldsFragment (local - schema-less)
└── pageBuilderFragment (local - aggregation)

sanity-blocks/src/:
├── hero-section.fragment.ts → heroSectionFragment (migrated)
├── cta.fragment.ts → ctaBlock (migrated - naming inconsistent)
├── faq-accordion.fragment.ts → faqSectionFragment (migrated)
├── image-link-cards.fragment.ts → imageLinkCardsFragment (outdated)
├── subscribe-newsletter.fragment.ts → subscribeNewsletterFragment (newer)
└── feature-cards-icon.fragment.ts → featureCardsIconFragment (newer)

sanity-atoms/src/:
├── image.fragment.ts → imageFields, imageFragment (migrated)
├── buttons.fragment.ts → buttonsFragment (migrated)
├── button.fragment.ts → buttonFragment (migrated)
├── custom-url.fragment.ts → customUrlFragment (migrated)
└── rich-text.fragment.ts → richTextFragment (migrated)
    └── (hidden) customLinkFragment, markDefsFragment
```

### State 2: After Migration (Target State)

```text
template-web/query.ts:
├── blogAuthorFragment (local - preserved)
├── blogCardFragment (local - preserved)
├── ogFieldsFragment (local - preserved)
├── pageBuilderFragment (local - preserved, updated imports)
└── (imports all fragments from shared packages)

sanity-blocks/src/:
├── hero-section.fragment.ts → heroSectionFragment
├── cta.fragment.ts → ctaFragment (renamed for consistency)
├── faq-accordion.fragment.ts → faqAccordionFragment (renamed to match schema)
├── image-link-cards.fragment.ts → imageLinkCardsFragment (updated to template-web version)
├── subscribe-newsletter.fragment.ts → subscribeNewsletterFragment (kept - already correct)
└── feature-cards-icon.fragment.ts → featureCardsIconFragment (kept - already correct)

sanity-atoms/src/:
├── image.fragment.ts → imageFields, imageFragment
├── buttons.fragment.ts → buttonsFragment
├── button.fragment.ts → buttonFragment
├── custom-url.fragment.ts → customUrlFragment
└── rich-text.fragment.ts → richTextFragment, customLinkFragment (exported), markDefsFragment (exported)
```

---

## Fragment Reconciliation Decision Matrix

| Fragment Name | Current State | Action | Reconciliation Strategy | Rationale |
|--------------|---------------|--------|------------------------|-----------|
| `imageFields` | Duplicate (exact) | Remove from template-web | Use sanity-atoms version | Identical implementations |
| `imageFragment` | Duplicate (wrapper diff) | Remove from template-web, update call sites | Use sanity-atoms version | Equivalent when used correctly |
| `customLinkFragment` | Hidden in sanity-atoms | Export from sanity-atoms | Make public API | Needed by multiple fragments |
| `markDefsFragment` | Hidden in sanity-atoms | Export from sanity-atoms | Make public API | Needed by multiple fragments |
| `imageLinkCardsBlock` | Duplicate (different) | Update sanity-blocks | Use template-web version | More defensive (array::compact, spread operator) |
| `subscribeNewsletterBlock` | Duplicate (different) | Use sanity-blocks | Keep shared package version | More complete (includes image field) |
| `featureCardsIconBlock` | Duplicate (different) | Use sanity-blocks | Keep shared package version | More complete (includes buttons) |
| `blogAuthorFragment` | Local only | No change | Keep in template-web | Application-specific composition |
| `blogCardFragment` | Local only | No change | Keep in template-web | Application-specific UI projection |
| `ogFieldsFragment` | Local only | No change | Keep in template-web | Application-specific SEO metadata |
| `pageBuilderFragment` | Local only | Update imports only | Keep in template-web | Application-specific aggregation |

---

## Fragment Dependency Graph

```text
pageBuilderFragment
├── heroSectionFragment
│   ├── imageFragment
│   │   └── imageFields
│   ├── buttonsFragment
│   │   └── buttonFragment
│   │       └── customUrlFragment
│   └── richTextFragment
│       ├── markDefsFragment
│       │   └── customLinkFragment
│       └── imageFields
├── ctaFragment
│   ├── imageFragment
│   ├── buttonsFragment
│   └── richTextFragment
├── faqAccordionFragment
│   └── richTextFragment
├── imageLinkCardsFragment
│   ├── richTextFragment
│   ├── buttonsFragment
│   ├── imageFragment
│   └── customUrlFragment
├── subscribeNewsletterFragment
│   ├── markDefsFragment
│   └── imageFragment
└── featureCardsIconFragment
    ├── richTextFragment
    └── buttonsFragment

blogCardFragment
├── imageFragment
└── blogAuthorFragment
    └── imageFragment

ogFieldsFragment
└── (direct Sanity image URL transformation - no fragment deps)
```

**Critical Path**: imageFields → imageFragment → [all blocks that use images]
- **Risk**: If imageFragment wrapper changes incorrectly, all blocks break
- **Mitigation**: Audit all call sites for `image { ${imageFragment} }` pattern

---

## Fragment Naming Convention Rules

### Rule 1: Schema-Coupled Fragments

**Pattern**: `[schemaName]Fragment`

**Examples**:
- Schema: `heroSection` → Fragment: `heroSectionFragment` ✅
- Schema: `imageLinkCards` → Fragment: `imageLinkCardsFragment` ✅
- Schema: `button` → Fragment: `buttonFragment` ✅

**Exceptions**:
- Schema: `faqAccordion` → Fragment: `faqSectionFragment` (legacy naming - acceptable)

### Rule 2: Primitive/Helper Fragments

**Pattern**: `[purpose]Fields` or `[purpose]Fragment`

**Examples**:
- `imageFields` (raw GROQ fields for image asset)
- `markDefsFragment` (mark definitions for rich text)
- `customLinkFragment` (custom link spread logic)

### Rule 3: Application-Level Fragments

**Pattern**: `[entity][Purpose]Fragment`

**Examples**:
- `blogAuthorFragment` (blog author composition)
- `blogCardFragment` (blog card projection)
- `pageBuilderFragment` (page builder aggregation)

---

## Migration Validation Rules

### Rule 1: Query Result Equivalence

**Validation**: Snapshot testing for all queries

**Test Cases**:
- `queryHomePageData` with locale "en"
- `querySlugPageData` with slug "about" and locale "en"
- `queryBlogIndexPageData` with locale "en"
- `queryBlogSlugPageData` with slug "example-post" and locale "en"
- `queryNavbarData` with locale "en"
- `queryFooterData` (no locale param)
- `querySettingsData` (no params)
- `queryAllLocalizedPages` with locale "en"

**Pass Criteria**: JSON output must be byte-for-byte identical before and after migration.

### Rule 2: TypeScript Compilation

**Validation**: `pnpm --filter template-web typecheck` passes

**Pass Criteria**: Zero TypeScript errors, all imports resolve correctly.

### Rule 3: Build Success

**Validation**: `pnpm --filter template-web build` passes

**Pass Criteria**: Next.js build completes without errors.

### Rule 4: Fragment Export Verification

**Validation**: All migrated fragments are importable from shared packages

**Test Script**:
```typescript
// Verify all fragments are accessible
import { heroSectionFragment } from "@walter/sanity-blocks/fragments/hero-section";
import { ctaFragment } from "@walter/sanity-blocks/fragments/cta";
import { imageLinkCardsFragment } from "@walter/sanity-blocks/fragments/image-link-cards";
import { customLinkFragment, markDefsFragment } from "@walter/sanity-atoms/fragments/rich-text";
// ... etc
```

**Pass Criteria**: All imports succeed without TypeScript errors.

---

## Rollback Plan

If migration causes production issues:

### Step 1: Identify Issue

Check for:
- Missing data fields in API responses
- TypeScript compilation errors
- Query execution failures
- Visual rendering differences

### Step 2: Immediate Mitigation

**Option A**: Revert Git commit (if no schema changes)
```bash
git revert <migration-commit-hash>
git push origin 010-migrate-web-fragments
```

**Option B**: Hotfix (if partial revert needed)
1. Restore local fragment definitions in template-web/query.ts
2. Remove imports from shared packages
3. Deploy hotfix

### Step 3: Root Cause Analysis

Compare:
- Query results before/after migration (snapshot diff)
- Fragment implementations (GROQ logic diff)
- Import paths (verify correct fragment imported)

### Step 4: Corrective Action

- Update shared package fragment to match expected behavior
- Fix import paths if incorrect fragment was imported
- Update call sites if wrapper pattern was incorrect

---

## Summary

This data model defines the fragment organization structure, state transitions, reconciliation decisions, and validation rules for the migration. Key points:

1. **Three-layer hierarchy**: Atoms → Blocks → Application
2. **11 fragments total**: 7 duplicates to resolve, 4 local to preserve
3. **Reconciliation strategy**: Template-web as source of truth, prefer complete implementations
4. **Validation**: Snapshot testing for query equivalence, TypeScript for correctness
5. **Risk mitigation**: Explicit dependency graph, clear rollback plan

No data schemas are modified - this is purely a code organization refactor.
