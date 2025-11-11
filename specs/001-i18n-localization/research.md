# Research: Multi-Language Website Support

**Feature**: 001-i18n-localization  
**Date**: 2025-11-06  
**Status**: Complete

## Overview

This document consolidates research findings for implementing comprehensive multi-language support using next-intl for frontend internationalization and @sanity/document-internationalization for CMS content management.

---

## 1. Frontend Internationalization Strategy

### Decision: Use next-intl with App Router integration

**Rationale:**
- Official i18n solution recommended for Next.js 15+ App Router
- Built-in support for subdirectory routing (/en/, /fr/)
- Seamless integration with Next.js SSR/SSG capabilities
- Type-safe translation keys with TypeScript support
- Automatic locale detection via middleware
- Static rendering compatible with proper configuration

**Alternatives Considered:**
- **next-i18next**: Pages Router focused, not optimized for App Router
- **react-intl**: Requires more manual setup, no built-in routing
- **Custom solution**: High maintenance burden, reinventing solved problems

**Implementation Pattern:**

```typescript
// src/i18n/routing.ts - Central routing configuration
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'], // French default for Quebec compliance
  defaultLocale: 'fr'
});
```

**Key Configuration Files:**
- `src/i18n/routing.ts` - Locale configuration and routing setup
- `src/i18n/navigation.ts` - Type-safe navigation API wrappers
- `src/i18n/request.ts` - Server-side locale detection
- `src/middleware.ts` - Automatic locale routing and detection
- `messages/` - Translation JSON files at app root

---

## 2. CMS Content Translation Strategy

### Decision: Use @sanity/document-internationalization for document-level translations

**Rationale:**
- Official Sanity plugin for document-level translations
- Creates separate documents for each language version
- Allows independent publishing workflows per language
- Links translations via `translation.metadata` reference documents
- Best suited for content where all/most fields require translation (pages, blog posts)
- Supports asynchronous language configuration
- Built-in UI for managing translations in Sanity Studio

**Alternatives Considered:**
- **Field-level translation (sanity-plugin-internationalized-array)**: Better for documents with mixed translatable/common fields, but lesson/page content is fully translatable
- **Custom reference system**: High maintenance, lacks UI integration
- **Localized objects**: Doesn't scale well for many languages, high attribute usage

**Why Document-Level vs Field-Level:**
- **Document-level chosen for**: Pages, blog posts, lessons (all fields are language-specific)
- **Field-level better for**: Person schema (name/image global, biography translated)
- Our content types (page, blog, navigation) have predominantly language-specific fields

**Implementation Pattern:**

```typescript
// apps/studio/sanity.config.ts
import {documentInternationalization} from '@sanity/document-internationalization'

export default defineConfig({
  plugins: [
    documentInternationalization({
      supportedLanguages: [
        {id: 'fr', title: 'Français'},
        {id: 'en', title: 'English'}
      ],
      schemaTypes: ['page', 'blog', 'navbar', 'footer', 'settings'],
      languageField: 'language',
      weakReferences: false,
      apiVersion: '2025-02-19'
    })
  ]
})
```

---

## 3. URL Structure Pattern

### Decision: Subdirectory-based routing with locale segments

**Rationale:**
- Best for SEO (clear language signals in URL)
- Simpler deployment (single domain)
- Better for CDN caching
- next-intl App Router pattern: `/[locale]/...` dynamic segment
- Aligns with Quebec standards for multi-language sites

**URL Examples:**
- French (default): `/fr/` or `/fr/a-propos`
- English: `/en/about`
- Root `/` redirects based on browser preference or default locale

**Alternatives Considered:**
- **Domain-based** (en.example.com): More complex deployment, higher cost
- **Query parameters** (?lang=en): Poor SEO, not user-friendly
- **Subdomains** (en.example.com): DNS complexity, certificate management

---

## 4. Locale Detection Strategy

### Decision: Multi-tier detection with fallback chain

