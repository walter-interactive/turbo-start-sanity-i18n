# Research: Orphaned Translation Badge Removal

**Date**: 2025-11-12  
**Feature**: Remove Orphaned Translation Badge  
**Branch**: 004-remove-orphaned-badge  

## Research Objectives

Verify that the orphaned translation badge component and logic can be safely removed from the Sanity Studio codebase without breaking existing functionality.

---

## Q1: Component Usage Verification

**Question**: Are there any imports of `OrphanedBadge` component in the codebase?

**Method**: 
```bash
rg "orphaned-translation-badge|OrphanedBadge" --type ts -l
```

**Findings**:
- **File Location**: `apps/studio/components/orphaned-translation-badge.tsx`
- **Import Count**: **ZERO** - Component is defined but never imported
- **Usage Count**: **ZERO** - Component is never used in any preview or UI code

**Evidence**:
- Component file exists at `apps/studio/components/orphaned-translation-badge.tsx` with 65 lines
- Exports `OrphanedBadge` component and `OrphanedBadgeProps` interface
- Search across entire codebase returns no import statements
- Documentation in spec 003 mentions the component but shows it was never actually integrated

**Decision**: ✅ **SAFE TO DELETE** - Component has zero dependencies

---

## Q2: Language Field Usage in Preview

**Question**: Is the `language` field used elsewhere in preview.select beyond orphaned detection?

**Method**: Manual inspection of preview.prepare() functions in page.ts, blog.ts, and faq.ts

**Findings**:

### Page Schema (`apps/studio/schemaTypes/documents/page.ts`)

```typescript
preview: {
  select: {
    title: "title",
    slug: "slug.current",
    language: "language",     // ← Only used for isOrphaned
    media: "image",
    isPrivate: "seoNoIndex",
    hasPageBuilder: "pageBuilder",
  },
  prepare: ({ title, slug, language, media, isPrivate, hasPageBuilder }) => {
    const isOrphaned = language !== DEFAULT_LOCALE;  // ← ONLY USAGE
    // ... rest of function doesn't use language
  }
}
```

**Usage**: `language` → `isOrphaned` calculation only

---

### Blog Schema (`apps/studio/schemaTypes/documents/blog.ts`)

```typescript
preview: {
  select: {
    title: "title",
    language: "language",     // ← Only used for isOrphaned
    media: "ogImage",
    isPrivate: "seoNoIndex",
    isHidden: "seoHideFromLists",
    author: "author.name",
    slug: "slug.current",
    publishDate: "publishDate",
  },
  prepare: ({ title, language, media, isPrivate, isHidden, author, slug, publishDate }) => {
    const isOrphaned = language !== DEFAULT_LOCALE;  // ← ONLY USAGE
    // ... rest of function doesn't use language
  }
}
```

**Usage**: `language` → `isOrphaned` calculation only

---

### FAQ Schema (`apps/studio/schemaTypes/documents/faq.ts`)

```typescript
preview: {
  select: {
    title: "title",
    language: "language",     // ← Only used for isOrphaned
    richText: "richText",
  },
  prepare: ({ title, language, richText }) => {
    const isOrphaned = language !== DEFAULT_LOCALE;  // ← ONLY USAGE
    const subtitle = parseRichTextToString(richText, 20);
    // ... language not used elsewhere
  }
}
```

**Usage**: `language` → `isOrphaned` calculation only

---

**Decision**: ✅ **SAFE TO REMOVE** - `language` field in preview.select serves no purpose after orphaned logic removal

**Note**: The `language` field itself remains in the document schema (defined in `common.ts` as `languageField`). We're only removing it from the preview.select configuration, not from the actual document data model.

---

## Q3: Scope of isOrphaned Usage

**Question**: What other document types might have this pattern?

**Method**:
```bash
rg "isOrphaned" --type ts -n
```

**Findings**:

### Production Code (apps/studio/)
1. **page.ts** (lines 78, 86) - Preview logic
2. **blog.ts** (lines 139, 158) - Preview logic
3. **faq.ts** (lines 39, 44) - Preview logic
4. **language-filter.ts** (lines 121-122) - Example in JSDoc comment only

### Documentation (specs/003-dedup-studio-records/)
5. **contracts/language-filter-types.ts** - Type definitions and examples (not production code)

**Summary**: Only 3 document schemas affected:
- ✅ page
- ✅ blog
- ✅ faq

**Additional Finding**: `language-filter.ts` contains an async function `isDocumentOrphaned()` that correctly checks for orphaned status using GROQ queries, but this function is **never called** in production code - it exists only as a utility with example documentation.

**Decision**: No additional document types require modification beyond page, blog, and faq

---

## Q4: Expected Subtitle Format After Removal

**Question**: What is the format of the subtitle after removal?

**Analysis by Document Type**:

### Pages (page.ts)

**Current Format** (with orphaned):
```
⚠️ Orphaned translation | ${statusEmoji} ${builderEmoji} | 🔗 ${slug}
```

**New Format** (after removal):
```
${statusEmoji} ${builderEmoji} | 🔗 ${slug}
```

**Example**:
- Before: `⚠️ Orphaned translation | 🌎 🧱 3 | 🔗 /about-us`
- After: `🌎 🧱 3 | 🔗 /about-us`

**Character Reduction**: ~26 characters per document

---

