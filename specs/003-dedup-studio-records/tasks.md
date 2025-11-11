# Tasks: De-duplicate i18n Records in Sanity Studio

**Input**: Design documents from `/specs/003-dedup-studio-records/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual testing only (no automated test suite per AGENTS.md and plan.md Constitution Check III)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a TurboRepo monorepo with apps/studio workspace:
- **Studio**: `apps/studio/` (all changes isolated here)
- **Web**: `apps/web/` (config changes only)
- **Shared Package**: `packages/i18n-config/` (new package)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create centralized i18n configuration package

**Why**: Eliminates configuration duplication across apps/web and apps/studio. Single source of truth for locale configuration.

- [X] T001 Create @workspace/i18n-config package directory structure at packages/i18n-config/
- [X] T002 [P] Create package.json for @workspace/i18n-config at packages/i18n-config/package.json
- [X] T003 [P] Create tsconfig.json for @workspace/i18n-config at packages/i18n-config/tsconfig.json
- [X] T004 Create centralized locale configuration at packages/i18n-config/src/index.ts with LOCALES, DEFAULT_LOCALE, SANITY_LANGUAGES, and utility functions
- [X] T005 [P] Create README.md for @workspace/i18n-config at packages/i18n-config/README.md documenting API and usage
- [X] T006 Add @workspace/i18n-config dependency to apps/web/package.json
- [X] T007 Add @workspace/i18n-config dependency to apps/studio/package.json
- [X] T008 Run pnpm install to link workspace packages

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Migrate existing apps to use shared i18n configuration

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. This establishes the shared configuration foundation that all user stories depend on.

- [X] T009 Update apps/web/src/i18n/routing.ts to import LOCALES and DEFAULT_LOCALE from @workspace/i18n-config
- [X] T010 Update apps/studio/sanity.config.ts to import SANITY_LANGUAGES from @workspace/i18n-config for documentInternationalization plugin
- [X] T011 [P] Create language filter utilities at apps/studio/components/language-filter.ts with fetchDocumentsByLanguage function and types
- [X] T012 Run pnpm --filter web typecheck to verify web app compiles
- [X] T013 Run pnpm --filter studio type to verify studio compiles and regenerate types
- [X] T014 Run pnpm build to verify all packages build successfully

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View De-duplicated Document Lists (Priority: P1) 🎯 MVP

**Goal**: Show only default language (FR) versions in Sanity Studio document lists, eliminating duplicate entries for multi-language content

**Independent Test**: Navigate to any document list view (e.g., "Pages by Path", "Blogs", "FAQs") with multi-language documents and verify only default language versions appear, with no duplicates. Each content piece should appear exactly once.

**Acceptance Criteria**:
1. Document lists show only FR (default) versions
2. No duplicate "Innovative Explicit Core" or other multi-language entries
3. Mixed single/multi-language documents display correctly
4. Filtering consistent across all i18n-enabled document types (pages, blogs, FAQs)

### Implementation for User Story 1

- [ ] T015 [P] [US1] Import DEFAULT_LOCALE from @workspace/i18n-config in apps/studio/components/nested-pages-structure.ts
- [ ] T016 [US1] Modify fetchDocuments function signature in apps/studio/components/nested-pages-structure.ts to accept language parameter with DEFAULT_LOCALE default
- [ ] T017 [US1] Update GROQ query in fetchDocuments function at apps/studio/components/nested-pages-structure.ts:37 to filter by language field using parameterized query
- [ ] T018 [US1] Add legacy document fallback to GROQ filter in nested-pages-structure.ts for documents without language field: `(!defined(language) || language == $language)`
- [ ] T019 [US1] Update createSlugBasedStructure call to fetchDocuments at apps/studio/components/nested-pages-structure.ts:366 to pass DEFAULT_LOCALE parameter
- [ ] T020 [P] [US1] Import DEFAULT_LOCALE from @workspace/i18n-config in apps/studio/structure.ts
- [ ] T021 [US1] Update FAQ list in apps/studio/structure.ts:120 to use S.documentList() with language filter instead of createList
- [ ] T022 [US1] Add GROQ filter to FAQ documentList: `filter('_type == $type && (!defined(language) || language == $language)')` with params
- [ ] T023 [US1] Verify author and redirect document types are NOT filtered (not in i18n schemaTypes array)

**Checkpoint**: At this point, User Story 1 should be fully functional - document lists should show only default language versions

### Manual Testing for User Story 1

- [ ] T024 [US1] Start Studio with `pnpm --filter studio dev` and navigate to "Pages by Path" list
- [ ] T025 [US1] Verify only FR versions appear in pages list (no duplicate "Innovative Explicit Core")
- [ ] T026 [US1] Navigate to "Blogs" list and verify only FR versions appear
- [ ] T027 [US1] Navigate to "FAQs" list and verify only FR versions appear
- [ ] T028 [US1] Verify non-i18n types (Authors, Redirects) show all documents normally
- [ ] T029 [US1] Check browser DevTools Network tab to confirm GROQ queries include language filter parameter

---

## Phase 4: User Story 2 - Access All Language Versions from Document View (Priority: P1)

**Goal**: Maintain full translation workflow - users can view and switch between all language versions from within an opened document

**Independent Test**: Open any document with translations from a list view and verify the Translations badge/UI is visible in the toolbar. Click the badge to see available languages (FR, EN) and successfully switch between them. Verify translation creation, editing, and deletion workflows remain fully functional.

**Acceptance Criteria**:
1. Translations badge visible when document has multiple languages
2. Can see and select all available languages from badge dropdown
3. Can switch between languages successfully
4. Can create new translations using plugin's "Translate" action
5. Single-language documents show appropriate UI state

### Implementation for User Story 2

**Note**: This user story requires NO code changes. The document-internationalization plugin already handles all translation UI and workflow. Tasks are verification only.

### Manual Testing for User Story 2

- [ ] T030 [US2] Open a multi-language document (e.g., "Innovative Explicit Core" page) from filtered list
- [ ] T031 [US2] Verify Translations badge appears in document toolbar showing current language
- [ ] T032 [US2] Click Translations badge and verify dropdown shows all available languages (FR, EN)
- [ ] T033 [US2] Select EN from Translations dropdown and verify document switches to English version
- [ ] T034 [US2] Switch back to FR and verify document changes to French version
- [ ] T035 [US2] Open a single-language document and verify Translations UI indicates no translations exist
- [ ] T036 [US2] Use "Translate" document action to create a new EN translation for an FR-only document
- [ ] T037 [US2] Verify new translation created successfully and appears in Translations dropdown
- [ ] T038 [US2] Verify new EN translation does NOT appear in main document list (still filtered)
- [ ] T039 [US2] Delete a translation and verify plugin's delete workflow works correctly

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - lists are de-duplicated AND translations are fully accessible

---

## Phase 5: User Story 3 - Understand Translation Status at a Glance (Priority: P2)

**Goal**: Show visual indicators for orphaned translations (documents that exist only in non-default languages) to help editors identify content needing attention

**Independent Test**: Create a test scenario where a document exists only in EN (delete FR version). Navigate to document lists and verify orphaned EN document appears with a warning badge/indicator. Verify accessibility of warning indicators.

**Acceptance Criteria**:
1. Orphaned documents (EN without FR) visible in lists with warning indicator
2. Warning badge uses appropriate @sanity/ui components (tone="caution")
3. Subtitle shows "⚠️ Orphaned translation" text
4. Indicators are accessible (proper ARIA labels, role="alert")

### Implementation for User Story 3

- [ ] T040 [P] [US3] Create orphaned translation badge component at apps/studio/components/orphaned-translation-badge.tsx using @sanity/ui Badge
- [ ] T041 [P] [US3] Import WarningOutlineIcon from @sanity/icons in orphaned-translation-badge.tsx
- [ ] T042 [US3] Implement OrphanedBadge component with tone="caution", ARIA labels, and conditional rendering based on language
- [ ] T043 [P] [US3] Import DEFAULT_LOCALE from @workspace/i18n-config in apps/studio/schemaTypes/documents/page.ts
- [ ] T044 [P] [US3] Import OrphanedBadge component in apps/studio/schemaTypes/documents/page.ts
- [ ] T045 [US3] Add preview.prepare() to page schema in apps/studio/schemaTypes/documents/page.ts with language-based orphaned detection
- [ ] T046 [US3] Update preview subtitle in page.ts to show "⚠️ Orphaned translation" for non-default language documents
- [ ] T047 [US3] Add OrphanedBadge to preview media in page.ts for nested list display
- [ ] T048 [P] [US3] Import DEFAULT_LOCALE and OrphanedBadge in apps/studio/schemaTypes/documents/blog.ts
- [ ] T049 [US3] Add preview.prepare() with orphaned detection to blog schema in apps/studio/schemaTypes/documents/blog.ts
- [ ] T050 [P] [US3] Import DEFAULT_LOCALE and OrphanedBadge in apps/studio/schemaTypes/documents/faq.ts
- [ ] T051 [US3] Add preview.prepare() with orphaned detection to faq schema in apps/studio/schemaTypes/documents/faq.ts

**Checkpoint**: All user stories should now be independently functional - de-duplicated lists, full translation access, and orphaned document warnings

### Manual Testing for User Story 3

- [ ] T052 [US3] Create test orphaned document by deleting FR version of a page, leaving only EN
- [ ] T053 [US3] Navigate to pages list and verify orphaned EN document appears with "⚠️ Orphaned translation" in subtitle
- [ ] T054 [US3] Verify OrphanedBadge appears in nested list views (if applicable)
- [ ] T055 [US3] Test keyboard navigation to orphaned document warning for accessibility
- [ ] T056 [US3] Use screen reader to verify ARIA labels are announced correctly
- [ ] T057 [US3] Repeat orphaned document test for blogs and FAQs
- [ ] T058 [US3] Restore default language version and verify warning disappears

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, code quality, and documentation

- [ ] T059 [P] Run pnpm check-types across all workspaces to verify TypeScript compilation
- [ ] T060 [P] Run pnpm lint across all workspaces to verify code quality standards
- [ ] T061 [P] Run pnpm format to apply consistent code formatting
- [ ] T062 Remove any console.log statements added during development
- [ ] T063 [P] Run comprehensive manual testing checklist from specs/003-dedup-studio-records/quickstart.md (11 test scenarios)
- [ ] T064 Test Studio performance with 100+ documents to verify no degradation
- [ ] T065 Verify all 7 i18n-enabled document types behave correctly (page, blog, blogIndex, navbar, footer, settings, homePage, faq)
- [ ] T066 [P] Update CLAUDE.md or other agent context files if needed with new patterns
- [ ] T067 Code review for TypeScript strict mode compliance (no `any` types)
- [ ] T068 Final build test: `pnpm build` to ensure production build succeeds

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
  - Creates @workspace/i18n-config package structure
  
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
  - Migrates apps to use shared configuration
  - Creates language filter utilities
  
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - **US1 (P1)**: Can start after Foundational - No dependencies on other stories
  - **US2 (P1)**: Can start after Foundational - Independent of US1 (testing only, no code)
  - **US3 (P2)**: Can start after Foundational - Independent of US1/US2
  
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) ✅ Independent
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) ✅ Independent (no code changes)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) ✅ Independent

**All user stories are independently testable and deliverable**

### Within Each User Story

- US1: Imports → Function modification → GROQ query update → Structure updates → Testing
- US2: Testing only (no implementation tasks)
- US3: Badge component → Schema previews (can be done in parallel per document type) → Testing

### Parallel Opportunities

**Within Setup (Phase 1)**:
- T002 (package.json) and T003 (tsconfig.json) can run in parallel
- T005 (README) can run in parallel with T002/T003
- T006 and T007 (dependency additions) can run in parallel

**Within Foundational (Phase 2)**:
- T011 (language filter utils) can run in parallel with T009/T010 (config updates)

**Within User Story 1**:
- T015 (import in nested-pages) and T020 (import in structure.ts) can run in parallel
- T021-T023 (structure.ts updates) run sequentially after T020

**Within User Story 3**:
- T040-T042 (create badge component) runs first
- After badge is created, all schema updates can run in parallel:
  - T043-T047 (page.ts)
  - T048-T049 (blog.ts)
  - T050-T051 (faq.ts)

**Cross-Story Parallelization**:
- If team has capacity, US1, US2 (testing), and US3 can all be worked on in parallel after Phase 2
- Different developers can own different user stories

**Within Polish (Phase 6)**:
- T059 (type check), T060 (lint), T061 (format) can all run in parallel
- T063 (manual testing) and T066 (docs) can run in parallel

---

## Parallel Example: User Story 3

```bash
# After badge component is created (T040-T042), launch all schema updates in parallel:

