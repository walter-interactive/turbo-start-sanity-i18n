# Quickstart Guide: Fix Language Switcher Translation Navigation

**Feature**: 006-fix-language-switcher
**Target**: Developers implementing this feature
**Time to Complete**: ~6-8 hours (includes Sanity Studio updates)

## Overview

This guide walks you through implementing the language switcher fix step-by-step. Follow the phases in order to ensure proper testing and integration.

---

## Prerequisites

Before starting, ensure you have:
- [x] Node.js 20+ installed
- [x] pnpm 10+ installed (project package manager)
- [x] Access to Sanity Studio (for testing translations)
- [x] Read the [research.md](./research.md) document (understanding the pattern)
- [x] Read the [data-model.md](./data-model.md) document (understanding data structures)
- [x] Familiarized yourself with conciliainc.com reference implementation

---

## Implementation Phases

### Phase 0: Configure next-intl Pathnames (20 min)

**Goal**: Set up localized pathname mapping for blog routes in routing configuration.

**Steps**:

1. **Open file**: `apps/web/src/i18n/routing.ts`

2. **Add pathnames configuration**:
   ```typescript
   export const routing = defineRouting({
     locales: LOCALES,
     defaultLocale: DEFAULT_LOCALE,
     localePrefix: "always" as const,
     pathnames: {
       // Homepage
       '/': {
         en: '/',
         fr: '/'
       },
       // Blog index
       '/blog': {
         en: '/blog',
         fr: '/blogue'
       },
       // Blog posts (dynamic route)
       '/blog/[slug]': {
         en: '/blog/[slug]',
         fr: '/blogue/[slug]'
       },
       // Regular pages (no prefix)
       '/[slug]': {
         en: '/[slug]',
         fr: '/[slug]'
       }
     }
   });
   ```

3. **Understand the mapping**:
   - English blog posts: `/en/blog/{slug}`
   - French blog posts: `/fr/blogue/{slug}` (localized "blogue")
   - next-intl automatically maps between these paths

**Verification**:
```bash
# Type check (next-intl types should recognize pathnames)
pnpm --filter web check-types

# Build to ensure routing config is valid
pnpm --filter web build
```

**Common Issues**:
- Ensure all pathname keys match actual route file paths
- Dynamic segments must use exact bracket notation: `[slug]` not `[id]` or `[...slug]`
- French "blogue" spelling is correct (not "blog")

---

### Phase 1: Create Locale Mapper Utility with Slug Normalization (45 min)

**Goal**: Build the utility function that transforms Sanity documents into the bidirectional lookup map with slug normalization.

**Steps**:

1. **Create the file**: `apps/web/src/lib/sanity/locale-mapper.ts`

2. **Import dependencies**:
   ```typescript
   import type { Locale } from '@/i18n/routing';
   import { DEFAULT_LOCALE, LOCALES } from '@/i18n/routing';
   import type {
     LocaleMapping,
     TranslationMetadata,
     SanityLocalizedDocument,
     DocumentType
   } from '@/specs/006-fix-language-switcher/contracts/locale-context-api';
   ```

3. **Note on slug format**:
   ```typescript
   /**
    * Slugs are stored WITH leading slash in Sanity
    * Examples:
    * - Blog post: "/my-amazing-post"
    * - Page: "/about-us"
    * 
    * For next-intl params, remove leading slash:
    * const slug = translation.slug.replace(/^\//, '');
    */
   ```

4. **Implement `getPathnamePattern()` helper**:
   ```typescript
   /**
    * Get next-intl pathname pattern for document type
    * Maps document type to route pattern defined in routing config
    */
   function getPathnamePattern(docType: DocumentType): string {
     switch (docType) {
       case 'homePage':
         return '/';
       case 'blogIndex':
         return '/blog';
       case 'blog':
         return '/blog/[slug]';
       case 'page':
         return '/[slug]';
       default:
         return '/[slug]';
     }
   }
   ```

