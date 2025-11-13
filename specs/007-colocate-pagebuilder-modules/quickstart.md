# Developer Quickstart: Co-located Page Builder Blocks

**Feature**: 007-colocate-pagebuilder-modules
**Created**: 2025-11-13
**Purpose**: Guide for working with reorganized page builder block structure

## Before/After Structure Comparison

### Before: Scattered Files

```
apps/studio/schemaTypes/blocks/hero.ts      # Schema definition
apps/web/src/components/sections/hero.tsx   # React component
apps/web/src/lib/sanity/query.ts            # Fragment buried in 482-line file (line ~XX)
```

**Problems**:
- Hard to find all related files for a block
- Query file too large to navigate
- No clear ownership of block files

### After: Organized Structure

```
packages/sanity-blocks/src/hero-section/
├── hero-section.schema.ts      # Schema definition
└── hero-section.fragment.ts    # GROQ fragment

apps/web/src/blocks/HeroSection/
└── HeroSection.tsx              # React component

apps/web/src/lib/sanity/queries/page.ts  # Organized by document type
```

**Benefits**:
- Schemas and fragments co-located in shared package
- Components organized in dedicated directory
- Queries organized by document type
- Clear ownership and discoverability

---

## Adding a New Block

### Step 1: Create Schema and Fragment in Shared Package

```bash
# Create block directory
mkdir -p packages/sanity-blocks/src/testimonials

# Create schema file
touch packages/sanity-blocks/src/testimonials/testimonials.schema.ts

# Create fragment file
touch packages/sanity-blocks/src/testimonials/testimonials.fragment.ts
```

### Step 2: Write Schema Definition

**File**: `packages/sanity-blocks/src/testimonials/testimonials.schema.ts`

```typescript
import { defineField, defineType } from 'sanity'

export const testimonialsSchema = defineType({
  name: 'testimonials',               // camelCase for Sanity
  title: 'Testimonials',              // Display name in Studio
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      title: 'Heading',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'testimonials',
      type: 'array',
      title: 'Testimonials',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'quote', type: 'text', title: 'Quote' },
            { name: 'author', type: 'string', title: 'Author' },
            { name: 'role', type: 'string', title: 'Role' },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
    },
    prepare: ({ heading }) => ({
      title: heading || 'Testimonials',
      subtitle: 'Testimonials Block',
    }),
  },
})
```

### Step 3: Write GROQ Fragment

**File**: `packages/sanity-blocks/src/testimonials/testimonials.fragment.ts`

```typescript
export const testimonialsFragment = /* groq */ `
  _type == "testimonials" => {
    ...,
    testimonials[] {
      quote,
      author,
      role
    }
  }
`
```

### Step 4: Export from Shared Package

**File**: `packages/sanity-blocks/src/index.ts`

```typescript
// Add to existing exports
export { testimonialsSchema } from './testimonials/testimonials.schema'
export { testimonialsFragment } from './testimonials/testimonials.fragment'

// Update allBlockSchemas array
export const allBlockSchemas = [
  heroSectionSchema,
  ctaSchema,
  faqAccordionSchema,
  featureCardsIconSchema,
  imageLinkCardsSchema,
  subscribeNewsletterSchema,
  testimonialsSchema,  // Add new schema
]
```

### Step 5: Create React Component

```bash
# Create component directory
mkdir -p apps/web/src/blocks/Testimonials

# Create component file
touch apps/web/src/blocks/Testimonials/Testimonials.tsx
```

**File**: `apps/web/src/blocks/Testimonials/Testimonials.tsx`

```typescript
import type { FC } from 'react'
import type { Testimonials as TestimonialsType } from '@/lib/sanity/sanity.types'

type Props = TestimonialsType

export const Testimonials: FC<Props> = ({ heading, testimonials }) => {
  return (
    <section className="container py-12">
      <h2 className="text-3xl font-bold mb-8">{heading}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials?.map((testimonial, index) => (
          <div key={index} className="rounded-lg border p-6">
            <p className="mb-4 italic">"{testimonial.quote}"</p>
            <div>
              <p className="font-semibold">{testimonial.author}</p>
              <p className="text-sm text-gray-600">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

### Step 6: Register Component in PageBuilder

**File**: `apps/web/src/components/pagebuilder.tsx`

```typescript
// Add import
import { Testimonials } from '@/blocks/Testimonials/Testimonials'

// Update BLOCK_COMPONENTS mapping
const BLOCK_COMPONENTS = {
  cta: CTABlock,
  faqAccordion: FaqAccordion,
  hero: HeroBlock,
  featureCardsIcon: FeatureCardsWithIcon,
  subscribeNewsletter: SubscribeNewsletter,
  imageLinkCards: ImageLinkCards,
  testimonials: Testimonials,  // Add new component
} as const satisfies Record<PageBuilderBlockTypes, React.ComponentType<any>>
```

### Step 7: Add Fragment to PageBuilder Aggregator

**File**: `apps/web/src/lib/sanity/fragments/pageBuilder/index.ts`

```typescript
import {
  heroSectionFragment,
  ctaFragment,
  faqAccordionFragment,
  featureCardsIconFragment,
  imageLinkCardsFragment,
  subscribeNewsletterFragment,
  testimonialsFragment,  // Add import
} from '@workspace/sanity-blocks'

