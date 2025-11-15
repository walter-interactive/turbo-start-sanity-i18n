# Quickstart: Migrate Web Query Fragments to Shared Packages

**Date**: 2025-11-14
**Feature**: 010-migrate-web-fragments
**Audience**: Developers implementing or reviewing this migration

## Overview

This guide walks through the complete migration process for moving query fragments from `apps/template-web` to shared packages (`@workspace/sanity-blocks` and `@workspace/sanity-atoms`).

**Time Estimate**: 2-3 hours (includes testing and verification)

**Prerequisites**:
- Node.js 20+ installed
- Repository cloned and dependencies installed (`pnpm install`)
- Familiarity with GROQ query syntax and Turborepo monorepo structure

---

## Quick Reference

### Fragment Migration Checklist

- [ ] **Phase 1**: Create baseline snapshots (pre-migration) - **DEFERRED** (see backlog.md)
- [ ] **Phase 2**: Update shared package fragments (reconcile duplicates)
- [ ] **Phase 3**: Export hidden fragments from sanity-atoms
- [ ] **Phase 4**: Update template-web imports
- [ ] **Phase 5**: Remove local fragment definitions from template-web
- [ ] **Phase 6**: Verify snapshots match baseline - **DEFERRED** (see backlog.md)
- [ ] **Phase 7**: Run type-check and build (REQUIRED)
- [ ] **Phase 8**: Update documentation (CLAUDE.md)

---

## Phase 1: Create Baseline Snapshots

> **⚠️ PHASE DEFERRED**: Snapshot testing has been moved to backlog (see `specs/backlog.md`). This phase is documented for future reference but **not required** for the current migration. Skip to Phase 2 for actual implementation.
>
> **Rationale**: Early development phase, no production data at risk, limited time. Manual QA + TypeScript compilation provide sufficient verification for now.

### Step 1.1: Run Sanity Studio Dev Server

```bash
# Terminal 1: Start Sanity Studio (needed for content access)
cd apps/template-studio
pnpm dev
# Wait for "Compiled successfully" message
```

### Step 1.2: Run Template-Web Dev Server

```bash
# Terminal 2: Start Next.js (needed for query execution)
cd apps/template-web
pnpm dev --turbopack
# Wait for "Ready in [time]" message
```

### Step 1.3: Create Snapshot Test File

Create `apps/template-web/scripts/snapshot-queries.ts`:

```typescript
import { sanityFetch } from "@/lib/sanity/client";
import {
  queryHomePageData,
  querySlugPageData,
  queryBlogIndexPageData,
  queryBlogSlugPageData,
  queryNavbarData,
  queryFooterData,
  querySettingsData,
  queryAllLocalizedPages,
} from "@/lib/sanity/query";
import { writeFileSync } from "fs";
import { resolve } from "path";

const SNAPSHOT_DIR = resolve(__dirname, "../snapshots");

async function captureSnapshots() {
  console.log("📸 Capturing query snapshots...");

  const snapshots = {
    homePage: await sanityFetch({
      query: queryHomePageData,
      params: { locale: "en" },
    }),
    slugPage: await sanityFetch({
      query: querySlugPageData,
      params: { slug: "about", locale: "en" },
    }),
    blogIndex: await sanityFetch({
      query: queryBlogIndexPageData,
      params: { locale: "en" },
    }),
    blogSlug: await sanityFetch({
      query: queryBlogSlugPageData,
      params: { slug: "example-post", locale: "en" },
    }),
    navbar: await sanityFetch({
      query: queryNavbarData,
      params: { locale: "en" },
    }),
    footer: await sanityFetch({
      query: queryFooterData,
      params: {},
    }),
    settings: await sanityFetch({
      query: querySettingsData,
      params: {},
    }),
    allLocalizedPages: await sanityFetch({
      query: queryAllLocalizedPages,
      params: { locale: "en" },
    }),
  };

  writeFileSync(
    `${SNAPSHOT_DIR}/baseline.json`,
    JSON.stringify(snapshots, null, 2)
  );

  console.log("✅ Baseline snapshots saved to snapshots/baseline.json");
}

captureSnapshots().catch(console.error);
```

### Step 1.4: Run Snapshot Script

```bash
# Create snapshots directory
mkdir -p apps/template-web/snapshots

# Run snapshot script
cd apps/template-web
npx tsx scripts/snapshot-queries.ts
```

**Expected Output**:
```
📸 Capturing query snapshots...
✅ Baseline snapshots saved to snapshots/baseline.json
```

**Verify**: Check that `apps/template-web/snapshots/baseline.json` exists and contains query results.

---

## Phase 2: Update Shared Package Fragments

### Step 2.1: Update imageLinkCardsFragment

**File**: `packages/sanity-blocks/src/image-link-cards.fragment.ts`

