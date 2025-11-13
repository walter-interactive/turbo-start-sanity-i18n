---
description: "Implementation tasks for Studio Documentation & Code Organization"
---

# Tasks: Studio Documentation & Code Organization

**Input**: Design documents from `/specs/005-studio-docs-cleanup/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not applicable - documentation feature validated through team review, not automated tests

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This feature modifies apps/studio workspace in the monorepo:
- Documentation: `apps/studio/README.md`
- Configuration files: `apps/studio/sanity.config.ts`, `apps/studio/structure.ts`
- Schema files: `apps/studio/schemaTypes/**/*.ts`
- Utility files: `apps/studio/utils/*.ts`
- Components: `apps/studio/components/*.tsx`

---

## Phase 1: Setup (Documentation Infrastructure)

**Purpose**: Prepare documentation framework and understand current codebase

- [X] T001 Review existing apps/studio codebase structure and identify all files requiring documentation
- [X] T002 Create documentation outline based on research.md structure for apps/studio/README.md
- [X] T003 [P] Establish JSDoc comment templates based on research.md standards (Section 6)
- [X] T004 [P] Create checklist of files requiring inline comments per data-model.md priority

---

## Phase 2: Foundational (Core Configuration Documentation)

**Purpose**: Document the two most critical files that block developer understanding

**⚠️ CRITICAL**: These files must be documented first as they are referenced throughout other documentation

- [X] T005 Add comprehensive JSDoc comments to sanity.config.ts explaining all 9 plugins per research.md Section 3
- [X] T006 Add inline comments to sanity.config.ts newDocumentOptions logic (lines 68-74) explaining template filtering
- [X] T007 Add inline comments to sanity.config.ts schema.templates section (lines 78-118) explaining i18n template filtering
- [X] T008 Add comprehensive JSDoc to structure.ts helper functions maintaining existing comment quality standard (lines 71-113)
- [X] T009 Add inline comments to structure.ts sidebar sections explaining language filtering pattern and DEFAULT_LOCALE usage

**Checkpoint**: Core configuration documented - user story work can now proceed in parallel

---

## Phase 3: User Story 1 - Onboarding New Developer (Priority: P1) 🎯 MVP

**Goal**: Enable new developer to understand codebase structure, plugin purposes, and locate key files within 30 minutes

**Independent Test**: New developer reads updated README, understands plugin purposes, locates key configuration files, and explains 4+ plugins within 30 minutes

### Implementation for User Story 1

- [X] T010 [P] [US1] Write "Quick Start" section in apps/studio/README.md with installation, dev server, and build commands
- [X] T011 [P] [US1] Write "Architecture Overview" section in apps/studio/README.md explaining directory structure per data-model.md
- [X] T012 [P] [US1] Write "Plugin Ecosystem" section in apps/studio/README.md documenting all 9 plugins from research.md Section 3
- [X] T013 [US1] Write "Plugin Interactions" subsection explaining documentInternationalization + structure filtering and orderableDocumentList + i18n orderRank quirk
- [X] T014 [US1] Write "Content Type System" section explaining documents/blocks/definitions organization from data-model.md
- [X] T015 [US1] Write "Studio Structure (Sidebar)" section explaining structure.ts helper functions and patterns
- [X] T016 [US1] Add cross-references linking README sections to specific file locations (e.g., sanity.config.ts:53-65)
- [X] T017 [US1] Write "Reference" section with environment variables, NPM scripts, naming conventions, and code style guidelines

**Checkpoint**: New developers can now navigate codebase, understand plugin ecosystem, and locate key files independently

---

## Phase 4: User Story 2 - Adding New Translatable Document Type (Priority: P2)

**Goal**: Enable developer to add new translatable document type following documentation alone, without errors, within 45 minutes

**Independent Test**: Developer adds new translatable document type by following documentation, including schema creation, plugin registration, structure configuration, and type generation, without missing steps

### Implementation for User Story 2

- [X] T018 [US2] Write "Adding a New Translatable Document Type" workflow guide in apps/studio/README.md with step-by-step checklist
- [X] T019 [US2] Add validation steps to workflow explaining how to verify translation actions appear in Studio
- [X] T020 [US2] Add "Common Issues" subsection covering missing translation actions and language field problems
- [X] T021 [P] [US2] Add header comments to example translatable document schemas (apps/studio/schemaTypes/documents/page.ts, blog.ts, faq.ts)
- [X] T022 [P] [US2] Add header comment to apps/studio/schemaTypes/common.ts explaining language field utility
- [X] T023 [US2] Document the i18nTypes array pattern in sanity.config.ts:80-88 with inline comment explaining why types must be filtered

**Checkpoint**: Developers can add new translatable content types independently without support questions

---

## Phase 5: User Story 3 - Understanding Code Organization (Priority: P1)

**Goal**: Enable developer to locate where specific functionality lives (components, hooks, utilities, migrations) by consulting README with 90% accuracy

**Independent Test**: Developer answers "where should I put [X]?" questions using README's architecture section with 90% accuracy for common scenarios

### Implementation for User Story 3

- [X] T024 [P] [US3] Add header comments to all schema block files in apps/studio/schemaTypes/blocks/ explaining each block's purpose and usage
- [X] T025 [P] [US3] Add header comments to all schema definition files in apps/studio/schemaTypes/definitions/ explaining reusable field group purposes
- [X] T026 [P] [US3] Add header comments to singleton document schemas (apps/studio/schemaTypes/documents/home-page.ts, settings.ts, navbar.ts, footer.ts)
- [X] T027 [P] [US3] Add JSDoc comments to all exported functions in apps/studio/utils/helper.ts with @param, @returns, @example tags
- [X] T028 [P] [US3] Add JSDoc comments to apps/studio/utils/slug-validation.ts explaining validation rules and usage
- [X] T029 [P] [US3] Add header comments to custom components in apps/studio/components/ (slug-field-component.tsx, language-filter.ts, nested-pages-structure.ts)
- [X] T030 [US3] Expand "Architecture Overview" section in README.md with "Where to Put What" guide covering components/, hooks/, utils/, migrations/, plugins/
- [X] T031 [US3] Add "File Naming Conventions" subsection to README.md explaining kebab-case for files, PascalCase for components

**Checkpoint**: Developers can confidently locate existing code and know where to place new functionality

---

## Phase 6: User Story 4 - Modifying Studio Structure (Priority: P2)

**Goal**: Enable developer to reorganize Studio sidebar by modifying structure.ts with confidence, using documented examples

**Independent Test**: Developer adds new grouped section to sidebar following structure.ts comments and README examples, resulting in correctly organized and filtered content

### Implementation for User Story 4

- [X] T032 [US4] Write "Modifying Studio Sidebar Structure" workflow guide in apps/studio/README.md with step-by-step instructions
- [X] T033 [US4] Document createSingleTon helper in workflow guide with example from structure.ts:39-44
- [X] T034 [US4] Document createList helper in workflow guide with example from structure.ts:56-62
- [X] T035 [US4] Document createIndexListWithOrderableItems helper in workflow guide referencing existing JSDoc at structure.ts:71-113
- [X] T036 [US4] Add inline comments to structure.ts sidebar sections (lines 173-253) explaining when to use each helper function
- [X] T037 [US4] Write "Adding a New Singleton Document" workflow guide as companion to translatable document workflow
- [X] T038 [US4] Add testing checklist to workflow explaining how to verify sidebar changes (restart dev server, check filtering, verify document creation)

**Checkpoint**: Developers can modify sidebar structure, add new content groupings, and apply language filtering patterns

---

## Phase 7: User Story 5 - Plugin Configuration Understanding (Priority: P3)

**Goal**: Enable developer to explain purpose of each plugin in sanity.config.ts and describe how they interact

**Independent Test**: Developer explains purpose of each plugin and describes how documentInternationalization affects structure.ts filtering

### Implementation for User Story 5

- [X] T039 [P] [US5] Add JSDoc comment block for presentationTool plugin in apps/studio/sanity.config.ts:33-43 explaining preview integration
- [X] T040 [P] [US5] Add JSDoc comment block for structureTool plugin in apps/studio/sanity.config.ts:44-46 explaining sidebar navigation role
- [X] T041 [P] [US5] Add JSDoc comment block for documentInternationalization plugin in apps/studio/sanity.config.ts:53-65 explaining i18n workflow
- [X] T042 [P] [US5] Add JSDoc comment block for visionTool, media, iconPicker, assist plugins explaining their purposes
- [X] T043 [P] [US5] Add JSDoc comment block for unsplashImageAsset plugin explaining stock photo integration
- [X] T044 [US5] Add @see links in each plugin JSDoc referencing official Sanity documentation URLs
- [X] T045 [US5] Add inline comment explaining presentationUrl custom plugin at apps/studio/sanity.config.ts:47
- [X] T046 [US5] Write "Plugin Configuration Guidelines" subsection in README.md explaining when/how to add new plugins

**Checkpoint**: Developers understand plugin ecosystem, can safely modify plugin configuration, and know when to add new plugins

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation, ensure consistency, and validate completeness

- [X] T047 [P] Add header comments to remaining utility files (apps/studio/utils/constant.ts, seo-fields.ts, og-fields.ts, types.ts, slug.ts)
- [X] T048 [P] Add header comment to apps/studio/location.ts explaining preview location resolver purpose
- [X] T049 [P] Add header comment to apps/studio/plugins/presentation-url.ts explaining custom plugin purpose
- [X] T050 Write "Troubleshooting" section in apps/studio/README.md covering common issues from research.md Section 4
- [X] T051 Add "Translation actions not appearing" troubleshooting entry with solution checklist
- [X] T052 Add "OrderRank not working across languages" troubleshooting entry explaining query compensation pattern
- [X] T053 Add "Preview not loading" troubleshooting entry covering presentationTool configuration
- [X] T054 Add "Type generation errors" troubleshooting entry explaining sanity typegen workflow
- [X] T055 Add Table of Contents to apps/studio/README.md for easy navigation
- [X] T056 Verify all cross-references in README.md point to correct file paths and line numbers
- [X] T057 Run pnpm --filter studio check-types to verify no TypeScript errors introduced by comments
- [X] T058 Run pnpm --filter studio build to verify build succeeds with new documentation
- [X] T059 Review documentation density per research.md guidelines (30-50% for config, 15-25% for utils)
- [ ] T060 Conduct documentation review with developer unfamiliar with Sanity to validate clarity (Success Criteria SC-001 through SC-007)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if multiple documentation writers available)
  - Or sequentially in priority order (US1 → US3 → US2 → US4 → US5)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Should reference US1 README sections
- **User Story 4 (P2)**: Can start after Foundational - Should reference US1 README sections
- **User Story 5 (P3)**: Can start after Foundational - Benefits from US1 plugin ecosystem section

### Within Each User Story

- P1 stories (US1, US3) should be prioritized first as they provide foundational documentation
- P2 stories (US2, US4) build on P1 documentation with specific workflows
- P3 story (US5) provides deep plugin understanding

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004)
- Within User Story 1: T010, T011, T012 can run in parallel (different README sections)
- Within User Story 2: T021, T022 can run in parallel (different schema files)
- Within User Story 3: T024, T025, T026, T027, T028, T029 can all run in parallel (different files)
- Within User Story 5: T039, T040, T041, T042, T043 can all run in parallel (different plugin comments)
- Within Polish phase: T047, T048, T049 can run in parallel (different files)
- User Stories 1 and 3 (both P1) can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch parallel tasks for different README sections:
Task: "Write 'Quick Start' section in apps/studio/README.md"
Task: "Write 'Architecture Overview' section in apps/studio/README.md"
Task: "Write 'Plugin Ecosystem' section in apps/studio/README.md"

# These are different sections of the same file, so must merge carefully
# Better approach: Assign complete sections to avoid merge conflicts
```

## Parallel Example: User Story 3

```bash
# Launch all schema documentation tasks in parallel (different files):
Task: "Add header comments to apps/studio/schemaTypes/blocks/cta.ts"
Task: "Add header comments to apps/studio/schemaTypes/blocks/hero.ts"
Task: "Add header comments to apps/studio/schemaTypes/blocks/faq-accordion.ts"
Task: "Add header comments to apps/studio/schemaTypes/blocks/feature-cards-icon.ts"
Task: "Add header comments to apps/studio/schemaTypes/blocks/image-link-cards.ts"
Task: "Add header comments to apps/studio/schemaTypes/blocks/subscribe-newsletter.ts"

# All different files - can run truly in parallel
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 3 - Both P1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (sanity.config.ts + structure.ts core comments)
3. Complete Phase 3: User Story 1 (README architecture and plugin documentation)
4. Complete Phase 5: User Story 3 (Code organization and file comments)
5. **STOP and VALIDATE**: Have unfamiliar developer review documentation (Success Criteria SC-001, SC-003, SC-004, SC-005)
6. Measure onboarding time and adjust if needed

### Incremental Delivery

1. Complete Setup + Foundational → Core files documented
2. Add User Story 1 → Test with new developer → Validate onboarding time (MVP!)
3. Add User Story 3 → Test code location tasks → Validate findability
4. Add User Story 2 → Test workflow by adding test document type
5. Add User Story 4 → Test sidebar modification workflow
6. Add User Story 5 → Test plugin understanding via quiz
7. Polish → Final review and troubleshooting additions

### Parallel Team Strategy

With multiple documentation writers:

1. Team completes Setup + Foundational together (1 day)
2. Once Foundational is done:
   - Writer A: User Story 1 (README architecture) - 2 days
   - Writer B: User Story 3 (Schema/util comments) - 2 days
   - Writer C: User Story 5 (Plugin documentation) - 1 day
3. Sequential phase:
   - Writer A: User Story 2 (workflows) - 1 day
   - Writer B: User Story 4 (structure workflows) - 1 day
4. All writers: Polish phase together (1 day)

**Estimated total time**:
- Sequential: 8-10 days
- Parallel (3 writers): 4-5 days

---

## Success Criteria Mapping

| Success Criteria | Verified By | Tasks |
|------------------|-------------|-------|
| SC-001: Locate any file within 5 minutes | Developer navigation test | T011, T030, T031 (US1, US3) |
| SC-002: Add translatable document type in 45 minutes | Workflow execution test | T018-T023 (US2) |
| SC-003: 100% of critical config sections have comments | Code review | T005-T009, T039-T045 (Phase 2, US5) |
| SC-004: Explain 4/5 major plugins | Developer quiz | T012, T013, T041 (US1, US5) |
| SC-005: Onboarding time < 1 hour | Timed onboarding trial | All US1 + US3 tasks |
| SC-006: 80% reduction in support questions | Post-handoff tracking | All documentation tasks |
| SC-007: 3+ step-by-step guides < 10 minutes each | Guide review | T018, T032, T037 (US2, US4) |

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- README.md sections should be written in Google Docs or separate markdown files first to avoid merge conflicts when working in parallel
- Commit after completing each user story phase
- Stop at any checkpoint to validate story independently with unfamiliar developer
- Use research.md and data-model.md as reference throughout implementation
- Maintain existing code functionality - only add comments and documentation, no code changes
- Follow JSDoc standards from research.md Section 6 for all inline comments
- Target comment density from research.md Section 8 (30-50% config files, 15-25% utils)
