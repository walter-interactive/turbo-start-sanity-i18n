# Research: Fix Language Switcher Translation Navigation

**Feature**: 006-fix-language-switcher
**Date**: 2025-11-13
**Status**: Complete

## Overview

This document captures research findings and technical decisions for implementing correct translation navigation in the language switcher. The implementation is based on a proven pattern from the conciliainc.com project, adapted for next-intl routing.

---

## Research Areas

### 1. Translation Fetching Strategy

**Question**: When and how should we fetch translation metadata for all documents?

**Decision**: Fetch all localized documents at app startup in the root layout (Server Component)

**Rationale**:
- **Performance**: Single initial fetch eliminates per-page translation lookups
- **Data volume**: Estimated <500 documents (well within Next.js SSR limits)
- **Proven pattern**: conciliainc.com uses this approach successfully
- **Next.js 15 App Router support**: Server Components in root layouts can perform async data fetching
- **Cache benefits**: Data is fetched once per request and shared across all components in the tree

**Alternatives Considered**:
1. **On-demand fetching per page** - Rejected: Adds network latency to every language switch, requires client-side Sanity client
2. **Static generation at build time** - Rejected: Doesn't work with ISR/dynamic content, requires full rebuild for new translations
3. **Edge caching with middleware** - Rejected: Adds complexity, middleware has execution time limits, less type-safe

**Implementation Details**:
- Fetch in `apps/web/src/app/[locale]/layout.tsx` (root layout for locale segment)
- Use existing `sanityFetch` utility with proper caching strategy
- Pass data to client components via React Context (hydration-safe)

---

### 2. Locale Mapping Data Structure

**Question**: What data structure provides optimal performance for slug-to-translation lookups?

**Decision**: Bidirectional hash map indexed by full pathname (with locale prefix)

**Rationale**:
- **O(1) lookup time**: Hash map provides instant access regardless of document count
- **Bidirectional**: Both English and French slugs serve as keys, enabling lookups from any language
- **Full pathname keys**: Includes locale prefix and document type prefix (e.g., `/blog/`, `/fr/blog/`)
- **Memory efficiency**: At ~500 documents × 2 languages × 4 translations per entry ≈ 4KB total (negligible)

**Data Structure**:
```typescript
interface LocaleMapping {
  [pathname: string]: {
    [language: string]: {
      slug: string;
      title: string;
      _id: string;
      _type: string;
    };
  };
}

// Example:
{
  "/blog/complete-guide": {
    "en": { slug: "/complete-guide", title: "Complete Guide", _id: "...", _type: "blog" },
    "fr": { slug: "/guide-complet", title: "Guide Complet", _id: "...", _type: "blog" }
  },
  "/fr/blog/guide-complet": {
    "en": { slug: "/complete-guide", title: "Complete Guide", _id: "...", _type: "blog" },
    "fr": { slug: "/guide-complet", title: "Guide Complet", _id: "...", _type: "blog" }
  }
}
```

**Alternatives Considered**:
1. **Array with linear search** - Rejected: O(n) lookup time, poor performance as content grows
2. **Tree structure by document type** - Rejected: Adds complexity, no performance benefit with current scale
3. **Separate maps per language** - Rejected: Requires knowing source language, complicates lookups
4. **Base slug keys only (without locale prefix)** - Rejected: Requires slug normalization on every lookup, error-prone

---

### 3. URL Prefix Handling with next-intl Pathnames

**Question**: How should we handle URL prefixes and localized routes for different document types?

**Decision**: Use next-intl's `pathnames` configuration for localized route mapping, with document type to pathname pattern mapping

**Rationale**:
- **Leverage next-intl pathnames**: Define localized route patterns in routing config (e.g., `/blog` → `/blogue` for French)
- **Better DX**: Use next-intl's type-safe Link component with pathname patterns
- **Centralized routing**: All route definitions in one place (routing config), not scattered across codebase
- **Automatic localization**: next-intl handles locale prefix and path translation automatically

**Pathname Configuration** (apps/web/src/i18n/routing.ts):
```typescript
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always" as const,
  pathnames: {
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
  }
});
```

