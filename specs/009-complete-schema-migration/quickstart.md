# Quick Start: Complete Schema Migration

**Audience**: Developers implementing or maintaining migrated schemas
**Time to Complete**: 5-10 minutes (reading), 2-3 hours (implementation)
**Prerequisites**: Familiarity with Sanity schemas, TypeScript, GROQ queries

## Overview

This guide walks through migrating Sanity schema definitions from `apps/template-studio` to shared workspace packages (`@workspace/sanity-atoms`, `@workspace/sanity-blocks`) following the established pattern from spec 007/008.

## Quick Reference

### Migration Checklist

**Atoms (Priority 1)**
- [ ] Migrate `button` schema to `packages/sanity-atoms/src/button.schema.ts`
- [ ] Create `button` fragment in `packages/sanity-atoms/src/button.fragment.ts`
- [ ] Migrate `customUrl` schema to `packages/sanity-atoms/src/customUrl.schema.ts`
- [ ] Create `customUrl` fragment in `packages/sanity-atoms/src/customUrl.fragment.ts`

**Blocks (Priority 2)**
- [ ] Complete `packages/sanity-blocks/src/faqAccordion.schema.ts`
- [ ] Migrate `featureCardsIcon` schema to packages
- [ ] Migrate `imageLinkCards` schema to packages
- [ ] Migrate `subscribeNewsletter` schema to packages
- [ ] Create fragments for all 4 blocks

**Template-Studio Cleanup (Priority 3)**
- [ ] Update `apps/template-studio/schemaTypes/definitions/index.ts`
- [ ] Update `apps/template-studio/schemaTypes/blocks/index.ts`
- [ ] Delete duplicate atom files (button.ts, custom-url.ts)
- [ ] Delete duplicate block files (faq-accordion.ts, etc.)

**Verification (Priority 4)**
- [ ] Run `pnpm check-types` (must pass)
- [ ] Run `pnpm build` (must succeed)
- [ ] Run `pnpm --filter template-studio dev` (must start without errors)
- [ ] Verify blocks appear in Studio pageBuilder UI

---

## Step-by-Step Guide

### Step 1: Migrate Atom Schemas (Priority 1)

#### 1.1 Migrate `button` Schema

**Source**: `apps/template-studio/schemaTypes/definitions/button.ts`
**Target**: `packages/sanity-atoms/src/button.schema.ts`

**Changes Required**:
1. Copy file to target location
2. Replace helper imports with inline logic:

```typescript
// Before (template-studio)
import { capitalize, createRadioListLayout } from "../../utils/helper";

const buttonVariants = ["default", "secondary", "outline", "link"];
options: createRadioListLayout(buttonVariants, { direction: "horizontal" })

// After (sanity-atoms package)
const buttonVariants = ["default", "secondary", "outline", "link"];
options: {
  layout: "radio",
  direction: "horizontal",
  list: buttonVariants.map(v => ({
    title: v.charAt(0).toUpperCase() + v.slice(1),
    value: v
  }))
}
```

3. Rename export:
```typescript
// Before
export const button = defineType({ ... })

// After
export const buttonSchema = defineType({ ... })
```

4. Schema `name` stays: `name: "button"` (no change)

#### 1.2 Create `button` Fragment

**Target**: `packages/sanity-atoms/src/button.fragment.ts`

```typescript
import { customUrlFragment } from "@workspace/sanity-atoms/fragments/custom-url";

export const buttonFragment = /* groq */ `
  variant,
  text,
  ${customUrlFragment}
`;
```

**Note**: Use direct imports with wildcard pattern, not relative paths.

#### 1.3 Migrate `customUrl` Schema

**Source**: `apps/template-studio/schemaTypes/definitions/custom-url.ts`
**Target**: `packages/sanity-atoms/src/customUrl.schema.ts`

**Changes Required**:
1. Copy file to target location
2. Inline `createRadioListLayout` helper:

```typescript
// Before
options: createRadioListLayout(["internal", "external"])

// After
options: {
  layout: "radio",
  list: [
    { title: "Internal", value: "internal" },
    { title: "External", value: "external" }
  ]
}
```

3. Inline `isValidUrl` helper in validation:

```typescript
validation: (Rule) => [
  Rule.custom((value, { parent }) => {
    const type = (parent as { type?: string })?.type;
    if (type === "external") {
      if (!value) return "URL can't be empty";

      // Inline isValidUrl logic
      try {
        new URL(value);
        return true;
      } catch {
        const isRelative = value.startsWith("/") || value.startsWith("#") || value.startsWith("?");
        if (!isRelative) return "Invalid URL";
      }
    }
    return true;
  }),
]
```