### Blogs (blog.ts)

**Current Format** (with orphaned):
```
⚠️ Orphaned translation | 🔗 ${slug} | ${visibility} | ${authorInfo} | ${dateInfo}
```

**New Format** (after removal):
```
🔗 ${slug} | ${visibility} | ${authorInfo} | ${dateInfo}
```

**Example**:
- Before: `⚠️ Orphaned translation | 🔗 /my-post | 🌎 Public | ✍️ John Doe | 📅 11/12/2025`
- After: `🔗 /my-post | 🌎 Public | ✍️ John Doe | 📅 11/12/2025`

**Character Reduction**: ~26 characters per document

---

### FAQs (faq.ts)

**Current Format** (with orphaned):
```
⚠️ Orphaned translation | ${richTextSnippet}
```

**New Format** (after removal):
```
${richTextSnippet}
```

**Example**:
- Before: `⚠️ Orphaned translation | How do I reset my password?`
- After: `How do I reset my password?`

**Character Reduction**: ~26 characters per document

---

**Decision**: All subtitle formats are cleaner and more readable after removal, with consistent ~26 character reduction for documents that previously showed the warning.

---

## Additional Research: Related Functions

### isDocumentOrphaned() Function

**Location**: `apps/studio/components/language-filter.ts` (lines 126-148)

**Purpose**: Async function that correctly checks for orphaned status by querying translation.metadata

**Implementation Approach**: 
- Uses GROQ query to check translation.metadata documents
- Verifies if both current document AND default language version exist in translations array
- Returns true only if document lacks default language counterpart

**Usage Count**: **ZERO** - Function defined but never called in production

**Reason Not Used**: Cannot be called from `preview.prepare()` because it's async and prepare() is synchronous-only

**Decision**: ⚠️ **KEEP** - While unused, this function represents the "correct" implementation approach and may be useful for future features (validation scripts, admin tools). Not causing any harm by existing.

---

## Testing Strategy

### Pre-Removal Baseline

1. **Visual Documentation**:
   - Screenshot Pages list showing orphaned warnings on EN documents
   - Screenshot Blogs list showing orphaned warnings
   - Screenshot FAQs list showing orphaned warnings
   - Note: Screenshots should capture both truly orphaned (rare) and false positives (common)

2. **Functional Baseline**:
   - Verify Translations badge works (shows all language versions)
   - Verify document editing works
   - Verify language switching works

### Post-Removal Verification

1. **Build Verification**:
   ```bash
   pnpm --filter studio typecheck  # Must pass
   pnpm --filter studio build      # Must succeed
   pnpm lint                        # Must pass
   ```

2. **Visual Verification**:
   - Pages list: No orphaned warnings, clean subtitles
   - Blogs list: No orphaned warnings, clean subtitles
   - FAQs list: No orphaned warnings, clean subtitles
   - All other preview elements intact (icons, slugs, dates)

3. **Functional Verification**:
   - Translations badge still functional
   - Language switching still works
   - Document editing unaffected
   - Preview updates reflect correctly

### Manual Test Checklist

- [ ] Start Studio: `pnpm --filter studio dev`
- [ ] Navigate to Pages list
- [ ] Verify no "⚠️ Orphaned translation" text visible
- [ ] Check subtitle format matches expected: `${status} ${builder} | 🔗 ${slug}`
- [ ] Navigate to Blogs list
- [ ] Verify no orphaned warnings
- [ ] Navigate to FAQs list
- [ ] Verify no orphaned warnings
- [ ] Open any document with multiple translations
- [ ] Verify Translations badge shows all versions correctly
- [ ] Switch language using badge
- [ ] Verify switching works correctly
- [ ] Close document
- [ ] Verify list view still displays correctly after navigation

---

## Decisions Summary

| Decision | Status | Rationale |
|----------|--------|-----------|
| Delete OrphanedBadge component | ✅ Approved | Zero imports, zero usage |
| Remove language from preview.select | ✅ Approved | Only used for orphaned check |
| Remove isOrphaned logic from page.ts | ✅ Approved | Produces false positives |
| Remove isOrphaned logic from blog.ts | ✅ Approved | Produces false positives |
| Remove isOrphaned logic from faq.ts | ✅ Approved | Produces false positives |
| Keep isDocumentOrphaned() function | ✅ Approved | Harmless, may be useful for future utilities |
| Keep language field in schema | ✅ Approved | Required for i18n, only removing from preview |
| No automated tests required | ✅ Approved | Removal feature, manual verification sufficient |

---

## Risk Assessment After Research

### No Risks Identified

- ✅ Component has zero dependencies
- ✅ Language field removal from preview.select is safe (only used for orphaned check)
- ✅ No other document types affected
- ✅ Subtitle format is cleaner and more readable
- ✅ All other preview functionality preserved

### Mitigation Complete

- ✅ Comprehensive search confirms no hidden dependencies
- ✅ Manual inspection confirms language field is isolated to orphaned logic
- ✅ Testing checklist provides thorough verification path
- ✅ Build and typecheck provide safety net for any missed issues

---

## Next Steps

**Phase 1 Ready**: Research complete, proceed to Phase 1 design:
1. Create quickstart.md with testing guide
2. Run agent context update script
3. Proceed to Phase 2 task breakdown

**No Blockers**: All research questions answered with clear decisions.
