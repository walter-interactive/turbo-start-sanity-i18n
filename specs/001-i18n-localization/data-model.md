# Data Model: Multi-Language Website Support

**Feature**: 001-i18n-localization  
**Date**: 2025-11-06  
**Status**: Complete

## Overview

This document defines the data structures and entity relationships for the multi-language website support feature, covering both Sanity CMS documents and Next.js frontend data patterns.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Sanity Content Lake                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐                    ┌──────────────┐       │
│  │   Page (FR)  │                    │   Page (EN)  │       │
│  ├──────────────┤                    ├──────────────┤       │
│  │ _id          │                    │ _id          │       │
│  │ language: fr │                    │ language: en │       │
│  │ title        │                    │ title        │       │
│  │ slug         │                    │ slug         │       │
│  │ content      │                    │ content      │       │
│  └──────┬───────┘                    └──────┬───────┘       │
│         │                                    │               │
│         │         ┌──────────────────┐      │               │
│         └────────►│  translation     │◄─────┘               │
│                   │   .metadata      │                      │
│                   ├──────────────────┤                      │
│                   │ _id (generated)  │                      │
│                   │ _type: meta      │                      │
│                   │ translations[]   │                      │
│                   │   - _key: "fr"   │                      │
│                   │     value._ref   │                      │
│                   │   - _key: "en"   │                      │
│                   │     value._ref   │                      │
│                   └──────────────────┘                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Next.js Frontend (web)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │ Locale Config    │        │  Message Files   │          │
│  ├──────────────────┤        ├──────────────────┤          │
│  │ locales: []      │───────►│ messages/en.json │          │
│  │ defaultLocale    │        │ messages/fr.json │          │
│  └──────────────────┘        └──────────────────┘          │
│                                                               │
│  ┌───────────────────────────────────────────┐              │
│  │          Route Structure                  │              │
│  │  /[locale]/                              │              │
│  │    ├─ page.tsx                           │              │
│  │    ├─ [...slug]/page.tsx                 │              │
│  │    └─ blog/                               │              │
│  │         ├─ page.tsx                       │              │
│  │         └─ [slug]/page.tsx                │              │
│  └───────────────────────────────────────────┘              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Entities

### 1. Translatable Document (Sanity)

**Purpose**: Base document type that exists in multiple language versions

**Fields**:
- `_id`: string (unique per language version)
- `_type`: string (document type: page, blog, navbar, etc.)
- `_createdAt`: datetime
- `_updatedAt`: datetime
- `_rev`: string
- `language`: string (ISO language code: 'en', 'fr')
- [document-specific fields]

**Validation Rules**:
- `language` MUST be one of configured supported languages
- `language` field is read-only via Studio UI (plugin manages)
- Each document can exist independently without translations

**State Transitions**:
```
Draft → Published (per language, independently)
Published → Unpublished (doesn't affect other languages)
```

**Example**:
```typescript
{
  _id: 'page-about-fr',
  _type: 'page',
  _createdAt: '2025-11-06T10:00:00Z',
  _updatedAt: '2025-11-06T14:30:00Z',
  _rev: 'abc123',
  language: 'fr',
  title: 'À propos',
  slug: {current: 'a-propos'},
  content: [...] // Portable Text
}
```

---

### 2. Translation Metadata Document (Sanity)

**Purpose**: Links multiple language versions of the same logical document

**Schema**:
- `_id`: string (auto-generated)
- `_type`: 'translation.metadata'
- `_createdAt`: datetime
- `_updatedAt`: datetime
- `schemaType`: string (references source document type)
- `translations`: array of references

**Translations Array Structure**:
```typescript
{
  _key: string,        // Language code (e.g., 'fr', 'en')
  _type: 'reference',
  value: {
    _ref: string,      // Document ID
    _type: 'reference'
  }
}
```

**Creation Rules**:
- Created automatically when first translation is made
- One metadata document per set of translations
- Persists even if only one language version remains

**Example**:
```typescript
{
  _id: '3c4e8f2a-1234-5678-90ab-cdef12345678',
  _type: 'translation.metadata',
  schemaType: 'page',
  translations: [
    {
      _key: 'fr',
      _type: 'reference',
      value: {
        _ref: 'page-about-fr',
        _type: 'reference'
      }
    },
    {
      _key: 'en',
      _type: 'reference',
      value: {
        _ref: 'page-about-en',
        _type: 'reference'
      }
    }
  ]
}
```