**Current**:
```typescript
export const imageLinkCardsFragment = /* groq */ `
  _type == "imageLinkCards" => {
    eyebrow,
    title,
    ${richTextFragment},
    ${buttonsFragment},
    "cards": cards[]{
      title,
      description,
      "image": image {
        ${imageFragment}
      },
      ${customUrlFragment}
    }
  }
`;
```

**Update to** (template-web version - more defensive):
```typescript
import { imageFragment } from "@workspace/sanity-atoms/fragments/image";
import { buttonsFragment } from "@workspace/sanity-atoms/fragments/buttons";
import { richTextFragment } from "@workspace/sanity-atoms/fragments/rich-text";

export const imageLinkCardsFragment = /* groq */ `
  _type == "imageLinkCards" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
    "cards": array::compact(cards[]{
      ...,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => url.internal->slug.current,
        url.type == "external" => url.external,
        url.href
      ),
      "internalType": select(
        url.type == "internal" => url.internal->_type,
        null
      ),
      "image": image {
        ${imageFragment}
      }
    })
  }
`;
```

**Why**: Template-web version uses spread operator (`...`) and `array::compact()` for better forward compatibility.

### Step 2.2: Rename ctaBlock → ctaFragment

**File**: `packages/sanity-blocks/src/cta.fragment.ts`

**Before**:
```typescript
export const ctaBlock = /* groq */ `...`;
```

**After**:
```typescript
export const ctaFragment = /* groq */ `...`;
```

**Reason**: Standardize naming convention to `[schemaName]Fragment`.

---

## Phase 3: Export Hidden Fragments

### Step 3.1: Update rich-text.fragment.ts

**File**: `packages/sanity-atoms/src/rich-text.fragment.ts`

**Before**:
```typescript
const customLinkFragment = /* groq */ `...`;  // Hidden (not exported)
const markDefsFragment = /* groq */ `...`;    // Hidden (not exported)
export const richTextFragment = /* groq */ `...`;
```

**After**:
```typescript
export const customLinkFragment = /* groq */ `
  ...customLink{
    openInNewTab,
    "href": select(
      type == "internal" => internal->slug.current,
      type == "external" => external,
      "#"
    ),
    "internalType": select(
      type == "internal" => internal->_type,
      null
    ),
  }
`;

export const markDefsFragment = /* groq */ `
  markDefs[]{
    ...,
    ${customLinkFragment}
  }
`;

export const richTextFragment = /* groq */ `
  richText[]{
    ...,
    _type == "block" => {
      ...,
      ${markDefsFragment}
    },
    _type == "image" => {
      ${imageFields},
      "caption": caption
    }
  }
`;
```

**Why**: These fragments are needed by other packages and should be part of the public API.

---

## Phase 4: Update template-web Imports

### Step 4.1: Update query.ts Imports

**File**: `apps/template-web/src/lib/sanity/query.ts`

**Before**:
```typescript
import { heroSectionFragment } from "@workspace/sanity-blocks/fragments/hero-section";
import { ctaBlock } from "@workspace/sanity-blocks/fragments/cta";
import { faqSectionFragment } from "@workspace/sanity-blocks/fragments/faq-accordion";
import { buttonsFragment } from "@workspace/sanity-atoms/fragments/buttons";
import { richTextFragment } from "@workspace/sanity-atoms/fragments/rich-text";

// Local fragments defined below...
```

**After**:
```typescript
import { heroSectionFragment } from "@workspace/sanity-blocks/fragments/hero-section";
import { ctaFragment } from "@workspace/sanity-blocks/fragments/cta";  // ← renamed
import { faqAccordionFragment } from "@workspace/sanity-blocks/fragments/faq-accordion";
import { imageLinkCardsFragment } from "@workspace/sanity-blocks/fragments/image-link-cards";  // ← NEW
import { subscribeNewsletterFragment } from "@workspace/sanity-blocks/fragments/subscribe-newsletter";  // ← NEW
import { featureCardsIconFragment } from "@workspace/sanity-blocks/fragments/feature-cards-icon";  // ← NEW

import { imageFields, imageFragment } from "@workspace/sanity-atoms/fragments/image";
import { buttonsFragment } from "@workspace/sanity-atoms/fragments/buttons";
import { richTextFragment, customLinkFragment, markDefsFragment } from "@workspace/sanity-atoms/fragments/rich-text";  // ← Added customLinkFragment, markDefsFragment

import { translationsFragment } from "./i18n";
```

---

## Phase 5: Remove Local Fragment Definitions

### Step 5.1: Remove Duplicate Fragments

**File**: `apps/template-web/src/lib/sanity/query.ts`

