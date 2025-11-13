# Data Model: Fix Language Switcher Translation Navigation

**Feature**: 006-fix-language-switcher
**Date**: 2025-11-13
**Status**: Complete

## Overview

This document defines the data structures and entities for the language switcher translation navigation feature. The model is based on the proven conciliainc.com pattern, adapted for this project's structure and next-intl integration.

---

## Core Entities

### 1. LocaleMapping

**Description**: A bidirectional lookup table that maps pathnames (with locale prefixes) to translation objects for all available language versions of documents.

**Purpose**: Enable instant O(1) lookup of translated slugs during language switching without additional API calls.

**TypeScript Interface**:
```typescript
/**
 * Maps pathname (including locale prefix) to translations for all languages
 *
 * @example
 * {
 *   "/blog/complete-guide": {
 *     "en": { slug: "/blog/complete-guide", title: "Complete Guide", ... },
 *     "fr": { slug: "/fr/blog/guide-complet", title: "Guide Complet", ... }
 *   },
 *   "/fr/blog/guide-complet": {
 *     "en": { slug: "/blog/complete-guide", title: "Complete Guide", ... },
 *     "fr": { slug: "/fr/blog/guide-complet", title: "Guide Complet", ... }
 *   }
 * }
 */
export interface LocaleMapping {
  [pathname: string]: LocaleTranslations;
}
```

**Key Characteristics**:
- **Bidirectional**: Both English and French slugs serve as keys
- **Includes locale prefix**: Keys are full pathnames (e.g., `/fr/blog/slug`, not just `slug`)
- **Includes document type prefix**: Keys include type prefixes (e.g., `/blog/`, `/fr/blog/`)
- **Immutable**: Created once at app startup, read-only thereafter
- **Serializable**: Can be passed from Server to Client Component via props

**Relationships**:
- Contains: Multiple `LocaleTranslations` objects (one per unique document)
- Used by: `LocaleContext`, `useLocale` hook, `LanguageSwitcher` component

---

### 2. LocaleTranslations

**Description**: Collection of all language versions of a single document, indexed by locale code.

**Purpose**: Group all translations of a document together for easy access during language switching.

**TypeScript Interface**:
```typescript
/**
 * All language versions of a single document
 *
 * @example
 * {
 *   "en": { slug: "/blog/complete-guide", title: "Complete Guide", _id: "abc123", _type: "blog" },
 *   "fr": { slug: "/fr/blog/guide-complet", title: "Guide Complet", _id: "def456", _type: "blog" }
 * }
 */
export interface LocaleTranslations {
  [locale: Locale]: TranslationMetadata;
}
```

**Key Characteristics**:
- **Locale-indexed**: Keys are locale codes (`'en' | 'fr'`)
- **Complete set**: Contains entries for all available translations (may be 1 if untranslated)
- **Symmetric**: If doc A translates to doc B, then doc B translates back to doc A
- **Type-safe**: Uses branded `Locale` type from `@workspace/i18n-config`

**Relationships**:
- Part of: `LocaleMapping`
- Contains: Multiple `TranslationMetadata` objects (one per language)
- Used by: Language switcher to lookup target translation

---

### 3. TranslationMetadata

**Description**: Metadata for a single language version of a document, including normalized slug, title, ID, and type.

**Purpose**: Provide minimal information needed for navigation and display without fetching full document content.

**TypeScript Interface**:
```typescript
/**
 * Metadata for a single language version of a document
 */
export interface TranslationMetadata {
  /** Slug with leading slash (e.g., "/mon-article", not "/blog/mon-article" or "mon-article") */
  slug: string;

  /** Document title in this language (for display) */
  title: string;

  /** Sanity document ID (for reference) */
  _id: string;

  /** Sanity document type (page, blog, homePage, blogIndex) */
  _type: DocumentType;
}
```

**Key Characteristics**:
- **Leading slash required**: Slugs are stored WITH leading slash (e.g., `/my-post` not `my-post`)
- **No document type prefix**: Slugs do NOT include document type prefix (e.g., `/my-post` not `/blog/my-post`)
- **Flat structure**: Blog slugs must be single-segment (e.g., `/my-post`, NOT `/category/my-post`)
- **Minimal**: Only includes fields needed for navigation/display
- **Sanity metadata**: Includes _id and _type for traceability
- **Read-only**: Immutable after creation

**Slug Format**:
- Sanity stores: `/my-post` (with leading slash, flat structure)
- LocaleMapping stores: `/my-post` (as-is from Sanity)
- Language switcher uses: Removes leading slash for next-intl params (`my-post` + pathname pattern `/blog/[slug]`)
- next-intl generates: `/en/blog/my-post` or `/fr/blogue/my-post`
- **Validation**: Enforces leading slash and single-segment flat structure (no nested paths like `/category/my-post`)

