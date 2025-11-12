# Quickstart Guide: De-duplicate i18n Records in Sanity Studio

**Feature**: 003-dedup-studio-records  
**Date**: 2025-11-11  
**For**: Developers implementing or testing this feature

## Overview

This guide provides step-by-step instructions for implementing and testing the document list de-duplication feature. After implementation, Sanity Studio will show only default language (FR) versions in document lists while maintaining full translation access through the Translations badge.

## Prerequisites

- Familiarity with Sanity Studio structure builder
- Understanding of GROQ query language
- Node.js 18+ and pnpm installed
- Access to Sanity Studio locally (`pnpm --filter studio dev`)

## Implementation Steps

### Step 1: Create @workspace/i18n-config Package

**Purpose**: Centralize locale configuration for entire monorepo

**1.1 Create package structure**:
```bash
mkdir -p packages/i18n-config/src
```

**1.2 Create package.json**:
```json
{
  "name": "@workspace/i18n-config",
  "version": "0.0.1",
  "type": "module",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "lint": "npx ultracite lint",
    "format": "npx ultracite fix",
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {
    "@workspace/typescript-config": "workspace:*",
    "typescript": "^5.9.2"
  }
}
```

**1.3 Create tsconfig.json**:
```json
{
  "extends": "@workspace/typescript-config/base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**1.4 Create src/index.ts**:
```typescript
// See contracts/i18n-config-package.ts for full implementation
export const LOCALES = ["fr", "en"] as const;
export const DEFAULT_LOCALE = LOCALES[0];
export type Locale = typeof LOCALES[number];

// ... rest of implementation from contract
```

**1.5 Add dependency to apps**:

In `apps/web/package.json` and `apps/studio/package.json`:
```json
{
  "dependencies": {
    "@workspace/i18n-config": "workspace:*",
    // ... other deps
  }
}
```

**1.6 Install dependencies**:
```bash
pnpm install
```

### Step 2: Update Web App to Use Shared Config

**2.1 Modify apps/web/src/i18n/routing.ts**:
```typescript
// Replace local LOCALES/DEFAULT_LOCALE with imports
import { LOCALES, DEFAULT_LOCALE, type Locale } from '@workspace/i18n-config';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always" as const,
});

// Re-export type for backward compatibility
export type { Locale };
```

**2.2 Test web app**:
```bash
pnpm --filter web typecheck
pnpm --filter web build
```

### Step 3: Update Studio to Use Shared Config

**3.1 Modify apps/studio/sanity.config.ts**:
```typescript
import { SANITY_LANGUAGES } from '@workspace/i18n-config';
import { documentInternationalization } from '@sanity/document-internationalization';

// Replace hardcoded supportedLanguages
documentInternationalization({
  supportedLanguages: SANITY_LANGUAGES,
  schemaTypes: [
    "page", "blog", "blogIndex", 
    "navbar", "footer", "settings", 
    "homePage", "faq"
  ],
})
```

**3.2 Test Studio**:
```bash
pnpm --filter studio type
pnpm --filter studio build
```

### Step 4: Implement Language Filtering Utility

**4.1 Create apps/studio/components/language-filter.ts**:
```typescript
import type { SanityClient } from "@sanity/client";
import { DEFAULT_LOCALE, type Locale } from '@workspace/i18n-config';

export interface DocumentWithLanguage {
  _id: string;
  title: string;
  slug: string;
  language: Locale;
}