Task: "Import DEFAULT_LOCALE and OrphanedBadge in apps/studio/schemaTypes/documents/page.ts"
Task: "Add preview.prepare() to page schema with orphaned detection"
Task: "Update preview subtitle in page.ts"

Task: "Import DEFAULT_LOCALE and OrphanedBadge in apps/studio/schemaTypes/documents/blog.ts"
Task: "Add preview.prepare() with orphaned detection to blog schema"

Task: "Import DEFAULT_LOCALE and OrphanedBadge in apps/studio/schemaTypes/documents/faq.ts"
Task: "Add preview.prepare() with orphaned detection to faq schema"

# All 6 tasks above work on different files and can execute simultaneously
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008) - Create shared config package
2. Complete Phase 2: Foundational (T009-T014) - CRITICAL foundation
3. Complete Phase 3: User Story 1 (T015-T029) - De-duplicated lists
4. **STOP and VALIDATE**: Test User Story 1 independently using T024-T029
5. Deploy/demo if ready - MVP delivered!

**Value**: Editors immediately see cleaner document lists with no duplicates

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready ✅
2. Add User Story 1 → Test independently → **Deploy/Demo (MVP!)**
   - Lists show only default language
   - No duplicates, cleaner UX
3. Add User Story 2 → Test independently → **Deploy/Demo**
   - Confirm translation workflow still works
   - No regressions
