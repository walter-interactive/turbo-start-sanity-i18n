# Research: File Co-location and Query Organization Patterns

**Created**: 2025-11-13
**Reference Project**: conciliainc.com
**Purpose**: Document proven patterns for co-locating page builder block modules and organizing Sanity queries

## 1. File Naming Conventions

### Decision: Shared Package for Schemas/Fragments, Components in Web App

**Shared Package Structure** (`packages/sanity-blocks/src/`):
```
packages/sanity-blocks/src/
├── hero-section/
│   ├── hero-section.schema.ts      # Sanity schema (kebab-case + .schema.ts suffix)
│   └── hero-section.fragment.ts    # GROQ fragment (kebab-case + .fragment.ts suffix)
├── cta/
│   ├── cta.schema.ts
│   └── cta.fragment.ts
└── index.ts                         # Barrel export for all schemas and fragments
```

**Web App Component Structure** (`apps/web/src/blocks/`):
```
apps/web/src/blocks/
├── HeroSection/
│   └── HeroSection.tsx              # React component (PascalCase)
├── Cta/
│   └── Cta.tsx
└── index.ts                         # Component exports
```

**Naming Conventions**:

| File Type | Location | Naming Pattern | Example |
|-----------|----------|----------------|---------|
| Schema | `packages/sanity-blocks/src/[block-name]/` | `[block-name].schema.ts` | `hero-section.schema.ts` |
| Fragment | `packages/sanity-blocks/src/[block-name]/` | `[block-name].fragment.ts` | `hero-section.fragment.ts` |
| Component | `apps/web/src/blocks/[BlockName]/` | `[BlockName].tsx` | `HeroSection.tsx` |

**Schema Export Convention**:
```typescript
// packages/sanity-blocks/src/hero-section/hero-section.schema.ts
export const heroSectionSchema = defineType({
  name: "heroSection",      // camelCase for Sanity
  title: "Hero Section",    // Spaces for Studio UI
  type: "object",
  fields: [...]
})
```

**Fragment Export Convention**:
```typescript
// packages/sanity-blocks/src/hero-section/hero-section.fragment.ts
export const heroSectionFragment = /* groq */ `
  _type == "heroSection" => {
    ...,
  }
`
```

**Rationale**:
- `.schema.ts` and `.fragment.ts` suffixes clearly indicate purpose
- kebab-case for package files (Node.js/npm convention)
- PascalCase for React components (React convention)
- Shared package enables proper monorepo dependency management
- Both studio and web can import from single source of truth

**Alternative Considered**: Co-locate all three files in web workspace with cross-workspace imports
**Rejected Because**: Cross-workspace imports are an anti-pattern in monorepos, create circular dependency risks, complicate build order, harder to manage workspace boundaries

---

## 2. Shared Package Pattern

### Decision: Schemas and fragments in shared workspace package

**Shared Package Exports** (`packages/sanity-blocks/src/index.ts`):
```typescript
// Schema exports
export { heroSectionSchema } from './hero-section/hero-section.schema'
export { ctaSchema } from './cta/cta.schema'
export { faqAccordionSchema } from './faq-accordion/faq-accordion.schema'
export { featureCardsIconSchema } from './feature-cards-icon/feature-cards-icon.schema'
export { imageLinkCardsSchema } from './image-link-cards/image-link-cards.schema'
export { subscribeNewsletterSchema } from './subscribe-newsletter/subscribe-newsletter.schema'

// Fragment exports
export { heroSectionFragment } from './hero-section/hero-section.fragment'
export { ctaFragment } from './cta/cta.fragment'
export { faqAccordionFragment } from './faq-accordion/faq-accordion.fragment'
export { featureCardsIconFragment } from './feature-cards-icon/feature-cards-icon.fragment'
export { imageLinkCardsFragment } from './image-link-cards/image-link-cards.fragment'
export { subscribeNewsletterFragment } from './subscribe-newsletter/subscribe-newsletter.fragment'

// Aggregate array for easy studio registration
export const allBlockSchemas = [
  heroSectionSchema,
  ctaSchema,
  faqAccordionSchema,
  featureCardsIconSchema,
  imageLinkCardsSchema,
  subscribeNewsletterSchema,
]
```

