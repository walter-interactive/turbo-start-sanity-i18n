---
description: "Task list for removing orphaned translation badge feature"
---

# Tasks: Remove Orphaned Translation Badge

**Input**: Design documents from `/specs/004-remove-orphaned-badge/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated tests required for this removal feature. Manual verification procedures documented in quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo structure**: `apps/studio/` for Sanity Studio workspace
- All paths relative to repository root: `/Users/walter-mac/walter-interactive/clone-0/turbo-start-sanity-i18n`

---

## Phase 1: Setup & Research

**Purpose**: Verify current state and confirm safe removal approach

- [X] T001 [P] Search codebase for OrphanedBadge imports to verify component is unused
- [X] T002 [P] Verify language field usage in apps/studio/schemaTypes/documents/page.ts preview.select
- [X] T003 [P] Verify language field usage in apps/studio/schemaTypes/documents/blog.ts preview.select
- [X] T004 [P] Verify language field usage in apps/studio/schemaTypes/documents/faq.ts preview.select
- [X] T005 Document current preview subtitle formats for baseline comparison

**Checkpoint**: Research confirms safe removal (zero component imports, language field only used for orphaned check)

---

## Phase 2: User Story 1 - Remove Orphaned Translation Warnings (Priority: P1) 🎯 MVP

**Goal**: Content editors can view document lists (pages, blogs, FAQs) without seeing false "orphaned translation" warnings

**Independent Test**: Navigate to Pages/Blogs/FAQs lists in Sanity Studio and verify no "⚠️ Orphaned translation" text appears on any document previews, especially on non-default language (EN) documents that have corresponding FR versions

### Implementation for User Story 1

- [X] T006 [P] [US1] Remove isOrphaned variable and logic from apps/studio/schemaTypes/documents/page.ts preview.prepare() (lines 78-79, 86-88)
- [X] T007 [P] [US1] Remove language field from apps/studio/schemaTypes/documents/page.ts preview.select (line 72) if only used for orphaned check
- [X] T008 [P] [US1] Remove isOrphaned variable and logic from apps/studio/schemaTypes/documents/blog.ts preview.prepare() (lines ~139, 158)
- [X] T009 [P] [US1] Remove language field from apps/studio/schemaTypes/documents/blog.ts preview.select if only used for orphaned check
- [X] T010 [P] [US1] Remove isOrphaned variable and logic from apps/studio/schemaTypes/documents/faq.ts preview.prepare() (lines ~39, 44)
- [X] T011 [P] [US1] Remove language field from apps/studio/schemaTypes/documents/faq.ts preview.select if only used for orphaned check
- [X] T012 [US1] Run typecheck to verify no type errors: pnpm --filter studio typecheck
- [X] T013 [US1] Run build to verify compilation succeeds: pnpm --filter studio build
- [X] T014 [US1] Start Studio dev server and verify it loads without errors: pnpm --filter studio dev

### Verification for User Story 1

- [X] T015 [US1] Visual verification - Navigate to Pages list in Studio and verify no orphaned warnings appear
- [X] T016 [US1] Visual verification - Navigate to Blogs list in Studio and verify no orphaned warnings appear
- [X] T017 [US1] Visual verification - Navigate to FAQs list in Studio and verify no orphaned warnings appear
- [X] T018 [US1] Verify document preview subtitles show clean format without orphaned text
- [X] T019 [US1] Verify Translations badge still functions correctly (not affected by removal)

**Checkpoint**: Pages, Blogs, and FAQs lists display without false orphaned warnings (US1 acceptance criteria met)

---

## Phase 3: User Story 2 - Verify Cleaner Document Preview Interface (Priority: P2)

**Goal**: Document preview subtitles are concise, readable, and free from misleading technical warnings

**Independent Test**: Compare document preview subtitle lengths before and after removal, verify average reduction of 15-20 characters for non-default language documents, confirm consistent format across all languages

**Note**: US2 is accomplished by the implementation of US1. This phase focuses on verification and documentation of the improved interface.

### Verification for User Story 2

- [X] T020 [US2] Measure and document subtitle length reduction for EN documents (expected: ~26 character reduction)
- [X] T021 [US2] Verify subtitle format consistency between FR (default) and EN (non-default) documents
- [X] T022 [US2] Confirm subtitle displays only essential information: status emoji, page builder status, slug
- [X] T023 [US2] Document before/after subtitle format examples in verification notes

**Checkpoint**: Document preview interface is measurably cleaner and more readable (US2 acceptance criteria met)

---

## Phase 4: User Story 3 - Remove Unused Badge Component (Priority: P3)

**Goal**: Codebase is free from unused orphaned translation badge component and all references to orphaned detection logic

**Independent Test**: Verify apps/studio/components/orphaned-translation-badge.tsx file is deleted, confirm codebase search for "isOrphaned" returns zero results in production code

### Implementation for User Story 3

- [X] T024 [US3] Delete apps/studio/components/orphaned-translation-badge.tsx component file
- [X] T025 [US3] Search entire apps/studio/ directory for remaining "isOrphaned" references
- [X] T026 [US3] Search entire apps/studio/ directory for remaining "OrphanedBadge" references
- [X] T027 [US3] Run typecheck to verify no import errors: pnpm --filter studio typecheck
- [X] T028 [US3] Run build to verify successful compilation: pnpm --filter studio build

### Verification for User Story 3

- [X] T029 [US3] Verify orphaned-translation-badge.tsx file no longer exists in repository
- [X] T030 [US3] Run codebase search to confirm zero "isOrphaned" references in production code
- [X] T031 [US3] Run codebase search to confirm zero "OrphanedBadge" references in apps/studio/
- [X] T032 [US3] Verify Studio dev server starts without missing component errors

**Checkpoint**: Unused component and all orphaned detection logic removed from codebase (US3 acceptance criteria met)

---

## Phase 5: Final Verification & Polish

**Purpose**: Comprehensive testing and documentation updates across all user stories

### Build & Type Safety

- [X] T033 [P] Final typecheck verification: pnpm --filter studio typecheck
- [X] T034 [P] Final build verification: pnpm --filter studio build
- [X] T035 [P] Linting verification: pnpm lint
- [X] T036 Verify no console errors when Studio loads in browser

### Functional Testing (Per quickstart.md)

- [X] T037 [P] Create new Page document in EN and verify preview displays without orphaned warning
- [X] T038 [P] Create new Blog document in EN and verify preview displays without orphaned warning
- [X] T039 [P] Open existing multilingual document and verify Translations badge works correctly
- [X] T040 [P] Switch between language versions and verify functionality is preserved
- [X] T041 [P] Edit and save document, verify preview updates correctly in list view
- [X] T042 Verify default language (FR) documents display correctly (should be unchanged)

### Edge Case Verification

- [X] T043 [P] Verify documents with missing slugs handle gracefully (display "no-slug")
- [X] T044 [P] Verify documents without images display correctly
- [X] T045 [P] Verify private documents show 🔒 icon correctly
- [X] T046 Verify page builder indicators display correctly (🧱 with count or 🏗️)

### Documentation & Cleanup

- [X] T047 [P] Update specs/003-dedup-studio-records/spec.md to note FR-010 removal and reference this spec
- [X] T048 [P] Document final subtitle format examples in completion notes
- [X] T049 [P] Archive or update specs/issues/003-T058-orphaned-badge-investigation.md with resolution
- [X] T050 Review and update CLAUDE.md if needed for future similar work

### Success Criteria Verification

- [X] T051 Confirm SC-001: 100% elimination of false positive orphaned warnings
- [X] T052 Confirm SC-002: Document subtitle length reduced by 15-20 characters for EN documents
- [X] T053 Confirm SC-003: Consistent preview formats across all document languages
- [X] T054 Confirm SC-004: Zero results for codebase search of "isOrphaned" in production code

**Checkpoint**: All user stories complete, verified, and documented. Feature ready for review/merge.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup completion - establishes foundation by removing core logic
- **User Story 2 (Phase 3)**: Depends on User Story 1 completion - verifies improvements from US1
- **User Story 3 (Phase 4)**: Can start after Setup, independent of US1/US2 - removes unused component
- **Polish (Phase 5)**: Depends on all user stories (US1, US2, US3) being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup (Phase 1) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 implementation - Verifies the cleaner interface achieved by US1
- **User Story 3 (P3)**: Independent of US1/US2 - Can start anytime after Setup - Removes unused component file

### Within Each User Story

**User Story 1:**
1. Implementation tasks (T006-T011) can run in parallel [P] - different schema files
2. Verification tasks (T012-T014) must run sequentially after implementation
3. Visual verification (T015-T019) must run after dev server starts

**User Story 2:**
1. All verification tasks (T020-T023) must run after US1 implementation complete
2. Verification tasks can run in parallel [P] if documenting different aspects

**User Story 3:**
1. Component deletion (T024) can run independently
2. Search tasks (T025-T026) can run in parallel [P]
3. Verification tasks (T027-T032) run after deletion

### Parallel Opportunities

**Phase 1 (Setup):**
- T001, T002, T003, T004 can all run in parallel (different files being analyzed)

**Phase 2 (User Story 1 - Implementation):**
- T006, T007 (page.ts modifications) - group together
- T008, T009 (blog.ts modifications) - group together  
- T010, T011 (faq.ts modifications) - group together
- All three file groups can run in parallel

**Phase 3 (User Story 2 - Verification):**
- T020, T021, T022, T023 can run in parallel (different verification aspects)

**Phase 4 (User Story 3):**
- T025, T026 (search tasks) can run in parallel
- T027, T028 (verification) can run in parallel

**Phase 5 (Polish):**
- T033, T034, T035 (build verification) can run in parallel
- T037, T038, T039, T040, T041 (functional tests) can run in parallel
- T043, T044, T045 (edge cases) can run in parallel
- T047, T048, T049, T050 (documentation) can run in parallel

---

## Parallel Example: User Story 1 Implementation

```bash
# Launch all schema file modifications together:
Task: "Remove isOrphaned logic from apps/studio/schemaTypes/documents/page.ts"
Task: "Remove isOrphaned logic from apps/studio/schemaTypes/documents/blog.ts"
Task: "Remove isOrphaned logic from apps/studio/schemaTypes/documents/faq.ts"