4. Add User Story 3 → Test independently → **Deploy/Demo**
   - Orphaned document warnings
   - Better content management visibility
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup (Phase 1) together
2. Team completes Foundational (Phase 2) together - CRITICAL
3. Once Foundational is done, split work:
   - **Developer A**: User Story 1 (T015-T029) - Core de-duplication
   - **Developer B**: User Story 2 (T030-T039) - Translation testing
   - **Developer C**: User Story 3 (T040-T058) - Orphaned warnings
4. Stories complete and integrate independently
5. Team runs Polish phase (Phase 6) together

---

## File Change Summary

### New Files Created

- `packages/i18n-config/package.json`
- `packages/i18n-config/tsconfig.json`
- `packages/i18n-config/src/index.ts`
- `packages/i18n-config/README.md`
- `apps/studio/components/language-filter.ts`
- `apps/studio/components/orphaned-translation-badge.tsx`

### Modified Files

- `apps/web/package.json` (add dependency)
- `apps/web/src/i18n/routing.ts` (import from shared config)
- `apps/studio/package.json` (add dependency)
- `apps/studio/sanity.config.ts` (import from shared config)
- `apps/studio/components/nested-pages-structure.ts` (add language filtering)
- `apps/studio/structure.ts` (apply filters to FAQ and other types)
- `apps/studio/schemaTypes/documents/page.ts` (add orphaned preview)
- `apps/studio/schemaTypes/documents/blog.ts` (add orphaned preview)
- `apps/studio/schemaTypes/documents/faq.ts` (add orphaned preview)