**Remove these local definitions** (lines 12-124):
```typescript
// DELETE: imageFields (line 12-25)
export const imageFields = /* groq */ `...`;

// DELETE: imageFragment (line 28-32)
export const imageFragment = /* groq */ `...`;

// DELETE: customLinkFragment (line 35-48)
const customLinkFragment = /* groq */ `...`;

// DELETE: markDefsFragment (line 50-55)
const markDefsFragment = /* groq */ `...`;

// DELETE: imageLinkCardsBlock (line 79-99)
const imageLinkCardsBlock = /* groq */ `...`;

// DELETE: subscribeNewsletterBlock (line 101-113)
const subscribeNewsletterBlock = /* groq */ `...`;

// DELETE: featureCardsIconBlock (line 115-124)
const featureCardsIconBlock = /* groq */ `...`;
```

**Keep these local definitions** (schema-less, application-specific):
```typescript
const blogAuthorFragment = /* groq */ `...`;  // Keep
const blogCardFragment = /* groq */ `...`;    // Keep
const ogFieldsFragment = /* groq */ `...`;    // Keep
const pageBuilderFragment = /* groq */ `...`; // Keep (update references below)
```

### Step 5.2: Update pageBuilderFragment References

**File**: `apps/template-web/src/lib/sanity/query.ts`

**Before**:
```typescript
const pageBuilderFragment = /* groq */ `
  pageBuilder[]{
    ...,
    _type,
    ${ctaBlock},                      // ← Old name
    ${heroSectionFragment},
    ${faqSectionFragment},            // ← Old name
    ${featureCardsIconBlock},         // ← Local definition
    ${subscribeNewsletterBlock},      // ← Local definition
    ${imageLinkCardsBlock}            // ← Local definition
  }
`;
```

**After**:
```typescript
const pageBuilderFragment = /* groq */ `
  pageBuilder[]{
    ...,
    _type,
    ${ctaFragment},                   // ← Updated name
    ${heroSectionFragment},
    ${faqAccordionFragment},          // ← Updated name
    ${featureCardsIconFragment},      // ← Shared package import
    ${subscribeNewsletterFragment},   // ← Shared package import
    ${imageLinkCardsFragment}         // ← Shared package import
  }
`;
```

---

## Phase 6: Verify Snapshots Match Baseline

> **⚠️ PHASE DEFERRED**: This phase requires Phase 1 (baseline snapshots), which has been deferred to backlog. Skip this phase for now. Instead, rely on:
> - **TypeScript compilation** (Phase 7) - catches import/type errors
> - **Manual QA** - visually verify pages render correctly in dev server
> - **Build success** (Phase 7) - confirms Next.js can bundle the code

### Step 6.1: Re-run Snapshot Script

```bash
# Restart dev server to pick up changes
cd apps/template-web
pnpm dev --turbopack
# Wait for "Ready" message

# Run snapshot script again (this time it will create post-migration snapshot)
npx tsx scripts/snapshot-queries.ts
```

### Step 6.2: Compare Snapshots

Update `scripts/snapshot-queries.ts` to compare:

```typescript
import { readFileSync } from "fs";

// ... (capture snapshots code from before)

async function compareSnapshots() {
  const baseline = JSON.parse(
    readFileSync(`${SNAPSHOT_DIR}/baseline.json`, "utf-8")
  );
  const current = JSON.parse(
    readFileSync(`${SNAPSHOT_DIR}/current.json`, "utf-8")
  );

  const baselineStr = JSON.stringify(baseline, null, 2);
  const currentStr = JSON.stringify(current, null, 2);

  if (baselineStr === currentStr) {
    console.log("✅ Snapshots match! Migration successful.");
    process.exit(0);
  } else {
    console.error("❌ Snapshots differ! Check differences:");
    console.error("Baseline length:", baselineStr.length);
    console.error("Current length:", currentStr.length);
    process.exit(1);
  }
}

// Update captureSnapshots to save as current.json
// Then run compareSnapshots()
```

**Expected Output**:
```
✅ Snapshots match! Migration successful.
```

---

## Phase 7: Type-Check and Build

### Step 7.1: Type-Check All Workspaces

```bash
# From repo root
pnpm check-types
```

**Expected**: All type checks pass.

### Step 7.2: Build Template-Web

```bash
pnpm --filter template-web build
```

**Expected**: Build succeeds without errors.

### Step 7.3: Build All Workspaces

```bash
# From repo root
pnpm build
```

**Expected**: All workspace builds succeed.

---

## Phase 8: Update Documentation

### Step 8.1: Update CLAUDE.md

**File**: `CLAUDE.md`

**Add to "Recent Changes" section**:

```markdown
## Recent Changes
- 010-migrate-web-fragments: Migrated query fragments from template-web to shared packages (@workspace/sanity-blocks, @workspace/sanity-atoms). All schema-coupled fragments now co-located with schemas. Exposed previously hidden fragments (customLinkFragment, markDefsFragment) as public API.
```