**Studio Imports** (`apps/studio/schemaTypes/blocks/index.ts`):
```typescript
import { allBlockSchemas } from '@workspace/sanity-blocks'
// or named imports:
// import { heroSectionSchema, ctaSchema, ... } from '@workspace/sanity-blocks'

export const pageBuilderBlocks = allBlockSchemas
```

**Web App Fragment Imports** (`apps/web/src/lib/sanity/fragments/pageBuilder/index.ts`):
```typescript
import {
  heroSectionFragment,
  ctaFragment,
  faqAccordionFragment,
  featureCardsIconFragment,
  imageLinkCardsFragment,
  subscribeNewsletterFragment,
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
    ${subscribeNewsletterFragment}
  }
`
```

**Package Configuration** (`packages/sanity-blocks/package.json`):
```json
{
  "name": "@workspace/sanity-blocks",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "sanity": "workspace:*"
  }
}
```

**Workspace Dependencies**:
```json
// apps/studio/package.json
{
  "dependencies": {
    "@workspace/sanity-blocks": "workspace:*"
  }
}

// apps/web/package.json
{
  "dependencies": {
    "@workspace/sanity-blocks": "workspace:*"
  }
}
```

**Rationale**:
- Proper monorepo dependency management (explicit dependencies in package.json)
- Single source of truth for schemas and fragments
- Both workspaces import from shared package (no cross-workspace relative imports)
- Clear build order: sanity-blocks → studio, sanity-blocks → web
- Easier to test and version schemas independently
- Prevents circular dependencies
- Follows monorepo best practices

**Alternative Considered**: Cross-workspace relative imports (studio importing from web)
**Rejected Because**: Anti-pattern in monorepos, creates implicit dependencies, complicates build order, violates workspace boundaries, difficult to manage in CI/CD, increases risk of circular dependencies

---

## 3. Fragment Composition and Aggregation

### Decision: Template literal composition with conditional GROQ syntax

**Individual Block Fragment** (`packages/sanity-blocks/src/hero-section/hero-section.fragment.ts`):
```typescript
import { buttonsFragment, imageFragment } from '@/lib/sanity/fragments/reusable'

export const heroSectionFragment = /* groq */ `
  _type == "heroSection" => {
    ...,
    ${imageFragment},
    ${buttonsFragment}
  }
`
```

**Central Aggregator** (`apps/web/src/lib/sanity/fragments/pageBuilder/index.ts`):
```typescript
import {
  heroSectionFragment,
  ctaFragment,
  faqAccordionFragment,
  featureCardsIconFragment,
  imageLinkCardsFragment,
  subscribeNewsletterFragment,
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
    ${subscribeNewsletterFragment}
  }
`
```

**Fragment Hierarchy**:
1. **Atomic** (`fragments/atomic/index.ts`): `imageFields`, `customLinkFragment`, `markDefsFragment`
2. **Reusable** (`fragments/reusable/index.ts`): `imageFragment`, `richTextFragment`, `buttonsFragment`
3. **Block-specific** (in shared package): `heroSectionFragment`, `ctaFragment`, etc. (imported from `@workspace/sanity-blocks`)
4. **Document-level** (in query files): `queryHomePageData`, `querySlugPageData`, etc.

**Rationale**:
- Template literals provide type-safe composition
- Conditional GROQ (`_type == "heroSection" => { }`) enables type discrimination
- Fragment reuse reduces duplication
- Clear dependency hierarchy

**Alternative Considered**: String concatenation or GROQ partials
**Rejected Because**: Less type-safe, harder to debug, no IDE support

---

## 4. Query Organization by Document Type

### Decision: Separate query files per document type

