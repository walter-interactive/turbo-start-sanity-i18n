# Research: Migrate Web Query Fragments to Shared Packages

**Date**: 2025-11-14
**Feature**: 010-migrate-web-fragments
**Status**: Complete

## Executive Summary

This research identifies all fragment duplicates, analyzes implementation differences, and provides reconciliation strategies. Key findings:

1. **3 block fragments have duplicates** with different implementations (imageLinkCardsBlock, subscribeNewsletterBlock, featureCardsIconBlock)
2. **2 atomic fragments are hidden** in rich-text.fragment.ts and should be exported publicly (customLinkFragment, markDefsFragment)
3. **1 schema-less fragment** exists in template-web (blogAuthorFragment, blogCardFragment) - decision needed on migration
4. **Fragment composition patterns** are well-established and should be preserved

## Research Tasks

### Task 1: Identify All Fragment Duplicates

**Research Question**: Which fragments exist in both template-web and shared packages?

**Findings**:

| Fragment Name | template-web Location | Shared Package Location | Duplicate? |
|---------------|----------------------|-------------------------|------------|
| `imageFields` | query.ts:12-25 | sanity-atoms/image.fragment.ts | ✅ YES |
| `imageFragment` | query.ts:28-32 | sanity-atoms/image.fragment.ts | ✅ YES |
| `customLinkFragment` | query.ts:35-48 | sanity-atoms/rich-text.fragment.ts:3-16 (hidden) | ✅ YES |
| `markDefsFragment` | query.ts:50-55 | sanity-atoms/rich-text.fragment.ts:18-23 (hidden) | ✅ YES |
| `heroSectionFragment` | ❌ Not in template-web | sanity-blocks/hero-section.fragment.ts | ❌ NO |
| `ctaBlock` | ❌ Not in template-web | sanity-blocks/cta.fragment.ts | ❌ NO |
| `faqSectionFragment` | ❌ Not in template-web | sanity-blocks/faq-accordion.fragment.ts | ❌ NO |
| `imageLinkCardsBlock` | query.ts:79-99 | sanity-blocks/image-link-cards.fragment.ts | ✅ YES (different) |
| `subscribeNewsletterBlock` | query.ts:101-113 | sanity-blocks/subscribe-newsletter.fragment.ts | ✅ YES (different) |
| `featureCardsIconBlock` | query.ts:115-124 | sanity-blocks/feature-cards-icon.fragment.ts | ✅ YES (different) |
| `blogAuthorFragment` | query.ts:57-64 | ❌ Not in shared packages | ❌ NO |
| `blogCardFragment` | query.ts:66-76 | ❌ Not in shared packages | ❌ NO |
| `ogFieldsFragment` | query.ts:219-237 | ❌ Not in shared packages | ❌ NO |

**Total Duplicates**: 7 fragments
- **4 exact duplicates**: imageFields, imageFragment, customLinkFragment, markDefsFragment
- **3 different implementations**: imageLinkCardsBlock, subscribeNewsletterBlock, featureCardsIconBlock

### Task 2: Analyze Implementation Differences for Duplicate Fragments

**Research Question**: What are the differences between template-web and shared package implementations?

#### 2.1 imageFields (Exact Match)

**template-web** (query.ts:12-25):
```groq
export const imageFields = /* groq */ `
  "id": asset._ref,
  "preview": asset->metadata.lqip,
  hotspot {
    x,
    y
  },
  crop {
    bottom,
    left,
    right,
    top
  }
`;
```

**sanity-atoms** (image.fragment.ts):
```groq
export const imageFields = /* groq */ `
  "id": asset._ref,
  "preview": asset->metadata.lqip,
  hotspot {
    x,
    y
  },
  crop {
    bottom,
    left,
    right,
    top
  }
`;
```

**Verdict**: ✅ **Identical** - Safe to use shared package version

---

#### 2.2 imageFragment (Exact Match)

**template-web** (query.ts:28-32):
```groq
export const imageFragment = /* groq */ `
  image {
    ${imageFields}
  }
