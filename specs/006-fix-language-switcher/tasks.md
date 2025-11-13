# Tasks: Fix Language Switcher Translation Navigation

**Input**: Design documents from `/specs/006-fix-language-switcher/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/locale-context-api.ts, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Tests**: Tests are MANDATORY per project constitution (Principle III: 80%+ coverage required)

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a TurboRepo monorepo with workspaces:
- **Web app**: `apps/web/src/`
- **Sanity Studio**: `apps/studio/`
- **Shared packages**: `packages/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create contexts directory at apps/web/src/contexts/
- [X] T002 [P] Review and understand design documents (plan.md, spec.md, research.md, data-model.md, contracts/)
- [X] T003 [P] Review conciliainc.com reference implementation for pattern understanding

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### next-intl Configuration

- [X] T004 Configure next-intl pathnames for localized routes in apps/web/src/i18n/routing.ts

### Sanity Query Infrastructure

- [X] T005 Create queryAllLocalizedPages GROQ query in apps/web/src/lib/sanity/query.ts

### Locale Mapping Utility

- [X] T006 Create locale-mapper.ts utility file at apps/web/src/lib/sanity/locale-mapper.ts
- [X] T007 Implement getPathnamePattern() helper function in locale-mapper.ts
- [X] T008 Implement getLocalizedPathname() helper function in locale-mapper.ts
- [X] T009 Implement createLocaleMapping() function with bidirectional mapping in locale-mapper.ts
- [X] T010 Add comprehensive JSDoc comments to all locale-mapper functions

### React Context Infrastructure

- [X] T011 Create slug-translation-context.tsx at apps/web/src/contexts/slug-translation-context.tsx
- [X] T012 Implement SlugTranslationProvider client component in slug-translation-context.tsx
- [X] T013 Implement useSlugTranslation() custom hook with error handling in slug-translation-context.tsx
- [X] T014 Export public API (SlugTranslationProvider, useSlugTranslation) from slug-translation-context.tsx

### Root Layout Integration

- [X] T015 Create fetchAllLocalizedPages() function in apps/web/src/app/[locale]/layout.tsx
- [X] T016 Update root layout to fetch localized pages at startup in apps/web/src/app/[locale]/layout.tsx
- [X] T017 Update root layout to create locale mapping in apps/web/src/app/[locale]/layout.tsx
- [X] T018 Wrap children in SlugTranslationProvider in apps/web/src/app/[locale]/layout.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Navigate to Translated Version of Current Page (Priority: P1) 🎯 MVP

**Goal**: Users can switch languages and navigate to the correct translated slug (e.g., `/fr/blogue/abc` → `/en/blog/xyz`)

**Independent Test**: Create a document with translations in multiple languages, navigate to one language version, click language switcher, verify navigation to correct translated slug with content in target language

### Unit Tests for User Story 1 ✅

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T019 [P] [US1] Create test file for locale-mapper at apps/web/src/__tests__/unit/locale-mapper.test.ts
- [ ] T020 [P] [US1] Write test: createLocaleMapping creates bidirectional mapping in locale-mapper.test.ts
- [ ] T021 [P] [US1] Write test: handles documents with only one language in locale-mapper.test.ts
- [ ] T022 [P] [US1] Write test: generates correct pathnames for homepage in locale-mapper.test.ts
- [ ] T023 [P] [US1] Write test: generates correct pathnames for blog posts in locale-mapper.test.ts
- [ ] T024 [P] [US1] Write test: generates correct pathnames for pages in locale-mapper.test.ts
- [ ] T025 [P] [US1] Write test: handles French locale prefix correctly in locale-mapper.test.ts
- [ ] T026 [P] [US1] Write test: returns empty mapping for empty input in locale-mapper.test.ts
- [ ] T027 [P] [US1] Create test file for locale-context at apps/web/src/__tests__/unit/locale-context.test.tsx
- [ ] T028 [P] [US1] Write test: useLocale returns context value when inside provider in locale-context.test.tsx
- [ ] T029 [P] [US1] Write test: useLocale throws error when outside provider in locale-context.test.tsx
- [ ] T030 [P] [US1] Write test: getTranslations returns correct translations for valid pathname in locale-context.test.tsx
- [ ] T031 [P] [US1] Write test: getTranslations returns undefined for invalid pathname in locale-context.test.tsx
- [ ] T032 [P] [US1] Write test: context value is memoized in locale-context.test.tsx

### Implementation for User Story 1