**Directory Structure**:
```
apps/web/src/lib/sanity/
├── fragments/
│   ├── atomic/
│   │   └── index.ts          # imageFields, customLinkFragment, markDefsFragment
│   ├── reusable/
│   │   └── index.ts          # imageFragment, richTextFragment, buttonsFragment, blogCardFragment
│   └── pageBuilder/
│       └── index.ts          # pageBuilderFragment (aggregates block fragments)
└── queries/
    ├── home.ts               # queryHomePageData
    ├── page.ts               # querySlugPageData, queryAllLocalizedPages
    ├── blog.ts               # queryBlogIndexPageData, queryBlogSlugPageData
    ├── navbar.ts             # queryNavbarData
    ├── footer.ts             # queryFooterData
    ├── settings.ts           # querySettingsData
    └── index.ts              # Re-exports all queries for backward compatibility
```

**Example Query File** (`queries/page.ts`):
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
    seo { ... }
  }
`)

export const queryAllLocalizedPages = defineQuery(/* groq */ `
  *[_type == "page" && language == $locale]{
    _id,
    title,
    "slug": slug.current,
    language
  }
`)
```

**Central Re-export** (`queries/index.ts`):
```typescript
export { queryHomePageData } from './home'
export { querySlugPageData, queryAllLocalizedPages } from './page'
export { queryBlogIndexPageData, queryBlogSlugPageData } from './blog'
export { queryNavbarData } from './navbar'
export { queryFooterData } from './footer'
export { querySettingsData } from './settings'
```

**Rationale**:
- Document-specific queries are easy to find (navigation time < 5 seconds)
- Related queries grouped together reduce duplication
- Barrel export (`index.ts`) maintains backward compatibility
- Fragment imports show clear dependencies

**Alternative Considered**: Single monolithic `query.ts` file (current state)
**Rejected Because**: 482-line file is hard to navigate, difficult to find specific queries, poor discoverability

---

## 5. Component Variant Patterns

### Decision: Multiple component files in same directory for variants

**Example from conciliainc.com** (`HeroSection/`):
```
# Component directory (apps/web/src/blocks/HeroSection/)
HeroSection/
├── HeroSection.tsx              # Main component with conditional logic
└── ContainedHeroSection.tsx     # Variant component

# Shared package directory (packages/sanity-blocks/src/hero-section/)
hero-section/
├── hero-section.schema.ts       # Single schema with `contained` boolean field
└── hero-section.fragment.ts     # Single fragment (no variant-specific fragments)
```

**Implementation Pattern**:
```typescript
// apps/web/src/blocks/HeroSection/HeroSection.tsx (main component)
import { ContainedHeroSection } from './ContainedHeroSection'

export const HeroSection: FC<Props> = ({ contained = false, ...props }) => {
  if (contained) {
    return <ContainedHeroSection {...props} />
  }
  return <div>{/* default layout */}</div>
}
```

**Rationale**:
- One schema definition drives multiple UI variants
- Variant components are sibling files (easy to discover)
- Main component handles conditional rendering logic
- Variants share the same GROQ fragment

**Alternative Considered**: Nested `variants/` directory or separate block directories
**Rejected Because**: Increases nesting complexity, harder to discover related files, variants are implementation details not public API

---

## 6. Optional Fragment Files

### Decision: Fragment files are optional when default GROQ spread is sufficient

**Example from conciliainc.com**: `case-study-details/` has no fragment file
- Component exists: `apps/web/src/blocks/CaseStudyDetails/CaseStudyDetails.tsx`
- Schema exists: `packages/sanity-blocks/src/case-study-details/case-study-details.schema.ts`
- Fragment missing: No custom query needed (default GROQ spread is sufficient)

**When to omit fragment**:
- Block only uses default fields (no custom query logic)
- GROQ spread operator `...` is sufficient
- No nested fragments or special field selections needed

**Rationale**:
- Reduces boilerplate for simple blocks
- Fragment files only needed when custom queries required
- Default GROQ spread handles most cases

---

## 7. Block Registry and Component Mapping

### Decision: Central registry files aggregate all blocks

**Studio Block Registry** (`apps/studio/schemaTypes/blocks/index.ts`):
```typescript
import { allBlockSchemas } from '@workspace/sanity-blocks'
// or named imports:
// import {
//   heroSectionSchema,
//   ctaSchema,
//   faqAccordionSchema,
//   featureCardsIconSchema,
//   imageLinkCardsSchema,
//   subscribeNewsletterSchema,
// } from '@workspace/sanity-blocks'

export const pageBuilderBlocks = allBlockSchemas
```