4. Rename export:
```typescript
export const customUrlSchema = defineType({ ... })
```

#### 1.4 Create `customUrl` Fragment

**Target**: `packages/sanity-atoms/src/customUrl.fragment.ts`

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

#### 1.5 Configure Wildcard Exports

**File**: `packages/sanity-atoms/package.json`

```json
{
  "exports": {
    "./schemas/*": "./src/*.schema.ts",
    "./fragments/*": "./src/*.fragment.ts"
  }
}
```

**File**: Root `tsconfig.json` + `apps/template-studio/tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@workspace/sanity-atoms/schemas/*": ["./packages/sanity-atoms/src/*.schema.ts"],
      "@workspace/sanity-atoms/fragments/*": ["./packages/sanity-atoms/src/*.fragment.ts"]
    }
  }
}
```

**⚠️ IMPORTANT**: Do NOT create `schemas.ts` or `fragments.ts` barrel files. Use direct imports only.

#### 1.6 Verify Atom Migration

```bash
# Type check
pnpm --filter @workspace/sanity-atoms check-types

# Should output: No errors
```

---

### Step 2: Migrate Block Schemas (Priority 2)

#### 2.1 Complete `faqAccordion` Schema

**File**: `packages/sanity-blocks/src/faqAccordion.schema.ts` (currently empty)

**Copy from**: `apps/template-studio/schemaTypes/blocks/faq-accordion.ts`

**Changes Required**:
1. Copy entire file content
2. Update import to use direct package import:

```typescript
// Before
import { customRichText } from "../definitions/rich-text";

// After
import { customRichText } from "@workspace/sanity-atoms/schemas/rich-text";
```

3. Rename export:
```typescript
export const faqAccordionSchema = defineType({ ... })
```

4. Schema `name` stays: `name: "faqAccordion"`

#### 2.2 Migrate `featureCardsIcon` Schema

**Source**: `apps/template-studio/schemaTypes/blocks/feature-cards-icon.ts`
**Target**: `packages/sanity-blocks/src/featureCardsIcon.schema.ts`

**Changes Required**:
1. Copy file to target location
2. Remove `iconField` import, inline definition:

```typescript
// Before
import { iconField } from "../common";

fields: [
  iconField,
  // ...
]

// After
import { defineField } from "sanity";

fields: [
  defineField({
    name: "icon",
    title: "Icon",
    type: "iconPicker",
    options: {
      storeSvg: true,
      providers: ["fi"]
    },
    description: "Choose a small picture symbol to represent this item"
  }),
  // ...
]
```

3. Update import to use direct package import:
```typescript
// Before
import { customRichText } from "../definitions/rich-text";

// After
import { customRichText } from "@workspace/sanity-atoms/schemas/rich-text";
```

4. Rename export:
```typescript
export const featureCardsIconSchema = defineType({ ... })
```

#### 2.3 Migrate `imageLinkCards` Schema

**Source**: `apps/template-studio/schemaTypes/blocks/image-link-cards.ts`
**Target**: `packages/sanity-blocks/src/imageLinkCards.schema.ts`

**Changes Required**:
1. Copy file to target location
2. Update imports to use direct package imports:

```typescript
// Before
import { buttonsField } from "../common";
import { customRichText } from "../definitions/rich-text";

// After
import { buttonsFieldSchema } from "@workspace/sanity-atoms/schemas/buttons";
import { customRichText } from "@workspace/sanity-atoms/schemas/rich-text";
```

3. Update field reference:
```typescript
// Before
buttonsField,

// After
buttonsFieldSchema,
```

4. Rename export:
```typescript
export const imageLinkCardsSchema = defineType({ ... })
```

#### 2.4 Migrate `subscribeNewsletter` Schema

**Source**: `apps/template-studio/schemaTypes/blocks/subscribe-newsletter.ts`
**Target**: `packages/sanity-blocks/src/subscribeNewsletter.schema.ts`

**Changes Required**:
1. Copy file to target location
2. Update import to use direct package import:

```typescript
// Before
import { customRichText } from "../definitions/rich-text";

// After
import { customRichText } from "@workspace/sanity-atoms/schemas/rich-text";
```

3. Rename export:
```typescript
export const subscribeNewsletterSchema = defineType({ ... })
```

#### 2.5 Create Block Fragments

**See**: `specs/009-complete-schema-migration/contracts/blocks.groq` for complete fragment definitions

**Files to Create**:
- `packages/sanity-blocks/src/faqAccordion.fragment.ts`
- `packages/sanity-blocks/src/featureCardsIcon.fragment.ts`
- `packages/sanity-blocks/src/imageLinkCards.fragment.ts`
- `packages/sanity-blocks/src/subscribeNewsletter.fragment.ts`

