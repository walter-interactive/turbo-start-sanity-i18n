# turbo-start-sanity-i18n Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-06

## Active Technologies
- TypeScript 5.x (strict mode), Node.js 18+ (003-dedup-studio-records)
- Sanity Content Lake (cloud-hosted, already configured) (003-dedup-studio-records)
- TypeScript 5.x (strictmode enabled per monorepo standards) (004-remove-orphaned-badge)
- Sanity Content Lake (cloud-hosted, no changes required) (004-remove-orphaned-badge)
- TypeScript/JavaScript (Node.js 20+) + N/A (content/metadata changes only) (002-remove-roboto-branding)
- N/A (no data persistence involved) (002-remove-roboto-branding)
- TypeScript 5.9.2, Node.js 20+ + Sanity Studio 4.4.1, React 19.1, @sanity/document-internationalization 4.1.0, @sanity/orderable-document-list 1.4.0 (005-studio-docs-cleanup)
- N/A (documentation-only, no data changes) (005-studio-docs-cleanup)
- TypeScript 5.9.2, Node.js 20+ + Next.js 15.x (App Router), next-intl (i18n routing), next-sanity (Sanity client), React 19.x, @sanity/document-internationalization (translation metadata) (006-fix-language-switcher)
- Sanity Content Lake (cloud-hosted CMS with translation metadata) (006-fix-language-switcher)
- TypeScript 5.9.2, Node.js 20+ + Next.js 15.x (App Router), Sanity Studio 4.4.1, React 19.x, next-sanity (Sanity client), @sanity/document-internationalization 4.1.0 (007-colocate-pagebuilder-modules)
- Sanity Content Lake (cloud-hosted CMS, no changes required) (007-colocate-pagebuilder-modules)
- Sanity Content Lake (cloud-hosted CMS, no changes in Phase 1) (008-multi-tenant-template)

- TypeScript 5.x (Next.js 15.x App Router, Node.js 18+) + next-intl (frontend i18n), @sanity/document-internationalization (CMS plugin), next-sanity (data fetching), groq (queries) (001-i18n-localization)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x (Next.js 15.x App Router, Node.js 18+): Follow standard conventions

## Recent Changes
- 008-multi-tenant-template: Added TypeScript 5.9.2, Node.js 20+
- 007-colocate-pagebuilder-modules: Added TypeScript 5.9.2, Node.js 20+ + Next.js 15.x (App Router), Sanity Studio 4.4.1, React 19.x, next-sanity (Sanity client), @sanity/document-internationalization 4.1.0
- 006-fix-language-switcher: Added TypeScript 5.9.2, Node.js 20+ + Next.js 15.x (App Router), next-intl (i18n routing), next-sanity (Sanity client), React 19.x, @sanity/document-internationalization (translation metadata)


<!-- MANUAL ADDITIONS START -->

## Sanity Studio: Preview System Constraints

**Important Architectural Limitation** (discovered during spec 004-remove-orphaned-badge):

Sanity Studio's `preview.prepare()` function is **synchronous-only** and cannot execute async operations or database queries. This creates significant limitations for preview logic:

### What Works ✅
- Accessing fields directly selected in `preview.select`
- Simple calculations and string formatting
- Conditional logic based on available fields
- Icon/emoji display

### What Doesn't Work ❌
- Async/await operations
- Database queries (GROQ, client.fetch)
- Querying related documents (e.g., translation.metadata)
- External API calls
- Promise-based logic

### Example: Orphaned Translation Detection

**Problem**: Attempted to detect "orphaned" translations (documents without default language version) in preview
**Implementation**: `const isOrphaned = language !== DEFAULT_LOCALE;`
**Result**: 60-80% false positive rate (marked all non-default language docs as orphaned)
**Root Cause**: Cannot query `translation.metadata` to verify if default language version exists
**Resolution**: Complete feature removal (spec 004)

### Lessons Learned