---

### 3. Language Configuration (Next.js)

**Purpose**: Defines available languages for the frontend application

**Location**: `src/i18n/routing.ts`

**Structure**:
```typescript
interface Routing {
  locales: readonly string[];        // ['fr', 'en']
  defaultLocale: string;             // 'fr'
  localePrefix?: 'always' | 'as-needed';
  pathnames?: Record<string, string>;
}
```

**Constraints**:
- MUST include at least one locale
- `defaultLocale` MUST exist in `locales` array
- Locale codes SHOULD follow ISO 639-1 (two-letter codes)

**Example**:
```typescript
export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always' // Always show /fr/ and /en/ in URLs
});
```

---

### 4. Translation Messages (Next.js)

**Purpose**: UI string translations for application interface

**Location**: `messages/[locale].json`

**Structure**:
```typescript
interface Messages {
  [namespace: string]: {
    [key: string]: string | Messages;
  }
}
```

**Namespacing Convention**:
- `common.*` - Shared across all pages
- `navigation.*` - Nav menu items
- `[pageName].*` - Page-specific translations
- `errors.*` - Error messages

**Example** (`messages/fr.json`):
```json
{
  "common": {
    "readMore": "Lire la suite",
    "backToHome": "Retour à l'accueil"
  },
  "navigation": {
    "home": "Accueil",
    "about": "À propos",
    "blog": "Blogue"
  },
  "blog": {
    "title": "Blogue",
    "publishedOn": "Publié le {date}",
    "author": "Par {name}"
  }
}
```

---

### 5. Locale Preference (Client-side)

**Purpose**: Stores user's language selection

**Storage**: Cookie + localStorage

**Cookie Structure**:
- Name: `NEXT_LOCALE`
- Value: ISO language code ('fr', 'en')
- Max-Age: 31536000 (1 year)
- Path: '/'
- SameSite: 'lax'

**Example**:
```
NEXT_LOCALE=fr; Path=/; Max-Age=31536000; SameSite=lax
```

---

## Relationships

### Document ↔ Translation Metadata (1:1 or 1:0)

**Relationship Type**: Reference (weak or strong based on config)

**Cardinality**:
- Each translatable document CAN have 0 or 1 metadata document
- Each metadata document references 1+ translatable documents

**Query Pattern** (GROQ):
```groq
// From document, get metadata
*[_type == "translation.metadata" && references($docId)][0]

// From metadata, get all translations
*[_id == $metadataId][0].translations[].value->
```

**Referential Integrity**:
- Deleting a document DOES NOT delete metadata (other translations remain)
- Deleting metadata DOES NOT delete documents (operates independently)
- Plugin manages metadata updates on translation create/delete

---

### Locale ↔ Messages (1:1)

**Relationship Type**: File-based

**Cardinality**: Each locale has exactly 1 message file

**Loading Pattern**:
```typescript
// Server Components
import {getTranslations} from 'next-intl/server';
const t = await getTranslations({locale, namespace: 'blog'});

// Client Components
import {useTranslations} from 'next-intl';
const t = useTranslations('blog');
```

**Fallback Behavior**:
- Missing key → returns key name as string
- Missing namespace → returns namespace.key as string
- Missing locale file → falls back to defaultLocale

---

### Route ↔ Document (1:1 or 1:0)

**Relationship Type**: Slug-based mapping

**URL Structure**: `/{locale}/{slug}`

**Query Pattern** (GROQ):
```groq
*[
  _type == $docType 
  && slug.current == $slug 
  && language == $locale
][0]
```

**Not Found Handling**:
- Document exists in other language → Show fallback notice
- Document doesn't exist → 404 error page (localized)

---

## Data Flow Diagrams

### Content Creation Flow

```
Content Editor
     │
     ├─> Creates document in French (default)
     │        │
     │        ├─> Plugin sets language: 'fr'
     │        └─> Saves to Sanity
     │
     ├─> Publishes French version
     │
     ├─> Clicks "Create Translation" → English
     │        │
     │        ├─> Plugin duplicates document structure
     │        ├─> Creates new doc with language: 'en'
     │        ├─> Creates/updates translation.metadata
     │        └─> Links both documents via metadata
     │
     └─> Edits and publishes English version
```

### Content Retrieval Flow (Frontend)

