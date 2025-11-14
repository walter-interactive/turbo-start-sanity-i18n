# Implementation Plan: Multi-Tenant Agency Template Architecture

**Branch**: `008-multi-tenant-template` | **Date**: 2025-11-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-multi-tenant-template/spec.md`

## Summary

Transform the monorepo into a multi-tenant agency template architecture by:
1. Renaming apps to distinguish template reference implementations from future client projects
2. Creating `@walter/sanity-atoms` package for reusable atomic content types (buttons, image, richText)
3. Reorganizing `@walter/sanity-blocks` package with flat file structure and camelCase naming
4. Establishing clear dependency hierarchy: `apps` → `@walter/sanity-blocks` → `@walter/sanity-atoms`

This is Phase 1: Foundation Setup. Future phases will add document schemas (Phase 2), i18n config refactoring (Phase 3), actual client projects (Phase 4), and CLI scaffolding tools (Phase 5).

## Technical Context

**Language/Version**: TypeScript 5.9.2, Node.js 20+
**Primary Dependencies**:
- Sanity Studio 4.4.1 (CMS)
- Next.js 15.x (App Router, web framework)
- React 19.x (UI library)
- @sanity/document-internationalization 4.1.0 (i18n plugin)
- pnpm (package manager)
- TurboRepo (monorepo build orchestration)

**Storage**: Sanity Content Lake (cloud-hosted CMS, no changes in Phase 1)
**Testing**: TypeScript type checking (`pnpm check-types`), build verification (`pnpm build`), manual validation of Studio and Web apps
**Target Platform**: Web (Sanity Studio for content editing, Next.js for frontend)
**Project Type**: Monorepo with multiple apps and shared packages
**Performance Goals**:
- Build time: <5 minutes for full monorepo build
- Dev server startup: <10 seconds
- File discoverability: <5 seconds to locate any block schema (flat structure benefit)

**Constraints**:
- Must maintain backward compatibility with existing Sanity content (no schema name changes)
- Must not disrupt current development workflow (all npm scripts continue to function)
- Must follow existing monorepo conventions (pnpm workspaces, TurboRepo)
- Zero TypeScript errors required for build/type-check success
- Flat file structure with camelCase naming required for simplicity

**Scale/Scope**:
- 3 existing blocks (cta, faq-section, hero-section) + 4 new blocks to migrate (total: 6-7 blocks)
- 3 atomic content types (buttons, image, richText)
- 2 template apps (studio, web)
- 3 shared packages (sanity-atoms, sanity-blocks, i18n-config)
- Current monorepo: ~4 apps + ~4 packages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Monorepo Structure & Boundaries

**Status**: ✅ **COMPLIANT**

- All packages maintain clear boundaries within TurboRepo structure
- New packages (`@walter/sanity-atoms`, `@walter/sanity-blocks`) will have explicit dependencies in package.json
- Dependency hierarchy is explicit: apps → blocks → atoms (no circular dependencies)
- Each workspace is independently buildable and testable
- No cross-workspace direct file references (all imports via workspace packages)

**Evidence**: FR-018, FR-019, FR-022, FR-039, FR-040, FR-046

### Principle II: TypeScript Strict Mode & Type Safety

**Status**: ✅ **COMPLIANT**

- TypeScript strict mode enabled across monorepo (A-003)
- `any` type prohibited (per CLAUDE.md global instructions)
- FR-042: Type checking must pass with zero errors
- All Sanity schemas use `defineType()` with full TypeScript type inference
- Flat file structure improves TypeScript import path resolution

**Evidence**: FR-042, A-003, C-004

### Principle III: Test Coverage (MANDATORY)

**Status**: ⚠️ **PARTIAL COMPLIANCE** - Justified for Phase 1

**Justification**: This is a code reorganization refactor (directory renaming, file migrations) with no new business logic. Testing strategy:
- **Type checking** (`pnpm check-types`) verifies import correctness
- **Build verification** (`pnpm build`) ensures all dependencies resolve
- **Manual validation** of Studio and Web apps confirms functional equivalence
- **Success criteria** SC-005 to SC-009 define acceptance tests

**Why traditional tests not required**:
- No new business logic added (pure refactoring)
- Existing Sanity schemas maintain exact same schema names (backward compatible)
- TypeScript compiler catches broken imports/dependencies
- Future features will add tests for new functionality

**Evidence**: FR-042 to FR-045, SC-005 to SC-009

### Principle IV: Component Modularity & Reusability

**Status**: ✅ **COMPLIANT**

- Atomic content types (atoms) follow single responsibility principle
- Blocks compose atoms for reusability across projects
- Clear separation: atoms = primitive fields, blocks = composed sections
- Flat structure reduces cognitive overhead for locating reusable components
- Shared packages enable reuse across all client projects

**Evidence**: FR-009 to FR-019 (atoms creation), FR-036 (blocks import atoms), C-007 (separation of concerns)

### Principle V: API Contracts & Versioning

**Status**: ✅ **COMPLIANT**

- Sanity schemas serve as API contracts between Studio (editor) and Web (consumer)
- Package.json exports define clear API boundaries (`./schemas`, `./fragments`)
- Semantic versioning applies to shared packages (future breaking changes = major version bump)
- No breaking changes in Phase 1 (only file reorganization, schema names unchanged)

**Evidence**: FR-011, FR-012, FR-016, FR-023, FR-024, C-001 (backward compatibility)

### Principle VI: Internationalization (i18n) First

**Status**: ✅ **COMPLIANT**

- Existing i18n architecture maintained (no disruption per C-006)
- Sanity content uses @sanity/document-internationalization plugin
- Next.js web app uses next-intl for routing
- Future i18n-config package refactoring deferred to Phase 3 (OS-003)
- All existing multilingual content preserved

**Evidence**: C-006, A-004, D-004, OS-003

### Principle VII: Code Quality & Observability

**Status**: ✅ **COMPLIANT**

- All code must pass linting (Ultracite)
- Build and type-check must succeed across all workspaces (FR-042, FR-043)
- Development servers must start without errors (FR-044)
- Flat structure improves developer experience (5-second file location = SC-004)
- Clear dependency graph aids debugging

**Evidence**: FR-042 to FR-045, SC-004, SC-010

### Pre-Merge Requirements

**Status**: ✅ **WILL COMPLY**

All PRs will pass:
1. TypeScript compilation (`pnpm check-types`) - FR-042
2. Linting (`pnpm lint`) - existing scripts
3. Tests (type checking serves as verification for refactoring) - Principle III justification
4. Build success (`pnpm build`) - FR-043
5. Code review approval - standard workflow
6. Documentation updated - quickstart.md generated in Phase 1

### Performance Budgets

**Status**: N/A - **NOT APPLICABLE TO PHASE 1**

Phase 1 is code reorganization with no runtime changes. Bundle sizes and build times remain unchanged (no new dependencies added to web app). Performance budgets apply to future features that add new UI components or business logic.

## Project Structure

### Documentation (this feature)

```text
specs/008-multi-tenant-template/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (already created)
├── research.md          # Phase 0 output (will be generated)
├── data-model.md        # Phase 1 output (will be generated)
├── quickstart.md        # Phase 1 output (will be generated)
├── contracts/           # Phase 1 output (will be generated if needed)
├── checklists/
│   └── requirements.md  # Spec validation (already created)
└── (tasks.md)           # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Structure Decision**: Monorepo with TurboRepo workspace structure. This is a code reorganization refactor that changes directory names and package structures but does not modify the overall monorepo architecture.