5. **Implement `getLocalizedPathname()` helper**:
   ```typescript
   /**
    * Generate full pathname with locale and localized document type prefix
    * Uses next-intl's pathname config for localized prefixes
    */
   function getLocalizedPathname(
     slug: string,
     docType: DocumentType,
     locale: Locale
   ): string {
     // Remove leading slash from slug for path construction
     const slugContent = slug.replace(/^\//, '');
     const localePrefix = locale === 'en' ? 'en' : locale;

     // Get document type prefix based on locale
     let docTypePrefix = '';
     switch (docType) {
       case 'blog':
         docTypePrefix = locale === 'fr' ? 'blogue' : 'blog';
         break;
       case 'blogIndex':
         docTypePrefix = locale === 'fr' ? 'blogue' : 'blog';
         break;
       case 'page':
       case 'homePage':
         docTypePrefix = '';
         break;
     }

     // Build full pathname
     if (docType === 'homePage') {
       return `/${localePrefix}`;
     }
     if (docType === 'blogIndex') {
       return `/${localePrefix}/${docTypePrefix}`;
     }

     const parts = [localePrefix, docTypePrefix, slugContent].filter(Boolean);
     return `/${parts.join('/')}`;
   }
   ```

6. **Implement `createLocaleMapping()` function**:
   ```typescript
   export function createLocaleMapping(
     documents: SanityLocalizedDocument[]
   ): LocaleMapping {
     const mapping: LocaleMapping = {};

     for (const doc of documents) {
       if (!doc._translations || doc._translations.length === 0) continue;

       // Build translations object for this document
       const translations: Record<string, TranslationMetadata> = {};

       for (const translation of doc._translations) {
         // Slugs are stored as-is (with leading slash, e.g., "/my-post")
         translations[translation.language] = {
           slug: translation.slug,
           title: translation.title,
           _id: translation._id,
           _type: translation._type
         };
       }

       // Add bidirectional mappings (one for each language's pathname)
       for (const locale of LOCALES) {
         if (!translations[locale]) continue;

         const pathname = getLocalizedPathname(
           translations[locale].slug,
           translations[locale]._type,
           locale
         );

         mapping[pathname] = translations;
       }
     }

     return mapping;
   }
   ```

7. **Add JSDoc comments**:
   - Document function purpose, parameters, return values
   - Include usage examples
   - Document edge cases (legacy slugs, untranslated documents, homepage)

**Verification**:
```bash
# Type check
pnpm --filter web check-types

# Should compile without errors
```

**Key Points**:
- `normalizeSlug()` handles both `/blog/my-post` and `my-post` formats
- `getLocalizedPathname()` constructs full URLs like `/fr/blogue/mon-article`
- Mapping keys use localized document type prefixes (e.g., `/fr/blogue/` not `/fr/blog/`)
- Bidirectional: both English and French pathnames are keys

**Test Cases to Write** (do later in Phase 7):
- Blog post with legacy slug format (`/blog/my-post`)
- Blog post with new slug format (`my-post`)
- Regular page with both translations
- Homepage special case (empty slug)
- BlogIndex with `/blog` slug

---

### Phase 2: Extend Sanity Queries (20 min)

**Goal**: Add GROQ query to fetch all localized documents with translation metadata.

**Steps**:

1. **Open file**: `apps/web/src/lib/sanity/query.ts`

2. **Add new query after existing queries**:
   ```typescript
   export const queryAllLocalizedPages = defineQuery(`
     *[
       _type in ["page", "blog", "homePage", "blogIndex"] &&
       language == "en"
     ]{
       _id,
       _type,
       language,
       "slug": slug.current,
       title,
       ${translationsFragment}
     }
   `);
   ```

