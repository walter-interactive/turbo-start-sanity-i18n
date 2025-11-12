# Data Model: Orphaned Translation Badge Removal

**Feature**: Remove Orphaned Translation Badge  
**Branch**: 004-remove-orphaned-badge  
**Date**: 2025-11-12

---

## Overview

This feature is a **removal operation** and does NOT introduce new data models or modify existing ones. This document confirms that no data model changes are required.

---

## Existing Data Model (Unchanged)

### Document Schemas

The following Sanity document schemas exist and will **remain unchanged** in the data model:

#### Page Schema
- **Type**: `page`
- **Fields**: 
  - `language` (string) - **PRESERVED** for internationalization
  - `title` (string)
  - `slug` (slug)
  - `description` (text)
  - `image` (image)
  - `pageBuilder` (array)
  - `seoNoIndex` (boolean)
  - All other SEO and OG fields

**Changes**: None to data model. Only preview configuration modified (not data structure).

---

#### Blog Schema
- **Type**: `blog`
- **Fields**:
  - `language` (string) - **PRESERVED** for internationalization
  - `title` (string)
  - `slug` (slug)
  - `author` (reference)
  - `publishDate` (datetime)
  - `seoNoIndex` (boolean)
  - `seoHideFromLists` (boolean)
  - `ogImage` (image)
  - All other content fields

**Changes**: None to data model. Only preview configuration modified (not data structure).

---

#### FAQ Schema
- **Type**: `faq`
- **Fields**:
  - `language` (string) - **PRESERVED** for internationalization
  - `title` (string)
  - `richText` (array/block content)
  - All other content fields

**Changes**: None to data model. Only preview configuration modified (not data structure).

---

### Translation Metadata

The translation metadata system managed by `@sanity/document-internationalization` plugin:

- **Type**: `translation.metadata`
- **Structure**: 
  ```typescript
  {
    _id: string;
    translations: Array<{
      _key: Locale;
      value: {
        _ref: string; // Document ID
        _type: "reference";
      };
    }>;
  }
  ```

**Changes**: None. This system remains fully functional and is NOT affected by preview logic removal.

---

## Preview Configuration (Modified, Not Data)

### What Changed

Preview configurations are **NOT part of the data model** - they are TypeScript/JavaScript functions that determine how documents are displayed in Studio lists. These changes do NOT affect:

- Document storage in Sanity Content Lake
- Document field structure
- Queries or API responses
- Frontend data fetching
- Migration requirements

### Preview Modifications

| Schema | Before | After |
|--------|--------|-------|
| page.ts | `preview.select` includes `language` | `language` removed from select (if only used for orphaned check) |
| page.ts | `preview.prepare` calculates `isOrphaned` | `isOrphaned` logic removed |
| page.ts | Subtitle shows orphaned warning | Subtitle shows clean format |
| blog.ts | Same as page.ts | Same as page.ts |
| faq.ts | Same as page.ts | Same as page.ts |

**Impact**: Visual presentation only, zero data model impact.

---

## Component Deletion (Not Data)

### OrphanedBadge Component

**File**: `apps/studio/components/orphaned-translation-badge.tsx`

**Status**: Deleted

**Reason**: Component was defined but never imported or used in any code.

**Data Impact**: None - this is a UI component, not a data structure.

---

## Validation Rules (Unchanged)

All document validation rules remain intact:

- Page title required
- Slug validation
- Meta description length warnings
- All other business logic validations

**Changes**: None.

---

## Relationships (Unchanged)

All document relationships remain intact:

- Blog → Author (reference)
- Document → Translation metadata (via plugin)
- Parent → Child pages (hierarchical structure)
- All other relationships

**Changes**: None.

---

## Database Migrations

**Required**: ❌ **NONE**

This feature requires zero database migrations because:
- No fields added or removed from schemas
- No field types changed
- No validation rules changed
- No relationships modified
- Only UI presentation logic changed (preview configuration)

---

## Data Integrity

**Impact**: ✅ **NONE**

- Existing documents remain valid
- No data corruption risk
- No orphaned data created
- No referential integrity concerns
- No index updates required

---

## Backward Compatibility

**Status**: ✅ **FULLY COMPATIBLE**

- Existing documents display correctly with new preview format
- No data re-import required
- No content editor training required (simpler interface)
- No breaking changes to APIs or queries

---

## Future Considerations

### If Accurate Orphaned Detection Is Needed Later

If the business decides to implement accurate orphaned translation detection in the future, options include:

1. **Custom Sanity Plugin**:
   - Create custom list view component with async data loading
   - Query translation.metadata for each document
   - Display badge based on actual metadata
   - **Data Model Impact**: None (uses existing metadata)

2. **Validation Script**:
   - CLI tool to scan all documents
   - Generate report of truly orphaned documents
   - Run periodically or on-demand
   - **Data Model Impact**: None (read-only analysis)

3. **Admin Dashboard**:
   - Separate view for managing translation completeness
   - Show documents missing default language versions
   - Provide bulk actions for fixing issues
   - **Data Model Impact**: None (uses existing data)

**Note**: All future options would use the existing `translation.metadata` data model. No schema changes anticipated.

---

## Summary

| Category | Status | Details |
|----------|--------|---------|
| **Data Model Changes** | ❌ None | Feature is removal-only |
| **Schema Modifications** | ❌ None | Document fields unchanged |
| **Database Migrations** | ❌ None | No data structure changes |
| **Validation Rules** | ❌ None | All validations preserved |
| **Relationships** | ❌ None | All references preserved |
| **Backward Compatibility** | ✅ Full | Zero breaking changes |
| **Data Integrity Risk** | ✅ None | Safe removal |

---

## Conclusion

This feature removes UI presentation logic (preview configuration and unused component) without touching the underlying data model. The `language` field remains in all document schemas for internationalization purposes. No database migrations, schema updates, or data transformations are required.

The removal is purely cosmetic, affecting only how documents are displayed in Sanity Studio lists, not how they are stored, queried, or managed.