`;
```

**sanity-atoms** (image.fragment.ts):
```groq
export const imageFragment = /* groq */ `
  ${imageFields}
`;
```

**Verdict**: ⚠️ **Different wrapper** - template-web wraps in `image { }`, shared package does not.

**Impact Analysis**:
- template-web uses: `${imageFragment}` → Results in `image { imageFields }`
- shared package uses: `image { ${imageFragment} }` → Results in `image { imageFields }`
- **Both patterns are equivalent** when used correctly at call site

**Reconciliation Strategy**: Use shared package version, update template-web call sites to wrap in `image { }` where needed.

---

#### 2.3 customLinkFragment (Hidden in rich-text.fragment.ts)

**template-web** (query.ts:35-48):
```groq
const customLinkFragment = /* groq */ `
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
```

**sanity-atoms** (rich-text.fragment.ts:3-16):
```groq
const customLinkFragment = /* groq */ `
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
```

**Verdict**: ✅ **Identical** but hidden (not exported)

**Reconciliation Strategy**: Export from sanity-atoms/rich-text.fragment.ts, remove from template-web.

---

#### 2.4 markDefsFragment (Hidden in rich-text.fragment.ts)

**template-web** (query.ts:50-55):
```groq
const markDefsFragment = /* groq */ `
  markDefs[]{
    ...,
    ${customLinkFragment}
  }
`;
```

**sanity-atoms** (rich-text.fragment.ts:18-23):
```groq
const markDefsFragment = /* groq */ `
  markDefs[]{
    ...,
    ${customLinkFragment}
  }
`;
```

**Verdict**: ✅ **Identical** but hidden (not exported)

**Reconciliation Strategy**: Export from sanity-atoms/rich-text.fragment.ts, remove from template-web.

---

#### 2.5 imageLinkCardsBlock (Different Implementations)

**template-web** (query.ts:79-99):
```groq
const imageLinkCardsBlock = /* groq */ `
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
      ${imageFragment},
    })
  }
`;
```