#### Current Structure (Before Phase 1)
```text
turbo-start-sanity-i18n/
├── apps/
│   ├── studio/                        # ⚠️ To be renamed
│   └── web/                           # ⚠️ To be renamed
│
├── packages/
│   ├── sanity/                        # ⚠️ To be reorganized
│   │   ├── src/
│   │   │   ├── blocks/
│   │   │   │   ├── cta/              # ⚠️ Nested structure
│   │   │   │   ├── faq-section/
│   │   │   │   └── hero-section/
│   │   │   ├── shared/               # ⚠️ To be migrated to atoms package
│   │   │   │   ├── buttons/
│   │   │   │   ├── image/
│   │   │   │   └── rich-text/
│   │   │   ├── fragments.ts
│   │   │   └── schemas.ts
│   │   └── package.json              # name: "@workspace/sanity"
│   │
│   ├── i18n-config/
│   ├── typescript-config/
│   └── ui/
│
├── turbo.json
└── package.json                       # Workspace references
```

#### Target Structure (After Phase 1)
```text
turbo-start-sanity-i18n/
├── apps/
│   ├── template-studio/              # ✅ Renamed from studio (FR-001)
│   │   ├── package.json              # ✅ Updated dependencies (FR-018, FR-039)
│   │   └── ...
│   │
│   └── template-web/                 # ✅ Renamed from web (FR-002)
│       ├── package.json              # ✅ Updated dependencies (FR-019, FR-040)
│       └── ...
│
├── packages/
│   ├── sanity-atoms/                 # ✅ NEW package (FR-009)
│   │   ├── src/
│   │   │   ├── buttons.schema.ts    # ✅ Flat file (FR-012)
│   │   │   ├── image.schema.ts      # ✅ Flat file (FR-013)
│   │   │   ├── richText.schema.ts   # ✅ Flat file (FR-014)
│   │   │   └── schemas.ts           # ✅ Re-exports (FR-015)
│   │   ├── package.json              # ✅ name: "@walter/sanity-atoms" (FR-010)
│   │   ├── tsconfig.json             # ✅ TypeScript config (FR-017)
│   │   └── README.md                 # ✅ Package documentation
│   │
│   ├── sanity-blocks/                # ✅ Renamed from sanity (FR-020)
│   │   ├── src/
│   │   │   ├── heroSection.schema.ts      # ✅ Flat, camelCase (FR-025, FR-030)
│   │   │   ├── heroSection.fragment.ts
│   │   │   ├── cta.schema.ts              # ✅ Flat, camelCase (FR-030)
│   │   │   ├── cta.fragment.ts
│   │   │   ├── faqAccordion.schema.ts     # ✅ Migrated (FR-026)
│   │   │   ├── faqAccordion.fragment.ts
│   │   │   ├── featureCardsIcon.schema.ts # ✅ Migrated (FR-027) [if exists]
│   │   │   ├── featureCardsIcon.fragment.ts
│   │   │   ├── imageLinkCards.schema.ts   # ✅ Migrated (FR-028) [if exists]
│   │   │   ├── imageLinkCards.fragment.ts
│   │   │   ├── subscribeNewsletter.schema.ts  # ✅ Migrated (FR-029) [if exists]
│   │   │   ├── subscribeNewsletter.fragment.ts
│   │   │   ├── schemas.ts                 # ✅ Re-exports + allBlockSchemas (FR-033, FR-035)
│   │   │   └── fragments.ts               # ✅ Re-exports (FR-034)
│   │   ├── package.json              # ✅ name: "@walter/sanity-blocks" (FR-021)
│   │   │                              # ✅ depends on: "@walter/sanity-atoms" (FR-022)
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── i18n-config/                  # (unchanged in Phase 1)
│   ├── typescript-config/            # (unchanged)
│   └── ui/                            # (unchanged)
│
├── turbo.json                         # ✅ Updated app references (FR-006)
└── package.json                       # ✅ Updated workspace refs (FR-007)
```