### Read-Only References

- `apps/studio/schemaTypes/common.ts` (reference existing language field)
- `apps/studio/sanity.config.ts` (read plugin configuration)

---

## Task Count Summary

- **Setup (Phase 1)**: 8 tasks
- **Foundational (Phase 2)**: 6 tasks
- **User Story 1 (Phase 3)**: 15 tasks (9 implementation + 6 manual testing)
- **User Story 2 (Phase 4)**: 10 tasks (all manual testing)
- **User Story 3 (Phase 5)**: 19 tasks (12 implementation + 7 manual testing)
- **Polish (Phase 6)**: 10 tasks
- **TOTAL**: 68 tasks

**Parallelizable tasks**: 18 tasks marked with [P]

**Independent test scenarios**: Each user story has clear acceptance criteria and can be tested independently

**Suggested MVP scope**: Phases 1-3 (User Story 1 only) = 29 tasks

---

## Notes

- **[P] tasks** = Different files, no dependencies - can run in parallel
- **[Story] label** maps task to specific user story for traceability
- **Each user story is independently completable and testable**
- **Manual testing only** (no automated test suite per plan.md)
- **No breaking changes** - can be rolled back by removing filters
- **TypeScript strict mode** enforced - no `any` types permitted
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All file paths are absolute from repository root