1. **Keep Preview Logic Simple**: Only use fields directly available in preview.select
2. **Avoid Complex Validations**: Preview is for display only, not validation
3. **False Positives Are Worse Than No Feature**: High false positive rate confuses users
4. **Async Detection Requires Custom Components**: Use Sanity Studio custom components for complex async logic
5. **Document Architectural Constraints**: Save investigation findings for future reference

### Alternative Approaches for Complex Preview Logic

If you need async data in previews:
1. **Custom Sanity Plugin**: Create custom list view component with async loading
2. **Background Jobs**: Pre-compute metadata and store in document fields
3. **Utility Scripts**: Separate admin tools for complex validation/reporting
4. **Client Components**: Use Sanity Studio custom components with async data fetching

### Reference Implementation

See `apps/studio/components/language-filter.ts:isDocumentOrphaned()` for example of correct async orphaned detection approach (used in utility functions, not preview).

---

## Feature Removal Best Practices

**Checklist for removing features** (learned from spec 004-remove-orphaned-badge):

1. **Code Cleanup**:
   - [ ] Remove logic from all affected files (search codebase thoroughly)
   - [ ] Delete unused component files
   - [ ] Remove unused imports (e.g., `DEFAULT_LOCALE` if only used for removed feature)
   - [ ] Simplify conditional logic
   - [ ] Verify zero references remain (use `rg` or `grep`)

2. **Verification**:
   - [ ] Type checking passes (`pnpm check-types` or equivalent)
   - [ ] Build succeeds
   - [ ] Linting passes
   - [ ] Dev server starts without errors
   - [ ] No missing component/import errors

3. **Documentation**:
   - [ ] Update original spec to mark requirement as removed
   - [ ] Create completion notes with before/after examples
   - [ ] Update investigation documents with resolution
   - [ ] Reference new spec from old spec
   - [ ] Document lessons learned

4. **Stakeholder Communication**:
   - [ ] Explain why removal is better than fixing
   - [ ] Provide before/after metrics (false positive rate, character reduction, etc.)
   - [ ] Suggest alternatives if feature becomes critical later

### Example Command Sequence

```bash
# 1. Remove logic from files
# (Edit schema files to remove conditional logic)

# 2. Delete component
rm apps/studio/components/unused-component.tsx

# 3. Verify no references
rg "UnusedComponent|unused-component" apps/studio/

# 4. Type check
pnpm --filter studio check-types

# 5. Build
pnpm --filter studio build

# 6. Test dev server
pnpm --filter studio dev
# (Check for errors, then Ctrl+C)
```

---

## Page Builder Block Organization (Feature 007-colocate-pagebuilder-modules)

**Implemented**: 2025-11-13
**Documentation**: `specs/007-colocate-pagebuilder-modules/quickstart.md`

### Shared Package Architecture

Page builder block schemas and GROQ fragments are organized in a shared workspace package to follow monorepo best practices and avoid cross-workspace import anti-patterns.

**Package Structure**:
```
packages/sanity-blocks/          # Shared package: @workspace/sanity-blocks
├── package.json                 # Package configuration
├── tsconfig.json
└── src/
    ├── hero-section/
    │   ├── hero-section.schema.ts     # Sanity schema definition
    │   └── hero-section.fragment.ts   # GROQ query fragment
    ├── cta/
    │   ├── cta.schema.ts
    │   └── cta.fragment.ts
    └── index.ts                  # Barrel exports (schemas, fragments, allBlockSchemas[])
```

**Component Structure**:
```
apps/web/src/blocks/
├── HeroSection/
│   └── HeroSection.tsx          # React component (web-specific UI)
├── Cta/
│   └── Cta.tsx
└── index.ts                      # Component exports
```

### File Naming Conventions

| File Type | Location | Naming Pattern | Example |
|-----------|----------|----------------|---------|
| Schema | `packages/sanity-blocks/src/[block-name]/` | `[block-name].schema.ts` | `hero-section.schema.ts` |
| Fragment | `packages/sanity-blocks/src/[block-name]/` | `[block-name].fragment.ts` | `hero-section.fragment.ts` |
| Component | `apps/web/src/blocks/[BlockName]/` | `[BlockName].tsx` | `HeroSection.tsx` |

