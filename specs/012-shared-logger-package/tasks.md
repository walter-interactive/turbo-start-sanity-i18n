# Tasks: Shared Logger Package

**Input**: Design documents from `/specs/012-shared-logger-package/`
**Prerequisites**: plan.md (✅), spec.md (✅), research.md (✅), data-model.md (✅), contracts/ (✅)

**Tests**: Not included per Complexity Tracking justification - no testing framework configured

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Monorepo workspace package at `packages/logger/`
- Application updates at `apps/template-web/`
- Future application integration at `apps/template-studio/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the new workspace package structure

- [X] T001 Create package directory structure at packages/logger/src/
- [X] T002 Create package.json for @workspace/logger at packages/logger/package.json
- [X] T003 [P] Create tsconfig.json for logger package at packages/logger/tsconfig.json
- [X] T004 [P] Create README.md for logger package at packages/logger/README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logger implementation with environment safety

**⚠️ CRITICAL**: This phase MUST be complete before any user story can integrate the logger

- [X] T005 Copy logger implementation to packages/logger/src/index.ts from apps/template-web/src/lib/logger.ts
- [X] T006 Add defensive typeof process checks to isDevelopment() in packages/logger/src/index.ts
- [X] T007 Add defensive typeof process checks to getEnvironment() in packages/logger/src/index.ts
- [X] T008 Update JSDoc import examples from @/lib/logger to @workspace/logger in packages/logger/src/index.ts
- [X] T009 Run pnpm install from repository root to register new workspace package
- [X] T010 Verify type checking passes for logger package: pnpm --filter @workspace/logger check-types

**Checkpoint**: Logger package is ready for consumption - user story implementation can now begin

---

## Phase 3: User Story 1 - Shared Logging Across Applications (Priority: P1) 🎯 MVP

**Goal**: Enable template-web to use the shared logger package with identical functionality

**Independent Test**: Build and run template-web successfully with @workspace/logger, verify all existing logger calls work with identical output format in both development and production environments

### Implementation for User Story 1

- [X] T011 [US1] Add @workspace/logger dependency to apps/template-web/package.json
- [X] T012 [US1] Run pnpm install from repository root to install logger dependency
- [X] T013 [US1] Update logger import in apps/template-web/src/i18n/routing.ts from '@/lib/logger' to '@workspace/logger'
- [X] T014 [US1] Verify no other files import @/lib/logger: rg "from ['\"]@/lib/logger['\"]" apps/template-web/src/
- [X] T015 [US1] Delete old logger file at apps/template-web/src/lib/logger.ts
- [X] T016 [US1] Remove lib/ directory if empty: rmdir apps/template-web/src/lib/
- [X] T017 [US1] Run type checking for template-web: pnpm --filter template-web check-types
- [X] T018 [US1] Run build for template-web: pnpm --filter template-web build
- [X] T019 [US1] Verify linting passes: pnpm --filter template-web lint

**Checkpoint**: template-web successfully uses @workspace/logger with identical behavior to original implementation

---

## Phase 4: User Story 2 - Backward Compatibility for Template-Web (Priority: P2)

**Goal**: Verify existing template-web functionality continues to work without changes beyond import path

**Independent Test**: Start template-web dev server, trigger logger calls (locale switching, errors), verify logs appear correctly in console

### Implementation for User Story 2

- [X] T020 [US2] Start template-web dev server: pnpm --filter template-web dev
- [X] T021 [US2] Verify info logs appear in development console with human-readable format
- [X] T022 [US2] Verify warn logs appear in development console with human-readable format
- [X] T023 [US2] Verify debug logs appear only in development environment
- [X] T024 [US2] Set NODE_ENV=production and verify logs output as JSON
- [X] T025 [US2] Verify extractErrorInfo helper works identically to original implementation
- [X] T026 [US2] Stop dev server and verify no errors during startup or runtime

**Checkpoint**: All existing logger functionality in template-web works identically with zero breaking changes

---

## Phase 5: User Story 3 - Future Application Integration (Priority: P3)

**Goal**: Demonstrate that new applications can easily add and use the shared logger

**Independent Test**: Add logger to template-studio, import and call logger methods, verify environment-aware output

### Implementation for User Story 3

- [X] T027 [US3] Add @workspace/logger dependency to apps/template-studio/package.json
- [X] T028 [US3] Run pnpm install from repository root to install logger for template-studio
- [X] T029 [US3] Add logger import to apps/template-studio/sanity.config.ts: import { logger } from '@workspace/logger'
- [X] T030 [US3] Add logger.info call to studio config initialization: logger.info('Sanity Studio initialized')
- [X] T031 [US3] Run type checking for template-studio: pnpm --filter template-studio check-types
- [X] T032 [US3] Start template-studio dev server and verify logger output appears in console
- [X] T033 [US3] Verify environment detection works correctly in Sanity Studio context

**Checkpoint**: template-studio successfully uses @workspace/logger with zero configuration beyond adding dependency

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation

- [ ] T034 [P] Verify all applications can import logger successfully
- [ ] T035 [P] Run monorepo-wide type checking: pnpm check-types
- [ ] T036 [P] Run monorepo-wide linting: pnpm lint
- [ ] T037 [P] Verify logger package has zero external runtime dependencies
- [ ] T038 Verify bundle size is under 2KB gzipped (check build output)
- [ ] T039 [P] Update CLAUDE.md with logger package documentation reference
- [ ] T040 Create git commit with all changes following commit message guidelines

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed sequentially in priority order (P1 → P2 → P3)
  - US2 and US3 depend on US1 completion (need template-web migration first)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 completion - Tests the migrated logger in template-web
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent, but recommended after US1 for validation pattern

### Within Each User Story

**User Story 1 (Migration)**:
1. Add dependency and install (T011-T012)
2. Update import path (T013)
3. Verify no old imports (T014)
4. Delete old file (T015-T016)
5. Verify build and type checking (T017-T019)

**User Story 2 (Backward Compatibility)**:
1. Start dev server (T020)
2. Manual testing of all log levels (T021-T023)
3. Production environment testing (T024-T025)
4. Cleanup (T026)

**User Story 3 (Future Integration)**:
1. Add dependency and install (T027-T028)
2. Add import and usage (T029-T030)
3. Verify build and runtime (T031-T033)

### Parallel Opportunities

- **Setup (Phase 1)**: T003 [P] and T004 [P] can run in parallel with T002
- **Polish (Phase 6)**: T034 [P], T035 [P], T036 [P], T037 [P], T039 [P] can all run in parallel

**Note**: User stories must run sequentially (US1 → US2 → US3) as US2 validates US1's migration and US3 demonstrates the reusability enabled by US1

---

## Parallel Example: Setup Phase

```bash
# After T001 and T002 complete, launch these in parallel:
Task: "Create tsconfig.json for logger package at packages/logger/tsconfig.json"
Task: "Create README.md for logger package at packages/logger/README.md"
```

## Parallel Example: Polish Phase

```bash
# After all user stories complete, launch these verification tasks in parallel:
Task: "Verify all applications can import logger successfully"
Task: "Run monorepo-wide type checking: pnpm check-types"
Task: "Run monorepo-wide linting: pnpm lint"
Task: "Verify logger package has zero external runtime dependencies"
Task: "Update CLAUDE.md with logger package documentation reference"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test template-web with @workspace/logger
5. Verify type checking, build, and runtime behavior
6. If successful, continue to US2 for validation

### Incremental Delivery

1. Complete Setup + Foundational → Logger package ready
2. Add User Story 1 → Test template-web migration → Validate ✅
3. Add User Story 2 → Test backward compatibility → Validate ✅
4. Add User Story 3 → Test new application integration → Validate ✅
5. Polish → Final verification and documentation

### Recommended Approach

Complete sequentially by user story:
1. US1 migrates template-web to use shared package
2. US2 validates that migration didn't break anything
3. US3 proves the package is reusable for future apps

Each story builds confidence before proceeding to next priority.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently validatable
- Commit after each phase or user story completion
- Stop at any checkpoint to validate story independently
- Environment safety checks (typeof process) are CRITICAL for browser compatibility
- Zero external dependencies requirement must be maintained (SC-006)
- Import path changes are the ONLY breaking change - no API changes
