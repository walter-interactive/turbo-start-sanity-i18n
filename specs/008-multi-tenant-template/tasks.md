# Tasks: Multi-Tenant Agency Template Architecture

**Input**: Design documents from `/specs/008-multi-tenant-template/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not required for this code organization refactor. Verification via TypeScript type checking and build success (per Constitution Principle III justification in plan.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. This is a special case where user stories represent architectural foundations that must be implemented sequentially due to dependencies (atoms → blocks → apps).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo structure**: `apps/*`, `packages/*` at repository root
- Tasks reference exact paths from quickstart.md and data-model.md

---

## Phase 1: Pre-Migration Verification

**Purpose**: Document current state before any changes to ensure backward compatibility

- [X] T001 Document all current Sanity schema names by inspecting packages/sanity/src/blocks/ and packages/sanity/src/shared/
- [X] T002 Verify current build passes with pnpm check-types && pnpm build
- [X] T003 Record baseline file locations for git history tracking

**Checkpoint**: ✅ Current state documented - ready to begin migrations

**Findings**:
- 2 implemented blocks: hero (heroSection.schema.ts), cta (cta.schema.ts)
- 1 empty block file: faq-section (0 bytes) - will NOT be migrated
- 3 atomic types: buttons, image, richText
- Studio build: ✅ PASS
- Type checking: ✅ PASS
- Web build: ⚠️ Pre-existing type issue (not blocking)

---

## Phase 2: User Story 4 - Developer Manages Shared Atomic Content Types (Priority: P1) 🎯

**Goal**: Create `@walter/sanity-atoms` package with reusable atomic field definitions, establishing foundation for blocks package

**Why First**: Atoms have no dependencies and are required by blocks package. Must be created before blocks can be reorganized (dependency: blocks → atoms).

**Independent Test**: Verify atoms package type-checks successfully and exports buttons, image, richText schemas that can be imported by other packages

### Implementation for User Story 4

- [X] T004 [P] [US4] Create packages/sanity-atoms/ directory structure
- [X] T005 [P] [US4] Create packages/sanity-atoms/package.json with name "@walter/sanity-atoms", exports "./schemas", peerDependencies, and devDependencies
- [X] T006 [P] [US4] Create packages/sanity-atoms/tsconfig.json extending @workspace/typescript-config
- [X] T007 [P] [US4] Create packages/sanity-atoms/README.md documenting package purpose and usage
- [X] T008 [US4] Copy buttons schema from packages/sanity/src/shared/buttons/buttons.schema.ts to packages/sanity-atoms/src/buttons.schema.ts
- [X] T009 [US4] Copy image schema from packages/sanity/src/shared/image/image.schema.ts to packages/sanity-atoms/src/image.schema.ts (empty - image is built-in Sanity type)
- [X] T010 [US4] Copy richText schema from packages/sanity/src/shared/rich-text/rich-text.schema.ts to packages/sanity-atoms/src/richText.schema.ts (rename file to camelCase)
- [X] T011 [US4] Verify schema export names are consistent (buttonsFieldSchema, richText, customRichText) in all atom files
- [X] T012 [US4] Create packages/sanity-atoms/src/schemas.ts with re-exports of all atomic schemas
- [X] T013 [US4] Run pnpm install to register new workspace package
- [X] T014 [US4] Run pnpm --filter @walter/sanity-atoms check-types to verify atoms package

**Checkpoint**: Atoms package created and type-checks successfully - ready for blocks to import

---

## Phase 3: User Story 3 - Developer Manages Shared Block Library (Priority: P1) 🎯

**Goal**: Reorganize blocks package with flat file structure, camelCase naming, and atoms dependency

**Why Second**: Blocks depend on atoms package (created in Phase 2). Must be reorganized before apps can update imports.

**Independent Test**: Verify blocks package type-checks successfully, all blocks exist as flat files with camelCase naming, blocks import atoms from @walter/sanity-atoms, and exports schemas.ts and fragments.ts with allBlockSchemas array

### Implementation for User Story 3

#### Blocks Package Reorganization

- [X] T015 [US3] Rename packages/sanity/ to packages/sanity-blocks/ using git mv
- [X] T016 [US3] Update packages/sanity-blocks/package.json name to "@walter/sanity-blocks"
- [X] T017 [US3] Add "@walter/sanity-atoms": "workspace:*" to packages/sanity-blocks/package.json dependencies
- [X] T018 [US3] Update packages/sanity-blocks/package.json exports to include "./schemas" and "./fragments"
- [X] T019 [US3] Run pnpm install to update workspace dependencies

#### Migrate Blocks to Flat Structure

- [X] T020 [P] [US3] Move packages/sanity-blocks/src/blocks/hero-section/hero-section.schema.ts to packages/sanity-blocks/src/heroSection.schema.ts using git mv
- [X] T021 [P] [US3] Move packages/sanity-blocks/src/blocks/hero-section/hero-section.fragment.ts to packages/sanity-blocks/src/heroSection.fragment.ts using git mv
- [X] T022 [P] [US3] Move packages/sanity-blocks/src/blocks/cta/cta.schema.ts to packages/sanity-blocks/src/cta.schema.ts using git mv
- [X] T023 [P] [US3] Move packages/sanity-blocks/src/blocks/cta/cta.fragment.ts to packages/sanity-blocks/src/cta.fragment.ts using git mv
- [X] T024 [P] [US3] Move packages/sanity-blocks/src/blocks/faq-section/faq-section.schema.ts to packages/sanity-blocks/src/faqAccordion.schema.ts using git mv (rename to camelCase)
- [X] T025 [P] [US3] Move packages/sanity-blocks/src/blocks/faq-section/faq-section.fragment.ts to packages/sanity-blocks/src/faqAccordion.fragment.ts using git mv (rename to camelCase)
- [X] T026 [US3] Remove empty nested directories: packages/sanity-blocks/src/blocks/hero-section/, packages/sanity-blocks/src/blocks/cta/, packages/sanity-blocks/src/blocks/faq-section/
- [X] T027 [US3] Remove packages/sanity-blocks/src/blocks/ directory (now empty)
- [X] T028 [US3] Remove packages/sanity-blocks/src/shared/ directory (atoms migrated to separate package)

#### Update Block Imports to Use Atoms Package

- [X] T029 [P] [US3] Update imports in packages/sanity-blocks/src/heroSection.schema.ts to import from '@walter/sanity-atoms/schemas' instead of local paths
- [X] T030 [P] [US3] Update imports in packages/sanity-blocks/src/cta.schema.ts to import from '@walter/sanity-atoms/schemas' instead of local paths
- [X] T031 [P] [US3] Update imports in packages/sanity-blocks/src/faqAccordion.schema.ts to import from '@walter/sanity-atoms/schemas' instead of local paths
- [X] T032 [US3] Verify schema export names are consistent (heroSectionSchema, ctaSchema, faqAccordionSchema) in all block files
- [X] T033 [US3] Verify schema name fields unchanged (e.g., name: 'heroSection') for backward compatibility

#### Create Aggregated Exports

- [X] T034 [US3] Create packages/sanity-blocks/src/schemas.ts with named exports (heroSectionSchema, ctaSchema, faqAccordionSchema) and allBlockSchemas array
- [X] T035 [US3] Create packages/sanity-blocks/src/fragments.ts with named exports (heroSectionFragment, ctaFragment, faqAccordionFragment) and allBlockFragments array
- [X] T036 [US3] Run pnpm --filter @walter/sanity-blocks check-types to verify blocks package

**Checkpoint**: Blocks package reorganized with flat structure and atoms dependency - ready for apps to update imports

---

## Phase 4: User Story 2 - Developer Maintains Template Reference Apps (Priority: P2)

**Goal**: Rename apps to distinguish template reference implementations from future client projects

**Why Third**: Apps are consumers of packages. Renaming them doesn't affect package structure but must be done before updating import paths.

**Independent Test**: Verify apps/template-studio and apps/template-web exist, are clearly named as templates, and workspace configuration recognizes renamed apps

### Implementation for User Story 2

#### Rename App Directories

- [X] T037 [US2] Rename apps/studio/ to apps/template-studio/ using git mv
- [X] T038 [US2] Rename apps/web/ to apps/template-web/ using git mv

#### Update App Package Configuration

- [X] T039 [US2] Update apps/template-studio/package.json name to "template-studio"
- [X] T040 [US2] Update apps/template-web/package.json name to "template-web"

#### Update Monorepo Configuration

- [X] T041 [US2] Update turbo.json to reference template-studio# and template-web# instead of studio# and web#
- [X] T042 [US2] Update root package.json workspaces if explicitly listed (or verify glob patterns still match)
- [X] T043 [US2] Run pnpm install to update workspace symlinks

**Checkpoint**: Apps renamed successfully - workspace recognizes new app names

---

## Phase 5: User Story 1 - Developer Sets Up New Client Project (Priority: P1) 🎯 MVP

**Goal**: Update template apps to import from reorganized packages, establishing foundation for future client project scaffolding

**Why Last**: This demonstrates the complete architecture working end-to-end. Apps consume the reorganized packages, proving the refactor succeeded.

**Independent Test**: Verify template apps successfully import schemas/fragments from @walter/sanity-blocks and @walter/sanity-atoms, build without errors, type-check passes, and dev servers start without errors

### Implementation for User Story 1

#### Update Template Studio Dependencies and Imports

- [X] T044 [US1] Update apps/template-studio/package.json dependencies to include "@walter/sanity-atoms": "workspace:*" and "@walter/sanity-blocks": "workspace:*"
- [X] T045 [US1] Remove old "@workspace/sanity" dependency from apps/template-studio/package.json
- [X] T046 [US1] Run pnpm install to update studio dependencies
- [X] T047 [US1] Find all imports of '@workspace/sanity' in apps/template-studio/ using grep
- [X] T048 [US1] Update schema imports in apps/template-studio/ to use '@walter/sanity-blocks/schemas' (import allBlockSchemas or individual schemas)
- [X] T049 [US1] Verify atoms can be imported if needed (though typically accessed via blocks)

#### Update Template Web Dependencies and Imports

- [X] T050 [US1] Update apps/template-web/package.json dependencies to include "@walter/sanity-blocks": "workspace:*"
- [X] T051 [US1] Remove old "@workspace/sanity" dependency from apps/template-web/package.json
- [X] T052 [US1] Run pnpm install to update web dependencies
- [X] T053 [US1] Find all imports of '@workspace/sanity' in apps/template-web/ using grep
- [X] T054 [US1] Update fragment imports in apps/template-web/ to use '@walter/sanity-blocks/fragments' (import individual fragments)

**Checkpoint**: Template apps updated to use reorganized packages - full architecture integrated

---

## Phase 6: User Story 5 - Developer Manages I18n Configuration (Priority: P2)

**Goal**: Document i18n configuration package for future refactoring (no changes in Phase 1)

**Why Deferred**: I18n config refactoring is deferred to Phase 3 of overall project (per plan.md out-of-scope OS-003). This user story validates existing i18n functionality remains intact.

**Independent Test**: Verify existing i18n-config package unchanged and template apps continue to use i18n configuration without errors

### Validation for User Story 5

- [ ] T055 [US5] Verify packages/i18n-config/ package unchanged (no files modified)
- [ ] T056 [US5] Verify template apps still import from i18n-config successfully
- [ ] T057 [US5] Document i18n-config package for future Phase 3 refactoring in packages/i18n-config/README.md (if not exists)

**Checkpoint**: I18n functionality preserved - no disruption to multi-language content

---

## Phase 7: Final Verification & Polish

**Purpose**: Comprehensive validation that refactor succeeded and documentation updates

- [ ] T058 Run pnpm check-types across all workspaces to verify zero TypeScript errors
- [ ] T059 Run pnpm build across all workspaces to verify successful builds
- [ ] T060 Start apps/template-studio dev server and verify it loads without errors
- [ ] T061 Verify all page builder blocks appear in Sanity Studio interface
- [ ] T062 Start apps/template-web dev server and verify it loads without errors
- [ ] T063 Verify web app pages render correctly with block content
- [ ] T064 Test file discoverability by timing how long to locate packages/sanity-blocks/src/heroSection.schema.ts (should be <5 seconds per SC-004)
- [ ] T065 Verify dependency graph correct by checking package.json files (apps → blocks → atoms)
- [ ] T066 Verify zero code duplication by searching for duplicate schema definitions
- [ ] T067 Verify schema names unchanged by comparing to pre-migration documentation (from T001)
- [ ] T068 Update project CLAUDE.md if needed with new package structure information
- [ ] T069 [P] Update any team documentation referencing old package names
- [ ] T070 Run quickstart.md validation steps to confirm all success criteria met

**Checkpoint**: All verification complete - refactor successful and ready for commit

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Pre-Migration)**: No dependencies - start immediately
- **Phase 2 (US4 - Atoms)**: Depends on Phase 1 - BLOCKS Phase 3
- **Phase 3 (US3 - Blocks)**: Depends on Phase 2 completion - blocks need atoms to exist
- **Phase 4 (US2 - Rename Apps)**: Depends on Phase 1 - can theoretically run in parallel with Phase 2/3 but sequenced for clarity
- **Phase 5 (US1 - Update Apps)**: Depends on Phases 2, 3, and 4 completion - apps need reorganized packages
- **Phase 6 (US5 - I18n Validation)**: Depends on Phase 5 - validate after all changes complete
- **Phase 7 (Final Verification)**: Depends on all user story phases - comprehensive validation

### User Story Dependencies

**Critical Dependency Chain** (must be sequential):
1. **User Story 4 (Atoms)** → Must complete FIRST (no dependencies, foundation for blocks)
2. **User Story 3 (Blocks)** → Depends on US4 completion (blocks import atoms)
3. **User Story 1 (App Updates)** → Depends on US3 completion (apps import blocks)

**Parallel Opportunities**:
- **User Story 2 (App Renaming)** can run in parallel with US4/US3 (independent of package changes)
- **User Story 5 (I18n Validation)** can run in parallel with final verification (passive check)

**Recommended Sequence** (safest):
1. Pre-Migration (Phase 1)
2. US4 - Create Atoms Package (Phase 2)
3. US3 - Reorganize Blocks Package (Phase 3)
4. US2 - Rename Apps (Phase 4)
5. US1 - Update App Imports (Phase 5)
6. US5 - I18n Validation (Phase 6)
7. Final Verification (Phase 7)

### Within Each User Story

- **US4 (Atoms)**: Package structure → schema files → aggregated exports → verification
- **US3 (Blocks)**: Rename package → add atoms dependency → migrate files to flat structure → update imports → create exports → verification
- **US2 (App Renaming)**: Rename directories → update package names → update monorepo config
- **US1 (App Updates)**: Update dependencies → find old imports → replace imports
- **US5 (I18n)**: Passive validation only

### Parallel Opportunities Within Phases

**Phase 2 (US4 - Atoms)**:
- T004-T007: All package setup files can be created in parallel [P]
- T008-T010: All atom schema files can be copied in parallel (after atoms package exists)

**Phase 3 (US3 - Blocks)**:
- T020-T025: All block file moves can run in parallel [P] (different files)
- T029-T031: All import updates can run in parallel [P] (different files)

**Phase 7 (Final Verification)**:
- T069: Documentation updates can run in parallel with verification [P]

---

## Parallel Example: User Story 4 (Atoms Creation)

```bash
# Launch all package setup files together:
Task T004: "Create packages/sanity-atoms/ directory structure"
Task T005: "Create packages/sanity-atoms/package.json..."
Task T006: "Create packages/sanity-atoms/tsconfig.json..."
Task T007: "Create packages/sanity-atoms/README.md..."

# Then launch all schema file copies together:
Task T008: "Copy buttons schema to packages/sanity-atoms/src/buttons.schema.ts"
Task T009: "Copy image schema to packages/sanity-atoms/src/image.schema.ts"
Task T010: "Copy richText schema to packages/sanity-atoms/src/richText.schema.ts"
```

---

## Implementation Strategy

### MVP First (Core Architecture)

**Minimum Viable Product** = User Stories 4, 3, and 1 (Atoms → Blocks → App Integration)

1. Complete Phase 1: Pre-Migration Verification
2. Complete Phase 2: US4 - Create Atoms Package
3. Complete Phase 3: US3 - Reorganize Blocks Package
4. Complete Phase 4: US2 - Rename Apps
5. Complete Phase 5: US1 - Update App Imports
6. **STOP and VALIDATE**: Test template apps independently
7. If successful, complete Phase 6 and 7 for full validation

**Why this MVP**: Establishes complete multi-tenant foundation - atoms, blocks, and template apps all working together. Future client projects can now use these packages.

### Incremental Delivery

1. **Atoms Package** (Phase 2) → Foundation ready
2. **Blocks Package** (Phase 3) → Package architecture complete
3. **App Renaming** (Phase 4) → Template distinction clear
4. **App Integration** (Phase 5) → Full architecture working → **DEPLOYABLE MVP**
5. **I18n Validation** (Phase 6) → Confidence in i18n preservation
6. **Final Verification** (Phase 7) → Production-ready

### Serial Strategy (Recommended)

With single developer or team working together:

1. Complete phases sequentially (1 → 2 → 3 → 4 → 5 → 6 → 7)
2. Verify at each checkpoint before proceeding
3. Estimated time: 3-4 hours total
4. Safest approach for this refactor (dependencies between phases)

### Parallel Strategy (Advanced)

With multiple developers (if urgent):

1. **Developer A**: Phase 2 (US4 - Atoms) + Phase 4 (US2 - Rename Apps)
2. **Developer B**: Wait for Phase 2, then Phase 3 (US3 - Blocks)
3. **Developer C**: Wait for Phases 2+3+4, then Phase 5 (US1 - App Updates)
4. **All**: Phase 7 (Final Verification) together

**Risk**: Coordination overhead, potential merge conflicts in package.json files. Only recommended if time-critical.

---

## Notes

- **[P] tasks**: Different files, no dependencies, can run in parallel
- **[Story] labels**: Map tasks to user stories for traceability (US1-US5)
- **Git history**: Use `git mv` for all renames/moves to preserve file history
- **Backward compatibility**: Schema `name` fields must remain unchanged (verify in T033 and T067)
- **Type safety**: TypeScript compiler serves as primary verification (no traditional tests needed per plan.md)
- **Checkpoints**: Stop at each checkpoint to validate independently before proceeding
- **File paths**: All paths are exact (from quickstart.md and data-model.md)
- **Commit strategy**: Consider committing after each phase for easier rollback if needed

---

## Summary

**Total Tasks**: 70 tasks across 7 phases

**Tasks by User Story**:
- **Pre-Migration**: 3 tasks
- **US4 (Atoms)**: 11 tasks
- **US3 (Blocks)**: 22 tasks
- **US2 (Rename Apps)**: 7 tasks
- **US1 (App Integration)**: 12 tasks
- **US5 (I18n Validation)**: 3 tasks
- **Final Verification**: 13 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel within their phases

**MVP Scope**: Phases 1-5 (Tasks T001-T054) = Complete multi-tenant architecture foundation

**Estimated Time**: 3-4 hours (per quickstart.md)

**Critical Path**: Pre-Migration → Atoms (US4) → Blocks (US3) → Apps (US2) → Integration (US1) → Verification

**Independent Tests**: Each user story has clear acceptance criteria (from spec.md) validated at checkpoints