**Key Changes**:
1. **App Renaming**: `studio` → `template-studio`, `web` → `template-web` (distinguishes templates from future client apps)
2. **New Atoms Package**: Extracts shared atomic types to `@walter/sanity-atoms` with flat file structure
3. **Blocks Package Reorganization**: Nested directories → flat files with camelCase naming
4. **Dependency Hierarchy**: apps → blocks → atoms (clear, acyclic dependency graph)
5. **Workspace Scope**: `@workspace` → `@walter` (agency branding)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle III: Test Coverage (Partial) | Pure refactoring with no new business logic - verification via type checking and build success | Traditional unit/integration tests would test file paths and import mechanics rather than logic; TypeScript compiler already verifies correctness of imports and schema structure |

**Rationale**: This feature is unique in that it's a code organization refactor with zero behavioral changes. The "tests" are:
- TypeScript compiler catches all broken imports (FR-042)
- Build system catches all dependency resolution issues (FR-043)
- Manual validation confirms functional equivalence (FR-044, FR-045)
- Success criteria define measurable outcomes (SC-005 to SC-012)

Adding traditional tests would mean writing tests that verify "heroSection.schema.ts exists in src/" or "import works from @walter/sanity-blocks" - which is already covered by TypeScript and the build system. Future features that add new logic WILL include proper test coverage per Principle III.

---

## Post-Design Constitution Re-Evaluation

*Re-checked after Phase 0 research and Phase 1 design artifacts completed.*

### Design Artifacts Generated

✅ **research.md**: Comprehensive research on:
- Flat vs nested directory structures (Decision: Flat with camelCase)
- File naming conventions (Decision: camelCase for TypeScript alignment)
- Atomic design principles for Sanity schemas (Decision: Separate atoms package)
- Workspace package naming (Decision: `@walter/*` for agency branding)
- Git migration strategies (Decision: Use `git mv` to preserve history)
- Package.json exports patterns (Decision: Sub-path exports)
- Template app naming (Decision: `template-*` prefix)