**Web Component Mapping** (`apps/web/src/components/pagebuilder.tsx`):
```typescript
import { Cta } from '@/blocks/Cta/Cta'
import { HeroSection } from '@/blocks/HeroSection/HeroSection'
import { FaqAccordion } from '@/blocks/FaqAccordion/FaqAccordion'
import { FeatureCardsIcon } from '@/blocks/FeatureCardsIcon/FeatureCardsIcon'
import { ImageLinkCards } from '@/blocks/ImageLinkCards/ImageLinkCards'
import { SubscribeNewsletter } from '@/blocks/SubscribeNewsletter/SubscribeNewsletter'

const BLOCK_COMPONENTS = {
  cta: Cta,                        // key matches schema "name" field
  heroSection: HeroSection,
  faqAccordion: FaqAccordion,
  featureCardsIcon: FeatureCardsIcon,
  subscribeNewsletter: SubscribeNewsletter,
  imageLinkCards: ImageLinkCards,
} as const satisfies Record<PageBuilderBlockTypes, React.ComponentType<any>>

// Rendering logic
const Component = BLOCK_COMPONENTS[block._type as PageBuilderBlockTypes]
if (!Component) return <div>Unknown block type: {block._type}</div>
return <Component {...block} />
```

**Rationale**:
- Single source of truth for available blocks
- Easy to audit all blocks in one place
- Type-safe component mapping prevents runtime errors
- Adding new block requires updating exactly 3 registry files (apps/studio/schemaTypes/blocks/index.ts, packages/sanity-blocks/src/index.ts, apps/web/src/components/pagebuilder.tsx)

---

## 8. Type Regeneration Process

### Decision: Regenerate types after schema file moves

**Command**: `pnpm --filter studio typegen` (or equivalent)

**Generated Output**: `apps/web/src/lib/sanity/sanity.types.ts`
- Auto-generated TypeScript types from Sanity schemas
- Must be regenerated after any schema file moves or schema changes
- Component props use these generated types for type safety

**Verification Steps**:
1. Move schema files to new locations
2. Update import paths in studio registry
3. Run `pnpm --filter studio typegen`
4. Verify `sanity.types.ts` regenerates without errors
5. Run `pnpm check-types` to verify all imports resolve correctly

**Rationale**:
- Type safety maintained throughout refactoring
- Generated types automatically reflect schema structure
- Type checking catches import path errors immediately

---

## 9. Import Path Migration Strategy

### Decision: Incremental migration with verification at each step