# Then run verification together:
Task: "pnpm --filter studio typecheck"
Task: "pnpm --filter studio build"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup & Research (T001-T005)
2. Complete Phase 2: User Story 1 (T006-T019)
3. **STOP and VALIDATE**: Test Pages/Blogs/FAQs lists - verify no orphaned warnings
4. Demo to stakeholders if ready (core false warnings eliminated)

**MVP Delivers**: Immediate value - content editors no longer see misleading warnings

---

### Incremental Delivery

1. **Setup + US1** → Test independently → Merge/Deploy (MVP!)
   - Pages, Blogs, FAQs lists show no false warnings
   - Core problem solved, immediate editor relief

2. **Add US2 Verification** → Document improvements → Merge/Deploy
   - Confirm and document interface improvements
   - Provide metrics on readability gains

3. **Add US3** → Test independently → Merge/Deploy
   - Codebase cleanup complete
   - No unused code remaining

4. **Add Polish** → Comprehensive verification → Final Merge/Deploy
   - All edge cases tested
   - Documentation updated
   - Feature fully complete

Each increment adds value without breaking previous work.

---

### Sequential Execution (Single Developer)

**Day 1: Setup & Research**
- Run T001-T005 (research and verification)
- Document findings

**Day 2: User Story 1 Implementation**
- Complete T006-T011 (remove orphaned logic from all schemas)
- Run T012-T014 (typecheck, build, dev server)
- Run T015-T019 (visual and functional verification)
- **Checkpoint**: MVP complete - no false warnings visible

