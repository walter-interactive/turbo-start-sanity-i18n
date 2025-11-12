# Quickstart: Orphaned Translation Badge Removal

**Feature**: Remove Orphaned Translation Badge  
**Branch**: 004-remove-orphaned-badge  
**Purpose**: Guide for testing the removal of orphaned translation badge functionality

---

## Overview

This guide provides step-by-step instructions for verifying that the orphaned translation badge has been successfully removed from Sanity Studio document previews without breaking existing functionality.

---

## Prerequisites

- Monorepo must be cloned and dependencies installed (`pnpm install`)
- Git branch `004-remove-orphaned-badge` checked out
- Node.js and pnpm available

---

## Quick Verification Steps

### 1. Build & Type Check

Verify that all code changes pass type checking and build successfully:

```bash
# From repository root
cd /Users/walter-mac/walter-interactive/clone-0/turbo-start-sanity-i18n

# Type check studio workspace
pnpm --filter studio typecheck

# Expected output: No type errors

# Build studio workspace  
pnpm --filter studio build

# Expected output: Build succeeds with no errors

# Run linting
pnpm lint

# Expected output: All checks pass
```

**Expected Results**:
- ✅ Type check passes with 0 errors
- ✅ Build completes successfully
- ✅ Linting passes with 0 warnings/errors

**If Failures Occur**:
- Review error messages for type issues
- Check that all removed code references are cleaned up
- Verify no imports of deleted OrphanedBadge component remain

---

### 2. Start Sanity Studio

Launch the Studio development server:

```bash
# From repository root
pnpm --filter studio dev

# Expected output:
# - Server starts on http://localhost:3333
# - No console errors related to missing components
# - No warnings about undefined variables
```

**Expected Results**:
- ✅ Studio loads in browser at http://localhost:3333
- ✅ No JavaScript errors in browser console
- ✅ No "Cannot find module" errors
- ✅ No "undefined variable" warnings

**If Failures Occur**:
- Check browser console for specific error messages
- Verify orphaned-translation-badge.tsx file is deleted
- Verify no remaining imports of OrphanedBadge

---

### 3. Visual Verification - Pages List

Navigate to the Pages document list and verify preview appearance:

**Steps**:
1. Open Studio at http://localhost:3333
2. Navigate to "Pages" in the Studio navigation
3. View the document list

**Expected Results**:
- ✅ No "⚠️ Orphaned translation" text visible on any document previews
- ✅ Document preview subtitles show clean format: `${statusEmoji} ${builderEmoji} | 🔗 ${slug}`
- ✅ Example clean subtitle: `🌎 🧱 3 | 🔗 /about-us`
- ✅ All other preview elements intact:
  - Document title displays correctly
  - Image thumbnails appear (if set)
  - Status emoji shows correctly (🌎 public, 🔒 private)
  - Page builder emoji shows correctly (🧱 with count or 🏗️)
  - Slug displays correctly with 🔗 prefix

**Before vs After**:
- **Before**: `⚠️ Orphaned translation | 🌎 🧱 3 | 🔗 /about-us`
- **After**: `🌎 🧱 3 | 🔗 /about-us`

---

### 4. Visual Verification - Blogs List

Navigate to the Blogs document list and verify preview appearance:

**Steps**:
1. Navigate to "Blogs" in the Studio navigation
2. View the document list

**Expected Results**:
- ✅ No "⚠️ Orphaned translation" text visible
- ✅ Document preview subtitles show clean format: `🔗 ${slug} | ${visibility} | ${authorInfo} | ${dateInfo}`
- ✅ Example clean subtitle: `🔗 /my-post | 🌎 Public | ✍️ John Doe | 📅 11/12/2025`
- ✅ All other preview elements intact:
  - Document title displays correctly
  - Image thumbnails appear (if set)
  - Visibility status correct
  - Author name displays
  - Publish date displays

**Before vs After**:
- **Before**: `⚠️ Orphaned translation | 🔗 /my-post | 🌎 Public | ✍️ John Doe | 📅 11/12/2025`
- **After**: `🔗 /my-post | 🌎 Public | ✍️ John Doe | 📅 11/12/2025`

---

### 5. Visual Verification - FAQs List

Navigate to the FAQs document list and verify preview appearance:

**Steps**:
1. Navigate to "FAQs" in the Studio navigation
2. View the document list