**Migration Sequence**:
1. Create new directory structure (`blocks/`, `fragments/`, `queries/`)
2. Copy files to new locations (don't delete old files yet)
3. Update import paths in new locations
4. Verify type checking passes
5. Update registry files to import from new locations
6. Verify build succeeds
7. Delete old files
8. Final verification (type check, build, dev server)

**Verification Commands**:
- Type checking: `pnpm --filter web check-types && pnpm --filter studio check-types`
- Build: `pnpm --filter web build && pnpm --filter studio build`
- Dev server: `pnpm --filter web dev` (smoke test - start and verify no errors)

**Rationale**:
- Incremental approach reduces risk of breaking changes
- Keep old files until verification complete provides rollback option
- Type checking at each step catches errors early
- Build verification ensures runtime compatibility

**Alternative Considered**: Big-bang refactoring (move all files at once)
**Rejected Because**: High risk of breaking changes, difficult to debug, no rollback option

---

## 10. Reusable Utilities and Shared Fragments

### Decision: Central location for cross-block utilities

**Shared Fragments** (`apps/web/src/lib/sanity/fragments/reusable/index.ts`):
```typescript
export const imageFragment = /* groq */ `
  image {
    ...,
    "alt": coalesce(asset->altText, asset->originalFilename, "Image"),
    "blurData": asset->metadata.lqip,
  }
`

export const buttonsFragment = /* groq */ `
  buttons[] {
    text,
    variant,
    _key,
    "href": select(
      url.type == "internal" => url.internal->slug.current,
      url.type == "external" => url.external,
      url.href
    )
  }
`

export const richTextFragment = /* groq */ `
  richText[] {
    ...,
    markDefs[] {
      ...,
      _type == "internalLink" => {
        "slug": reference->slug.current
      }
    }
  }
`
```

**Shared Schema Fields** (example from conciliainc.com):
```typescript
// blocks/utils/spacing-fields.ts
export const spacingFields = [
  defineField({
    name: "spacingTop",
    type: "string",
    options: { list: ["none", "small", "medium", "standard"] },
    initialValue: "standard",
  }),
  defineField({
    name: "spacingBottom",
    type: "string",
    options: { list: ["none", "small", "medium", "standard"] },
    initialValue: "standard",
  }),
]

// Usage in block schema (packages/sanity-blocks/src/hero-section/hero-section.schema.ts)
import { spacingFields } from '../utils/spacing-fields'

export const heroSectionSchema = defineType({
  name: "heroSection",
  fields: [
    defineField({ name: "heading", type: "string" }),
    ...spacingFields,  // Spread operator for reuse
  ],
})
```

**Rationale**:
- DRY principle: reusable fragments defined once
- Shared utilities reduce duplication across blocks
- Clear separation between block-specific and shared code

---

## 11. Internationalization (i18n) Integration

### Decision: Preserve existing i18n query patterns

**i18n Fragment** (`apps/web/src/lib/sanity/i18n.ts`):
```typescript
export const translationsFragment = groq`
  "_translations": *[
    _type == "translation.metadata" && references(^._id)
  ][0].translations[].value->{
    _id,
    _type,
    language,
    "slug": slug.current,
    title
  }
`
```

**Usage in Queries**:
```typescript
import { translationsFragment } from '@/lib/sanity/i18n'

export const querySlugPageData = defineQuery(/* groq */ `
  *[_type == "page" && slug.current == $slug && language == $locale][0]{
    ...,
    ${pageBuilderFragment},
    ${translationsFragment},
    seo { ... }
  }
`)
```

**Rationale**:
- i18n is project-specific concern (not block-specific)
- Keep i18n fragments in central location
- All document-level queries include translations fragment
- No changes to i18n logic during refactoring

---

## Summary of Key Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| **File Naming** | Schemas/fragments: `[block-name].schema.ts`, `[block-name].fragment.ts` (kebab-case)<br>Components: `[BlockName].tsx` (PascalCase) | Clear suffixes indicate purpose, follows Node.js and React conventions |
| **Monorepo Architecture** | Shared package `@workspace/sanity-blocks` for schemas and fragments | Proper dependency management, prevents anti-pattern cross-workspace imports |
| **Package Structure** | Schemas and fragments in `packages/sanity-blocks/src/[block-name]/` | Single source of truth, explicit dependencies, clear build order |
| **Component Location** | Components in `apps/web/src/blocks/[BlockName]/` | Web-specific UI, imports schema types from shared package |
| **Fragment Composition** | Template literal composition with conditional GROQ | Type-safe, clear dependencies |
| **Query Organization** | Separate files per document type | Faster navigation, better discoverability |
| **Component Variants** | Multiple files in same block directory | Easy discovery, shared schema |
| **Optional Fragments** | Fragment files optional for simple blocks | Reduces boilerplate |
| **Block Registry** | Barrel exports in `packages/sanity-blocks/src/index.ts` | Single source of truth, easy auditing |
| **Type Regeneration** | Run `pnpm typegen` after schema moves | Maintains type safety |
| **Migration Strategy** | Incremental with verification at each step | Reduces risk, enables rollback |
| **Shared Utilities** | Central `fragments/reusable/` for query fragments | DRY principle, reduces duplication |
| **i18n Integration** | Preserve existing i18n patterns | No functional changes during refactoring |

## Implementation Readiness

All research tasks completed:
- ✅ File naming conventions defined
- ✅ Cross-workspace import patterns documented
- ✅ Fragment composition patterns researched
- ✅ Query organization architecture defined
- ✅ Component variant patterns documented
- ✅ Migration strategy outlined
- ✅ Type regeneration process verified

**Ready for Phase 1**: Design artifacts (quickstart.md, agent context update)