**Pattern** (example for faqAccordion):
```typescript
import { customUrlFragment } from "@workspace/sanity-atoms/fragments/custom-url";

export const faqAccordionFragment = /* groq */ `
  _type == "faqAccordion" => {
    eyebrow,
    title,
    subtitle,
    "link": link {
      title,
      description,
      ${customUrlFragment}
    },
    "faqs": faqs[]->{
      _id,
      question,
      answer
    }
  },
`;
```

**Note**: Always use direct file imports with wildcard pattern (e.g., `@workspace/sanity-atoms/fragments/custom-url`), never barrel exports.

#### 2.6 Verify Block Migration

```bash
# Type check
pnpm --filter @workspace/sanity-blocks check-types

# Should output: No errors
```

---

### Step 3: Update Template-Studio Imports (Priority 3)

#### 3.1 Update Atom Imports

**File**: `apps/template-studio/schemaTypes/definitions/index.ts`

```typescript
// Before
import { button } from "./button";
import { customUrl } from "./custom-url";

export const definitions = [
  button,
  customUrl,
  // ... other definitions
];

// After
import { buttonSchema } from "@workspace/sanity-atoms/schemas/button";
import { customUrlSchema } from "@workspace/sanity-atoms/schemas/custom-url";

export const definitions = [
  buttonSchema,
  customUrlSchema,
  // ... other definitions
];
```

**Note**: Use direct file imports with wildcard pattern, not barrel exports.

#### 3.2 Update Block Imports

**File**: `apps/template-studio/schemaTypes/blocks/index.ts`

```typescript
// Before
import { faqAccordion } from "./faq-accordion";
import { featureCardsIcon } from "./feature-cards-icon";
import { imageLinkCards } from "./image-link-cards";
import { subscribeNewsletter } from "./subscribe-newsletter";

export const pageBuilderBlocks = [
  faqAccordion,
  featureCardsIcon,
  imageLinkCards,
  subscribeNewsletter,
];

// After
import { heroSectionSchema } from "@workspace/sanity-blocks/schemas/hero-section";
import { ctaSchema } from "@workspace/sanity-blocks/schemas/cta";
import { faqAccordionSchema } from "@workspace/sanity-blocks/schemas/faq-accordion";
import { featureCardsIconSchema } from "@workspace/sanity-blocks/schemas/feature-cards-icon";
import { imageLinkCardsSchema } from "@workspace/sanity-blocks/schemas/image-link-cards";
import { subscribeNewsletterSchema } from "@workspace/sanity-blocks/schemas/subscribe-newsletter";

export const pageBuilderBlocks = [
  heroSectionSchema,
  ctaSchema,
  faqAccordionSchema,
  featureCardsIconSchema,
  imageLinkCardsSchema,
  subscribeNewsletterSchema,
];
```

**Note**: Use direct file imports with wildcard pattern, not barrel exports.

#### 3.3 Verify Studio Imports

```bash
# Type check template-studio
pnpm --filter template-studio check-types

# Build template-studio
pnpm --filter template-studio build

# Should both succeed with no errors
```

---

### Step 4: Delete Duplicate Files (Priority 3)

**Only delete files after verifying Step 3 passes all checks!**

```bash
cd apps/template-studio/schemaTypes

# Delete duplicate atom files
rm definitions/button.ts
rm definitions/custom-url.ts

# Delete duplicate block files
rm blocks/faq-accordion.ts
rm blocks/feature-cards-icon.ts
rm blocks/image-link-cards.ts
rm blocks/subscribe-newsletter.ts
```

#### 4.1 Verify Deletions

```bash
# Search for duplicate schema definitions (should return 0 results)
rg "name: \"button\"" apps/template-studio/schemaTypes
rg "name: \"customUrl\"" apps/template-studio/schemaTypes
rg "name: \"faqAccordion\"" apps/template-studio/schemaTypes
rg "name: \"featureCardsIcon\"" apps/template-studio/schemaTypes
rg "name: \"imageLinkCards\"" apps/template-studio/schemaTypes
rg "name: \"subscribeNewsletter\"" apps/template-studio/schemaTypes

# Type check (should still pass)
pnpm check-types
```

---

### Step 5: Final Verification (Priority 4)

#### 5.1 Run All Type Checks

```bash
# From repo root
pnpm check-types

# Expected output: No errors across all workspaces
```

#### 5.2 Run All Builds

```bash
# From repo root
pnpm build

# Expected output: Successful builds for all packages
```

#### 5.3 Test Studio Dev Server