**sanity-blocks** (image-link-cards.fragment.ts:6-21):
```groq
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

**Key Differences**:
1. **Spread operator**: template-web uses `...` to include all fields, shared package is explicit (eyebrow, title)
2. **Array compact**: template-web uses `array::compact(cards[]{...})`, shared package uses `cards[]{...}`
3. **Card fields**: template-web inlines URL logic, shared package uses `${customUrlFragment}`
4. **Image wrapper**: template-web uses `${imageFragment}` (with wrapper), shared package uses `image { ${imageFragment} }`

**Impact**: Template-web version is more defensive (compact removes null entries) and uses spread for forward compatibility.

**Reconciliation Strategy**: **Use template-web version** as authoritative, update shared package to match.

---

#### 2.6 subscribeNewsletterBlock (Different Implementations)

**template-web** (query.ts:101-113):
```groq
const subscribeNewsletterBlock = /* groq */ `
  _type == "subscribeNewsletter" => {
    ...,
    "subTitle": subTitle[]{
      ...,
      ${markDefsFragment}
    },
    "helperText": helperText[]{
      ...,
      ${markDefsFragment}
    }
  }
`;
```

**sanity-blocks** (subscribe-newsletter.fragment.ts):
```groq
export const subscribeNewsletterFragment = /* groq */ `
  _type == "subscribeNewsletter" => {
    _key,
    _type,
    eyebrow,
    title,
    "subTitle": subTitle[]{
      ...,
      ${markDefsFragment}
    },
    placeholder,
    buttonText,
    "helperText": helperText[]{
      ...,
      ${markDefsFragment}
    },
    ${imageFragment}
  }
`;
```

**Key Differences**:
1. **Spread operator**: template-web uses `...` at top level, shared package is explicit (eyebrow, title, placeholder, buttonText, etc.)
2. **Image field**: shared package includes `${imageFragment}`, template-web does not

**Impact**: Shared package version is more comprehensive (includes image field). Template-web version may be older or intentionally minimal.

**Reconciliation Strategy**: **Use shared package version** as authoritative (more complete). Verify template-web doesn't rely on image field absence.

---

#### 2.7 featureCardsIconBlock (Different Implementations)

**template-web** (query.ts:115-124):
```groq
const featureCardsIconBlock = /* groq */ `
  _type == "featureCardsIcon" => {
    ...,
    ${richTextFragment},
    "cards": array::compact(cards[]{
      ...,
      ${richTextFragment},
    })
  }
`;
```

**sanity-blocks** (feature-cards-icon.fragment.ts):
```groq
export const featureCardsIconFragment = /* groq */ `
  _type == "featureCardsIcon" => {
    _key,
    _type,
    eyebrow,
    title,
    ${richTextFragment},
    ${buttonsFragment},
    "cards": cards[]{
      icon,
      title,
      ${richTextFragment}
    }
  }
`;
```

**Key Differences**:
1. **Spread operator**: template-web uses `...` at both levels, shared package is explicit
2. **Array compact**: template-web uses `array::compact(cards[]{...})`, shared package uses `cards[]{...}`
3. **Buttons field**: shared package includes `${buttonsFragment}`, template-web does not

**Impact**: Shared package version is more comprehensive (includes buttons). Template-web version may be older.

**Reconciliation Strategy**: **Use shared package version** as authoritative (more complete). Verify template-web doesn't rely on buttons field absence.

---

### Task 3: Schema-less Fragments (template-web only)

**Research Question**: Should fragments without corresponding schemas be migrated to shared packages?

**Findings**:

#### 3.1 blogAuthorFragment
```groq
const blogAuthorFragment = /* groq */ `
  authors[0]->{
    _id,
    name,
    position,
    ${imageFragment}
  }
`;
```

**Analysis**: This is a **query-level composition** (fetches first author reference). Not tied to a specific schema - it's a reusable query pattern.

**Decision**: Keep in template-web (query.ts) - this is application-specific query logic, not a schema-coupled fragment.

---

#### 3.2 blogCardFragment
```groq
const blogCardFragment = /* groq */ `
  _type,
  _id,
  title,
  description,
  "slug":slug.current,
  orderRank,
  ${imageFragment},
  publishedAt,
  ${blogAuthorFragment}
`;
```

**Analysis**: This is a **projection pattern** for blog list views. It's application UI logic (what fields to show in blog cards).

**Decision**: Keep in template-web (query.ts) - this is application-specific UI projection, not a schema-coupled fragment.

---

#### 3.3 ogFieldsFragment
```groq
const ogFieldsFragment = /* groq */ `
  _id,
  _type,
  "title": select(...),
  "description": select(...),
  "image": image.asset->url + "?w=566&h=566&dpr=2&fit=max",
  ...
`;
```

**Analysis**: This is an **OpenGraph metadata projection** pattern. Application-specific SEO logic with image URL transformations.

**Decision**: Keep in template-web (query.ts) - this is application-specific metadata logic, not a schema-coupled fragment.

---

### Task 4: Fragment Export Best Practices

**Research Question**: How should shared packages export fragments for discoverability?

**Current State** (sanity-blocks/package.json):
```json
"exports": {
  "./schemas/*": "./src/*.schema.ts",
  "./fragments/*": "./src/*.fragment.ts"
}
```

**Usage Pattern** (template-web/query.ts:3-8):
```typescript
import { heroSectionFragment } from "@workspace/sanity-blocks/fragments/hero-section";
import { ctaBlock } from "@workspace/sanity-blocks/fragments/cta";
import { faqSectionFragment } from "@workspace/sanity-blocks/fragments/faq-accordion";
import { buttonsFragment } from "@workspace/sanity-atoms/fragments/buttons";
import { richTextFragment } from "@workspace/sanity-atoms/fragments/rich-text";
```

**Analysis**:
- ✅ Package.json wildcard exports work well
- ✅ Import paths are clear and explicit
- ❌ No barrel export (index.ts) for convenience imports
- ❌ Fragment naming inconsistency: `heroSectionFragment` vs `ctaBlock` vs `faqSectionFragment`

**Best Practice Recommendations**:
1. **Naming Convention**: All fragment exports should use `[name]Fragment` suffix (e.g., `ctaFragment`, not `ctaBlock`)
2. **Hidden Fragments**: Export `customLinkFragment` and `markDefsFragment` from sanity-atoms/rich-text.fragment.ts
3. **Optional Barrel Export**: Consider adding `packages/sanity-atoms/fragments.ts` for convenience (not required, but nice-to-have)

---

### Task 5: Fragment Composition Patterns

**Research Question**: What are the established fragment composition patterns to preserve?

**Findings**:

#### Pattern 1: Atomic Fragment Composition
```groq
// rich-text.fragment.ts composes customLink + markDefs + image
export const richTextFragment = /* groq */ `
  richText[]{
    ...,
    _type == "block" => {
      ...,
      ${markDefsFragment}  // ← Composed fragment
    },
    _type == "image" => {
      ${imageFields},      // ← Composed fragment
      "caption": caption
    }
  }
`;
```

**Pattern**: Atomic fragments compose other atomic fragments.

---

#### Pattern 2: Block Fragment Composition
```groq
// image-link-cards.fragment.ts composes multiple atomic fragments
export const imageLinkCardsFragment = /* groq */ `
  _type == "imageLinkCards" => {
    ${richTextFragment},    // ← Atomic fragment
    ${buttonsFragment},     // ← Atomic fragment
    "cards": cards[]{
      ${customUrlFragment}, // ← Atomic fragment
      ${imageFragment}      // ← Atomic fragment
    }
  }
`;
```

**Pattern**: Block fragments compose multiple atomic fragments.

---

#### Pattern 3: Page-Level Aggregation
```groq
// query.ts pageBuilderFragment aggregates all blocks
const pageBuilderFragment = /* groq */ `
  pageBuilder[]{
    ...,
    _type,
    ${ctaBlock},
    ${heroSectionFragment},
    ${faqSectionFragment},
    ${featureCardsIconBlock},
    ${subscribeNewsletterBlock},
    ${imageLinkCardsBlock}
  }
`;
```

**Pattern**: Application-level fragments aggregate all block fragments.

---

**Preservation Strategy**:
- ✅ Maintain import chains (blocks → atoms, queries → blocks)
- ✅ Update import paths but preserve composition structure
- ✅ Keep pageBuilderFragment in template-web (application-specific aggregation)

---

## Reconciliation Summary

### Fragments to Migrate

| Fragment | Action | Target Location | Notes |
|----------|--------|----------------|-------|
| `imageFields` | Remove from template-web | ✅ Already in sanity-atoms | Exact match |
| `imageFragment` | Remove from template-web | ✅ Already in sanity-atoms | Handle wrapper difference at call site |
| `customLinkFragment` | Export from sanity-atoms | sanity-atoms/rich-text.fragment.ts | Currently hidden |
| `markDefsFragment` | Export from sanity-atoms | sanity-atoms/rich-text.fragment.ts | Currently hidden |
| `imageLinkCardsBlock` | Update shared package | sanity-blocks/image-link-cards.fragment.ts | Use template-web version (more defensive) |
| `subscribeNewsletterBlock` | Use shared package version | ✅ Already in sanity-blocks | Shared version more complete |
| `featureCardsIconBlock` | Use shared package version | ✅ Already in sanity-blocks | Shared version more complete |

### Fragments to Keep in template-web

| Fragment | Reason |
|----------|--------|
| `blogAuthorFragment` | Application-specific query composition |
| `blogCardFragment` | Application-specific UI projection |
| `ogFieldsFragment` | Application-specific SEO metadata |
| `pageBuilderFragment` | Application-specific block aggregation |

### Import Path Updates Required

All fragment imports in template-web/query.ts must change from local to shared package imports:

```typescript
// BEFORE
const imageLinkCardsBlock = /* groq */ `...`;

