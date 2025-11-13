# Implementation Plan: Co-locate Page Builder Block Modules

**Branch**: `007-colocate-pagebuilder-modules` | **Date**: 2025-11-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-colocate-pagebuilder-modules/spec.md`

## Summary

Reorganize the repository to co-locate page builder block files (React component, Sanity schema definition, GROQ query fragment) into single directories per block, following the established pattern from the conciliainc.com reference project. Additionally, restructure the `apps/web/src/lib/sanity/` directory to organize queries by document type rather than in a single monolithic file. This refactoring improves developer discoverability, reduces time to locate related files, and establishes clear patterns for adding new blocks. **No functional changes** - only code reorganization.

## Technical Context

**Language/Version**: TypeScript 5.9.2, Node.js 20+
**Primary Dependencies**: Next.js 15.x (App Router), Sanity Studio 4.4.1, React 19.x, next-sanity (Sanity client), @sanity/document-internationalization 4.1.0
**Storage**: Sanity Content Lake (cloud-hosted CMS, no changes required)
**Testing**: TypeScript type checking (`pnpm check-types`), build validation (`pnpm build`), development server smoke test
**Target Platform**: TurboRepo monorepo with two workspaces: `apps/web` (Next.js), `apps/studio` (Sanity Studio)
**Project Type**: Web monorepo (frontend + CMS studio)
**Performance Goals**: No performance impact - pure refactoring with identical runtime behavior
**Constraints**: Must maintain all existing functionality, type safety, and i18n query patterns; zero breaking changes
**Scale/Scope**: 6 page builder blocks to reorganize, ~180 lines of query fragments to split, import path updates across ~15+ files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Monorepo Structure & Boundaries
✅ **COMPLIANT** - Refactoring maintains clear workspace boundaries. Block schemas and fragments stored in shared @workspace/sanity-blocks package, imported by both studio and web workspaces. Creates new workspace package in packages/ directory following monorepo best practices.

### Principle II: TypeScript Strict Mode & Type Safety
✅ **COMPLIANT** - All reorganization preserves type safety. Import path updates maintain proper type flow. Success criteria (SC-003) explicitly requires type checking to pass. No use of `any` type introduced.

### Principle III: Test Coverage (MANDATORY)
✅ **COMPLIANT** - Refactoring-only feature verified by build validation and type checking. Functional behavior remains identical (SC-002), making runtime tests redundant. Constitution mandates tests for features that change behavior; this feature does not.

### Principle IV: Component Modularity & Reusability
✅ **COMPLIANT** - Reorganization enhances modularity by co-locating related files. Shared UI components (buttons, rich text, images) remain in central location per FR-010. No changes to component interfaces or props.

### Principle V: API Contracts & Versioning
✅ **COMPLIANT** - No API changes. Query structure remains identical; only file organization changes. Type contracts preserved through auto-generated `sanity.types.ts`.

### Principle VI: Internationalization (i18n) First
✅ **COMPLIANT** - FR-008 explicitly requires preserving i18n query patterns. `translationsFragment` and locale-based queries remain unchanged in functionality.

### Principle VII: Code Quality & Observability
✅ **COMPLIANT** - Success criteria include passing type checking (SC-003), successful builds (SC-004), and error-free dev server (SC-005). No observability changes needed for refactoring.

### Pre-Merge Requirements
✅ **COMPLIANT** - Plan includes validation gates:
- Type compilation success (SC-003)
- Build success for both workspaces (SC-004)
- Development server starts without errors (SC-005)
- No linting changes required (code structure only)

**Constitutional Compliance**: ✅ ALL GATES PASS - No violations to justify

## Project Structure

### Documentation (this feature)

```text
specs/007-colocate-pagebuilder-modules/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (complete)
├── research.md          # Phase 0 output - file organization patterns
├── data-model.md        # Phase 1 output - N/A (no data changes)
├── quickstart.md        # Phase 1 output - developer guide for new structure
├── checklists/
│   └── requirements.md  # Spec quality validation (complete)
└── contracts/           # Phase 1 output - N/A (no API contracts)
```

### Source Code (repository root)

```text
# Current Structure (Before Refactoring)
apps/
├── web/
│   └── src/
│       ├── components/
│       │   ├── pagebuilder.tsx       # Block component mapping
│       │   ├── sections/              # All block components
│       │   │   ├── hero.tsx
│       │   │   ├── cta.tsx
│       │   │   ├── faq-accordion.tsx
│       │   │   ├── feature-cards-with-icon.tsx
│       │   │   ├── image-link-cards.tsx
│       │   │   └── subscribe-newsletter.tsx
│       │   └── elements/              # Shared UI components
│       └── lib/
│           └── sanity/
│               ├── query.ts           # Monolithic 482-line file with ALL fragments + queries
│               ├── i18n.ts
│               ├── client.ts
│               └── [other files...]
└── studio/
    └── schemaTypes/
        ├── blocks/                    # All block schemas
        │   ├── index.ts               # Block registry
        │   ├── hero.ts
        │   ├── cta.ts
        │   ├── faq-accordion.ts
        │   ├── feature-cards-icon.ts
        │   ├── image-link-cards.ts
        │   └── subscribe-newsletter.ts
        └── definitions/
            └── pagebuilder.ts         # Page builder array definition