**Relationships**:
- Part of: `LocaleTranslations`
- Derived from: Sanity document + translation.metadata
- Used by: Language switcher for navigation with next-intl Link component

---

### 4. SanityLocalizedDocument

**Description**: Raw document structure returned from Sanity GROQ query, including document fields and joined translation metadata.

**Purpose**: Intermediate structure from Sanity API before transformation into `LocaleMapping`.

**TypeScript Interface**:
```typescript
/**
 * Document structure returned from queryAllLocalizedPages GROQ query
 */
export interface SanityLocalizedDocument {
  /** Sanity document ID */
  _id: string;

  /** Document type (page, blog, homePage, blogIndex) */
  _type: DocumentType;

  /** Document language (always 'en' for base query) */
  language: Locale;

  /** Document slug (without locale prefix) */
  slug: string;

  /** Document title */
  title: string;

  /** Joined translations from translation.metadata */
  _translations: Array<{
    _id: string;
    _type: DocumentType;
    language: Locale;
    slug: string;
    title: string;
  }>;
}
```

**Key Characteristics**:
- **Raw Sanity format**: Matches GROQ query projection exactly
- **Base language only**: Query filters to `language == 'en'`
- **Includes translations array**: Joined from `translation.metadata` documents
- **Transformation target**: Converted to `LocaleMapping` by `createLocaleMapping()`

**Relationships**:
- Returned by: `queryAllLocalizedPages` GROQ query
- Transformed by: `createLocaleMapping()` utility
- Source for: `LocaleMapping` construction

---

### 5. LocaleContextValue

**Description**: React Context value providing access to locale mapping and utility functions.

**Purpose**: Provide type-safe, hook-based access to translation data throughout the component tree.

**TypeScript Interface**:
```typescript
/**
 * React Context value for locale mapping
 */
export interface LocaleContextValue {
  /** Complete locale mapping (all documents, all languages) */
  localeMapping: LocaleMapping;

  /**
   * Lookup translations for a given pathname
   * @param pathname - Full pathname with locale prefix (e.g., "/fr/blog/slug")
   * @returns Translations for all languages, or undefined if not found
   */
  getTranslations: (pathname: string) => LocaleTranslations | undefined;
}
```

**Key Characteristics**:
- **Context-provided**: Made available via `LocaleProvider` React component
- **Hook-consumed**: Accessed via `useLocale()` custom hook
- **Memoized**: Value is memoized to prevent unnecessary re-renders
- **Type-safe**: Throws error if used outside provider

**Relationships**:
- Provided by: `LocaleProvider` component
- Consumed by: `useLocale()` hook
- Contains: `LocaleMapping` and utility functions
- Used by: `LanguageSwitcher` and any component needing translation lookups

---

## Supporting Types

### DocumentType

**Description**: Union type of all Sanity document types that support internationalization.

**TypeScript Definition**:
```typescript
/**
 * Sanity document types that support internationalization
 */
export type DocumentType = 'page' | 'blog' | 'homePage' | 'blogIndex';
```

**Usage**: Type safety for document type checking in mapping creation and slug generation.

---

### Locale

**Description**: Branded type for supported locale codes.

**TypeScript Definition**:
```typescript
/**
 * Supported locale codes
 * Imported from @workspace/i18n-config
 */
export type Locale = 'en' | 'fr';
```

**Source**: Defined in `packages/i18n-config/src/index.ts`

**Usage**: Type safety for locale codes throughout the application.

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. App Startup (Server Component)                           │
│    apps/web/src/app/[locale]/layout.tsx                     │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ fetchAllLocalizedPages()
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Sanity Query (GROQ)                                      │
│    apps/web/src/lib/sanity/query.ts                         │
│    queryAllLocalizedPages                                   │
│                                                              │
│    Returns: SanityLocalizedDocument[]                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ createLocaleMapping()
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Mapping Creation (Utility Function)                      │
│    apps/web/src/lib/sanity/locale-mapper.ts                 │
│    createLocaleMapping(documents)                           │
│                                                              │
│    Returns: LocaleMapping                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ <LocaleProvider localeMapping={...}>
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. React Context (Server → Client Boundary)                 │
│    apps/web/src/contexts/locale-context.tsx                 │
│    LocaleProvider component                                 │
│                                                              │
│    Provides: LocaleContextValue                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ useLocale() hook
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Client Component (Language Switcher)                     │
│    apps/web/src/components/language-switcher.tsx            │
│                                                              │
│    const { getTranslations } = useLocale();                 │
│    const translations = getTranslations(pathname);          │
│    const targetSlug = translations[newLocale].slug;         │
│    router.push(targetSlug);                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Validation Rules