export const pageBuilderFragment = /* groq */ `
  pageBuilder[]{
    ...,
    _type,
    ${heroSectionFragment},
    ${ctaFragment},
    ${faqAccordionFragment},
    ${featureCardsIconFragment},
    ${imageLinkCardsFragment},
    ${subscribeNewsletterFragment},
    ${testimonialsFragment}
  }
`
```

### Step 8: Regenerate Types and Verify

```bash
# Regenerate Sanity types
pnpm --filter studio type

# Type check both workspaces
pnpm --filter studio check-types
pnpm --filter web check-types

# Build to verify
pnpm --filter studio build
pnpm --filter web build

# Test dev server
pnpm --filter studio dev &  # Starts in background
pnpm --filter web dev       # Check for errors, then Ctrl+C
```

---

## Modifying an Existing Block

### Scenario: Add a new field to Hero block

1. **Update Schema** (`packages/sanity-blocks/src/hero-section/hero-section.schema.ts`):
```typescript
export const heroSectionSchema = defineType({
  name: 'heroSection',
  fields: [
    // ... existing fields ...
    defineField({
      name: 'videoUrl',       // New field
      type: 'url',
      title: 'Video URL',
      description: 'Optional video URL to display instead of image',
    }),
  ],
})
```

2. **Update Fragment** (`packages/sanity-blocks/src/hero-section/hero-section.fragment.ts`):
```typescript
export const heroSectionFragment = /* groq */ `
  _type == "heroSection" => {
    ...,
    ${imageFragment},
    ${buttonsFragment},
    videoUrl  // Add new field
  }
`
```

3. **Update Component** (`apps/web/src/blocks/HeroSection/HeroSection.tsx`):
```typescript
export const HeroSection: FC<Props> = ({ heading, excerpt, buttons, image, videoUrl }) => {
  return (
    <section>
      {videoUrl ? (
        <video src={videoUrl} controls />
      ) : image ? (
        <SanityImage {...image} />
      ) : null}
      <h1>{heading}</h1>
      {/* ... rest of component ... */}
    </section>
  )
}
```

4. **Regenerate Types**:
```bash
pnpm --filter studio type
pnpm check-types
```

**All three files are easy to find** - schemas and fragments are in the same package directory!

---

## Finding Queries by Document Type

### Quick Reference

| Document Type | Query File | Queries Available |
|--------------|------------|-------------------|
| Home Page | `queries/home.ts` | `queryHomePageData` |
| Regular Pages | `queries/page.ts` | `querySlugPageData`, `queryAllLocalizedPages` |
| Blog | `queries/blog.ts` | `queryBlogIndexPageData`, `queryBlogSlugPageData` |
| Navigation | `queries/navbar.ts` | `queryNavbarData` |
| Footer | `queries/footer.ts` | `queryFooterData` |
| Settings | `queries/settings.ts` | `querySettingsData` |

### Example: Modifying Page Query

**File**: `apps/web/src/lib/sanity/queries/page.ts`

```typescript
import { defineQuery } from 'next-sanity'
import { pageBuilderFragment } from '@/lib/sanity/fragments/pageBuilder'
import { translationsFragment } from '@/lib/sanity/i18n'

export const querySlugPageData = defineQuery(/* groq */ `
  *[_type == "page" && slug.current == $slug && language == $locale][0]{
    ...,
    "slug": slug.current,
    ${pageBuilderFragment},
    ${translationsFragment},
    seo {
      metaTitle,
      metaDescription,
      openGraphImage
    }
  }
`)
```

All page-related queries are in one file - easy to find and modify!

---

## Import Patterns

### Importing from Shared Package

```typescript
// Studio: Import schemas
import { heroSectionSchema, allBlockSchemas } from '@workspace/sanity-blocks'

// Web: Import fragments
import { heroSectionFragment, ctaFragment } from '@workspace/sanity-blocks'

// Web: Import both if needed
import {
  heroSectionSchema,
  heroSectionFragment,
  allBlockSchemas,
} from '@workspace/sanity-blocks'
```

### Importing Components

```typescript
// In pagebuilder.tsx or other files
import { HeroSection } from '@/blocks/HeroSection/HeroSection'
import { Testimonials } from '@/blocks/Testimonials/Testimonials'
```

### Importing Fragments and Queries

```typescript
// Atomic fragments
import { imageFields, customLinkFragment } from '@/lib/sanity/fragments/atomic'

// Reusable fragments
import { imageFragment, buttonsFragment } from '@/lib/sanity/fragments/reusable'

