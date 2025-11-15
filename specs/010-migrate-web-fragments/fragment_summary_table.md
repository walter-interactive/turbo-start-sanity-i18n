# Fragment Migration Summary Table

## Quick Reference: Which Fragments Are Where

### Blocks (Page Builder Components)

| Block | sanity-blocks | template-web | Duplication | Notes |
|-------|---------------|--------------|-------------|-------|
| **Hero Section** | ✓ heroSectionFragment | ❌ | No | Properly migrated, no local copy |
| **CTA** | ✓ ctaBlock | ❌ | No | Properly migrated, no local copy |
| **FAQ Accordion** | ✓ faqSectionFragment | ❌ | No | Properly migrated, no local copy |
| **Feature Cards Icon** | ✓ featureCardsIconFragment | ✓ featureCardsIconBlock | YES | Local version used instead of imported |
| **Image Link Cards** | ✓ imageLinkCardsFragment | ✓ imageLinkCardsBlock | YES | Versions differ (array::compact vs field projection) |
| **Subscribe Newsletter** | ✓ subscribeNewsletterFragment | ✓ subscribeNewsletterBlock | YES | Versions differ (markDefs handling) |

### Atoms (Reusable Components)

| Atom | sanity-atoms | template-web | Duplication | Notes |
|------|--------------|--------------|-------------|-------|
| **Image** | ✓ imageFragment | ✓ imageFragment | YES | Both defined locally (commented import in template-web) |
| **Image Fields** | ✓ imageFields | ✓ imageFields | YES | Both defined locally (commented import in template-web) |
| **Buttons** | ✓ buttonsFragment | ❌ | No | Properly imported |
| **Button** | ✓ buttonFragment | ❌ | No | Properly imported (rarely used) |
| **Rich Text** | ✓ richTextFragment | ❌ | No | Properly imported |
| **Custom URL** | ✓ customUrlFragment | ❌ | No | Properly imported |

### Other Fragments (Document & Utility)

| Fragment | Type | Location | Status |
|----------|------|----------|--------|
| **translationsFragment** | i18n | i18n.ts | ✓ Properly organized |
| **blogAuthorFragment** | Document | query.ts | Local (blog-specific) |
| **blogCardFragment** | Document | query.ts | Local (blog-specific) |
| **ogFieldsFragment** | Document | query.ts | Local (OG-specific) |
| **customLinkFragment** | Utility | query.ts | Unmigrated (used by markDefsFragment) |
| **markDefsFragment** | Utility | query.ts | Unmigrated (rich text pattern) |

---

## Import Status by Fragment

### ✓ Already Using Package Imports (Correct)

```typescript
import { heroSectionFragment } from "@walter/sanity-blocks/fragments/hero-section";
import { ctaBlock } from "@walter/sanity-blocks/fragments/cta";
import { faqSectionFragment } from "@walter/sanity-blocks/fragments/faq-accordion";
import { buttonsFragment } from "@walter/sanity-atoms/fragments/buttons";
import { richTextFragment } from "@walter/sanity-atoms/fragments/rich-text";
```

### ❌ Commented Out (Could Be Used)

```typescript
// import { imageFields, imageFragment } from "@walter/sanity-atoms/fragments/image";
```

Reason: Defined locally in query.ts instead (duplicate)

### ❌ Using Local Definitions (Conflict)

```typescript
// Local definitions in query.ts that shadow package exports:
export const imageFields = /* groq */ `...`;
export const imageFragment = /* groq */ `...`;

// Local definitions for unmigrated utilities:
const customLinkFragment = /* groq */ `...`;
const markDefsFragment = /* groq */ `...`;

// Local block definitions (override packages):
const imageLinkCardsBlock = /* groq */ `...`;
const subscribeNewsletterBlock = /* groq */ `...`;
const featureCardsIconBlock = /* groq */ `...`;  // Not even exported from packages
```

---

## Package Structure Comparison

### sanity-blocks Structure
```
packages/sanity-blocks/src/
├── cta.schema.ts
├── cta.fragment.ts
├── faq-accordion.schema.ts
├── faq-accordion.fragment.ts
├── feature-cards-icon.schema.ts
├── feature-cards-icon.fragment.ts
├── hero-section.schema.ts
├── hero-section.fragment.ts
├── image-link-cards.schema.ts
├── image-link-cards.fragment.ts
├── subscribe-newsletter.schema.ts
├── subscribe-newsletter.fragment.ts
└── package.json (exports: "./fragments/*": "./src/*.fragment.ts")
```

**Total:** 6 blocks with 6 fragments
**Has index.ts:** NO
**Imports:** Must use full path: `@walter/sanity-blocks/fragments/hero-section`

### sanity-atoms Structure
```
packages/sanity-atoms/src/
├── button.schema.ts
├── button.fragment.ts
├── buttons.schema.ts
├── buttons.fragment.ts
├── custom-url.schema.ts
├── custom-url.fragment.ts
├── image.fragment.ts
├── rich-text.schema.ts
├── rich-text.fragment.ts
└── package.json (exports: "./fragments/*": "./src/*.fragment.ts")
```

**Total:** 4+ atoms with 5+ fragments
**Has index.ts:** NO
**Imports:** Must use full path: `@walter/sanity-atoms/fragments/buttons`

### template-web Current Structure
```
apps/template-web/src/lib/sanity/
├── query.ts               # Contains 10+ local fragment definitions
├── i18n.ts               # Contains translationsFragment
├── client.ts
├── link-helpers.ts
├── locale-mapper.ts
├── live.ts
├── redirect-query.ts
├── sanity.types.ts
└── token.ts
```

