# Implementation Plan: Complete Schema Migration to Monorepo Packages

**Branch**: `009-complete-schema-migration` | **Date**: 2025-11-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-complete-schema-migration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Migrate all remaining Sanity schema definitions (atoms: button, customUrl; blocks: faqAccordion, featureCardsIcon, imageLinkCards, subscribeNewsletter) from `apps/template-studio` to the monorepo shared packages (`@walter/sanity-atoms`, `@walter/sanity-blocks`). This completes the schema migration started in spec 008, enabling reusability across multiple Sanity Studio instances while following established patterns for schema/fragment organization.

## Technical Context

**Language/Version**: TypeScript 5.9.2, Node.js 20+
**Primary Dependencies**: Sanity 4.4.1, React 19.1, @sanity/document-internationalization 4.1.0, lucide-react 0.539.0, sanity-plugin-icon-picker 4.0.0
**Storage**: Sanity Content Lake (cloud-hosted CMS, no changes required)
**Testing**: TypeScript type checking (`tsc --noEmit`), build verification, Studio dev server testing
**Target Platform**: Monorepo workspace packages (pnpm workspaces)
**Project Type**: Monorepo with shared packages (established structure: packages/sanity-atoms, packages/sanity-blocks)
**Performance Goals**: Fast schema discovery (<5 seconds), efficient GROQ queries with complete data fetching, type-safe imports across workspace boundaries
**Constraints**: Sanity Studio 4.x preview.prepare() synchronous-only (cannot use async operations), workspace protocol dependencies, strict TypeScript mode enabled
**Scale/Scope**: 2 atom schemas (button, customUrl), 4 block schemas (faqAccordion, featureCardsIcon, imageLinkCards, subscribeNewsletter), ~8-12 files to migrate/create

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Monorepo Structure & Boundaries
✅ **PASS** - Migration moves schemas to workspace packages (`@walter/sanity-atoms`, `@walter/sanity-blocks`) with explicit workspace protocol dependencies. Cross-workspace imports will use published package exports (`@walter/sanity-atoms/schemas`), not direct file references.

### Principle II: TypeScript Strict Mode & Type Safety
✅ **PASS** - All workspaces use TypeScript 5.9.2 with strict mode. Migration preserves existing type definitions, imports will be type-safe across packages. No use of `any` type.

### Principle III: Test Coverage (MANDATORY)
⚠️ **PARTIAL** - Schema migration is primarily structural (moving files). Tests will focus on:
- Type checking verification (`pnpm check-types`)
- Build success verification
- Studio dev server smoke testing
- Manual verification of block rendering in Studio UI

Full unit/integration tests are out of scope for schema definitions (they have no business logic), but contract verification via TypeScript types and build process provides confidence.

### Principle IV: Component Modularity & Reusability
✅ **PASS** - Entire migration purpose is to extract reusable schemas to shared packages for use across multiple Sanity Studio instances. Follows single responsibility (atoms vs blocks).

### Principle V: API Contracts & Versioning
✅ **PASS** - Schema definitions ARE the API contracts between Studio and frontend. GROQ fragments define query contracts. No breaking changes to existing schemas, only organizational changes.

### Principle VI: Internationalization (i18n) First
✅ **PASS** - Schemas already support i18n via @sanity/document-internationalization. Migration preserves existing i18n field configurations.

### Principle VII: Code Quality & Observability
✅ **PASS** - All changes must pass Ultracite linting, TypeScript type checking, and build verification. Clear error messages from type system during development.

**Gate Status**: ✅ PASS (with documented justification for Principle III partial compliance)

## Project Structure

### Documentation (this feature)

```text
specs/009-complete-schema-migration/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (GROQ fragment contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (monorepo structure)

```text
packages/sanity-atoms/
├── src/
│   ├── button.schema.ts         # TO MIGRATE from template-studio
│   ├── button.fragment.ts       # TO CREATE
│   ├── customUrl.schema.ts      # TO MIGRATE from template-studio
│   ├── customUrl.fragment.ts    # TO CREATE
│   ├── buttons.schema.ts        # EXISTING (already migrated)
│   ├── buttons.fragment.ts      # EXISTING
│   ├── richText.schema.ts       # EXISTING
│   ├── richText.fragment.ts     # EXISTING
│   ├── image.fragment.ts        # EXISTING
│   ├── schemas.ts               # TO UPDATE (add button, customUrl exports)
│   └── fragments.ts             # TO UPDATE (add button, customUrl fragment exports)
└── package.json                 # EXISTING

