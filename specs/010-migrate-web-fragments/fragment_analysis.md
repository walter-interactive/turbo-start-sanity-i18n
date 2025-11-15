# Query Fragment Structure Analysis - template-web

## Current State Overview

### Directory Structure Status

#### template-web (/apps/template-web/src/lib/sanity/)
- **NO separate `/fragments/` directory exists**
- All fragments are defined inline in `/apps/template-web/src/lib/sanity/query.ts`
- Fragments are imported from shared packages but also locally defined
- Only 2 files in sanity lib:
  - `query.ts` - Main query file with embedded fragments
  - `i18n.ts` - i18n-specific fragments

#### sanity-blocks (/packages/sanity-blocks/src/)
- **Flat structure** - no subdirectories
- Contains 12 TypeScript files (6 schemas + 6 fragments)
- **NO index.ts file** for barrel exports
- Uses package.json exports field for path mapping

#### sanity-atoms (/packages/sanity-atoms/src/)
- **Flat structure** - no subdirectories
- Contains 9 TypeScript files (4 schemas + 5 fragments)
- **NO index.ts file** for barrel exports
- Uses package.json exports field for path mapping

---

## Fragment Files Inventory

### Blocks - sanity-blocks Package

| Fragment | File | Imports From | Type | Status |
|----------|------|--------------|------|--------|
| CTA Block | `cta.fragment.ts` | richTextFragment, buttonsFragment | Block conditional | Migrated ✓ |
| Hero Section | `hero-section.fragment.ts` | imageFragment, buttonsFragment, richTextFragment | Block conditional | Migrated ✓ |
| FAQ Accordion | `faq-accordion.fragment.ts` | richTextFragment | Block conditional | Migrated ✓ |
| Feature Cards Icon | `feature-cards-icon.fragment.ts` | richTextFragment | Block conditional | Migrated ✓ |
| Image Link Cards | `image-link-cards.fragment.ts` | customUrlFragment, buttonsFragment, richTextFragment, imageFragment | Block conditional | Migrated ✓ |
| Subscribe Newsletter | `subscribe-newsletter.fragment.ts` | customUrlFragment | Block conditional | Migrated ✓ |

### Atoms - sanity-atoms Package

| Fragment | File | Imports From | Type | Status |
|----------|------|--------------|------|--------|
| Image (fields) | `image.fragment.ts` | - | Core utility | Migrated ✓ |
| Image | `image.fragment.ts` | imageFields | Atom | Migrated ✓ |
| Buttons | `buttons.fragment.ts` | - | Atom | Migrated ✓ |
| Rich Text | `rich-text.fragment.ts` | imageFields | Atom | Migrated ✓ |
| Button (single) | `button.fragment.ts` | - | Atom | Migrated ✓ |
| Custom URL | `custom-url.fragment.ts` | - | Atom | Migrated ✓ |

### Fragments Still in template-web (query.ts)

| Fragment | Location | Lines | Status | Notes |
|----------|----------|-------|--------|-------|
| `imageFields` | query.ts | 12-25 | **Exported** | Re-exported but also defined locally; commented import exists |
| `imageFragment` | query.ts | 28-32 | **Exported** | Wraps imageFields; commented import exists |
| `customLinkFragment` | query.ts | 35-48 | **Local** | Unmigrated; used by markDefsFragment |
| `markDefsFragment` | query.ts | 50-55 | **Local** | Unmigrated; used by rich text processing |
| `blogAuthorFragment` | query.ts | 57-64 | **Local** | Unmigrated; blog-specific |
| `blogCardFragment` | query.ts | 66-76 | **Local** | Unmigrated; blog-specific |
| `imageLinkCardsBlock` | query.ts | 79-99 | **Duplicate** | Local version differs from migrated fragment |
| `subscribeNewsletterBlock` | query.ts | 101-113 | **Duplicate** | Local version differs from migrated fragment |
| `featureCardsIconBlock` | query.ts | 115-124 | **Duplicate** | Local version differs from migrated fragment |
| `ogFieldsFragment` | query.ts | 219-237 | **Local** | Unmigrated; OG tag specific |