- [X] T033 [US1] Import required dependencies (getPathnamePattern, useSlugTranslation, Link, usePathname) in apps/web/src/components/language-switcher.tsx
- [X] T034 [US1] Get current pathname and translations using useSlugTranslation hook in apps/web/src/components/language-switcher.tsx
- [X] T035 [US1] Update language switcher to handle missing translations gracefully in apps/web/src/components/language-switcher.tsx
- [X] T036 [US1] Update language switcher to map through locales and render Link components with translated slugs in apps/web/src/components/language-switcher.tsx
- [X] T037 [US1] Configure Link components with pathname patterns, params, and locale props in apps/web/src/components/language-switcher.tsx
- [X] T038 [US1] Handle missing translations with disabled state and "(unavailable)" label in apps/web/src/components/language-switcher.tsx
- [X] T039 [US1] Style active/current language appropriately in apps/web/src/components/language-switcher.tsx
- [X] T040 [US1] Add analytics tracking on language switch click in apps/web/src/components/language-switcher.tsx

### Verification for User Story 1

- [ ] T041 [US1] Run unit tests and verify 100% pass rate: pnpm --filter web test
- [X] T042 [US1] Manual test: Navigate from English blog post to French blog post
- [X] T043 [US1] Manual test: Verify round-trip consistency (FR → EN → FR returns to original slug)
- [X] T044 [US1] Manual test: Test homepage translation switching
- [X] T045 [US1] Manual test: Test regular page translation switching

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Handle Missing Translations Gracefully (Priority: P2)

**Goal**: When a user switches to a language without a translation, the system provides clear feedback (404 page)

**Independent Test**: Create a document in only one language, attempt to switch to a language without translation, verify appropriate error handling (404 page with message)

### Integration Tests for User Story 2 ✅

- [ ] T046 [P] [US2] Create test file for language-switcher at apps/web/src/__tests__/integration/language-switcher.test.tsx
- [ ] T047 [P] [US2] Write test: renders language options correctly in language-switcher.test.tsx
- [ ] T048 [P] [US2] Write test: handles missing translations gracefully in language-switcher.test.tsx
- [ ] T049 [P] [US2] Write test: disables current language option in language-switcher.test.tsx
- [ ] T050 [P] [US2] Write test: shows unavailable state for missing translations in language-switcher.test.tsx
- [ ] T051 [P] [US2] Write test: navigates to correct translated slug on click in language-switcher.test.tsx

### Implementation for User Story 2

- [X] T052 [US2] Add null check for translations in language switcher in apps/web/src/components/language-switcher.tsx
- [X] T053 [US2] Add conditional rendering for missing translation options in apps/web/src/components/language-switcher.tsx
- [X] T054 [US2] Add "(unavailable)" label for language options without translations in apps/web/src/components/language-switcher.tsx
- [X] T055 [US2] Add disabled state for language options without translations in apps/web/src/components/language-switcher.tsx
- [X] T056 [US2] Ensure navigation occurs even for missing translations (404 handling) in apps/web/src/components/language-switcher.tsx

### Verification for User Story 2

- [ ] T057 [US2] Run integration tests and verify 100% pass rate: pnpm --filter web test
- [X] T058 [US2] Manual test: Create English-only document and attempt French switch
- [X] T059 [US2] Manual test: Verify 404 page displays with appropriate message
- [X] T060 [US2] Manual test: Verify unavailable language options are clearly marked

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Performance: Fast Language Switching (Priority: P3)

**Goal**: Language switching responds within 200ms without network delays

**Independent Test**: Measure time from clicking language switcher to seeing content in target language, verify sub-200ms navigation

### E2E Tests for User Story 3 ✅

- [ ] T061 [P] [US3] Create E2E test file at apps/web/src/__tests__/e2e/language-switching.spec.ts
- [ ] T062 [P] [US3] Write test: successful translation navigation (EN → FR) in language-switching.spec.ts
- [ ] T063 [P] [US3] Write test: round-trip navigation consistency (FR → EN → FR) in language-switching.spec.ts
- [ ] T064 [P] [US3] Write test: missing translation shows 404 page in language-switching.spec.ts
- [ ] T065 [P] [US3] Write test: homepage translation switching in language-switching.spec.ts
- [ ] T066 [P] [US3] Write test: analytics tracking on language switch in language-switching.spec.ts
- [ ] T067 [P] [US3] Write test: language switch completes within 200ms performance budget in language-switching.spec.ts

### Performance Verification for User Story 3