# Target Structure (After Refactoring)
packages/
└── sanity-blocks/                     # NEW: Shared package for schemas and fragments
    ├── package.json                   # Package config: @workspace/sanity-blocks
    ├── tsconfig.json                  # TypeScript config
    └── src/
        ├── hero-section/
        │   ├── hero-section.schema.ts    # Schema (moved from studio/schemaTypes/blocks/hero.ts)
        │   └── hero-section.fragment.ts  # Fragment (extracted from lib/sanity/query.ts)
        ├── cta/
        │   ├── cta.schema.ts
        │   └── cta.fragment.ts
        ├── faq-accordion/
        │   ├── faq-accordion.schema.ts
        │   └── faq-accordion.fragment.ts
        ├── feature-cards-icon/
        │   ├── feature-cards-icon.schema.ts
        │   └── feature-cards-icon.fragment.ts
        ├── image-link-cards/
        │   ├── image-link-cards.schema.ts
        │   └── image-link-cards.fragment.ts
        ├── subscribe-newsletter/
        │   ├── subscribe-newsletter.schema.ts
        │   └── subscribe-newsletter.fragment.ts
        └── index.ts                      # Barrel exports: schemas, fragments, allBlockSchemas[]

apps/
├── web/
│   ├── package.json                   # UPDATED: Add "@workspace/sanity-blocks": "workspace:*"
│   └── src/
│       ├── blocks/                    # NEW: Block components only
│       │   ├── HeroSection/
│       │   │   └── HeroSection.tsx    # Component (moved from components/sections/hero.tsx)
│       │   ├── Cta/
│       │   │   └── Cta.tsx            # Component (moved from components/sections/cta.tsx)
│       │   ├── FaqAccordion/
│       │   │   └── FaqAccordion.tsx
│       │   ├── FeatureCardsIcon/
│       │   │   └── FeatureCardsIcon.tsx
│       │   ├── ImageLinkCards/
│       │   │   └── ImageLinkCards.tsx
│       │   └── SubscribeNewsletter/
│       │       └── SubscribeNewsletter.tsx
│       ├── components/
│       │   ├── pagebuilder.tsx        # UPDATED: Import components from blocks/
│       │   └── elements/              # Unchanged: shared UI components
│       └── lib/
│           └── sanity/
│               ├── client.ts          # Unchanged
│               ├── live.ts            # Unchanged
│               ├── token.ts           # Unchanged
│               ├── i18n.ts            # Unchanged
│               ├── locale-mapper.ts   # Unchanged
│               ├── link-helpers.ts    # Unchanged
│               ├── sanity.types.ts    # Auto-regenerated after schema moves
│               ├── fragments/         # NEW: Organized fragment hierarchy
│               │   ├── atomic/
│               │   │   └── index.ts   # imageFields, customLinkFragment, markDefsFragment
│               │   ├── reusable/
│               │   │   └── index.ts   # imageFragment, richTextFragment, buttonsFragment, blogCardFragment
│               │   └── pageBuilder/
│               │       └── index.ts   # Imports fragments from @workspace/sanity-blocks
│               └── queries/           # NEW: Document-type specific queries
│                   ├── home.ts        # queryHomePageData
│                   ├── page.ts        # querySlugPageData, queryAllLocalizedPages
│                   ├── blog.ts        # queryBlogIndexPageData, queryBlogSlugPageData
│                   ├── navbar.ts      # queryNavbarData
│                   ├── footer.ts      # queryFooterData
│                   ├── settings.ts    # querySettingsData
│                   └── index.ts       # Re-exports all queries for backward compatibility
└── studio/
    ├── package.json                   # UPDATED: Add "@workspace/sanity-blocks": "workspace:*"
    └── schemaTypes/
        ├── blocks/
        │   └── index.ts               # UPDATED: Import from @workspace/sanity-blocks
        └── definitions/
            └── pagebuilder.ts         # Unchanged (imports from blocks/index.ts)