✅ **data-model.md**: Documented:
- Package organization model (hierarchy: apps → blocks → atoms)
- Schema composition hierarchy (atoms compose into blocks)
- Dependency graph model (explicit, acyclic dependencies)
- File organization model (flat structure with camelCase naming)
- Schema name preservation strategy (backward compatibility)
- Implementation checklist with verification steps

✅ **quickstart.md**: Step-by-step implementation guide:
- 6 phases with estimated times (total: 3-4 hours)
- Detailed bash commands for each step
- Verification checkpoints after each phase
- Troubleshooting section for common issues
- Success criteria validation checklist

✅ **CLAUDE.md**: Agent context updated with:
- Language: TypeScript 5.9.2, Node.js 20+
- Database: Sanity Content Lake (cloud-hosted CMS)
- Project type: Monorepo with multiple apps and shared packages

### Constitution Principles Re-Check

**Principle I: Monorepo Structure & Boundaries** - ✅ **STILL COMPLIANT**
- Design artifacts confirm clear package boundaries
- Dependency graph explicitly documented in data-model.md
- No circular dependencies introduced

**Principle II: TypeScript Strict Mode & Type Safety** - ✅ **STILL COMPLIANT**
- All packages maintain TypeScript strict mode
- Type checking enforced through FR-042
- Flat structure improves import path resolution

**Principle III: Test Coverage** - ⚠️ **STILL PARTIAL (JUSTIFIED)**
- Design confirms this is pure refactor with no new business logic
- Verification strategy documented in quickstart.md (type-check + build + manual validation)
- Justification remains valid post-design

**Principle IV: Component Modularity & Reusability** - ✅ **STILL COMPLIANT**
- Atomic design hierarchy documented in data-model.md
- Clear separation: atoms (primitives) → blocks (composed) → documents (future)
- Reusability demonstrated through package exports

**Principle V: API Contracts & Versioning** - ✅ **STILL COMPLIANT**
- Package.json exports define clear API boundaries (research.md section 6)
- Schema name preservation ensures backward compatibility (data-model.md section "Schema Name Preservation")
- Semantic versioning applies to all shared packages

**Principle VI: Internationalization (i18n) First** - ✅ **STILL COMPLIANT**
- No i18n disruption (C-006 constraint maintained)
- Existing i18n architecture preserved
- Future i18n-config refactoring deferred to Phase 3

**Principle VII: Code Quality & Observability** - ✅ **STILL COMPLIANT**
- Type checking and build verification documented in quickstart.md
- Flat structure improves developer experience (SC-004: <5 second file location)
- Clear dependency graph aids debugging

### Quality Gates Re-Check

**Pre-Merge Requirements** - ✅ **ON TRACK**
- TypeScript compilation: Enforced by FR-042, verified in quickstart.md Phase 5.1
- Linting: Existing scripts maintained
- Tests: Type-checking serves as verification (justified above)
- Build success: Enforced by FR-043, verified in quickstart.md Phase 5.2
- Documentation: quickstart.md generated (this phase)

**Performance Budgets** - ✅ **STILL N/A**
- No runtime changes (code organization only)
- Bundle sizes unchanged
- Build times unchanged (no new dependencies)

### Complexity Tracking Re-Assessment

**Principle III Violation**: No changes to justification post-design.

The design artifacts (research.md, data-model.md, quickstart.md) confirm:
1. This is pure file/directory reorganization
2. No new business logic added
3. TypeScript compiler + build system provide comprehensive verification
4. Traditional tests would test file system structure, not logic

**Conclusion**: Partial compliance with Principle III remains justified. Future features adding new logic will include proper tests.

---

## Final Checklist

Before proceeding to `/speckit.tasks` command:

- [x] All constitution principles evaluated (pre-design)
- [x] Quality gates assessed
- [x] Complexity tracking documented (justified violations)
- [x] Phase 0: research.md generated (all decisions documented)
- [x] Phase 1: data-model.md generated (schema organization documented)
- [x] Phase 1: quickstart.md generated (implementation guide created)
- [x] Phase 1: Agent context updated (CLAUDE.md updated)
- [x] Post-design constitution re-evaluation complete
- [ ] Phase 2: tasks.md generation (use `/speckit.tasks` command)

**Status**: ✅ Planning phase complete. Ready for task generation.

**Next Command**: `/speckit.tasks` to generate dependency-ordered implementation tasks.