**Day 3: User Story 2 Verification**
- Complete T020-T023 (measure and document improvements)
- **Checkpoint**: Interface improvements quantified

**Day 4: User Story 3 Implementation**
- Complete T024-T032 (delete component and verify removal)
- **Checkpoint**: Codebase cleanup complete

**Day 5: Final Verification & Polish**
- Complete T033-T054 (comprehensive testing and documentation)
- **Checkpoint**: Feature fully complete and documented

**Estimated Total**: 5 days (with buffer for unexpected issues)

---

### Parallel Team Strategy

**Not applicable** - This is a focused removal feature best completed by a single developer to maintain consistency and avoid conflicts. All modified files are schema definitions that should be handled together.

However, if parallelization is needed:

**Team of 2:**
1. **Developer A**: Setup (Phase 1) + User Story 1 (Phase 2) + User Story 2 (Phase 3)
2. **Developer B**: User Story 3 (Phase 4) after Setup complete
3. **Both**: Final Verification & Polish (Phase 5)

---

## Task Summary

| Phase | Task Range | Count | Parallelizable | Can Start After |
|-------|------------|-------|----------------|-----------------|
| Setup & Research | T001-T005 | 5 | 4 of 5 [P] | Immediately |
| User Story 1 (P1) | T006-T019 | 14 | 6 of 14 [P] | Setup complete |
| User Story 2 (P2) | T020-T023 | 4 | 4 of 4 [P] | US1 complete |
| User Story 3 (P3) | T024-T032 | 9 | 5 of 9 [P] | Setup complete |
| Final Polish | T033-T054 | 22 | 18 of 22 [P] | All US complete |
| **TOTAL** | **T001-T054** | **54** | **37 [P]** | - |