```

**Structure Decision**: Monorepo web application pattern with shared workspace package. Key change: schemas and fragments extracted to `packages/sanity-blocks` (published as `@workspace/sanity-blocks`), with both studio and web importing from shared package. Components remain in `apps/web/src/blocks/`. Query organization moves from single 482-line file to modular structure: atomic fragments → reusable fragments → block-specific fragments (from shared package) → document-type queries. This follows monorepo best practices and avoids cross-workspace import anti-patterns.

## Complexity Tracking

**No constitutional violations** - this table is not needed.

## Phase 0: Research & Patterns

### Research Tasks

1. **File Naming Conventions**: Document proper naming for shared package:
   - Schema files: `[block-name].schema.ts` (kebab-case + .schema.ts suffix)
   - Fragment files: `[block-name].fragment.ts` (kebab-case + .fragment.ts suffix)
   - Component files: `[BlockName].tsx` (PascalCase for React convention)
   - Export naming: `heroSectionSchema`, `heroSectionFragment` (camelCase exports)

2. **Shared Package Architecture**: Document monorepo best practices:
   - Creating `@workspace/sanity-blocks` package in `packages/` directory
   - Package.json configuration with workspace dependencies
   - Barrel exports pattern in `src/index.ts`
   - Import patterns for both studio and web workspaces
   - Avoiding cross-workspace import anti-patterns

3. **Query Organization Architecture**: Document modular query structure:
   - Fragment hierarchy (atomic → reusable → block-specific → document-level)
   - Document-type specific query files
   - Fragment reuse patterns across multiple queries
   - Central aggregator pattern for page builder fragments

4. **Import Path Migration Strategy**: Research best practices for:
   - Updating TypeScript import paths to use `@workspace/sanity-blocks`
   - Maintaining type safety during file moves
   - Creating new workspace package and updating dependencies
   - Avoiding circular dependencies

5. **Type Regeneration Process**: Document:
   - When to run `sanity typegen` after schema moves
   - How generated types (`sanity.types.ts`) relate to schema file locations
   - Verification that type generation still works after reorganization

### Research Findings Consolidation

Output: `research.md` documenting:
- File naming conventions (.schema.ts, .fragment.ts suffixes, kebab-case)
- Shared package architecture with @workspace/sanity-blocks
- Import patterns for studio and web workspaces
- Step-by-step migration sequence to avoid breaking changes
- Verification checklist for each reorganization step

## Phase 1: Design Artifacts

### Data Model

**Not applicable** - This is a code reorganization feature with no data model changes. Sanity schemas define the same fields before and after refactoring. Content structure in Sanity Content Lake remains identical.

Output: `data-model.md` with note: "N/A - Refactoring only, no data model changes"

### API Contracts

**Not applicable** - No API changes. GROQ query results return identical data structures. Component props remain unchanged. No external APIs involved.

Output: Skip `contracts/` directory creation

### Developer Quickstart

Output: `quickstart.md` documenting:
- **Before/After Structure Comparison**: Visual diagram of old vs. new organization
- **Adding a New Block**: Step-by-step guide with file template examples
- **Modifying Existing Block**: Workflow showing co-located files
- **Finding Queries**: How to navigate document-type query structure
- **Import Patterns**: Examples of importing blocks, fragments, and queries
- **Verification Steps**: Type checking, build, and dev server smoke tests

### Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh claude` to update CLAUDE.md with:
- No new technologies (all existing: TypeScript, Next.js, Sanity, React)
- Document new structural patterns: co-located blocks, query organization by document type
- Reference quickstart.md for adding new blocks

## Phase 2: Task Generation

**Not executed by /speckit.plan** - Run `/speckit.tasks` after Phase 1 completion to generate dependency-ordered implementation tasks.

Expected task categories (for reference):
1. Create shared package structure (packages/sanity-blocks with package.json, tsconfig.json)
2. Create new directory structures (blocks/ in web, fragments/, queries/)
3. Move and rename files (schemas → shared package, components → blocks, extract fragments, split queries)
4. Update workspace dependencies (add @workspace/sanity-blocks to studio and web)
5. Update import paths (studio/schemaTypes/blocks/index.ts, pagebuilder.tsx, fragment aggregators)
6. Create barrel exports (packages/sanity-blocks/src/index.ts, queries/index.ts)
7. Regenerate types (pnpm --filter studio typegen)
8. Verify gates (type check, build, dev server)

## Validation Gates

### Phase 0 Complete (Research)
- [ ] research.md created with reference project patterns documented
- [ ] File naming conventions defined
- [ ] Import path migration strategy documented
- [ ] Type regeneration process verified

### Phase 1 Complete (Design)
- [ ] quickstart.md created with developer guide
- [ ] CLAUDE.md updated with structural patterns
- [ ] Constitutional compliance re-verified (no changes expected)

### Phase 2 Ready (Pre-Implementation)
- [ ] All research findings consolidated
- [ ] Quickstart guide reviewed for completeness
- [ ] Ready to run `/speckit.tasks` for task generation

## Notes

- **Zero Functional Changes**: Success is defined by identical runtime behavior (SC-002)
- **Type Safety Priority**: Type checking must pass at every step (SC-003)
- **Incremental Verification**: After each file move, verify imports resolve correctly
- **Reference Project**: conciliainc.com serves as authoritative pattern (32 blocks successfully using this structure)
- **Backward Compatibility**: Consider creating barrel exports in old locations during transition to avoid breaking external references (evaluate during implementation)
- **Registry File Count (SC-007)**: Adding a new block requires modifying exactly 3 central registry files:
  1. `apps/studio/schemaTypes/blocks/index.ts` (import schema from shared package)
  2. `packages/sanity-blocks/src/index.ts` (export schema and fragment)
  3. `apps/web/src/components/pagebuilder.tsx` (register component mapping)