---

## Current Import Pattern

### In query.ts (template-web)
```typescript
import { heroSectionFragment } from "@workspace/sanity-blocks/fragments/hero-section";
import { ctaBlock } from "@workspace/sanity-blocks/fragments/cta";
import { faqSectionFragment } from "@workspace/sanity-blocks/fragments/faq-accordion";
// import { imageFields, imageFragment } from "@workspace/sanity-atoms/fragments/image";
import { buttonsFragment } from "@workspace/sanity-atoms/fragments/buttons";
import { richTextFragment } from "@workspace/sanity-atoms/fragments/rich-text";
```

### Package Export Patterns (package.json)

Both packages use the same export strategy:
```json
"exports": {
  "./schemas/*": "./src/*.schema.ts",
  "./fragments/*": "./src/*.fragment.ts"
}
```

This allows imports like:
- `@workspace/sanity-blocks/fragments/hero-section`
- `@workspace/sanity-atoms/fragments/buttons`

---

## Dependency Chain Analysis

### Block Fragment Dependencies

```
heroSection.fragment
├── imageFragment (atoms)
├── buttonsFragment (atoms)
└── richTextFragment (atoms)

cta.fragment
├── richTextFragment (atoms)
└── buttonsFragment (atoms)

faqAccordion.fragment
├── richTextFragment (atoms)
└── faqFragment (internal)
    └── richTextFragment (atoms)

featureCardsIcon.fragment
└── richTextFragment (atoms)

imageLinkCards.fragment
├── customUrlFragment (atoms)
├── buttonsFragment (atoms)
├── richTextFragment (atoms)
└── imageFragment (atoms)

subscribeNewsletter.fragment
└── customUrlFragment (atoms)
```

### Atom Fragment Dependencies

```
richText.fragment
├── imageFields (self)
└── customLink pattern (internal)

image.fragment
└── imageFields (self)

buttons.fragment
└── (no dependencies - uses customUrl pattern inline)

button.fragment
└── (no dependencies)

customUrl.fragment
└── (no dependencies)
```

---

## Issues Identified

### 1. **Duplicate Block Fragments in template-web**

Three block fragments exist in BOTH locations with **slight differences**:

#### imageLinkCardsBlock (template-web) vs imageLinkCardsFragment (sanity-blocks)

**In query.ts (template-web):**
```groq
const imageLinkCardsBlock = `
  _type == "imageLinkCards" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
    "cards": array::compact(cards[]{
      ...,
      "openInNewTab": url.openInNewTab,
      "href": select(...),
      "internalType": select(...),
      ${imageFragment},
    })
  }
`;
```

**In sanity-blocks:**
```groq
export const imageLinkCardsFragment = `
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

**Differences:**
- template-web uses `array::compact()` wrapper
- template-web has inline URL transformation logic
- sanity-blocks uses field projection and customUrlFragment
- sanity-blocks wraps image differently

#### subscribeNewsletterBlock (template-web) vs subscribeNewsletterFragment (sanity-blocks)

**In query.ts (template-web):**
```groq
const subscribeNewsletterBlock = `
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

**In sanity-blocks:**
```groq
export const subscribeNewsletterFragment = `
  _type == "subscribeNewsletter" => {
    title,
    "subTitle": subTitle[]{
      ...,
      markDefs[]{...customUrlFragment pattern}
    },
    "helperText": helperText[]{
      ...,
      markDefs[]{...customUrlFragment pattern}
    }
  }
`;
```

**Differences:**
- template-web uses shared markDefsFragment
- sanity-blocks uses inline markDefs with customUrlFragment pattern
- template-web spreads everything with `...`

#### featureCardsIconBlock (template-web) vs featureCardsIconFragment (sanity-blocks)

Both are nearly identical but:
- template-web has local version: `featureCardsIconBlock`
- sanity-blocks has: `featureCardsIconFragment`
- Local version is used in query.ts

### 2. **Shared Fragment Definitions**

Three fragments appear in BOTH packages:

- **imageFragment** - Exported from atoms but also defined in query.ts (with commented import)
- **imageFields** - Core utility used by imageFragment

### 3. **Missing Migration Targets**

Fragments still only in template-web that need new homes:

| Fragment | Purpose | Belongs To |
|----------|---------|-----------|
| `customLinkFragment` | Transforms customLink field | atoms? (generic URL pattern) |
| `markDefsFragment` | Rich text mark definitions | atoms (with richText) |
| `blogAuthorFragment` | Blog document metadata | Should stay in query (doc-specific) |
| `blogCardFragment` | Blog list display | Should stay in query (doc-specific) |
| `ogFieldsFragment` | OG meta tags | Should stay in query (doc-specific) |

### 4. **Import Path Inconsistency**

- Most imports use correct path pattern: `@workspace/sanity-blocks/fragments/hero-section`
- One import uses different export name: `ctaBlock` vs expected `ctaFragment`

---

## Fragment Categories

### 1. Block Fragments (6) - Page Builder Components
- heroSectionFragment
- ctaFragment
- faqAccordionFragment
- featureCardsIconFragment
- imageLinkCardsFragment
- subscribeNewsletterFragment

**Status**: All defined in sanity-blocks; 3 have duplicates in template-web

### 2. Atomic Fragments (6) - Reusable Components
- imageFragment / imageFields
- buttonsFragment
- richTextFragment
- buttonFragment
- customUrlFragment

**Status**: All defined in sanity-atoms; 2 partially duplicated in template-web

### 3. Document-Specific Fragments (5) - Page/Blog Data
- translationsFragment (in i18n.ts) ✓
- blogAuthorFragment
- blogCardFragment
- ogFieldsFragment
- (pageBuilderFragment - aggregator)

**Status**: Only translationsFragment migrated; others remain in query.ts

### 4. Supporting Fragments (2) - Internal Utilities
- customLinkFragment (rich text link pattern)
- markDefsFragment (rich text mark definitions)
- faqFragment (internal to faqAccordionFragment)

**Status**: Only faqFragment migrated; others remain in query.ts

---

## Export Summary

### What's Being Exported (via package.json)
- All `.schema.ts` files via `./schemas/*`
- All `.fragment.ts` files via `./fragments/*`

### What's NOT Exported
- No barrel index files (`index.ts`)
- Individual files must be imported by full path

### Import Usage in template-web
```typescript
// This works:
import { heroSectionFragment } from "@workspace/sanity-blocks/fragments/hero-section";

// These don't work (no index.ts):
// import { heroSectionFragment, ctaFragment } from "@workspace/sanity-blocks";
// import { allBlockFragments } from "@workspace/sanity-blocks";
```

---

## File Count Summary

| Package | Schemas | Fragments | Total | Flat? |
|---------|---------|-----------|-------|-------|
| sanity-blocks | 6 | 6 | 12 | Yes |
| sanity-atoms | 4 | 5 | 9 | Yes |
| template-web | 0 | 10+ | 10+ | N/A (in query.ts) |

---

## Missing/Needed Organization

### Issues with Current Setup:
1. **No index files** - Can't do barrel imports
2. **Duplicate definitions** - Same fragment in 2+ places
3. **Fragment scattered** - Not organized by purpose (block vs atom)
4. **Naming inconsistency** - `ctaBlock` vs `ctaFragment` patterns
5. **No fragment organization** - All files flat in sanity-blocks/atoms src/

### What Would Be Better:
```
packages/sanity-blocks/src/
├── blocks/              # (New directory)
│   ├── hero-section/
│   │   ├── hero-section.schema.ts
│   │   └── hero-section.fragment.ts
│   ├── cta/
│   ├── faq-accordion/
│   └── ...
├── index.ts            # Barrel exports
└── package.json

packages/sanity-atoms/src/
├── atoms/              # (New directory)
│   ├── image/
│   │   ├── image.schema.ts
│   │   └── image.fragment.ts
│   ├── buttons/
│   ├── rich-text/
│   └── ...
├── index.ts            # Barrel exports
└── package.json
```

But current flat structure is still valid if using path-based exports.