- [ ] T068 [US3] Run E2E tests and verify 100% pass rate: pnpm --filter web test:e2e
- [ ] T069 [US3] Measure initial page load time increase (must be <150ms)
- [ ] T070 [US3] Measure locale mapping creation time (must be <5ms)
- [ ] T071 [US3] Measure language switch time from click to render (must be <200ms)
- [ ] T072 [US3] Check memory usage for locale mapping (must be <500KB)
- [ ] T073 [US3] Verify no additional network requests during language switching

**Checkpoint**: All user stories should now be independently functional with performance validated

---

## Phase 6: Sanity Studio Updates (Cross-Cutting Concern)

**Purpose**: Update Sanity Studio slug validation and URL preview for new slug format and localized pathnames

### Slug Validation Updates

- [X] T074 [P] Update blog slug validation config in apps/studio/utils/slug-validation.ts (lines 99-118)
- [X] T075 [P] Remove requiredPrefix for blog posts in slug-validation.ts
- [X] T076 [P] Set requireSlash to true for blog posts in slug-validation.ts
- [X] T077 [P] Set segmentCount to 1 for flat structure in slug-validation.ts
- [X] T078 [P] Add forbidden pattern /^\/blog\// to block legacy format in slug-validation.ts
- [X] T079 [P] Add custom validator for leading slash requirement in slug-validation.ts
- [X] T080 [P] Add custom validator for flat structure enforcement in slug-validation.ts
- [X] T081 Update slug generation for blog posts to return `/${cleanTitle}` in slug-validation.ts (lines 536-537)

### URL Preview Updates

- [X] T082 [P] Import LOCALE_METADATA in apps/studio/components/slug-field-component.tsx
- [X] T083 [P] Add getPathnameForDocType() helper function in slug-field-component.tsx
- [X] T084 [P] Add getLocalizedPathPrefix() helper function in slug-field-component.tsx
- [X] T085 Update localizedPathname useMemo to use locale-aware URL construction in slug-field-component.tsx (lines 213-226)

### Studio Verification

- [ ] T086 Build Sanity Studio: pnpm --filter studio build
- [ ] T087 Manual test: Create new blog post and verify slug generated with leading slash
- [ ] T088 Manual test: Try to save blog post with /blog/ prefix and verify validation fails
- [ ] T089 Manual test: Try to save blog post without leading slash and verify validation fails
- [ ] T090 Manual test: Try to save nested slug /category/post and verify validation fails
- [ ] T091 Manual test: Verify English blog post shows /en/blog/slug in URL preview
- [ ] T092 Manual test: Verify French blog post shows /fr/blogue/slug in URL preview
- [ ] T093 Manual test: Change document language and verify URL preview updates

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, documentation, and quality assurance

- [X] T094 [P] Add JSDoc comments to all public functions in apps/web/src/lib/sanity/locale-mapper.ts
- [X] T095 [P] Add JSDoc comments to LocaleProvider and useLocale in apps/web/src/contexts/locale-context.tsx
- [ ] T096 [P] Add inline comments for complex logic in language-switcher.tsx
- [X] T097 [P] Update component usage examples in locale-context.tsx
- [X] T098 Run type checking across monorepo: pnpm check-types
- [X] T099 Run linting across monorepo: pnpm lint
- [X] T100 Run formatting across monorepo: pnpm format
- [X] T101 Run full build across monorepo: pnpm build
- [ ] T105 Manual test: Complete quickstart.md verification checklist
- [ ] T106 Check browser console for errors during language switching
- [X] T107 Remove any debug or development console.logs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Sanity Studio Updates (Phase 6)**: Can proceed in parallel with User Stories (different workspace)
- **Polish (Phase 7)**: Depends on all user stories and Studio updates being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Performance validation of US1 and US2

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Utility functions before React components
- Component updates before verification
- Unit tests before integration tests before E2E tests
- Story complete before moving to next priority

### Within Sanity Studio Updates

- Validation rules before generation logic
- Helper functions before component updates
- Build before manual testing

### Parallel Opportunities

- **Phase 1**: T001 and T002/T003 can run in parallel
- **Phase 2 - Queries & Utils**: T005, T006-T010 can run in parallel (different files)
- **Phase 2 - Context**: T011-T014 can run in parallel with T004 (different files)
- **User Story 1 - Tests**: T019-T032 can all run in parallel (test writing)
- **User Story 2 - Tests**: T046-T051 can all run in parallel (test writing)
- **User Story 3 - Tests**: T061-T067 can all run in parallel (test writing)
- **Phase 6 - Validation**: T074-T081 can all run in parallel (same file but can be written together)
- **Phase 6 - Preview**: T082-T084 can all run in parallel (different functions)
- **Phase 7 - Documentation**: T094-T097 can all run in parallel (different files)
- **Phase 7 - Quality Checks**: T098-T101 should run sequentially
- **Phase 7 - Manual Tests**: T106-T112 can run in parallel (different test scenarios)