**Total:** 10+ fragments (3 duplicated, 2 commented imports)
**Has fragments/ subdirectory:** NO
**Structure:** All inline in query.ts

---

## What Needs to Happen for Full Migration

### Tier 1: Fix Duplicates (HIGH PRIORITY)

1. **Remove imageFragment & imageFields from query.ts**
   - Currently defined locally (duplicate of atoms)
   - Import is commented out
   - Action: Remove local definitions, uncomment import

2. **Replace local block fragments with package versions**
   - Remove: `imageLinkCardsBlock`, `subscribeNewsletterBlock`, `featureCardsIconBlock`
   - Replace with: imported versions from sanity-blocks
   - Action: Analyze differences, potentially update schemas to match migrated fragments

### Tier 2: Migrate Utility Fragments (MEDIUM PRIORITY)

3. **Migrate customLinkFragment**
   - Currently: Used only by markDefsFragment
   - Belongs to: sanity-atoms (generic link pattern)
   - Action: Create `custom-link.fragment.ts` in sanity-atoms

4. **Migrate markDefsFragment**
   - Currently: Used by rich text processing
   - Belongs to: sanity-atoms (extend richTextFragment)
   - Action: Could be exported from rich-text.fragment.ts or separate file

### Tier 3: Document Fragments (LOW PRIORITY - Keep Local)

5. **Keep these in query.ts (document-specific)**
   - `blogAuthorFragment` - Blog doc specific
   - `blogCardFragment` - Blog doc specific
   - `ogFieldsFragment` - Meta tag specific
   - Action: Document as intentional, add comments explaining why they stay

### Tier 4: Optional Organization Improvements (NICE TO HAVE)

6. **Create index.ts files** in packages for barrel exports
   - Allows: `import { heroSectionFragment } from '@walter/sanity-blocks'`
   - Current limitation: Must use full path imports
   - Action: Add index.ts files to both packages

7. **Reorganize into subdirectories** (optional)
   - Current: Flat structure in src/
   - Proposed: `src/blocks/` and `src/atoms/` with nested files
   - Action: Requires package.json export path updates

---

## Quick Checklist for Fragment Migration

- [ ] **Tier 1: Remove Duplicates**
  - [ ] Delete local `imageFields` from query.ts
  - [ ] Delete local `imageFragment` from query.ts
  - [ ] Uncomment import from `@walter/sanity-atoms/fragments/image`
  - [ ] Test that imports work
  
  - [ ] Analyze `imageLinkCardsBlock` vs `imageLinkCardsFragment` differences
  - [ ] Update schema or fragment to match (TBD)
  - [ ] Replace local with imported version
  - [ ] Test functionality
  
  - [ ] Analyze `subscribeNewsletterBlock` vs `subscribeNewsletterFragment` differences
  - [ ] Update schema or fragment to match (TBD)
  - [ ] Replace local with imported version
  - [ ] Test functionality
  
  - [ ] Analyze `featureCardsIconBlock` vs `featureCardsIconFragment` differences
  - [ ] Note: featureCardsIcon in packages uses proper naming
  - [ ] Replace local with imported version
  - [ ] Test functionality

- [ ] **Tier 2: Migrate Utilities**
  - [ ] Create `custom-link.fragment.ts` in sanity-atoms
  - [ ] Export from new file
  - [ ] Replace template-web local with import
  - [ ] Update `markDefsFragment` to use imported `customLinkFragment`
  - [ ] Test rich text rendering

- [ ] **Tier 3: Document & Organize**
  - [ ] Add comments to query.ts explaining why some fragments stay local
  - [ ] Create README in template-web/src/lib/sanity/ explaining fragment strategy
  - [ ] Document which fragments are document-specific vs reusable

---

## File Locations Reference

### Read These Files to Understand Current State
- `/apps/template-web/src/lib/sanity/query.ts` - All local fragments
- `/apps/template-web/src/lib/sanity/i18n.ts` - i18n fragments
- `/packages/sanity-blocks/src/*.fragment.ts` - Block fragments
- `/packages/sanity-atoms/src/*.fragment.ts` - Atom fragments

### Example Fragment Files
- Migrated block: `/packages/sanity-blocks/src/hero-section.fragment.ts`
- Migrated atom: `/packages/sanity-atoms/src/rich-text.fragment.ts`
- Duplicated: `/apps/template-web/src/lib/sanity/query.ts` (lines 12-32)
- Unmigrated: `/apps/template-web/src/lib/sanity/query.ts` (lines 35-55)

---

## Next Steps for Planning

### Data Gathering Complete ✓
- Identified all fragments (22 total)
- Mapped duplication issues (6 problematic)
- Found utility fragments (2 unmigrated)
- Documented structure (3 different locations)

### Ready for Decision
1. **How to handle block fragment differences?**
   - Should schemas be updated to match migrated fragments?
   - Or should migrated fragments be updated to match current usage?

2. **Should customLinkFragment be in atoms?**
   - Currently only used by markDefsFragment (both utilities)
   - Could be part of custom-url.fragment.ts or separate

3. **Create index.ts for barrel imports?**
   - Improves ergonomics but changes structure
   - Requires decision on how to handle

### Migration Strategy Options
A. **Minimal**: Remove duplicates, keep local where necessary
B. **Complete**: Move all reusable fragments to packages + add index files
C. **Hybrid**: Focus on Tier 1 first, decide on optional improvements later