### Step 8.2: Create Completion Notes

**File**: `specs/010-migrate-web-fragments/completion-notes.md`

```markdown
# Completion Notes: 010-migrate-web-fragments

**Date**: 2025-11-14
**Status**: ✅ Complete

## Summary

Successfully migrated all query fragments from template-web to shared packages. Zero functional changes confirmed through snapshot testing.

## Metrics

- **Fragments migrated**: 7 (imageLinkCardsBlock, subscribeNewsletterBlock, featureCardsIconBlock, customLinkFragment, markDefsFragment, imageFields, imageFragment)
- **Fragments preserved in template-web**: 4 (blogAuthorFragment, blogCardFragment, ogFieldsFragment, pageBuilderFragment)
- **Fragments renamed for consistency**: 2 (ctaBlock → ctaFragment, faqSectionFragment → faqAccordionFragment)
- **Hidden fragments exposed**: 2 (customLinkFragment, markDefsFragment)
- **Snapshot test pass rate**: 100% (8/8 queries identical)

## Verification

✅ Type-check passed: `pnpm check-types`
✅ Build passed: `pnpm build`
✅ Snapshot tests passed: All 8 queries identical
✅ Documentation updated: CLAUDE.md, quickstart.md
```

---

## Troubleshooting

### Issue: TypeScript Import Errors

**Symptom**: `Cannot find module '@workspace/sanity-blocks/fragments/...'`

**Solution**:
1. Verify package.json exports field includes `"./fragments/*": "./src/*.fragment.ts"`
2. Restart TypeScript server in IDE (VS Code: Cmd+Shift+P → "Restart TS Server")
3. Clear Turborepo cache: `pnpm turbo clean`

### Issue: Snapshot Mismatch

**Symptom**: `❌ Snapshots differ!`

**Solution**:
1. Compare baseline.json and current.json manually
2. Check for missing/extra fields in fragment definitions
3. Verify fragment composition (imports are correct)
4. Check for `imageFragment` wrapper issues (`image { ${imageFragment} }` vs `${imageFragment}`)

### Issue: Build Fails

**Symptom**: `Error: Cannot find module ...` during build

**Solution**:
1. Clear Next.js cache: `rm -rf apps/template-web/.next`
2. Reinstall dependencies: `pnpm install`
3. Verify all imports are correct in query.ts

---

## Post-Migration Checklist

After completing all phases:

- [ ] ~~All snapshot tests pass (8/8 queries identical)~~ - **DEFERRED** (see backlog.md)
- [ ] Type-check passes (`pnpm check-types`) - **REQUIRED**
- [ ] Build passes (`pnpm build`) - **REQUIRED**
- [ ] Dev server starts without errors - **REQUIRED**
- [ ] Manual QA: Visit homepage, blog post, settings pages - visually verify rendering - **RECOMMENDED**
- [ ] Documentation updated (CLAUDE.md, completion-notes.md) - **REQUIRED**
- [ ] No local fragment duplicates remain in template-web/query.ts - **REQUIRED**
- [ ] Hidden fragments are now exported from sanity-atoms - **REQUIRED**
- [ ] Fragment naming is consistent ([schemaName]Fragment) - **REQUIRED**

---

## Next Steps

1. **Create Pull Request**: Follow PR template, include snapshot test results
2. **Review**: Request review from team member familiar with GROQ/Sanity
3. **Deploy**: Merge to main branch, deploy to staging for visual QA
4. **Monitor**: Watch for any query performance issues or missing data fields

---

## Reference

- **Spec**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Contracts**: [contracts/README.md](./contracts/README.md)
- **Original Feature (Schema Migration)**: `specs/007-colocate-pagebuilder-modules/quickstart.md`

---

## Time Estimate Breakdown

| Phase | Time | Status |
|-------|------|--------|
| Phase 1: Create baseline snapshots | ~~15 min~~ | **DEFERRED** |
| Phase 2: Update shared package fragments | 20 min | Required |
| Phase 3: Export hidden fragments | 10 min | Required |
| Phase 4: Update template-web imports | 10 min | Required |
| Phase 5: Remove local definitions | 15 min | Required |
| Phase 6: Verify snapshots | ~~15 min~~ | **DEFERRED** |
| Phase 7: Type-check and build | 20 min | Required |
| Phase 8: Update documentation | 15 min | Required |
| **Total (with deferred phases)** | **~1.5 hours** | |
| **Total (if implementing snapshots later)** | **~2 hours** | |

*(Add 30-60 min buffer for troubleshooting if needed)*

**Note**: Snapshot testing (Phases 1 & 6) deferred to backlog. Current migration relies on TypeScript compilation, build success, and manual QA for verification.