// AFTER
import { imageLinkCardsFragment } from "@workspace/sanity-blocks/fragments/image-link-cards";
```

---

## Technology Recommendations

### Snapshot Testing Approach

> **NOTE**: Snapshot testing has been **deferred to backlog** (see `specs/backlog.md` - "010-migrate-web-fragments - Snapshot Testing"). For this migration, manual QA and TypeScript compilation provide sufficient verification. The approach below is documented for future implementation.

**Tool**: Vitest with snapshots (or manual JSON comparison)

**Test Strategy**:
1. Create baseline snapshots BEFORE migration for all queries:
   - queryHomePageData
   - querySlugPageData
   - queryBlogIndexPageData
   - queryBlogSlugPageData
   - queryNavbarData
   - queryFooterData
   - querySettingsData
   - queryAllLocalizedPages
2. Run migration
3. Compare new query results against baseline snapshots
4. Verify byte-for-byte identical results

**Implementation**:
```typescript
// tests/snapshot/query-snapshots.test.ts
import { sanityFetch } from '@/lib/sanity/client';
import { queryHomePageData } from '@/lib/sanity/query';

describe('Query Result Snapshots', () => {
  it('queryHomePageData returns identical results', async () => {
    const result = await sanityFetch({
      query: queryHomePageData,
      params: { locale: 'en' }
    });
    expect(result).toMatchSnapshot();
  });
  // ... repeat for all queries
});
```

### Fragment Naming Convention

**Standard**: `[schemaName]Fragment` for schema-coupled fragments

**Examples**:
- ✅ `heroSectionFragment` (matches heroSection schema)
- ✅ `imageLinkCardsFragment` (matches imageLinkCards schema)
- ✅ `richTextFragment` (matches richText schema)
- ❌ `ctaBlock` (should be `ctaFragment`)
- ❌ `faqSectionFragment` (schema is faqAccordion - should align or stay as-is if intentional)

**Recommendation**: Standardize on `Fragment` suffix, align with schema names where possible.

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Query result mismatch after migration | High (production bug) | Medium | Comprehensive snapshot testing before merge |
| Import path errors breaking build | High (build failure) | Low | TypeScript compilation enforces valid imports |
| Fragment reconciliation chooses wrong version | Medium (missing data) | Low | Manual review of implementation differences, template-web as source of truth |
| Hidden fragments not exported properly | Low (import error) | Low | TypeScript compilation catches missing exports |
| Image fragment wrapper mismatch | Medium (incorrect query structure) | Medium | Explicit call site auditing for `image { }` wrapper usage |

---

## Open Questions

### Q1: Should we rename `ctaBlock` to `ctaFragment` for consistency?

**Answer**: **Yes** - standardize on `Fragment` suffix. Update export name in sanity-blocks/cta.fragment.ts and import in template-web.

### Q2: Should we create barrel exports (index.ts) for fragments?

**Answer**: **Optional** - current wildcard exports work well. Barrel exports add convenience but increase maintenance. Recommend: **skip for now**, add later if developer feedback requests it.

### Q3: How do we handle the imageFragment wrapper difference?

**Answer**: Audit all call sites in template-web:
- If using `${imageFragment}` directly → Change to `image { ${imageFragment} }`
- If already wrapped → No change needed

---

## Conclusion

Research is complete. All fragment duplicates identified, implementation differences analyzed, and reconciliation strategies defined. Ready to proceed to Phase 1 (design).

**Key Takeaways**:
1. **7 duplicates** to resolve (4 exact, 3 different)
2. **2 hidden fragments** to export (customLinkFragment, markDefsFragment)
3. **3 schema-less fragments** stay in template-web (blogAuthor, blogCard, ogFields)
4. **Template-web as source of truth** for reconciliation (when in doubt, use template-web version)
5. **Snapshot testing critical** for verifying zero functional changes