**Rationale:**
- Respects user preferences while ensuring content accessibility
- Complies with Quebec language law defaults (French first)
- Allows explicit user override via language switcher

**Detection Order:**
1. **Explicit user selection** (stored in cookie/localStorage) - highest priority
2. **URL locale parameter** ([locale] segment)
3. **Accept-Language header** (browser preference)
4. **Default locale** (French) - fallback

**Implementation:**

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);
```

**Browser Preference Persistence:**
- Cookie: `NEXT_LOCALE` (set by next-intl middleware)
- Session persistence across browser restarts
- Overwrites on explicit language change

---

## 5. Translation Data Model

### Decision: Separate translation.metadata document linking language versions

**Rationale:**
- Cleaner transaction history per language
- Independent publishing workflows
- Easier deletion of language versions
- No "base language" requirement
- Better scales with many languages

**Data Structure:**

```
Document: page (_id: page-about-fr)
├─ language: "fr"
└─ content fields...

Document: page (_id: page-about-en)
├─ language: "en"
└─ content fields...

Document: translation.metadata (_id: auto-generated)
└─ translations: [
    {_key: "fr", value: {_ref: "page-about-fr"}},
    {_key: "en", value: {_ref: "page-about-en"}}
   ]
```

**Alternatives Considered:**
- **Inline translation array**: Messy history, requires base language
- **Separate collection per language**: Query complexity, no relationship tracking
- **Field-level in single doc**: Doesn't allow independent publishing

**Document Quota Impact:**
- 1 document per language version
- 1 metadata document per translated content set
- Example: 100 pages × 2 languages = 200 page docs + 100 metadata docs = 300 total

---

## 6. GROQ Query Pattern for Translations

### Decision: Use references() function with translation.metadata resolution

**Rationale:**
- Efficient single-query retrieval of all language versions
- Works with both individual and list queries
- Supports language filtering at query time
- Compatible with GraphQL alternative queries

**Implementation:**

```groq
// Get document with all translations
*[_type == "page" && slug.current == $slug && language == $language][0]{
  _id,
  title,
  slug,
  content,
  language,
  "_translations": *[
    _type == "translation.metadata" 
    && references(^._id)
  ][0].translations[].value->{
    _id,
    slug,
    language,
    title
  }
}
```

**Fallback Pattern with coalesce():**

```groq
*[_type == "page" && slug.current == $slug][0]{
  "title": coalesce(
    select(
      language == $targetLang => title
    ),
    select(
      language == $defaultLang => title
    ),
    title
  )
}
```

---

## 7. Static Rendering Strategy

### Decision: Use setRequestLocale() for static generation compatibility

**Rationale:**
- Next.js App Router defaults to dynamic rendering with locale detection
- Static rendering improves performance and reduces serverless costs
- next-intl provides temporary API until Next.js native solution
- Required for build-time page generation

**Implementation Pattern:**

```typescript
// app/[locale]/page.tsx
import {setRequestLocale} from 'next-intl/server';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale); // Enable static rendering
  
  // Now use next-intl hooks
  const t = useTranslations('HomePage');
  return <h1>{t('title')}</h1>;
}
```

**Requirements:**
1. Add `generateStaticParams()` to layout or pages
2. Call `setRequestLocale(locale)` before using i18n hooks
3. Validate locale in root layout
4. Use locale param in metadata generation

---

## 8. SEO and Metadata Strategy

### Decision: Comprehensive hreflang and language-specific metadata

**Rationale:**
- Required for proper search engine indexing
- Prevents duplicate content penalties
- Enables language-specific search results
- Supports geographic targeting for Quebec

**Implementation Requirements:**

1. **hreflang tags** (in layout.tsx):
```typescript
export async function generateMetadata({params}) {
  const {locale} = await params;
  return {
    alternates: {
      languages: {
        'fr': '/fr',
        'en': '/en',
        'x-default': '/fr' // Default for Quebec
      }
    }
  }
}
```

2. **HTML lang attribute**:
```tsx
<html lang={locale}>
```

3. **Language-specific Open Graph tags**:
```typescript
openGraph: {
  locale: locale,
  alternateLocale: ['en', 'fr'].filter(l => l !== locale)
}
```

4. **Sitemap with language variants**:
- Generate sitemap including all language versions
- Use `<xhtml:link rel="alternate">` annotations

---

## 9. Language Switcher UX Pattern

### Decision: Dropdown/toggle with current language indicator

**Rationale:**
- Accessible and familiar UI pattern
- Shows current language clearly
- Maintains context when switching (same page in new language)
- Fits in navbar without excessive space

**Component Requirements:**

```typescript
// src/components/language-switcher.tsx
import {usePathname, Link} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';