---

## Success Criteria Checklist

After all tasks complete, verify:

- ✅ **SC-001**: Zero "⚠️ Orphaned translation" warnings visible in Studio (T015-T017, T051)
- ✅ **SC-002**: Subtitle length reduced by 15-20 characters for EN documents (T020, T052)
- ✅ **SC-003**: Consistent preview format across FR and EN documents (T021, T053)
- ✅ **SC-004**: Zero codebase search results for "isOrphaned" in production (T030, T054)
- ✅ **Build Health**: All typecheck, build, and lint commands pass (T033-T035)
- ✅ **Functional Preservation**: Translations badge and language switching work (T019, T039-T040)
- ✅ **Documentation**: All specs updated with removal notes (T047-T049)

---

## Rollback Plan

If critical issues discovered during implementation:

1. **Before any commits**: `git reset --hard` to starting state
2. **After commits**: `git revert <commit-hash>` for each commit in reverse order
3. **Partial rollback**: Restore specific files from main:
   ```bash
   git checkout main -- apps/studio/schemaTypes/documents/page.ts
   git checkout main -- apps/studio/schemaTypes/documents/blog.ts
   git checkout main -- apps/studio/schemaTypes/documents/faq.ts
   git checkout main -- apps/studio/components/orphaned-translation-badge.tsx
   ```

**Rollback triggers**:
- Studio fails to load after changes
- Type errors cannot be resolved
- Document previews break entirely
- Translations badge stops functioning

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **No automated tests**: Manual verification via quickstart.md checklist
- **Commit strategy**: Commit after each user story phase for clean rollback points
- **Stop at any checkpoint**: Each user story can be validated independently
- **File paths**: All paths use kebab-case per project conventions
- **Language field**: Only remove from preview.select if verification confirms it's only used for orphaned check
- **Preserve functionality**: Translations badge, language switching, and all other preview elements must remain functional

---

## Reference Documents

- **Spec**: [spec.md](./spec.md) - Feature requirements and user stories
- **Plan**: [plan.md](./plan.md) - Technical approach and architecture
- **Research**: [research.md](./research.md) - Detailed investigation findings
- **Data Model**: [data-model.md](./data-model.md) - Confirms no schema changes
- **Quickstart**: [quickstart.md](./quickstart.md) - Manual verification procedures
- **Investigation**: [../issues/003-T058-orphaned-badge-investigation.md](../issues/003-T058-orphaned-badge-investigation.md) - Root cause analysis