```
User Request: /en/about
     │
     ├─> Middleware detects locale from URL
     │        └─> Sets NEXT_LOCALE cookie: 'en'
     │
     ├─> Page component receives locale param
     │        └─> Calls setRequestLocale('en')
     │
     ├─> GROQ query fetches document
     │        ├─> Filter: language == 'en'
     │        └─> Filter: slug.current == 'about'
     │
     ├─> Result found?
     │    ├─> YES: Render page with English content
     │    └─> NO: Check for French version
     │              ├─> Found: Render with fallback notice
     │              └─> Not Found: Show 404 page
     │
     └─> Response sent to browser
```

### Language Switch Flow

```
User clicks Language Switcher (FR → EN)
     │
     ├─> Client-side navigation
     │        ├─> Current pathname: /fr/about
     │        └─> New pathname: /en/about
     │
     ├─> Navigation API (from next-intl)
     │        └─> router.push(pathname, {locale: 'en'})
     │
     ├─> Middleware intercepts
     │        └─> Updates NEXT_LOCALE cookie: 'en'
     │
     ├─> Server fetches English version
     │        └─> Same GROQ query, different language param
     │
     └─> Page re-renders with English content
```

---

## Validation Rules Summary

### Document-Level Validation

| Rule | Enforcement | Location |
|------|-------------|----------|
| Language field required | Schema validation | Sanity Studio |
| Language matches config | Plugin validation | Studio plugin |
| Unique slug per language | Custom validation | Schema `validation` |
| Translation metadata references valid docs | Sanity referential integrity | Content Lake |

### Frontend Validation

| Rule | Enforcement | Location |
|------|-------------|----------|
| Locale in routing.locales | Runtime check | middleware.ts |
| Message file exists | Build-time check | next-intl setup |
| Translation keys exist | Type-time check | TypeScript |
| hreflang references valid | Build-time generation | metadata API |

---

## Performance Considerations

### Document Queries

**Optimization Strategy**:
- Index on `language` field (Sanity auto-indexes)
- Index on `slug.current` field (already indexed)
- Use projections to limit fields returned
- Cache translation metadata lookups (rarely changes)

**Query Performance**:
```groq
// OPTIMIZED: Specific fields only
*[_type == "page" && language == $lang && slug.current == $slug][0]{
  _id,
  title,
  content
}

// AVOID: Returning all fields
*[_type == "page" && language == $lang && slug.current == $slug][0]
```

### Translation Metadata

**Caching Strategy**:
- Metadata changes infrequently (only on translation create/delete)
- Cache metadata documents with long TTL (1 hour+)
- Invalidate on webhook from Sanity on metadata update

---

## Migration Path

### From No Internationalization

**Step 1**: Add language field to existing documents (default: 'fr')
```typescript
// Migration script
const docs = await client.fetch(`*[_type in $types && !defined(language)]`);
await Promise.all(
  docs.map(doc => 
    client.patch(doc._id).set({language: 'fr'}).commit()
  )
);
```

**Step 2**: Create translations via Studio UI (metadata auto-created)

**Step 3**: No changes to document structure, only additions

---

## Schema Type Mapping

### Translatable Documents

| Sanity Type | Has Translations | Language Field | Notes |
|-------------|------------------|----------------|-------|
| page | ✅ Yes | Required | All fields translated |
| blog | ✅ Yes | Required | All fields translated |
| blog-index | ✅ Yes | Required | Title/description translated |
| navbar | ✅ Yes | Required | Menu items translated |
| footer | ✅ Yes | Required | Links/text translated |
| settings | ✅ Yes | Required | Site metadata translated |
| home-page | ✅ Yes | Required | All fields translated |
| faq | ✅ Yes | Required | Questions/answers translated |

### Non-Translatable Documents

| Sanity Type | Reason | Alternative |
|-------------|--------|-------------|
| author | Name/bio global | N/A |
| redirect | Technical, language-neutral | N/A |

---

## Data Integrity Constraints

1. **Orphaned Metadata Prevention**:
   - Metadata documents with < 1 translation reference SHOULD be deleted
   - Handled by plugin on translation delete

2. **Circular Reference Prevention**:
   - Document CANNOT reference itself in metadata
   - Enforced by plugin logic

3. **Language Consistency**:
   - `translations[n]._key` MUST match `translations[n].value->language`
   - Enforced by plugin on create/update

4. **Unique Language Per Metadata**:
   - Each language code appears once in `translations[]` array
   - Enforced by plugin (uses language as `_key`)

---

**Data Model Status**: ✅ Complete  
**Next**: Create API contracts and configuration examples