---

## Parallel Example: User Story 1 Tests

```bash
# Launch all unit tests for User Story 1 together:
Task: "Write test: createLocaleMapping creates bidirectional mapping"
Task: "Write test: handles documents with only one language"
Task: "Write test: generates correct pathnames for homepage"
Task: "Write test: generates correct pathnames for blog posts"
Task: "Write test: generates correct pathnames for pages"
Task: "Write test: handles French locale prefix correctly"
Task: "Write test: returns empty mapping for empty input"

# All tests are in different describe blocks or test files, no conflicts
```

---

## Parallel Example: Foundational Phase

```bash
# After T004 (pathnames config) completes, these can run in parallel:
Task: "Create queryAllLocalizedPages GROQ query" (query.ts)
Task: "Create locale-mapper.ts utility file" (locale-mapper.ts)
Task: "Create slug-translation-context.tsx" (slug-translation-context.tsx)

# Different files, no dependencies between them
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T018) - CRITICAL
3. Complete Phase 3: User Story 1 (T019-T045)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - core value delivered

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T018)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) (T019-T045)
3. Add User Story 2 → Test independently → Deploy/Demo (T046-T060)
4. Add User Story 3 → Test independently → Deploy/Demo (T061-T073)
5. Add Sanity Studio updates → Deploy (T074-T093)
6. Polish and final QA → Production ready (T094-T112)

Each phase adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Foundation Phase** (Everyone): T001-T018 completed together
2. **Parallel User Stories** (Once foundation done):
   - Developer A: User Story 1 (T019-T045)
   - Developer B: User Story 2 (T046-T060)
   - Developer C: User Story 3 (T061-T073)
   - Developer D: Sanity Studio Updates (T074-T093)
3. **Integration**: Stories complete and integrate independently
4. **Polish** (Everyone): T094-T112 final QA

---

## Success Criteria Checklist

Per spec.md success criteria:

- [ ] SC-001: Users navigate from any language to translated equivalent in <1 second
- [ ] SC-002: Round-trip switching returns to exact same URL 100% of the time
- [ ] SC-003: Language switching has 0% error rate for existing translations
- [ ] SC-004: Initial app load time increases by <150ms
- [ ] SC-005: 95%+ language switch completion rate (tracked via analytics)
- [ ] SC-006: System handles 100% of internationalized document types
- [ ] SC-007: Analytics events tracked with 100% accuracy

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests written FIRST, must FAIL before implementation (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All paths are absolute from repository root
- Follow kebab-case file naming convention
- No `type any` usage - use specific types or `unknown`
- Import types with `import type` syntax
- Use arrow functions over function expressions

---

## Performance Benchmarks

| Metric | Target | Verification Task |
|--------|--------|-------------------|
| Sanity query time | <100ms | T069 |
| Mapping creation time | <5ms | T070 |
| Language switch time | <200ms | T071 |
| Memory usage (mapping) | <500KB | T072 |
| Initial load impact | <150ms | T069, T108 |
| No network calls during switch | 0 requests | T073 |

---

## Rollback Plan

If issues discovered in production:

1. **Immediate**: Revert the PR (git revert)
2. **Deploy**: Trigger production deployment of reverted code
3. **Verify**: Confirm old behavior is restored
4. **Debug**: Fix issues in development environment
5. **Re-deploy**: After fixes verified, re-deploy feature

---

## Total Task Count: 112 tasks

- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 15 tasks (BLOCKS all user stories)
- **Phase 3 (User Story 1 - P1)**: 27 tasks (13 tests + 8 implementation + 6 verification)
- **Phase 4 (User Story 2 - P2)**: 15 tasks (6 tests + 5 implementation + 4 verification)
- **Phase 5 (User Story 3 - P3)**: 13 tasks (7 tests + 6 verification)
- **Phase 6 (Sanity Studio)**: 20 tasks (12 implementation + 8 verification)
- **Phase 7 (Polish)**: 19 tasks

**Parallel Opportunities**: 40+ tasks marked [P] can run in parallel within their phase

**MVP Scope**: Phases 1-3 (T001-T045) = 45 tasks for core functionality

**Independent Test Criteria**:
- User Story 1: Create translated documents, switch languages, verify correct navigation
- User Story 2: Create untranslated document, switch languages, verify 404 handling
- User Story 3: Measure performance metrics, verify <200ms switching time