```bash
# Start Studio
pnpm --filter template-studio dev

# Expected:
# 1. Server starts without errors
# 2. Visit http://localhost:3333
# 3. Create or edit a page with pageBuilder
# 4. Verify all 6 blocks appear in block menu:
#    - Hero, CTA, FAQ Accordion, Feature Cards Icon,
#      Image Link Cards, Subscribe Newsletter
# 5. Test adding/editing each block
# 6. Verify preview renders correctly
```

#### 5.4 Test Fragment Queries (Optional)

1. Open Sanity Studio Vision tab (http://localhost:3333/vision)
2. Run test query:

```groq
*[_type == "page"][0]{
  title,
  pageBuilder[]{
    ...,
    _type,
    _type == "faqAccordion" => {
      eyebrow,
      title,
      "faqs": faqs[]->{ question, answer }
    }
  }
}
```

3. Verify query returns complete data with no undefined fields

---

## Common Issues & Solutions

### Issue: "Cannot find module '@workspace/sanity-atoms/schemas/button'"

**Cause**: Package not installed, TypeScript not resolving workspace dependencies, or wildcard paths not configured

**Solution**:
```bash
# Re-install dependencies
pnpm install

# Verify package.json has workspace dependency
cat apps/template-studio/package.json | grep "@workspace/sanity-atoms"
# Should show: "@workspace/sanity-atoms": "workspace:*"

# Verify tsconfig.json has wildcard path mappings
cat tsconfig.json | grep "@workspace/sanity-atoms/schemas"
# Should show: "@workspace/sanity-atoms/schemas/*": ["./packages/sanity-atoms/src/*.schema.ts"]
```

---

### Issue: Type errors for schema fields after migration

**Cause**: Import using wrong export name (e.g., `button` instead of `buttonSchema`) or wrong import path

**Solution**: Verify export names and paths match:
```typescript
// In package
export const buttonSchema = defineType({ name: "button", ... })

// In template-studio (use direct file import)
import { buttonSchema } from "@workspace/sanity-atoms/schemas/button"
```

---

### Issue: Studio dev server fails with "Schema type 'button' not found"

**Cause**: Schema not registered in Studio configuration

**Solution**: Verify `schemaTypes/index.ts` includes all schemas:
```typescript
import { definitions } from "./definitions";
import { pageBuilderBlocks } from "./blocks";

export const schemaTypes = [
  ...definitions,
  ...pageBuilderBlocks,
  // ...
];
```

---

### Issue: Blocks don't appear in pageBuilder block menu

**Cause**: Block schemas not included in pageBuilder definition

**Solution**: Verify `schemaTypes/blocks/pagebuilder.ts` references all blocks:
```typescript
import { pageBuilderBlocks } from "./index";

export const pagebuilder = defineType({
  name: "pageBuilder",
  type: "array",
  of: pageBuilderBlocks.map(block => ({ type: block.name }))
});
```

---

## Next Steps

After completing migration:

1. **Update Frontend Queries** (`apps/template-web`):
   - Import fragments using direct file imports (e.g., `@workspace/sanity-atoms/fragments/custom-url`, `@workspace/sanity-blocks/fragments/faq-accordion`)
   - Update pageBuilder query to include new block fragments

2. **Create Frontend Components** (if not exists):
   - `apps/template-web/src/blocks/FaqAccordion/FaqAccordion.tsx`
   - `apps/template-web/src/blocks/FeatureCardsIcon/FeatureCardsIcon.tsx`
   - `apps/template-web/src/blocks/ImageLinkCards/ImageLinkCards.tsx`
   - `apps/template-web/src/blocks/SubscribeNewsletter/SubscribeNewsletter.tsx`

3. **Register Components in PageBuilder**:
   - Update `apps/template-web/src/components/pagebuilder.tsx` to map block types to components

4. **Regenerate Sanity Types**:
```bash
pnpm --filter template-studio type
```

---

## Reference Files

- **Research**: [research.md](./research.md) - Technical decisions and patterns
- **Data Model**: [data-model.md](./data-model.md) - Entity definitions and relationships
- **Contracts**: [contracts/](./contracts/) - GROQ fragment contracts
- **Spec**: [spec.md](./spec.md) - Feature requirements and acceptance criteria
- **Plan**: [plan.md](./plan.md) - Implementation plan and structure

---

## Success Criteria

Migration is complete when:
- ✅ All 2 atom schemas migrated to `@workspace/sanity-atoms`
- ✅ All 4 block schemas migrated to `@workspace/sanity-blocks`
- ✅ All 6 fragments created (2 atoms + 4 blocks)
- ✅ Template-studio imports from packages (no local files)
- ✅ All duplicate files deleted
- ✅ `pnpm check-types` passes
- ✅ `pnpm build` succeeds
- ✅ Studio dev server starts without errors
- ✅ All 6 blocks appear in pageBuilder UI