packages/sanity-blocks/
├── src/
│   ├── heroSection.schema.ts    # EXISTING
│   ├── heroSection.fragment.ts  # EXISTING
│   ├── cta.schema.ts            # EXISTING
│   ├── cta.fragment.ts          # EXISTING
│   ├── faqAccordion.schema.ts   # TO COMPLETE (currently empty)
│   ├── faqAccordion.fragment.ts # EXISTING
│   ├── featureCardsIcon.schema.ts    # TO MIGRATE from template-studio
│   ├── featureCardsIcon.fragment.ts  # TO CREATE
│   ├── imageLinkCards.schema.ts      # TO MIGRATE from template-studio
│   ├── imageLinkCards.fragment.ts    # TO CREATE
│   ├── subscribeNewsletter.schema.ts # TO MIGRATE from template-studio
│   ├── subscribeNewsletter.fragment.ts # TO CREATE
│   ├── schemas.ts               # TO UPDATE (add 4 new blocks)
│   └── fragments.ts             # TO UPDATE (add 4 new fragments)
└── package.json                 # EXISTING

apps/template-studio/
├── schemaTypes/
│   ├── blocks/
│   │   ├── index.ts             # TO UPDATE (import from packages)
│   │   ├── faq-accordion.ts     # TO DELETE after migration
│   │   ├── feature-cards-icon.ts # TO DELETE after migration
│   │   ├── image-link-cards.ts  # TO DELETE after migration
│   │   └── subscribe-newsletter.ts # TO DELETE after migration
│   └── definitions/
│       ├── index.ts             # TO UPDATE (import from packages)
│       ├── button.ts            # TO DELETE after migration
│       └── custom-url.ts        # TO DELETE after migration
└── package.json                 # EXISTING (already has workspace deps)
```

**Structure Decision**: Monorepo workspace package structure. Atoms are primitive reusable types with no dependencies, stored in `@walter/sanity-atoms`. Blocks are complex page builder components that depend on atoms, stored in `@walter/sanity-blocks`. Template-studio consumes both packages via workspace protocol dependencies. This follows the established pattern from spec 007/008.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle III: Test Coverage (Partial) | Schema definitions are declarative type contracts with no business logic. Testing focuses on type checking, build verification, and manual Studio UI verification. | Unit tests for schema definitions would test the Sanity framework itself rather than application logic. The TypeScript compiler and Sanity's built-in validation provide contract verification. Full E2E tests for Studio UI interactions are out of scope for this structural migration. |

---

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design completion*

### Principle I: Monorepo Structure & Boundaries
✅ **PASS** - Design maintains clear workspace boundaries. Schemas migrated to packages with proper workspace protocol dependencies. No cross-workspace direct file imports introduced.

### Principle II: TypeScript Strict Mode & Type Safety
✅ **PASS** - All migrated schemas use TypeScript strict mode with full type definitions. Helper function inlining maintains type safety. No `any` types introduced.

### Principle III: Test Coverage (MANDATORY)
⚠️ **PARTIAL** - (Status unchanged from initial check)
- Verification strategy defined: type checking + build success + Studio dev server testing
- No unit tests required (schemas are declarative contracts)
- TypeScript provides compile-time contract verification
- Manual UI testing covers Studio integration

### Principle IV: Component Modularity & Reusability
✅ **PASS** - Design achieves primary goal: extracting reusable schemas to shared packages. Atom/block separation maintains single responsibility. Package structure supports unlimited schema additions.

### Principle V: API Contracts & Versioning
✅ **PASS** - GROQ fragment contracts documented in `contracts/` directory. Schema contracts remain unchanged (no breaking changes). Fragment composition pattern ensures consistency across queries.

### Principle VI: Internationalization (i18n) First
✅ **PASS** - Design preserves existing i18n support. No changes to language field handling or document internationalization configuration.

### Principle VII: Code Quality & Observability
✅ **PASS** - Design includes verification steps: linting, type checking, build validation. Clear error messages from TypeScript during migration. Quickstart guide provides troubleshooting steps.

**Post-Design Gate Status**: ✅ PASS (no new violations introduced)