**Export Naming**:
- Schemas: `export const heroSectionSchema = defineType({ name: "heroSection", ... })`
- Fragments: `export const heroSectionFragment = /* groq */ \`...\``
- Components: `export const HeroSection: FC<Props> = ({ ... }) => { ... }`

### Import Patterns

**Studio** (importing schemas):
```typescript
// apps/studio/schemaTypes/blocks/index.ts
import { allBlockSchemas } from '@workspace/sanity-blocks'
// or named imports:
import { heroSectionSchema, ctaSchema } from '@workspace/sanity-blocks'

export const pageBuilderBlocks = allBlockSchemas
```

**Web** (importing fragments):
```typescript
// apps/web/src/lib/sanity/fragments/pageBuilder/index.ts
import {
  heroSectionFragment,
  ctaFragment,
  faqAccordionFragment,
} from '@workspace/sanity-blocks'

export const pageBuilderFragment = /* groq */ `
  pageBuilder[]{
    ...,
    _type,
    ${heroSectionFragment},
    ${ctaFragment},
    ${faqAccordionFragment}
  }
`
```

**Web** (importing components):
```typescript
// apps/web/src/components/pagebuilder.tsx
import { HeroSection } from '@/blocks/HeroSection/HeroSection'
import { Cta } from '@/blocks/Cta/Cta'

const BLOCK_COMPONENTS = {
  heroSection: HeroSection,  // key matches schema "name" field
  cta: Cta,
} as const
```

### Query Organization

Queries are organized by document type for better discoverability:

```
apps/web/src/lib/sanity/
├── fragments/
│   ├── atomic/index.ts          # imageFields, customLinkFragment, markDefsFragment
│   ├── reusable/index.ts        # imageFragment, buttonsFragment, richTextFragment
│   └── pageBuilder/index.ts     # Aggregates block fragments from @workspace/sanity-blocks
└── queries/
    ├── home.ts                  # queryHomePageData
    ├── page.ts                  # querySlugPageData, queryAllLocalizedPages
    ├── blog.ts                  # queryBlogIndexPageData, queryBlogSlugPageData
    ├── navbar.ts                # queryNavbarData
    ├── footer.ts                # queryFooterData
    ├── settings.ts              # querySettingsData
    └── index.ts                 # Re-exports all queries
```

### Adding a New Block (Quick Reference)

1. Create schema and fragment in `packages/sanity-blocks/src/[block-name]/`
2. Export from `packages/sanity-blocks/src/index.ts`
3. Create component in `apps/web/src/blocks/[BlockName]/`
4. Register component in `apps/web/src/components/pagebuilder.tsx`
5. Add fragment to `apps/web/src/lib/sanity/fragments/pageBuilder/index.ts`
6. Regenerate types: `pnpm --filter studio type`
7. Verify: `pnpm check-types && pnpm build`

**See**: `specs/007-colocate-pagebuilder-modules/quickstart.md` for detailed guide with examples.

### Key Benefits

- **Clear Ownership**: Schemas and fragments co-located by block
- **Monorepo Best Practices**: Proper dependency management via `@workspace/sanity-blocks`
- **Fast Discovery**: Find all files for a block in < 5 seconds
- **Type Safety**: Maintained through auto-generated types
- **Scalable**: Proven pattern with 32 blocks in reference project (conciliainc.com)

### Important Notes

- Both `apps/studio` and `apps/web` depend on `@workspace/sanity-blocks` in their package.json
- Run `pnpm --filter studio type` after any schema changes to regenerate types
- Fragment files are optional for simple blocks (default GROQ spread is sufficient)
- Component variants (e.g., `ContainedHeroSection.tsx`) live in the same directory as main component

---

<!-- MANUAL ADDITIONS END -->