**Expected Results**:
- ✅ No "⚠️ Orphaned translation" text visible
- ✅ Document preview subtitles show clean format: `${richTextSnippet}`
- ✅ Example clean subtitle: `How do I reset my password?`
- ✅ Rich text snippet displays first ~20 words of FAQ answer

**Before vs After**:
- **Before**: `⚠️ Orphaned translation | How do I reset my password?`
- **After**: `How do I reset my password?`

---

### 6. Functional Verification - Translations Badge

Verify that the Translations badge (used for managing language versions) still works correctly:

**Steps**:
1. Open any document that has multiple language versions
2. Look for the "Translations" badge/button in the document editor
3. Click the Translations badge
4. Verify dropdown shows all available language versions (e.g., FR, EN)
5. Click a different language version
6. Verify the document switches to that language

**Expected Results**:
- ✅ Translations badge displays correctly
- ✅ Badge shows count of available translations (e.g., "2 translations")
- ✅ Dropdown lists all language versions
- ✅ Clicking a language switches to that document version
- ✅ Switching languages works without errors

**Why This Matters**: The removal of the orphaned badge logic should NOT affect the Translations badge functionality, which is a separate feature for managing language versions.

---

### 7. Functional Verification - Document Editing

Verify that normal document operations work correctly:

**Steps**:
1. Open any document for editing
2. Make a small change (e.g., edit title)
3. Save the document
4. Return to document list
5. Verify preview updates correctly

**Expected Results**:
- ✅ Document opens without errors
- ✅ Editing works normally
- ✅ Saving succeeds
- ✅ Preview in list view reflects changes
- ✅ No console errors during any operations

---

### 8. Edge Case Verification - New Documents

Verify that newly created documents display correctly:

**Steps**:
1. Create a new Page document
2. Set language to English (EN)
3. Enter title and slug
4. Save the document
5. Return to Pages list
6. Verify the new document preview displays correctly

**Expected Results**:
- ✅ New document appears in list
- ✅ Preview subtitle shows clean format (no orphaned warning)
- ✅ Document is editable and functional

---

### 9. Edge Case Verification - Default Language Documents

Verify that default language (French) documents display correctly:

**Steps**:
1. Find or create a document with language set to French (FR)
2. View it in the document list
3. Verify preview displays correctly

**Expected Results**:
- ✅ FR documents never showed orphaned warning before (language === DEFAULT_LOCALE)
- ✅ FR documents should show same preview format as before
- ✅ No changes to FR document previews expected

---

## Comprehensive Test Checklist

Use this checklist to ensure all verification steps are complete:

### Build & Compilation
- [ ] `pnpm --filter studio typecheck` passes
- [ ] `pnpm --filter studio build` succeeds
- [ ] `pnpm lint` passes
- [ ] No type errors in terminal output
- [ ] No build warnings related to removed code

### Studio Loading
- [ ] `pnpm --filter studio dev` starts successfully
- [ ] Studio opens in browser without errors
- [ ] Browser console shows no errors
- [ ] No "Cannot find module" messages
- [ ] No undefined variable warnings

### Pages List
- [ ] No orphaned warnings visible
- [ ] Subtitle format is clean: `${status} ${builder} | 🔗 ${slug}`
- [ ] All EN documents display without warnings
- [ ] All FR documents display correctly
- [ ] Status emojis display correctly (🌎 / 🔒)
- [ ] Page builder indicators display correctly (🧱 X / 🏗️)
- [ ] Slugs display with 🔗 prefix

### Blogs List
- [ ] No orphaned warnings visible
- [ ] Subtitle format is clean: `🔗 ${slug} | ${visibility} | ${author} | ${date}`
- [ ] Visibility status displays correctly
- [ ] Author names display correctly
- [ ] Publish dates display correctly

### FAQs List
- [ ] No orphaned warnings visible
- [ ] Subtitle shows rich text snippet only
- [ ] Snippets are readable and appropriately truncated

### Functional Tests
- [ ] Translations badge visible on multilingual documents
- [ ] Translations dropdown lists all language versions
- [ ] Language switching works correctly
- [ ] Document editing works normally
- [ ] Saving documents succeeds
- [ ] Preview updates after edits
- [ ] Creating new documents works
- [ ] New document previews display correctly

### Edge Cases
- [ ] Newly created EN documents show no orphaned warning
- [ ] FR (default language) documents unchanged
- [ ] Documents with missing slugs handle gracefully
- [ ] Documents without images display correctly
- [ ] Private documents show 🔒 icon correctly