### LocaleMapping Construction

1. **Bidirectionality**: Every document must have entries for both its English slug AND its French slug (if translated)
2. **Completeness**: Each entry must contain translations for all available languages for that document
3. **Slug uniqueness**: No two documents of the same type can have the same slug in the same language
4. **Flat structure**: Blog slugs must be single-segment (e.g., `my-post`, not `category/my-post`)

### Translation Metadata

1. **Slug format**: Stored as normalized flat string without prefixes (e.g., `my-post`, not `/blog/my-post`)
2. **Flat structure**: Must be single segment for blog posts (no slashes after normalization)
3. **Title presence**: Title must be non-empty string
4. **ID validity**: _id must match Sanity document ID format
5. **Type validity**: _type must be one of: `page | blog | homePage | blogIndex`

### Context Usage

1. **Provider requirement**: `useLocale()` hook must be called within `LocaleProvider` tree
2. **Pathname format**: `getTranslations(pathname)` expects full pathname with locale prefix
3. **Undefined handling**: Caller must handle undefined return value for untranslated pages

---

## Example Data

### Complete Example: Blog Post with French Translation

**Sanity Query Result**:
```typescript
{
  _id: "blog-abc123",
  _type: "blog",
  language: "en",
  slug: "/complete-guide", // NOTE: Stored WITH leading slash, WITHOUT /blog/ prefix
  title: "Complete Guide to Next.js",
  _translations: [
    {
      _id: "blog-abc123",
      _type: "blog",
      language: "en",
      slug: "/complete-guide",
      title: "Complete Guide to Next.js"
    },
    {
      _id: "blog-def456",
      _type: "blog",
      language: "fr",
      slug: "/guide-complet",
      title: "Guide Complet de Next.js"
    }
  ]
}
```

**After createLocaleMapping()** (slugs stored as-is):
```typescript
{
  // Lookup by current pathname (with locale + document type prefix)
  "/en/blog/complete-guide": {
    "en": {
      slug: "/complete-guide", // Stored as-is (with leading slash)
      title: "Complete Guide to Next.js",
      _id: "blog-abc123",
      _type: "blog"
    },
    "fr": {
      slug: "/guide-complet", // Stored as-is (with leading slash)
      title: "Guide Complet de Next.js",
      _id: "blog-def456",
      _type: "blog"
    }
  },
  // Bidirectional: also lookup by French pathname
  "/fr/blogue/guide-complet": {
    "en": {
      slug: "/complete-guide",
      title: "Complete Guide to Next.js",
      _id: "blog-abc123",
      _type: "blog"
    },
    "fr": {
      slug: "/guide-complet",
      title: "Guide Complet de Next.js",
      _id: "blog-def456",
      _type: "blog"
    }
  }
}
```

**Language Switcher Usage** (with next-intl):
```typescript
import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';

// User on /fr/blogue/guide-complet, switches to English
const currentPathname = usePathname(); // Returns "/fr/blogue/guide-complet"
const { getTranslations } = useLocale();
const translations = getTranslations(currentPathname);

const targetTranslation = translations["en"];
// { slug: "/complete-guide", _type: "blog", ... }

// Get pathname pattern for document type
const pathname = getPathnamePattern(targetTranslation._type);
// Returns "/blog/[slug]"

// Remove leading slash for next-intl params
const slug = targetTranslation.slug.replace(/^\//, '');
// slug = "complete-guide"

// Use next-intl Link component
<Link
  href={{
    pathname: "/blog/[slug]",
    params: { slug }
  }}
  locale="en"
>
  English
</Link>
// next-intl generates: /en/blog/complete-guide
```

**Note on Mapping Keys**: Keys are the full current URL paths (including locale and localized document type prefix). For French blog posts, the key uses `/blogue/` (not `/blog/`) because that's what appears in the actual URL.

---

## Edge Cases

### 1. Untranslated Document (English Only)

**Scenario**: Blog post exists only in English, no French translation

**Sanity Query Result**:
```typescript
{
  _id: "blog-xyz789",
  _type: "blog",
  language: "en",
  slug: "new-post",
  title: "Brand New Post",
  _translations: [
    {
      _id: "blog-xyz789",
      _type: "blog",
      language: "en",
      slug: "new-post",
      title: "Brand New Post"
    }
    // No French translation
  ]
}
```

**LocaleMapping Entry**:
```typescript
{
  "/blog/new-post": {
    "en": {
      slug: "/blog/new-post",
      title: "Brand New Post",
      _id: "blog-xyz789",
      _type: "blog"
    }
    // No "fr" key - translation doesn't exist
  }
}
```

