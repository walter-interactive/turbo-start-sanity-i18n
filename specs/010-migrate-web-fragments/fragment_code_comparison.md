# Fragment Code Comparison - Identifying Differences

## Duplicate Fragment #1: imageLinkCardsBlock vs imageLinkCardsFragment

### In template-web/src/lib/sanity/query.ts (lines 79-99)
```typescript
const imageLinkCardsBlock = /* groq */ `
  _type == "imageLinkCards" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
    "cards": array::compact(cards[]{
      ...,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => url.internal->slug.current,
        url.type == "external" => url.external,
        url.href
      ),
      "internalType": select(
        url.type == "internal" => url.internal->_type,
        null
      ),
      ${imageFragment},
    })
  }
`;
```

### In packages/sanity-blocks/src/image-link-cards.fragment.ts
```typescript
import { customUrlFragment } from "@walter/sanity-atoms/fragments/custom-url";
import { buttonsFragment } from "@walter/sanity-atoms/fragments/buttons";
import { richTextFragment } from "@walter/sanity-atoms/fragments/rich-text";
import { imageFragment } from "@walter/sanity-atoms/fragments/image";

export const imageLinkCardsFragment = /* groq */ `
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

### Key Differences

| Aspect | template-web | sanity-blocks |
|--------|--------------|---------------|
| **Spread** | `...` everywhere | Field projection (eyebrow, title, etc.) |
| **Array cleanup** | Uses `array::compact()` | No compact wrapper |
| **Card fields** | Minimal (just URL transforms) | Full projection (title, description) |
| **Image wrapping** | Direct `${imageFragment}` | Wrapped in `image { ... }` |
| **URL handling** | Inline select/transform | Uses `${customUrlFragment}` |
| **Field names** | Custom (openInNewTab, href, internalType) | Relies on customUrlFragment |

### Impact: MEDIUM (different field structure returned)

---

## Duplicate Fragment #2: subscribeNewsletterBlock vs subscribeNewsletterFragment

### In template-web/src/lib/sanity/query.ts (lines 101-113)
```typescript
const subscribeNewsletterBlock = /* groq */ `
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

### In packages/sanity-blocks/src/subscribe-newsletter.fragment.ts
```typescript
import { customUrlFragment } from "@walter/sanity-atoms/fragments/custom-url";

export const subscribeNewsletterFragment = /* groq */ `
  _type == "subscribeNewsletter" => {
    title,
    "subTitle": subTitle[]{
      ...,
      markDefs[]{
        ...,
        _type == "customLink" => {
          ${customUrlFragment}
        }
      }
    },
    "helperText": helperText[]{
      ...,
      markDefs[]{
        ...,
        _type == "customLink" => {
          ${customUrlFragment}
        }
      }
    }
  }
`;
```

### Key Differences

| Aspect | template-web | sanity-blocks |
|--------|--------------|---------------|
| **Spread** | `...` on all fields | Only on markDefs |
| **Title field** | Spreads with `...` | Explicit `title` projection |
| **markDefs approach** | Uses shared markDefsFragment | Inline with customUrlFragment |
| **customLink handling** | Via markDefsFragment | Direct in markDefs array |

### Impact: MEDIUM (nested structure & linkification differs)

### Note: markDefsFragment in template-web
```groq
const markDefsFragment = `
  markDefs[]{
    ...,
    ${customLinkFragment}
  }
`;
```

This is NOT in packages - it's a utility fragment that combines markDefs handling with customLink transformation.

---

## Duplicate Fragment #3: featureCardsIconBlock vs featureCardsIconFragment

### In template-web/src/lib/sanity/query.ts (lines 115-124)
```typescript
const featureCardsIconBlock = /* groq */ `
  _type == "featureCardsIcon" => {
    ...,
    ${richTextFragment},
    "cards": array::compact(cards[]{
      ...,
      ${richTextFragment},
    })
  }
`;
```

### In packages/sanity-blocks/src/feature-cards-icon.fragment.ts
```typescript
import { richTextFragment } from "@walter/sanity-atoms/fragments/rich-text";

export const featureCardsIconFragment = /* groq */ `
  _type == "featureCardsIcon" => {
    eyebrow,
    title,
    ${richTextFragment},
    "cards": cards[]{
      icon,
      title,
      ${richTextFragment}
    }
  }
`;
```

### Key Differences

| Aspect | template-web | sanity-blocks |
|--------|--------------|---------------|
| **Top-level spread** | Uses `...` | Explicit fields (eyebrow, title) |
| **Array cleanup** | Uses `array::compact()` | No compact wrapper |
| **Card spread** | Uses `...` | Explicit fields (icon, title) |

### Impact: MEDIUM (field filtering differs)

---

## Critical Insight: Why Differences Exist

The differences suggest these scenarios:

1. **schema-first vs query-first evolution**
   - Schemas were defined first with specific fields
   - Queries were written to be defensive with `...`
   - Later fragments were optimized for schema reality

2. **Field filtering vs field discovery**
   - template-web: "Get everything, transform what we need" (defensive)
   - sanity-blocks: "Project only fields we need" (optimized)

3. **Utility fragments vs inline transforms**
   - template-web: Reuses markDefsFragment for URL handling
   - sanity-blocks: Inlines customUrlFragment where needed

---

## Missing Fragment #1: customLinkFragment

### Current Location: template-web/src/lib/sanity/query.ts (lines 35-48)
```typescript
const customLinkFragment = /* groq */ `
  ...customLink{
    openInNewTab,
    "href": select(
      type == "internal" => internal->slug.current,
      type == "external" => external,
      "#"
    ),
    "internalType": select(
      type == "internal" => internal->_type,
      null
    ),
  }