**Document Type to Pathname Pattern Mapping**:
```typescript
function getPathnamePattern(docType: DocumentType, slug?: string): string {
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

**Slug Format**:
```typescript
// Slugs are stored WITH leading slash in Sanity
// Examples:
// - Blog post: "/my-amazing-post"
// - Page: "/about-us"
// - Homepage: "/" (special case)

// No normalization needed - slugs are used as-is from Sanity
```

**Usage in Language Switcher**:
```typescript
import { Link } from '@/i18n/navigation';

const translation = translations[targetLocale];
const pathname = getPathnamePattern(translation._type);
// Remove leading slash from slug for next-intl params
const slug = translation.slug.replace(/^\//, '');

<Link
  href={{
    pathname,
    params: pathname.includes('[slug]') ? { slug } : undefined
  }}
  locale={targetLocale}
>
  {localeName}
</Link>
```

**Example URL Generation**:
- Blog post with slug `/my-post` in French:
  - Sanity stores: `slug.current = "/my-post"`
  - Pathname pattern: `/blog/[slug]`
  - Params: `{ slug: 'my-post' }` (leading slash removed for next-intl)
  - Locale: `fr`
  - Result: next-intl generates `/fr/blogue/my-post` automatically

**Alternatives Considered**:
1. **Hardcoded document type prefixes** - Rejected: Doesn't leverage next-intl's pathname localization, harder to change route structures
2. **Manual URL construction** - Rejected: Error-prone, doesn't benefit from next-intl's type safety
3. **Store full paths in Sanity** - Rejected: Duplicates routing logic, harder to maintain

---

### 4. React Context vs Props Drilling

**Question**: How should we provide the locale mapping to client components?

**Decision**: Use React Context with a dedicated LocaleProvider

**Rationale**:
- **Avoid props drilling**: Language switcher is in the layout/header, far from root layout
- **Single source of truth**: Context ensures all components access the same mapping
- **Type-safe**: Context can provide typed hooks (useLocale) with IntelliSense support
- **React 19 compatible**: Context works seamlessly with Server/Client Component boundaries
- **Hydration-safe**: Mapping is serialized from server and hydrated on client

**Context Structure**:
```typescript
interface LocaleContextValue {
  localeMapping: LocaleMapping;
  getTranslations: (pathname: string) => LocaleTranslations | undefined;
}

export const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({
  localeMapping,
  children
}: {
  localeMapping: LocaleMapping;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({
    localeMapping,
    getTranslations: (pathname: string) => localeMapping[pathname]
  }), [localeMapping]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
}
```

**Alternatives Considered**:
1. **Props drilling** - Rejected: Would require passing mapping through multiple layout layers
2. **Global variable** - Rejected: Not SSR-safe, breaks React's rendering model, no hydration support
3. **Redux/Zustand store** - Rejected: Overkill for read-only data, adds dependency, increases complexity
4. **React Query/SWR** - Rejected: Data doesn't need reactivity/invalidation, fetched once at startup

---

### 5. Navigation Method with next-intl Pathname Patterns

**Question**: What navigation method should the language switcher use?

**Decision**: Use next-intl's `Link` component with pathname patterns and params

**Rationale**:
- **next-intl pathname integration**: Link component handles localized pathname mapping automatically
- **Type-safe routing**: Leverages next-intl's TypeScript integration with pathname patterns
- **Client-side navigation**: Provides instant navigation without full page reload
- **Proper locale management**: Updates locale cookie and URL state correctly
- **Automatic URL translation**: next-intl converts `/blog/[slug]` → `/blogue/[slug]` for French automatically

**Implementation**:
```typescript
import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';

function LanguageSwitcher() {
  const currentPathname = usePathname();
  const { getTranslations } = useLocale();
  const translations = getTranslations(currentPathname);

  if (!translations) return null;

  return (
    <>
      {LOCALES.map((locale) => {
        const translation = translations[locale];
        if (!translation) return null;

        const pathname = getPathnamePattern(translation._type);
        const cleanSlug = normalizeSlug(translation.slug, translation._type);

        return (
          <Link
            key={locale}
            href={{
              pathname,
              params: pathname.includes('[slug]') ? { slug: cleanSlug } : undefined
            }}
            locale={locale}
          >
            {getLocaleName({ locale })}
          </Link>
        );
      })}
    </>
  );
}
```

**Example Navigation Flow**:
1. User on `/en/blog/complete-guide` (English)
2. Clicks "Français" in language switcher
3. Link component receives:
   - `pathname`: `/blog/[slug]`
   - `params`: `{ slug: 'guide-complet' }`
   - `locale`: `fr`
4. next-intl looks up `/blog/[slug]` in pathnames config
5. Finds French mapping: `/blogue/[slug]`
6. Replaces `[slug]` with `guide-complet`
7. Adds locale prefix: `/fr`
8. Navigates to: `/fr/blogue/guide-complet`

**Alternatives Considered**:
1. **router.replace(pathname, { locale })** - Current implementation, keeps same slug (BUG)
2. **Manual URL construction** - Rejected: Doesn't leverage next-intl's pathname localization, error-prone
3. **window.location.href** - Rejected: Full page reload, loses React state, slower than client-side navigation
4. **router.push with hardcoded slug** - Rejected: Doesn't benefit from next-intl's type safety and pathname mapping

**Key Difference from conciliainc.com**:
- conciliainc.com uses `window.location.href` to force full reload for Cookiebot reinitialization
- conciliainc.com manually constructs full URLs with locale prefixes
- This project uses next-intl's Link component for automatic pathname localization and better DX

---

### 6. Missing Translation Handling

**Question**: What should happen when a user switches to a language without a translation?

**Decision**: Navigate to translated slug anyway, letting Next.js render 404 page

**Rationale**:
- **User requirement**: Spec explicitly states "show 404 when translation doesn't exist"
- **Consistent navigation**: All language switches follow the same code path
- **Next.js automatic handling**: 404 pages are rendered automatically by Next.js App Router
- **SEO benefits**: Proper 404 status codes for search engines
- **Future-proof**: If translation is added later, URL will work without code changes

**Implementation**:
```typescript
const handleLocaleChange = (newLocale: Locale) => {
  const translations = getTranslations(pathname);

  // Even if translation doesn't exist for newLocale, navigate anyway
  // Next.js will render 404 page automatically
  const targetSlug = translations?.[newLocale]?.slug || `/${newLocale}`;

  router.push(targetSlug);
};
```

**Alternatives Considered**:
1. **Disable language option in dropdown** - Rejected: Requires checking all pages, complex UI logic, spec says allow clicks
2. **Show toast/alert before navigation** - Rejected: Interrupts user flow, adds UI complexity
3. **Redirect to homepage in target language** - Rejected: Confusing UX, users lose context, not in spec
4. **Fallback to source language** - Rejected: Defeats purpose of language switching

---

### 7. GROQ Query Strategy

**Question**: How should we query all localized documents with their translations?

**Decision**: Query DEFAULT_LOCALE documents only, join translation metadata via `translation.metadata`

**Rationale**:
- **Single source of truth**: Use DEFAULT_LOCALE from `@workspace/i18n-config` package (currently "fr")
- **Base language pattern**: Query documents in the default locale, all translations reference the base documents
- **Efficient**: Querying one base document per translation group (not N queries for N languages)
- **Plugin compatibility**: Matches @sanity/document-internationalization structure
- **Proven pattern**: conciliainc.com successfully uses this approach

**Implementation** (apps/web/src/lib/sanity/query.ts):
```typescript
import { DEFAULT_LOCALE } from '@/i18n/routing';
import { defineQuery } from 'next-sanity';

export const getAllLocalizedDocumentsQuery = defineQuery(`
*[
  _type in ["page", "blog", "homePage", "blogIndex"] &&
  language == $locale
]{
  _id,
  _type,
  language,
  "slug": slug.current,
  title,
  "_translations": *[
    _type == "translation.metadata" &&
    references(^._id)
  ][0].translations[].value->{
    _id,
    _type,
    language,
    "slug": slug.current,
    title
  }
}
`);

// Usage in layout or locale mapping utility
const documents = await sanityFetch({
  query: getAllLocalizedDocumentsQuery,
  params: { locale: DEFAULT_LOCALE },
});
```

**Query Explanation**:
1. Import DEFAULT_LOCALE from i18n-config (currently "fr", not hardcoded)
2. Filter to DEFAULT_LOCALE documents only (`language == $locale`)
3. Include all translatable document types
4. Get slug, title, and basic metadata
5. Join translation.metadata documents that reference this document
6. Extract all translation values (includes all language versions)
7. Result: Base document + array of all its translations

**Alternatives Considered**:
1. **Query all languages, deduplicate** - Rejected: 2x network payload, requires client-side deduplication
2. **Separate query per document type** - Rejected: 4 queries instead of 1, harder to maintain
3. **Include all document fields** - Rejected: Unnecessary data transfer, only need slug + title + metadata

---

### 8. Sanity Studio URL Preview and Slug Validation

**Question**: How should Sanity Studio handle URL previews and slug validation with localized pathnames?

**Decision**: Update URL preview to show locale-aware URLs, enforce flat blog structure with required leading slash, forbid `/blog/` prefix

**Rationale**:
- **Accurate previews**: Content editors should see the actual URL users will visit
- **Locale awareness**: Preview should reflect the document's language (e.g., French doc shows `/fr/blogue/...`)
- **Flat structure**: Enforce single-segment slugs (e.g., `/my-post`, not `/category/my-post`) to keep blog architecture simple and consistent
- **Required leading slash**: Slugs stored with leading slash (e.g., `/my-post`) for consistency with page slugs
- **No legacy support**: `/blog/` prefix is forbidden - user will manually update existing posts before deployment

**URL Preview Changes** (apps/studio/components/slug-field-component.tsx):

**Current implementation**:
```typescript
// Simply concatenates: https://example.com/blog/my-post
const fullUrl = `${presentationOriginUrl}${currentSlug}`;
```

**New implementation**:
```typescript
import { LOCALE_METADATA } from '@workspace/i18n-config';

// Get document language from context
const documentLanguage = document.language || 'en';

// Map document type to pathname pattern
const getPathnameForDocType = (docType: string): string => {
  switch (docType) {
    case 'blog': return 'blog'; // Will become '/blog' or '/blogue'
    case 'blogIndex': return 'blog';
    case 'page': return '';
    case 'homePage': return '';
    default: return '';
  }
};

// Get localized path prefix
const getLocalizedPathPrefix = (docType: string, locale: string): string => {
  const pathname = getPathnameForDocType(docType);

  // For French blog, use 'blogue'
  if (pathname === 'blog' && locale === 'fr') {
    return 'blogue';
  }

  return pathname;
};

// Build full URL
const localePrefix = documentLanguage === 'en' ? 'en' : documentLanguage;
const pathPrefix = getLocalizedPathPrefix(documentType, documentLanguage);
// Slug is stored with leading slash - remove it for URL construction
const slug = currentSlug.replace(/^\//, '');

const fullUrl = [
  presentationOriginUrl,
  localePrefix,
  pathPrefix,
  slug
].filter(Boolean).join('/');

// Example results:
// English blog: https://example.com/en/blog/my-post
// French blog: https://example.com/fr/blogue/mon-article
// English page: https://example.com/en/about-us
// French page: https://example.com/fr/a-propos
```

**Slug Validation Changes** (apps/studio/utils/slug-validation.ts):

**Current validation** (lines 99-118):
```typescript
blog: {
  documentType: "Blog post",
  requiredPrefix: "/blog/",  // ← FORCES PREFIX
  requireSlash: true,
  segmentCount: 2,
  // ...
}
```

**New validation**:
```typescript
blog: {
  documentType: "Blog post",
  requiredPrefix: undefined,  // ← No prefix required
  requireSlash: true,         // ← REQUIRES leading slash (e.g., "/my-post")
  segmentCount: 1,            // ← ENFORCES single segment (flat structure)
  forbiddenPatterns: [/^\/author/, /^\/admin/, /^\/blog\//],  // ← Forbid /blog/ prefix
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

**Slug Generation Changes** (lines 536-537):

**Current**:
```typescript
case "blog":
  return `/blog/${cleanTitle}`;
```

**New**:
```typescript
case "blog":
  return `/${cleanTitle}`;  // Slug with leading slash, no /blog/ prefix
```

**Slug Format**:
- Standard format: `/my-post` (with leading slash, single segment, flat structure)
- Legacy `/blog/my-post` format is FORBIDDEN (blocked by forbiddenPatterns)
- Nested paths like `/category/my-post` are NOT allowed (enforced by validation)
- URL preview uses slug as-is (no normalization needed)
- User will manually update existing posts to remove `/blog/` prefix before deployment

**Alternatives Considered**:
1. **Store slugs without leading slash** - Rejected: Inconsistent with page slugs, less clear
2. **Support legacy `/blog/` prefix with normalization** - Rejected: User will manually migrate, no need for complexity
3. **Keep `/blog/` prefix requirement** - Rejected: Doesn't leverage next-intl pathname localization

---

## Best Practices

### Next.js 15 App Router with next-intl
- Use Server Components for data fetching (layouts, pages)
- Use Client Components only when needed (interactive elements like language switcher)
- Leverage next-intl's routing APIs (`Link`, `usePathname`, `useRouter` from `@/i18n/navigation`)
- Respect locale prefixes (`localePrefix: "always"` in routing config)

### GROQ Query Patterns
- Use projections to limit data transfer (only fetch needed fields)
- Leverage references and joins for related documents
- Filter at query level (not client-side) for performance
- Use `defineQuery` for type safety with sanity-typegen

### React Context Best Practices
- Memoize context value to prevent unnecessary re-renders
- Provide type-safe hooks (`useLocale`) with error handling
- Keep context values serializable (no functions in state)
- Document context requirements (must wrap in provider)

### TypeScript Strict Mode
- Define comprehensive interfaces for all data structures
- Use branded types for Locale (`type Locale = 'en' | 'fr'`)
- Leverage discriminated unions for document types
- Document complex types with JSDoc comments

---

## Technology Decisions Summary

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| Next.js | 15.x | Web framework | App Router with streaming SSR, Server Components |
| next-intl | Latest | i18n routing | Type-safe locale management, automatic prefix handling, pathname localization |
| next-intl pathnames | Config | Localized routes | Maps `/blog` → `/blogue` for French, better SEO, native language URLs |
| next-sanity | Latest | Sanity client | Optimized for Next.js, built-in caching, type generation |
| React | 19.x | UI library | Context API, Suspense, Transitions, concurrent rendering |
| TypeScript | 5.9.2 | Type safety | Strict mode, comprehensive interfaces, branded types |
| @sanity/document-internationalization | 4.x | Translation metadata | Industry-standard plugin, proven structure |
| Vitest | Latest | Unit testing | Fast, ESM-native, compatible with TurboRepo |
| Playwright | Latest | E2E testing | Cross-browser, reliable, matches monorepo standards |

---

## Open Questions

None. All technical decisions have been researched and resolved.

---

## References

- **conciliainc.com implementation**: `/Users/walter-mac/walter-interactive/conciliainc.com/apps/web/`
  - `src/app/layout.tsx`: Root layout with translation fetching
  - `utils/localeMapper.ts`: Mapping creation logic
  - `src/contexts/LocaleContext.tsx`: Context provider implementation
  - `src/components/LocaleSwitcher/LocaleSwitcher.tsx`: Switcher component
- **Next.js 15 App Router docs**: https://nextjs.org/docs/app
- **next-intl routing docs**: https://next-intl-docs.vercel.app/docs/routing
- **@sanity/document-internationalization**: https://www.sanity.io/plugins/document-internationalization
- **Project constitution**: `.specify/memory/constitution.md`