---

## Troubleshooting

### Issue: Type errors after removal

**Symptom**: `pnpm --filter studio typecheck` fails with errors about missing types

**Solution**:
1. Check that all imports of `OrphanedBadge` are removed
2. Verify `OrphanedBadgeProps` is not referenced anywhere
3. Check that `language` parameter is removed from preview.prepare() if not used elsewhere

---

### Issue: Studio fails to load

**Symptom**: Browser shows white screen or error page

**Solution**:
1. Check browser console for specific error messages
2. Verify `orphaned-translation-badge.tsx` file is deleted
3. Check that no preview.prepare() function references `isOrphaned` after removal
4. Restart dev server: Stop with Ctrl+C, run `pnpm --filter studio dev` again

---

### Issue: Preview subtitles show "undefined"

**Symptom**: Document list previews show "undefined" in subtitle

**Solution**:
1. Check that conditional logic in preview.prepare() is updated correctly
2. Verify subtitle template string doesn't reference removed variables
3. Ensure all emoji and status variables are still calculated correctly

---

### Issue: Translations badge missing

**Symptom**: Cannot find Translations badge on documents

**Solution**:
1. Verify you're looking at a document with multiple language versions
2. Check that document has `language` field defined (should be preserved)
3. Ensure `@sanity/document-internationalization` plugin is still configured
4. This issue should NOT occur - orphaned badge removal doesn't affect Translations badge

---

## Performance Verification

### Expected Improvements

After removal, document list previews should be:
- **Faster**: Less logic to execute in preview.prepare()
- **Cleaner**: ~26 fewer characters per EN document subtitle
- **More readable**: No false warning text cluttering the UI

### Measuring Impact

**Subtitle Length Reduction**:
- Before: Average ~80-100 characters for EN documents
- After: Average ~55-75 characters for EN documents
- Reduction: ~25-30 characters per document preview

**Visual Noise Reduction**:
- Before: Every EN document shows "⚠️ Orphaned translation | "
- After: Clean, informative subtitles only

---

## Success Criteria

The feature removal is successful when ALL of the following are true:

1. ✅ Type checking passes for studio workspace
2. ✅ Studio builds without errors
3. ✅ Linting passes with no violations
4. ✅ Studio loads in browser without errors
5. ✅ Pages list shows no orphaned warnings
6. ✅ Blogs list shows no orphaned warnings
7. ✅ FAQs list shows no orphaned warnings
8. ✅ All preview subtitles are clean and readable
9. ✅ Translations badge still functions correctly
10. ✅ Language switching still works
11. ✅ Document editing is unaffected
12. ✅ No console errors during normal operations

---

## Rollback Plan

If critical issues are discovered after removal:

1. **Immediate Rollback**:
   ```bash
   git checkout main
   pnpm install
   pnpm --filter studio dev
   ```

2. **Partial Rollback** (restore component but not preview usage):
   ```bash
   git checkout main -- apps/studio/components/orphaned-translation-badge.tsx
   ```

3. **Investigation**:
   - Document the specific issue encountered
   - Check if issue is related to removal or pre-existing
   - Review error logs and stack traces
   - Consult research.md for edge cases

---

## Additional Notes

### What Was NOT Removed

- ✅ `language` field in document schemas (page, blog, faq) - **Still exists in data model**
- ✅ `languageField` in common.ts - **Still used for i18n**
- ✅ Translations badge functionality - **Completely preserved**
- ✅ `isDocumentOrphaned()` function in language-filter.ts - **Kept for potential future use**

### What WAS Removed

- ❌ `orphaned-translation-badge.tsx` component file - **Deleted (unused)**
- ❌ `language` from preview.select in page.ts, blog.ts, faq.ts - **Removed (only used for orphaned check)**
- ❌ `isOrphaned` variable in preview.prepare() - **Removed from all 3 schemas**
- ❌ Orphaned warning text in subtitle conditionals - **Removed from all 3 schemas**

---

## Contact & Support

**Feature Spec**: See [spec.md](./spec.md) for full requirements  
**Research**: See [research.md](./research.md) for detailed findings  
**Implementation Plan**: See [plan.md](./plan.md) for technical approach  

If you encounter issues not covered in this guide, refer to the investigation document:
- `specs/issues/003-T058-orphaned-badge-investigation.md`