`;
```

### Similar Pattern in sanity-atoms: custom-url.fragment.ts
```typescript
export const customUrlFragment = /* groq */ `
  "url": {
    type,
    openInNewTab,
    external,
    href,
    "internal": internal->{
      _type,
      "slug": slug.current
    }
  }
`;
```

### Differences
- **template-web's customLinkFragment**: Spreads customLink, does href transformation
- **sanity-atoms's customUrlFragment**: Wraps in `url` object, references internal->slug

### Relationship
- customLinkFragment is used by markDefsFragment (rich text mark definitions)
- customUrlFragment is for button/link fields
- They're similar but different use cases!

**Recommendation**: Create separate `custom-link.fragment.ts` in sanity-atoms for rich text links

---

## Missing Fragment #2: markDefsFragment

### Current Location: template-web/src/lib/sanity/query.ts (lines 50-55)
```typescript
const markDefsFragment = /* groq */ `
  markDefs[]{
    ...,
    ${customLinkFragment}
  }
`;
```

### Used By
- blogCardFragment (lines 66-76)
- subscribeNewsletterBlock (lines 101-113)
- imageLinkCardsBlock (lines 79-99) - indirectly via richTextFragment

### Note: Similar to richTextFragment
The `richTextFragment` in sanity-atoms does:
```typescript
export const richTextFragment = /* groq */ `
  richText[]{
    ...,
    _type == "block" => {
      ...,
      ${markDefsFragment}  // <-- Imports markDefsFragment!
    },
    _type == "image" => {
      ${imageFields},
      "caption": caption
    }
  }
`;
```

### The Circular Reference Problem
- richText.fragment imports markDefsFragment from... somewhere?
- But markDefsFragment uses customLinkFragment
- And customLinkFragment is in template-web, not atoms!

**WAIT!** Let me verify this...

---

## FINDING: Circular Dependency Issue!

Looking at `/packages/sanity-atoms/src/rich-text.fragment.ts`:

```typescript
import { imageFields } from "./image.fragment";

const customLinkFragment = /* groq */ `
  ...customLink{
    openInNewTab,
    "href": select(
      type == "internal" => internal->slug.current,
      type == "external" => external,
      "#"
    ),
    "internalType": select(
      type == "internal" => internal->_type,
      null
    ),
  }
`;

const markDefsFragment = /* groq */ `
  markDefs[]{
    ...,
    ${customLinkFragment}
  }
`;

export const richTextFragment = /* groq */ `
  richText[]{
    ...,
    _type == "block" => {
      ...,
      ${markDefsFragment}
    },
    _type == "image" => {
      ${imageFields},
      "caption": caption
    }
  }
`;
```

**REVELATION**: customLinkFragment and markDefsFragment are ALREADY in sanity-atoms!
They're just not exported from rich-text.fragment.ts!

### Current State (Atoms)
```
rich-text.fragment.ts
├── imageFields (imported from image.fragment)
├── customLinkFragment (defined locally - NOT exported)
├── markDefsFragment (defined locally - NOT exported)
└── richTextFragment (exported - uses both above)
```

### Current State (template-web)
```
query.ts
├── customLinkFragment (DUPLICATE - defined locally)
├── markDefsFragment (DUPLICATE - defined locally)
└── markDefsFragment is used by blogCardFragment & subscribeNewsletterBlock
```

### Root Cause
- These fragments exist in atoms but are hidden inside richTextFragment
- They're not re-exported as public API
- So template-web duplicated them for local use

---

## Summary of All Code Differences

### 1. Block Fragment Differences (3 blocks affected)

**imageLinkCards**: Uses field projection vs spread; customUrlFragment vs inline transforms
**subscribeNewsletter**: Uses field projection vs spread; customUrlFragment vs inline transforms  
**featureCardsIcon**: Uses field projection vs spread; array::compact usage differs

**Root cause**: Defensive `...` vs optimized field selection

### 2. Missing Fragment Exports (2 fragments)

**customLinkFragment**: Defined in atoms but not exported; duplicated in template-web
**markDefsFragment**: Defined in atoms but not exported; duplicated in template-web

**Root cause**: Designed as internal implementation details of richTextFragment, not public API

### 3. Duplicate Fragment Definitions (2 fragments)

**imageFields**: Defined in atoms AND template-web (commented import exists)
**imageFragment**: Defined in atoms AND template-web (commented import exists)

**Root cause**: Commented import suggests migration attempt was abandoned; unclear why

---

## Migration Path Forward

### Phase 1: Fix Atoms Export Issue
1. Export customLinkFragment from rich-text.fragment.ts (or custom-link.fragment.ts)
2. Export markDefsFragment from rich-text.fragment.ts (or custom-link.fragment.ts)
3. Update imports in template-web to use atoms versions

### Phase 2: Reconcile Block Fragment Differences
1. Decide: Keep defensive spread OR use optimized projection
2. Update all 3 affected fragments (imageLinkCards, subscribeNewsletter, featureCardsIcon)
3. Update template-web imports to use package versions

### Phase 3: Remove Duplicates
1. Delete imageFields & imageFragment from query.ts
2. Uncomment import from atoms
3. Verify all usages still work

### Phase 4: Optional Improvements
1. Reorganize into subdirectories if desired
2. Add index.ts for barrel exports if desired
3. Add JSDoc comments to all fragments