export function LanguageSwitcher() {
  const pathname = usePathname();
  
  return (
    <div>
      {routing.locales.map((locale) => (
        <Link key={locale} href={pathname} locale={locale}>
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
```

**Features:**
- Persist to same page path in new language
- Show all available languages
- Indicate current language
- Handle missing translations with fallback notice

---

## 10. Sanity Schema Configuration

### Decision: Add language field to all translatable document types

**Rationale:**
- Required by @sanity/document-internationalization plugin
- Enables language filtering in queries
- Allows manual language override if needed (though hidden by default)

**Schema Pattern:**

```typescript
// apps/studio/schemaTypes/documents/page.ts
import {defineField, defineType} from 'sanity'

export const pageType = defineType({
  name: 'page',
  type: 'document',
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    // ... other fields
  ]
})
```

**Document Types Requiring Language Field:**
- page
- blog
- blog-index
- navbar
- footer
- settings
- home-page
- faq

---

## 11. Translation Workflow in Sanity Studio

### Decision: Use plugin's built-in translation UI

**Rationale:**
- Provides "Create translation" action in document menu
- Shows translation status badges
- Links between language versions
- Handles metadata document creation automatically

**Workflow:**
1. Content editor creates document in default language (French)
2. Publishes when ready
3. Clicks "Create translation" → selects English
4. Plugin duplicates document structure, creates linked English version
5. Editor translates content in English version
6. Publishes English version independently

**Optional Enhancement:**
- Bulk publishing feature (requires Scheduling API access)
- AI Assist translation (separate plugin integration)

---

## 12. Message (Translation) File Structure

### Decision: Flat JSON files with namespaced keys

**Rationale:**
- next-intl default pattern
- Simple to manage and edit
- Good TypeScript inference
- Scalable namespace organization

**File Structure:**

```
messages/
├── en.json
└── fr.json
```

**Key Naming Convention:**

```json
{
  "common": {
    "buttons": {
      "save": "Save",
      "cancel": "Cancel"
    }
  },
  "navigation": {
    "home": "Home",
    "about": "About"
  },
  "blog": {
    "readMore": "Read more",
    "publishedOn": "Published on {date}"
  }
}
```

**Usage:**

```typescript
const t = useTranslations('common.buttons');
return <button>{t('save')}</button>;
```

---

## 13. Fallback Content Strategy

### Decision: Multi-level fallback with user notification

**Rationale:**
- Prevents broken experiences when translations incomplete
- Informs users when viewing non-preferred language
- Allows progressive translation (publish base language first)

**Fallback Hierarchy:**
1. **Requested language** (user selected)
2. **Default language** (French)
3. **Any available language**
4. **Error state** (content not available)

**UI Pattern:**

```tsx
{isShowingFallback && (
  <Notice>
    This page is not available in English. Showing French version.
  </Notice>
)}
```

**Field-Level Fallback in GROQ:**

```groq
"title": coalesce(
  title[$language],
  title[$defaultLanguage],
  "Untranslated"
)
```

---

## 14. Type Safety Strategy

### Decision: Generate TypeScript types for translations and documents

**Rationale:**
- Catch translation key typos at compile time
- Autocomplete for translation keys
- Sanity typegen for locale-aware document types
- Improved developer experience

**Implementation:**

1. **Sanity Types** (auto-generated):
```bash
pnpm --filter studio type
```

Generated types include language field:
```typescript
export type Page = {
  _type: 'page';
  language: 'en' | 'fr';
  title: string;
  // ...
}
```

2. **next-intl Types** (via TypeScript module augmentation):
```typescript
// global.d.ts
type Messages = typeof import('./messages/en.json');

declare interface IntlMessages extends Messages {}
```

---

## 15. Testing Strategy

### Decision: Multi-layer testing approach

**Rationale:**
- Constitution Principle III requires test coverage
- i18n logic needs validation at multiple levels
- Manual testing required for Studio UI (no E2E framework)

**Test Layers:**

1. **Unit Tests**:
   - Locale detection logic
   - Translation fallback functions
   - Language switcher component
   - GROQ query helpers

2. **Integration Tests**:
   - GROQ queries return correct language documents
   - Middleware locale routing
   - API routes with locale parameters

3. **Contract Tests**:
   - Sanity schema includes language field
   - translation.metadata structure validation
   - Next.js route structure

4. **Manual Testing** (Sanity Studio):
   - Create translation workflow
   - Translation status badges
   - Language field auto-population
   - Metadata document creation

**Test Examples:**

```typescript
// Unit test - locale detection
describe('getPreferredLocale', () => {
  it('should return user-selected locale from cookie', () => {
    const locale = getPreferredLocale({
      cookie: 'fr',
      acceptLanguage: 'en',
      default: 'fr'
    });
    expect(locale).toBe('fr');
  });
});

// Integration test - GROQ query
describe('getPageWithTranslations', () => {
  it('should return page with all language versions', async () => {
    const result = await client.fetch(pageQuery, {
      slug: 'about',
      language: 'en'
    });
    expect(result.language).toBe('en');
    expect(result._translations).toHaveLength(2);
  });
});
```

---

## 16. Performance Considerations

### Decision: Optimize for static generation and caching

**Rationale:**
- Static pages have best performance
- CDN caching works better with static routes
- Reduces serverless function invocations
- Better user experience with instant page loads

**Optimization Strategies:**

1. **Static Generation** (when possible):
   - Use `generateStaticParams()` for known locales
   - Call `setRequestLocale()` in all layouts/pages
   - Pre-render all language versions at build time

2. **ISR for dynamic content**:
   - Revalidate: 3600 (1 hour) for blog posts
   - On-demand revalidation via webhook from Sanity

3. **Translation file optimization**:
   - Keep message files small (<50KB)
   - Load only needed namespaces per page
   - Consider code splitting for large translation sets

4. **GROQ Query optimization**:
   - Fetch only needed fields
   - Use projections to reduce payload
   - Cache translation metadata lookups

**Build Time Budget:**
- Target: < 5 minutes total build (per constitution)
- Per-language build overhead: ~30 seconds acceptable
- 2 languages: should stay under 5 minute limit

---

## 17. Content Migration Strategy

### Decision: Gradual migration with metadata creation

**Rationale:**
- Existing content in single language can remain
- Add translations incrementally as needed
- Plugin supports `allowCreateMetaDoc` for linking existing docs

**Migration Steps:**

1. **Phase 1**: Install plugin, add language field to schemas
2. **Phase 2**: Run script to add default language to existing documents
3. **Phase 3**: Create translations as needed via Studio UI
4. **Phase 4**: Metadata documents created automatically on translation

**Migration Script Pattern:**

```typescript
// scripts/add-language-field.ts
const documents = await client.fetch(`*[_type in $types && !defined(language)]`, {
  types: ['page', 'blog', 'navbar', 'footer']
});

const transaction = documents.reduce((tx, doc) => {
  return tx.patch(doc._id, {set: {language: 'fr'}});
}, client.transaction());

await transaction.commit();
```

---

## 18. Error Handling and Edge Cases

### Decision: Graceful degradation with clear user feedback

**Rationale:**
- Better user experience than hard errors
- Allows partial translation scenarios
- Helps content editors identify missing translations

**Edge Case Handling:**

1. **Invalid locale in URL** → Redirect to default locale
2. **Missing translation** → Show default language with notice
3. **Metadata document missing** → Create on first translation
4. **Partial field translation** → Use coalesce fallback
5. **Deleted translation** → Remove from metadata, keep other versions
6. **Concurrent edits** → Sanity's eventual consistency handles

**Error Logging:**

```typescript
if (!hasTranslation) {
  console.warn(`Translation missing for ${slug} in ${locale}`);
  // Track in analytics/monitoring
  analytics.track('translation_fallback', {slug, locale});
}
```

---

## 19. Extensibility for Future Languages

### Decision: Configuration-driven language list

**Rationale:**
- Easy to add new languages without code changes
- Scales to many languages efficiently
- Can be dynamic (fetch from Sanity)

**Adding a New Language:**

1. Add to routing config:
```typescript
export const routing = defineRouting({
  locales: ['fr', 'en', 'es'], // Added Spanish
  defaultLocale: 'fr'
});
```

2. Add message file: `messages/es.json`

3. Sanity plugin auto-detects (if using static config)

4. Generate static params automatically includes new locale

**Dynamic Language Configuration** (future):

```typescript
// Fetch from Sanity dataset
documentInternationalization({
  supportedLanguages: (client) => 
    client.fetch(`*[_type == "language"]{id, title}`)
})
```

---

## 20. Development Workflow

### Decision: Monorepo with independent workspace development

**Rationale:**
- Web and Studio can be developed independently
- TurboRepo caching benefits
- Shared TypeScript types via workspace packages (if needed)

**Dev Commands:**

```bash
# Start web app with hot reload
pnpm --filter web dev

# Start Sanity Studio
pnpm --filter studio dev

# Type check all workspaces
pnpm check-types

# Build all workspaces
pnpm build
```

**Type Generation Workflow:**

```bash
# After schema changes
pnpm --filter studio type

# Regenerates: apps/studio/sanity.typegen.ts
# Web app imports these types via relative path or workspace package
```

---

## Summary of Key Decisions

| Aspect | Decision | Primary Rationale |
|--------|----------|-------------------|
| **Frontend i18n** | next-intl | Official Next.js 15 App Router solution |
| **CMS i18n** | @sanity/document-internationalization | Separate docs, independent publishing |
| **URL Structure** | Subdirectory (/en/, /fr/) | SEO, simplicity, caching |
| **Default Language** | French | Quebec compliance, Bill 101 |
| **Locale Detection** | Multi-tier (cookie → URL → header → default) | User preference with fallback |
| **Data Model** | translation.metadata linking | Clean history, no base language |
| **Rendering** | Static with setRequestLocale() | Performance, cost efficiency |
| **SEO** | hreflang + lang attr + sitemap | Search engine best practices |
| **Translation Storage** | messages/ JSON files | Simple, type-safe, scalable |
| **Fallback Strategy** | Multi-level with user notice | Graceful degradation |
| **Type Safety** | Generated types + augmentation | Compile-time safety |
| **Testing** | Unit + integration + manual | Comprehensive coverage |

---

## Next Steps

With research complete, proceed to **Phase 1: Design & Contracts** to create:
1. `data-model.md` - Entity relationships and translation structures
2. `contracts/` - Configuration files, schemas, and query patterns
3. `quickstart.md` - Developer onboarding guide
4. Update agent context with new technologies and patterns

---

**Research Status**: ✅ Complete  
**Ready for Phase 1**: Yes  
**Outstanding Questions**: None