export async function fetchDocumentsByLanguage(
  client: SanityClient,
  schemaType: string,
  language: Locale = DEFAULT_LOCALE
): Promise<DocumentWithLanguage[]> {
  try {
    const documents = await client.fetch(
      `*[_type == $schemaType && defined(slug.current) && 
        (!defined(language) || language == $language)] {
        _id,
        title,
        "slug": slug.current,
        language
      }`,
      { schemaType, language }
    );

    if (!Array.isArray(documents)) {
      throw new Error("Invalid documents response");
    }

    return documents;
  } catch (error) {
    throw new Error(
      `Unable to load ${schemaType} documents. ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
```

### Step 5: Update Document Fetching in Structure Builder

**5.1 Modify apps/studio/components/nested-pages-structure.ts**:

Find the `fetchDocuments` function (around line 32) and update it:

```typescript
import { DEFAULT_LOCALE, type Locale } from '@workspace/i18n-config';

const fetchDocuments = async (
  client: SanityClient,
  schemaType: string,
  language: Locale = DEFAULT_LOCALE
): Promise<DocumentData[]> => {
  try {
    const documents = await client.fetch(
      `*[_type == $schemaType && defined(slug.current) && 
        (!defined(language) || language == $language)] {
        _id,
        title,
        "slug": slug.current,
        language
      }`,
      { schemaType, language }
    );

    if (!Array.isArray(documents)) {
      throw new Error("Invalid documents response");
    }

    return documents;
  } catch (error) {
    throw new Error(
      `Unable to load ${schemaType} documents. Please try again. ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
```

**5.2 Update the call to fetchDocuments** (around line 366):
```typescript
// Change from:
const documents = await fetchDocuments(client, schemaType);

// To:
const documents = await fetchDocuments(client, schemaType, DEFAULT_LOCALE);
```

### Step 6: Apply Filtering to All Document Types

**6.1 Update apps/studio/structure.ts**:

For document types using `createList` (faq, author, redirect), update to use filtered queries:

```typescript
import { DEFAULT_LOCALE } from '@workspace/i18n-config';

// For i18n-enabled types, modify the list to filter by language
// Example for FAQ (which is in schemaTypes array):
S.listItem()
  .title("FAQs")
  .icon(MessageCircle)
  .child(
    S.documentList()
      .title("FAQs")
      .filter('_type == $type && (!defined(language) || language == $language)')
      .params({ type: 'faq', language: DEFAULT_LOCALE })
  )
```

### Step 7: Add Orphaned Translation Badges (Optional)

**7.1 Create badge component** apps/studio/components/orphaned-translation-badge.tsx:
```typescript
import { Badge, Flex, Text } from "@sanity/ui";
import { WarningOutlineIcon } from "@sanity/icons";
import { DEFAULT_LOCALE, type Locale } from '@workspace/i18n-config';

export interface OrphanedBadgeProps {
  language: Locale;
  showBadge?: boolean;
}

export function OrphanedBadge({ language, showBadge = true }: OrphanedBadgeProps) {
  if (!showBadge || language === DEFAULT_LOCALE) {
    return null;
  }

  return (
    <Badge
      role="alert"
      tone="caution"
      radius={2}
      aria-label="Orphaned translation - missing default language version"
    >
      <Flex align="center" gap={1}>
        <WarningOutlineIcon />
        <Text size={1} weight="medium">Orphaned</Text>
      </Flex>
    </Badge>
  );
}
```

**7.2 Update schema previews** (e.g., apps/studio/schemaTypes/documents/page.ts):
```typescript
import { DEFAULT_LOCALE } from '@workspace/i18n-config';
import { OrphanedBadge } from '../../components/orphaned-translation-badge';

preview: {
  select: {
    title: "title",
    language: "language",
    slug: "slug.current",
  },
  prepare({ title, language, slug }) {
    const isOrphaned = language !== DEFAULT_LOCALE;
    
    return {
      title: title || "Untitled",
      subtitle: isOrphaned ? `⚠️ Orphaned translation - ${slug}` : slug,
      media: isOrphaned ? (
        <OrphanedBadge language={language} showBadge />
      ) : undefined,
    };
  },
}
```

### Step 8: Build and Test

**8.1 Type check all workspaces**:
```bash
pnpm check-types
```

**8.2 Lint all workspaces**:
```bash
pnpm lint
```

**8.3 Build all workspaces**:
```bash
pnpm build
```

## Manual Testing Checklist

Run these tests after implementation to verify the feature works correctly:

### Test 1: Document Lists Show Only Default Language
- [ ] Start Studio: `pnpm --filter studio dev`
- [ ] Navigate to "Pages by Path" list
- [ ] **Expected**: See only FR (default language) versions of pages
- [ ] **Expected**: No duplicate "Innovative Explicit Core" entries
- [ ] **Expected**: Each content piece appears exactly once

### Test 2: All Document Types Filtered
- [ ] Check "Pages by Path" list → Only FR versions
- [ ] Check "Blogs" list → Only FR versions
- [ ] Check "FAQs" list → Only FR versions
- [ ] Check "All Pages" list → Only FR versions
- [ ] **Expected**: Consistent filtering across all i18n-enabled types

### Test 3: Translations Badge Works
- [ ] Open any document from a list (e.g., "Innovative Explicit Core" page)
- [ ] **Expected**: Document opens successfully
- [ ] **Expected**: Translations badge/button visible in toolbar
- [ ] **Expected**: Badge shows available languages (FR, EN)

### Test 4: Language Switching Works
- [ ] Open a document that has translations
- [ ] Click the Translations badge/dropdown
- [ ] **Expected**: See list of available languages
- [ ] Select a different language (EN if viewing FR)
- [ ] **Expected**: Document switches to selected language version
- [ ] **Expected**: Can switch back to default language

### Test 5: Translation Workflow Unchanged
- [ ] Open a document in default language (FR)
- [ ] Use "Translate" action to create EN version
- [ ] **Expected**: Translation creation works as before
- [ ] **Expected**: New EN document created successfully
- [ ] **Expected**: EN version NOT visible in main list
- [ ] **Expected**: Can access EN version via Translations badge

### Test 6: Orphaned Documents Show Warning (if implemented)
- [ ] Create a test: Delete the FR version of a page, leaving only EN
- [ ] Navigate to pages list
- [ ] **Expected**: EN version visible with warning indicator
- [ ] **Expected**: Subtitle shows "⚠️ Orphaned translation" text
- [ ] **Expected**: Badge visible if preview media is supported

### Test 7: Document Creation
- [ ] Create a new page from Studio
- [ ] **Expected**: New page assigned default language (FR) automatically
- [ ] **Expected**: New page appears in filtered list immediately
- [ ] Publish the new page
- [ ] **Expected**: Published page remains in filtered list

### Test 8: Document Deletion
- [ ] Delete a non-default language version (EN)
- [ ] **Expected**: Deletion works normally
- [ ] **Expected**: Default version (FR) still visible in list
- [ ] **Expected**: Translations badge updated (EN no longer listed)

### Test 9: Search Still Works
- [ ] Use Studio's search function (Cmd/Ctrl + K)
- [ ] Search for a document title
- [ ] **Expected**: Search returns all language versions
- [ ] **Note**: Search is NOT filtered (this is intentional)

### Test 10: Performance Check
- [ ] Navigate to pages list
- [ ] **Expected**: List loads in under 1 second
- [ ] **Expected**: No noticeable delay compared to before
- [ ] Open browser DevTools → Network tab
- [ ] **Expected**: GROQ queries include language filter parameter

### Test 11: Configuration Change
- [ ] Edit `packages/i18n-config/src/index.ts`
- [ ] Change `LOCALES = ["fr", "en"]` to `LOCALES = ["en", "fr"]`
- [ ] Restart dev server: `pnpm --filter studio dev`
- [ ] **Expected**: Lists now show EN versions (new default)
- [ ] **Expected**: Web app also uses EN as default
- [ ] **Revert**: Change back to `["fr", "en"]` after test

## Troubleshooting

### Issue: TypeScript errors about @workspace/i18n-config

**Solution**:
```bash
# Reinstall dependencies
pnpm install

# Check package is linked
ls -la packages/i18n-config

# Rebuild TypeScript
pnpm check-types
```

### Issue: Lists show no documents

**Possible causes**:
1. All documents are in wrong language
2. Language field missing on documents
3. GROQ query syntax error

**Debug**:
```typescript
// Check what fetchDocuments returns
console.log('Fetched documents:', documents);

// Check GROQ query directly in Vision plugin
*[_type == "page" && (!defined(language) || language == "fr")] {
  _id, title, language
}
```

### Issue: Duplicate documents still appear

**Possible causes**:
1. Filter not applied to all list types
2. Language filter not working
3. Different document types

**Check**:
- Verify `DEFAULT_LOCALE` import in all files
- Check GROQ query includes language filter
- Verify documents have language field populated

### Issue: Translations badge missing

**Possible cause**: Document type not in `schemaTypes` array

**Fix**: Add document type to plugin configuration in `sanity.config.ts`:
```typescript
documentInternationalization({
  supportedLanguages: SANITY_LANGUAGES,
  schemaTypes: ['page', 'blog', 'faq', 'YourTypeHere'],
})
```

### Issue: Orphaned badges not showing

**Note**: Preview media badges only work in nested lists, not top-level structure lists.

**Workaround**: Use text-based indicator in subtitle field instead.

## Rollback Instructions

If you need to revert the changes:

1. **Remove @workspace/i18n-config dependency** from apps:
   ```bash
   # Edit apps/web/package.json and apps/studio/package.json
   # Remove "@workspace/i18n-config": "workspace:*"
   pnpm install
   ```

2. **Restore original routing.ts**:
   ```typescript
   // apps/web/src/i18n/routing.ts
   export const LOCALES = ["fr", "en"] as const;
   export const DEFAULT_LOCALE = LOCALES[0];
   ```

3. **Restore original sanity.config.ts**:
   ```typescript
   documentInternationalization({
     supportedLanguages: [
       { id: "fr", title: "Français" },
       { id: "en", title: "English" },
     ],
     // ...
   })
   ```

4. **Remove language filter from fetchDocuments**:
   ```typescript
   // Remove language parameter and filter
   const documents = await client.fetch(`
     *[_type == $schemaType && defined(slug.current)] {
       _id, title, "slug": slug.current
     }
   `, { schemaType });
   ```

5. **Rebuild**:
   ```bash
   pnpm build
   ```

## Next Steps

After successful testing:

1. **Commit changes**: Create a PR with all changes
2. **Documentation**: Update README files if needed
3. **Team review**: Share testing results with team
4. **Deploy**: Merge to main and deploy Studio

## Additional Resources

- **Spec**: `specs/003-dedup-studio-records/spec.md`
- **Research**: `specs/003-dedup-studio-records/research.md`
- **Data Model**: `specs/003-dedup-studio-records/data-model.md`
- **Contracts**: `specs/003-dedup-studio-records/contracts/`
- **Sanity Structure Builder Docs**: https://www.sanity.io/docs/structure-builder
- **GROQ Reference**: https://www.sanity.io/docs/groq
- **Document Internationalization Plugin**: https://www.sanity.io/plugins/document-internationalization

## Questions or Issues?

If you encounter problems not covered in this guide:

1. Check the research.md file for detailed technical context
2. Review the data-model.md for entity relationships
3. Examine the contracts/ directory for type definitions
4. Test with Vision plugin to debug GROQ queries
5. Check browser console for error messages