3. **Explanation**:
   - Filters to English documents only (base language)
   - Includes all translatable document types
   - Uses existing `translationsFragment` to join translation metadata
   - Returns minimal fields (only what's needed for navigation)

**Verification**:
```bash
# Type check (should regenerate Sanity types)
pnpm --filter web check-types

# Test query in Sanity Vision (optional)
# 1. Open Sanity Studio
# 2. Go to Vision tool
# 3. Paste query (without defineQuery wrapper)
# 4. Verify results structure matches SanityLocalizedDocument interface
```

---

### Phase 3: Create Locale Context (45 min)

**Goal**: Build React Context Provider and hook for accessing locale mapping.

**Steps**:

1. **Create directory**: `apps/web/src/contexts/` (if doesn't exist)

2. **Create file**: `apps/web/src/contexts/locale-context.tsx`

3. **Mark as Client Component**:
   ```typescript
   'use client';
   ```

4. **Import dependencies**:
   ```typescript
   import { createContext, useContext, useMemo } from 'react';
   import type {
     LocaleMapping,
     LocaleTranslations,
     LocaleContextValue,
     LocaleProviderProps
   } from '@/specs/006-fix-language-switcher/contracts/locale-context-api';
   ```

5. **Create context**:
   ```typescript
   const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);
   ```

6. **Implement LocaleProvider component**:
   - Accepts `localeMapping` prop
   - Creates memoized context value with `getTranslations()` helper
   - Wraps children in Context.Provider
   - Reference: conciliainc.com's `src/contexts/LocaleContext.tsx`

7. **Implement useLocale() hook**:
   - Calls `useContext(LocaleContext)`
   - Throws error if used outside provider
   - Returns LocaleContextValue
   - Type-safe with TypeScript

8. **Export public API**:
   ```typescript
   export { LocaleProvider, useLocale };
   ```

**Verification**:
```bash
# Type check
pnpm --filter web check-types

# Build (ensures client component boundary works)
pnpm --filter web build
```

**Common Issues**:
- "use client" directive must be at top of file
- Context value must be memoized to prevent unnecessary re-renders
- Error message should guide users to wrap component in LocaleProvider

---

### Phase 4: Update Root Layout (30 min)

**Goal**: Fetch all localized pages at app startup and provide mapping via context.

**Steps**:

1. **Open file**: `apps/web/src/app/[locale]/layout.tsx`

2. **Import new dependencies**:
   ```typescript
   import { queryAllLocalizedPages } from '@/lib/sanity/query';
   import { createLocaleMapping } from '@/lib/sanity/locale-mapper';
   import { LocaleProvider } from '@/contexts/locale-context';
   import { sanityFetch } from '@/lib/sanity/client';
   ```

3. **Create fetch function** (above component):
   ```typescript
   async function fetchAllLocalizedPages() {
     return await sanityFetch({
       query: queryAllLocalizedPages,
       stale: 60 // Cache for 60 seconds
     });
   }
   ```

4. **Update layout component**:
   - Fetch localized pages: `const localizedPages = await fetchAllLocalizedPages();`
   - Create mapping: `const localeMapping = createLocaleMapping(localizedPages);`
   - Wrap children in LocaleProvider: `<LocaleProvider localeMapping={localeMapping}>{children}</LocaleProvider>`

5. **Verify Server Component**:
   - Layout should remain a Server Component (no "use client")
   - LocaleProvider is a Client Component (handles context)
   - This crosses Server/Client boundary correctly

**Verification**:
```bash
# Build (Server Components + Client Components integration)
pnpm --filter web build

# Dev server (check for errors)
pnpm --filter web dev
# Navigate to any page
# Check browser console for errors
# Check server logs for query execution
```

**Performance Check**:
- Check server logs for query execution time (<100ms expected)
- Check browser DevTools Network tab for payload size (<50KB expected after gzip)
- Initial page load should not increase by more than 150ms

---

### Phase 5: Update Sanity Studio (60 min)

**Goal**: Update slug validation and URL preview to support new slug format and show localized URLs.

#### 5.1: Update Slug Validation (20 min)

**File**: `apps/studio/utils/slug-validation.ts`

**Steps**:

1. **Update blog validation config** (lines 99-118):
   ```typescript
   blog: {
     documentType: "Blog post",
     requiredPrefix: undefined,  // CHANGED: was "/blog/", now no prefix required
     requireSlash: true,          // CHANGED: REQUIRES leading slash (e.g., "/my-post")
     segmentCount: 1,             // CHANGED: was 2, now 1 to enforce flat structure (single segment)
     sanityDocumentType: "blog",
     forbiddenPatterns: [/^\/author/, /^\/admin/, /^\/blog\//],  // CHANGED: added /^\/blog\// to forbid old format
     customValidators: [
       (slug: string) => {
         if (!slug.startsWith('/')) {
           return ["Blog post slug must start with '/' (e.g., '/my-post')"];
         }

         // Remove leading slash to check content
         const slugContent = slug.slice(1);

         if (slugContent.length < MIN_BLOG_SLUG_LENGTH) {
           return ["Blog post slug must be at least 3 characters after '/'"];
         }

         // Enforce flat structure - no nested paths allowed
         if (slugContent.includes('/')) {
           return ["Blog post slugs must be flat (no slashes after leading slash). Use '/my-post', not '/category/my-post'"];
         }

         return [];
       },
     ],
   },
   ```

2. **Update slug generation** (lines 536-537):
   ```typescript
   case "blog":
     return `/${cleanTitle}`;  // CHANGED: was `/blog/${cleanTitle}`, now slug with leading slash
   ```

**Verification**:
- Create new blog post in Studio, verify slug generated with leading slash (e.g., `/my-post`)
- Try to save blog post with `/blog/` prefix, verify validation fails (forbidden pattern)
- Try to save blog post without leading slash, verify validation fails
- Try to save blog post with 1-character slug, verify validation fails
- Try to save blog post with nested slug `/category/my-post`, verify validation fails with flat structure message

#### 5.2: Update URL Preview (40 min)

**File**: `apps/studio/components/slug-field-component.tsx`

**Steps**:

1. **Import locale utilities** (add to top of file):
   ```typescript
   import { LOCALE_METADATA } from '@workspace/i18n-config';
   ```

2. **Add helper functions** (before SlugFieldComponent):
   ```typescript
   /**
    * Map document type to pathname base
    */
   function getPathnameForDocType(docType: string): string {
     switch (docType) {
       case 'blog': return 'blog';
       case 'blogIndex': return 'blog';
       case 'page': return '';
       case 'homePage': return '';
       default: return '';
     }
   }

   /**
    * Get localized path prefix (e.g., 'blog' → 'blogue' for French)
    */
   function getLocalizedPathPrefix(docType: string, locale: string): string {
     const pathname = getPathnameForDocType(docType);

     // French blog uses 'blogue'
     if (pathname === 'blog' && locale === 'fr') {
       return 'blogue';
     }

     return pathname;
   }
   ```

3. **Update localizedPathname useMemo** (lines 213-226):
   ```typescript
   const localizedPathname = useMemo(() => {
     try {
       // Get document language from context
       const documentLanguage = document.language || 'en';
       const localePrefix = documentLanguage === 'en' ? 'en' : documentLanguage;

       // Get localized document type prefix
       const pathPrefix = getLocalizedPathPrefix(documentType, documentLanguage);

       // Remove leading slash from slug for URL construction
       const slug = currentSlug.replace(/^\//, '');

       // Build full URL path
       const parts = [localePrefix, pathPrefix, slug].filter(Boolean);
       return `/${parts.join('/')}`;
     } catch {
       return currentSlug || "/";
     }
   }, [currentSlug, documentType, document.language]);
   ```

4. **Test all document types**:
   - English blog: Should show `/en/blog/my-post`
   - French blog: Should show `/fr/blogue/mon-article`
   - English page: Should show `/en/about-us`
   - French page: Should show `/fr/a-propos`

**Verification**:
```bash
# Build Studio
pnpm --filter studio build

# Dev server
pnpm --filter studio dev

# Manual testing:
# 1. Open English blog post - verify URL shows /en/blog/slug
# 2. Open French blog post - verify URL shows /fr/blogue/slug
# 3. Open legacy blog post with /blog/ slug - verify normalized correctly
# 4. Change document language - verify URL updates dynamically
```

---

### Phase 6: Update Language Switcher with Pathname Patterns (45 min)

**Goal**: Modify language switcher to use next-intl Link component with pathname patterns.

**Steps**:

1. **Open file**: `apps/web/src/components/language-switcher.tsx`

2. **Add helper function** (before component):
   ```typescript
   /**
    * Get pathname pattern for document type
    * Must match patterns defined in routing config
    */
   function getPathnamePattern(docType: string): string {
     switch (docType) {
       case 'homePage':
         return '/';
       case 'blogIndex':
         return '/blog';
       case 'blog':
         return '/blog/[slug]';
       case 'page':
         return '/[slug]';
       default:
         return '/[slug]';
     }
   }
   ```

3. **Import new dependencies**:
   ```typescript
   import { useLocale } from '@/contexts/locale-context';
   import { Link } from '@/i18n/navigation';
   import { usePathname } from 'next/navigation';  // NOT from @/i18n/navigation
   import type { Locale } from '@/i18n/routing';
   ```

4. **Update component logic**:
   ```typescript
   export function LanguageSwitcher() {
     const pathname = usePathname(); // Gets full pathname with locale
     const currentLocale = useLocale() as Locale;
     const { getTranslations } = useLocale();
     const [isPending, startTransition] = useTransition();

     const translations = getTranslations(pathname);

     return (
       <DropdownMenu>
         <DropdownMenuTrigger asChild>
           <Button
             aria-label="Switch language"
             disabled={isPending}
             size="icon"
             variant="outline"
           >
             <Languages className="size-4" />
             <span className="sr-only">Switch language</span>
           </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end">
           {LOCALES.map((locale) => {
             const isActive = locale === currentLocale;
             const translation = translations?.[locale];

             if (!translation) {
               // No translation available - still show option but disabled
               return (
                 <DropdownMenuItem
                   key={locale}
                   disabled
                   className="cursor-not-allowed"
                 >
                   <span className="flex items-center gap-2">
                     <span className="text-muted-foreground text-xs uppercase">
                       {locale}
                     </span>
                     <span className="text-muted-foreground">
                       {getLocaleName({ locale, native: true })}
                     </span>
                     <span className="ms-auto text-xs">(unavailable)</span>
                   </span>
                 </DropdownMenuItem>
               );
             }

             const pattern = getPathnamePattern(translation._type);
             const hasSlugParam = pattern.includes('[slug]');

             return (
               <Link
                 key={locale}
                 href={hasSlugParam
                   ? { pathname: pattern, params: { slug: translation.slug } }
                   : pattern
                 }
                 locale={locale}
                 onClick={() => {
                   // Track analytics
                   analytics.trackLanguageSwitch({
                     from: currentLocale,
                     to: locale,
                     pathname,
                   });
                 }}
               >
                 <DropdownMenuItem
                   disabled={isActive || isPending}
                   className="cursor-pointer"
                 >
                   <span className="flex items-center gap-2">
                     <span className="text-muted-foreground text-xs uppercase">
                       {locale}
                     </span>
                     <span>{getLocaleName({ locale, native: true })}</span>
                     {isActive && (
                       <span className="ms-auto text-muted-foreground text-xs">
                         ✓
                       </span>
                     )}
                   </span>
                 </DropdownMenuItem>
               </Link>
             );
           })}
         </DropdownMenuContent>
       </DropdownMenu>
     );
   }
   ```

5. **Key changes explained**:
   - `usePathname()` from `next/navigation` gets full pathname with locale
   - `getPathnamePattern()` maps document type to next-intl pathname pattern
   - `Link` component uses `{ pathname, params }` format for dynamic routes
   - `locale` prop tells next-intl which language to use
   - next-intl automatically converts `/blog/[slug]` → `/blogue/[slug]` for French

**Verification**:
```bash
# Type check
pnpm --filter web check-types

# Dev server
pnpm --filter web dev

# Manual testing:
# 1. Navigate to /en/blog/some-post
# 2. Click "Français" in language switcher
# 3. Verify navigation to /fr/blogue/translated-slug (NOT /fr/blog/same-slug)
# 4. Click "English" to switch back
# 5. Verify returns to /en/blog/some-post (round-trip consistency)
# 6. Test homepage, regular pages, blog index
```

**Common Issues**:
- Using `usePathname()` from `@/i18n/navigation` (returns pathname without locale prefix) - use `next/navigation` instead
- Forgetting to handle missing translations gracefully
- Not tracking analytics event
- Incorrect pathname pattern (must match routing config exactly)

---

### Phase 7: Write Tests (90 min)

**Goal**: Achieve 80%+ code coverage for the feature.

#### 7.1 Unit Tests: locale-mapper.ts (30 min)

**Create file**: `apps/web/src/__tests__/unit/locale-mapper.test.ts`

**Test cases**:
1. Creates bidirectional mapping for documents with translations
2. Handles documents with only one language (untranslated)
3. Generates correct slugs for homepage (no slug)
4. Generates correct slugs for blog posts (with /blog/ prefix)
5. Generates correct slugs for pages (no prefix)
6. Handles French locale prefix correctly
7. Returns empty mapping for empty input

**Example test**:
```typescript
describe('createLocaleMapping', () => {
  it('should create bidirectional mapping', () => {
    const documents: SanityLocalizedDocument[] = [
      {
        _id: '1',
        _type: 'blog',
        language: 'en',
        slug: 'test-post',
        title: 'Test Post',
        _translations: [
          { _id: '1', _type: 'blog', language: 'en', slug: 'test-post', title: 'Test Post' },
          { _id: '2', _type: 'blog', language: 'fr', slug: 'article-test', title: 'Article Test' }
        ]
      }
    ];

    const mapping = createLocaleMapping(documents);

    // English slug as key
    expect(mapping['/blog/test-post']).toBeDefined();
    expect(mapping['/blog/test-post']['en'].slug).toBe('/blog/test-post');
    expect(mapping['/blog/test-post']['fr'].slug).toBe('/fr/blog/article-test');

    // French slug as key (bidirectional!)
    expect(mapping['/fr/blog/article-test']).toBeDefined();
    expect(mapping['/fr/blog/article-test']['en'].slug).toBe('/blog/test-post');
    expect(mapping['/fr/blog/article-test']['fr'].slug).toBe('/fr/blog/article-test');
  });
});
```

#### 7.2 Unit Tests: locale-context.tsx (30 min)

**Create file**: `apps/web/src/__tests__/unit/locale-context.test.tsx`

**Test cases**:
1. useLocale() returns context value when inside provider
2. useLocale() throws error when outside provider
3. getTranslations() returns correct translations for valid pathname
4. getTranslations() returns undefined for invalid pathname
5. Context value is memoized (doesn't change between renders)

**Example test**:
```typescript
import { renderHook } from '@testing-library/react';
import { LocaleProvider, useLocale } from '@/contexts/locale-context';

describe('useLocale', () => {
  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useLocale());
    }).toThrow('useLocale must be used within LocaleProvider');
  });
});
```

#### 7.3 Integration Tests: language-switcher.tsx (30 min)

**Create file**: `apps/web/src/__tests__/integration/language-switcher.test.tsx`

**Test cases**:
1. Renders language options correctly
2. Switches language when option clicked
3. Tracks analytics event on language switch
4. Navigates to correct translated slug
5. Handles missing translations (shows 404 link)
6. Disables current language option
7. Shows loading state during transition

**Example test**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { LocaleProvider } from '@/contexts/locale-context';

describe('LanguageSwitcher', () => {
  it('should navigate to translated slug on click', () => {
    const mockMapping = {
      '/blog/test': {
        'en': { slug: '/blog/test', title: 'Test', _id: '1', _type: 'blog' },
        'fr': { slug: '/fr/blog/test-fr', title: 'Test FR', _id: '2', _type: 'blog' }
      }
    };

    render(
      <LocaleProvider localeMapping={mockMapping}>
        <LanguageSwitcher />
      </LocaleProvider>
    );

    const frenchButton = screen.getByText(/français/i);
    fireEvent.click(frenchButton);

    // Assert navigation occurred (check router mock or Link href)
  });
});
```

**Running tests**:
```bash
# All tests
pnpm --filter web test

# Watch mode
pnpm --filter web test -- --watch

# Coverage report
pnpm --filter web test -- --coverage
```

---

### Phase 8: E2E Tests (60 min)

**Goal**: Verify full user workflows with Playwright.

**Create file**: `apps/web/src/__tests__/e2e/language-switching.spec.ts`

**Test scenarios**:

1. **Successful translation navigation**:
   - Start on /en/blog/post-1
   - Click French in language switcher
   - Verify navigation to /fr/blog/article-1
   - Verify page content is in French
   - Click English in language switcher
   - Verify return to /en/blog/post-1 (round-trip)

2. **Missing translation 404**:
   - Create a document in English only (no French translation)
   - Navigate to English version
   - Click French in language switcher
   - Verify 404 page is shown
   - Verify URL is /fr/blog/...

3. **Homepage translation**:
   - Start on / (English homepage)
   - Click French
   - Verify navigation to /fr (French homepage)
   - Verify different content

4. **Analytics tracking**:
   - Mock analytics service
   - Switch language
   - Verify trackLanguageSwitch was called with correct params

**Example test**:
```typescript
import { test, expect } from '@playwright/test';

test('should navigate to translated slug', async ({ page }) => {
  await page.goto('/en/blog/complete-guide');

  // Open language switcher
  await page.click('[aria-label="Switch language"]');

  // Click French option
  await page.click('text=Français');

  // Wait for navigation
  await page.waitForURL('/fr/blog/guide-complet');

  // Verify we're on French version
  expect(page.url()).toContain('/fr/blog/guide-complet');

  // Verify content is in French (check for French text)
  await expect(page.locator('h1')).toContainText('Guide Complet');
});
```

**Running E2E tests**:
```bash
# Install browsers (first time only)
pnpm exec playwright install

# Run tests
pnpm --filter web test:e2e

# Run in UI mode (debugging)
pnpm exec playwright test --ui
```

---

### Phase 9: Final Verification (30 min)

**Goal**: Ensure all quality gates pass before merging.

**Checklist**:

1. **Type Checking**:
   ```bash
   pnpm check-types
   # Must pass with zero errors
   ```

2. **Linting**:
   ```bash
   pnpm lint
   # Must pass with zero errors
   ```

3. **Build**:
   ```bash
   pnpm build
   # Must succeed for all workspaces
   ```

4. **Tests**:
   ```bash
   pnpm --filter web test
   # Must pass with 80%+ coverage
   ```

5. **E2E Tests**:
   ```bash
   pnpm --filter web test:e2e
   # All scenarios must pass
   ```

6. **Manual Testing**:
   - [ ] Start dev server: `pnpm dev`
   - [ ] Test English → French navigation on blog post
   - [ ] Test French → English navigation on blog post
   - [ ] Test round-trip consistency (FR → EN → FR returns to original slug)
   - [ ] Test homepage translation
   - [ ] Test blog index translation
   - [ ] Test untranslated page (should show 404 in target language)
   - [ ] Check browser console for errors
   - [ ] Check Network tab for reasonable payload sizes
   - [ ] Check Performance tab for <150ms load time increase

7. **Documentation**:
   - [ ] All functions have JSDoc comments
   - [ ] Complex logic has inline comments
   - [ ] TypeScript interfaces are documented
   - [ ] Example usage is provided

---

## Common Issues & Solutions

### Issue 1: "useLocale must be used within LocaleProvider"

**Cause**: Component using `useLocale()` is not wrapped in `<LocaleProvider>`.

**Solution**: Check component tree. LocaleProvider must be in root layout, wrapping all routes.

---

### Issue 2: Language switcher navigates to 404 even though translation exists

**Cause**: Slug mapping is incorrect (likely issue with URL prefix generation).

**Solution**:
1. Check `getLocalizedSlug()` logic in locale-mapper.ts
2. Verify locale prefix is correct (`/fr` for French, none for English)
3. Verify document type prefix is correct (`/blog/` for blog, none for page)
4. Check Sanity query to ensure slugs are returned without prefixes
5. Debug by logging the LocaleMapping in browser console

---

### Issue 3: Round-trip navigation goes to wrong slug

**Cause**: Mapping is not truly bidirectional (only one direction indexed).

**Solution**:
1. Verify `createLocaleMapping()` adds entries for ALL translated slugs
2. Example: Both `/blog/post` AND `/fr/blog/article` should be keys
3. Both keys should point to same translations object

---

### Issue 4: Initial page load is slow (>150ms increase)

**Cause**: Too much data fetched, or query is slow.

**Solution**:
1. Check Sanity query projection (only fetch needed fields)
2. Verify Sanity CDN is being hit (check response headers)
3. Add caching to `sanityFetch` (stale: 60 seconds)
4. Consider pagination if document count is very high (>1000)

---

### Issue 5: TypeScript errors about missing types

**Cause**: Contract types not imported correctly.

**Solution**:
1. Import types from contract file: `@/specs/006-fix-language-switcher/contracts/locale-context-api`
2. Ensure contract file is in TypeScript path (should be automatic)
3. Run `pnpm check-types` to regenerate type cache

---

## Performance Benchmarks

Expected performance targets:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Sanity query time | <100ms | Check server logs during page load |
| Mapping creation time | <5ms | Add `console.time()` around createLocaleMapping() |
| Context hydration time | <10ms | Check React DevTools Profiler |
| Total initial load impact | <150ms | Compare Lighthouse scores before/after |
| Language switch time | <200ms | Time from click to page render |
| Memory usage (mapping) | <500KB | Check browser DevTools Memory tab |

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests pass (unit, integration, e2e)
- [ ] Code review approved
- [ ] Feature flag enabled (if using feature flags)
- [ ] Sanity production data includes proper translations
- [ ] Analytics tracking verified in staging environment
- [ ] Performance benchmarks meet targets
- [ ] Lighthouse score does not degrade
- [ ] Accessibility audit passes (WCAG 2.1 AA)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile testing (iOS, Android)

---

## Rollback Plan

If issues are discovered in production:

1. **Immediate**: Revert the PR (git revert)
2. **Deploy**: Trigger production deployment of reverted code
3. **Verify**: Confirm old behavior is restored
4. **Debug**: Fix issues in development environment
5. **Re-deploy**: After fixes are verified, re-deploy feature

**Feature flag alternative**: If using feature flags, simply disable the flag instead of reverting code.

---

## Next Steps

After completing this feature:

1. **Monitor**: Watch error logs for any issues with missing translations or 404s
2. **Analyze**: Check analytics to see which language switches are most common
3. **Optimize**: If needed, implement lazy loading for large translation mappings
4. **Iterate**: Gather user feedback on language switching experience

---

## Resources

- **Reference implementation**: `~/walter-interactive/conciliainc.com`
- **Research doc**: [research.md](./research.md)
- **Data model doc**: [data-model.md](./data-model.md)
- **API contract**: [contracts/locale-context-api.ts](./contracts/locale-context-api.ts)
- **Next.js 15 docs**: https://nextjs.org/docs
- **next-intl docs**: https://next-intl-docs.vercel.app
- **Sanity GROQ**: https://www.sanity.io/docs/how-queries-work

---

## Support

If you encounter issues not covered in this guide:

1. Check the [Common Issues](#common-issues--solutions) section
2. Review the reference implementation in conciliainc.com
3. Consult the research.md document for technical decisions
4. Ask in team Slack channel (#dev-help)
5. Create an issue in GitHub with reproduction steps