// Page builder fragment (aggregated)
import { pageBuilderFragment } from '@/lib/sanity/fragments/pageBuilder'

// Document queries
import { queryHomePageData } from '@/lib/sanity/queries/home'
import { querySlugPageData } from '@/lib/sanity/queries/page'
```

### Backward Compatibility (Barrel Export)

```typescript
// All queries re-exported from index for convenience
import {
  queryHomePageData,
  querySlugPageData,
  queryBlogIndexPageData,
} from '@/lib/sanity/queries'  // index.ts re-exports all
```

---

## Verification Checklist

### After Adding/Modifying a Block

- [ ] Schema file created/updated in `packages/sanity-blocks/src/[block-name]/[block-name].schema.ts`
- [ ] Fragment file created/updated in `packages/sanity-blocks/src/[block-name]/[block-name].fragment.ts`
- [ ] Exported from `packages/sanity-blocks/src/index.ts`
- [ ] Component created/updated in `apps/web/src/blocks/[BlockName]/[BlockName].tsx`
- [ ] Component registered in `apps/web/src/components/pagebuilder.tsx`
- [ ] Fragment added to `apps/web/src/lib/sanity/fragments/pageBuilder/index.ts`
- [ ] Types regenerated: `pnpm --filter studio type`
- [ ] Type checking passes: `pnpm check-types`
- [ ] Builds succeed: `pnpm build`
- [ ] Dev servers start without errors

### Common Issues

**Issue**: Type errors after adding new block
**Solution**: Run `pnpm --filter studio type` to regenerate `sanity.types.ts`

**Issue**: Component not rendering in PageBuilder
**Solution**: Check that block `_type` matches the key in `BLOCK_COMPONENTS` object

**Issue**: Fragment not included in query results
**Solution**: Verify fragment is imported and added to `pageBuilderFragment` template literal

**Issue**: Import errors for `@workspace/sanity-blocks`
**Solution**: Verify workspace dependency added to package.json and run `pnpm install`

---

## File Structure Reference

```
turbo-start-sanity-i18n/
├── packages/
│   └── sanity-blocks/              # Shared package
│       ├── package.json            # @workspace/sanity-blocks
│       ├── tsconfig.json
│       └── src/
│           ├── hero-section/
│           │   ├── hero-section.schema.ts
│           │   └── hero-section.fragment.ts
│           ├── cta/
│           │   ├── cta.schema.ts
│           │   └── cta.fragment.ts
│           └── index.ts            # Barrel exports
│
├── apps/
│   ├── web/
│   │   ├── package.json            # Depends on @workspace/sanity-blocks
│   │   └── src/
│   │       ├── blocks/
│   │       │   ├── HeroSection/
│   │       │   │   └── HeroSection.tsx
│   │       │   └── Cta/
│   │       │       └── Cta.tsx
│   │       ├── components/
│   │       │   ├── pagebuilder.tsx      # Component registry
│   │       │   └── elements/            # Shared UI components
│   │       └── lib/
│   │           └── sanity/
│   │               ├── fragments/
│   │               │   ├── atomic/index.ts
│   │               │   ├── reusable/index.ts
│   │               │   └── pageBuilder/index.ts
│   │               └── queries/
│   │                   ├── home.ts
│   │                   ├── page.ts
│   │                   ├── blog.ts
│   │                   └── index.ts
│   │
│   └── studio/
│       ├── package.json            # Depends on @workspace/sanity-blocks
│       └── schemaTypes/
│           ├── blocks/
│           │   └── index.ts        # Imports from @workspace/sanity-blocks
│           └── definitions/
│               └── pagebuilder.ts
│
└── pnpm-workspace.yaml
```

---

## Quick Commands

```bash
# Type checking
pnpm check-types                    # All workspaces
pnpm --filter studio check-types    # Studio only
pnpm --filter web check-types       # Web only

# Building
pnpm build                          # All workspaces
pnpm --filter studio build          # Studio only
pnpm --filter web build             # Web only

# Development
pnpm dev                            # All workspaces in parallel
pnpm --filter studio dev            # Studio only
pnpm --filter web dev               # Web only

# Type generation
pnpm --filter studio type           # Regenerate sanity.types.ts

# Linting
pnpm lint                           # All workspaces
```

---

## Summary

**Key Principles**:
1. Schemas and fragments live in `@workspace/sanity-blocks` shared package
2. Components live in `apps/web/src/blocks/[BlockName]/`
3. Queries organized by document type in `queries/[type].ts`
4. Always regenerate types after schema changes
5. Verify with type checking, build, and dev server

**File Naming**:
- Schemas: `[block-name].schema.ts` (kebab-case)
- Fragments: `[block-name].fragment.ts` (kebab-case)
- Components: `[BlockName].tsx` (PascalCase)

**Benefits**:
- Clear ownership and organization
- Easy discoverability (< 5 seconds to find files)
- Proper monorepo dependency management
- Type safety maintained throughout