**Language Switcher Behavior**:
```typescript
const translations = getTranslations("/blog/new-post");
const frenchSlug = translations["fr"]?.slug; // undefined
// Fallback: Navigate to /fr/blog/new-post anyway
// Next.js will render 404 page (per spec requirement)
```

---

### 2. Homepage Translation

**Scenario**: Homepage has special routing (no slug, just locale prefix)

**Sanity Query Result**:
```typescript
{
  _id: "homePage-home",
  _type: "homePage",
  language: "en",
  slug: "", // Homepage has no slug
  title: "Welcome",
  _translations: [
    {
      _id: "homePage-home",
      _type: "homePage",
      language: "en",
      slug: "",
      title: "Welcome"
    },
    {
      _id: "homePage-home-fr",
      _type: "homePage",
      language: "fr",
      slug: "",
      title: "Bienvenue"
    }
  ]
}
```

**LocaleMapping Entry**:
```typescript
{
  "/": {
    "en": { slug: "/", title: "Welcome", _id: "homePage-home", _type: "homePage" },
    "fr": { slug: "/fr", title: "Bienvenue", _id: "homePage-home-fr", _type: "homePage" }
  },
  "/fr": {
    "en": { slug: "/", title: "Welcome", _id: "homePage-home", _type: "homePage" },
    "fr": { slug: "/fr", title: "Bienvenue", _id: "homePage-home-fr", _type: "homePage" }
  }
}
```

---

### 3. BlogIndex Special Case

**Scenario**: Blog index page has fixed path `/blog`

**LocaleMapping Entry**:
```typescript
{
  "/blog": {
    "en": { slug: "/blog", title: "Blog", _id: "blogIndex-main", _type: "blogIndex" },
    "fr": { slug: "/fr/blog", title: "Blog", _id: "blogIndex-main-fr", _type: "blogIndex" }
  },
  "/fr/blog": {
    "en": { slug: "/blog", title: "Blog", _id: "blogIndex-main", _type: "blogIndex" },
    "fr": { slug: "/fr/blog", title: "Blog", _id: "blogIndex-main-fr", _type: "blogIndex" }
  }
}
```

---

## State Transitions

The `LocaleMapping` is immutable and has no state transitions. It is created once at app startup and remains constant until the next app restart or page refresh.

**Lifecycle**:
1. **Creation**: Built from Sanity query results in root layout (server-side)
2. **Serialization**: Passed as prop from Server Component to Client Component boundary
3. **Hydration**: Deserialized in client during React hydration
4. **Usage**: Read-only access via `useLocale()` hook
5. **Disposal**: Garbage collected when page unloads

**No mutations**: The mapping never changes after creation. New translations or slug updates require a page refresh to fetch updated data from Sanity.

---

## Performance Considerations

### Memory Usage

**Estimated size for 500 documents**:
- 500 documents × 2 languages = 1000 document entries
- Each entry: slug (50 bytes) + title (50 bytes) + _id (20 bytes) + _type (10 bytes) = 130 bytes
- Total per document: 130 bytes × 2 translations = 260 bytes
- Total for 500 documents: 260 bytes × 500 = 130 KB
- LocaleMapping keys (bidirectional): 130 KB × 2 = 260 KB
- **Total memory: ~260 KB** (negligible for modern browsers/servers)

### Lookup Performance

- **Time complexity**: O(1) for all lookups (hash map)
- **Worst case**: <1ms for hash collision resolution
- **Average case**: <0.1ms for direct hash access
- **No network calls**: All data pre-loaded, instant navigation

### Serialization

- **Server → Client transfer**: 260 KB gzipped to ~30 KB (JSON compresses well)
- **Hydration time**: <10ms to deserialize and initialize context
- **No blocking**: Wrapped in Suspense boundary, doesn't block page shell

---

## Future Considerations

### Scalability

**If document count grows beyond 1000**:
- Consider pagination or lazy loading strategies
- Implement incremental loading (fetch only current document's translations)
- Use service worker for client-side caching
- Split mapping by document type or route segment

### Additional Languages

**If adding more languages (e.g., Spanish)**:
- No schema changes required (Locale type extends to `'en' | 'fr' | 'es'`)
- Mapping size grows linearly (260 KB → 390 KB for 3 languages)
- Query remains single-pass (still only query base language)

### Dynamic Content

**If translations can be added/updated without page refresh**:
- Implement cache invalidation strategy (Sanity webhooks)
- Use SWR or React Query for automatic revalidation
- Consider WebSocket updates for real-time translation additions

---

## References

- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/
- **React Context API**: https://react.dev/reference/react/createContext
- **Sanity GROQ**: https://www.sanity.io/docs/how-queries-work
- **next-intl Types**: https://next-intl-docs.vercel.app/docs/usage/typescript
