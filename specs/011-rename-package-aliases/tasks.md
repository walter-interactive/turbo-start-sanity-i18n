# Implementation Tasks: Rename Package Aliases from @walter to @workspace

**Feature**: 011-rename-package-aliases
**Branch**: `011-rename-package-aliases`
**Date**: 2025-11-15

---

## Overview

This feature renames package aliases from `@walter/*` to `@workspace/*` for consistency across the monorepo. The rename is **atomic** - all changes must be made together in a single commit to maintain consistency.

**Key Constraint**: All three user stories (US1, US2, US3) are **interdependent** and must be completed together. The transformation affects:
- 2 Package Identifiers (package.json "name" fields)
- 5+ Package Dependency References (package.json dependencies)
- 4+ TypeScript Path Mappings (tsconfig.json paths)
- 52+ Import Statements (source code imports)

**Validation**: Contract-based testing via grep patterns, type checking, and build processes

---

## Implementation Strategy

**MVP Scope**: Complete atomic transformation (all user stories together)

This feature cannot be delivered incrementally - all changes must be applied atomically to avoid breaking the monorepo. The phases below represent preparation → transformation → validation → polish, not incremental feature delivery.

---

## Phase 1: Setup & Preparation

**Goal**: Prepare environment for atomic rename transformation

### Tasks

- [x] T001 Verify working on correct feature branch `011-rename-package-aliases`
  - Command: `git branch --show-current`
  - Expected: `011-rename-package-aliases`

- [ ] T002 Verify clean working tree (no uncommitted changes)
  - Command: `git status`
  - Expected: "nothing to commit, working tree clean"

- [ ] T003 Backup current pnpm-lock.yaml for rollback safety
  - Command: `cp pnpm-lock.yaml pnpm-lock.yaml.backup`
  - File: `/Users/walter-mac/walter-interactive/turbo-start-sanity-i18n/pnpm-lock.yaml`

- [ ] T004 Identify all files requiring updates via grep
  - Run validation queries from data-model.md to confirm scope:
    - Package identifiers: `grep -r '"name":.*@walter/sanity' --include="package.json"`
    - Dependencies: `grep -r '"@walter/sanity-atoms"\|"@walter/sanity-blocks"' --include="package.json"`
    - Path mappings: `grep -r '@walter/sanity-atoms\|@walter/sanity-blocks' --include="tsconfig.json"`
    - Import statements: `grep -rn '@walter/sanity-atoms\|@walter/sanity-blocks' --include="*.ts" --include="*.tsx" --exclude-dir=node_modules`
  - Expected: ~2 package names, ~5 dependencies, ~4 path mappings, ~52 import statements

---

## Phase 2: Atomic Transformation (US1 + US2 + US3)

**Goal**: Perform atomic rename of all package aliases from @walter to @workspace

**Story Coverage**: This phase satisfies all three user stories simultaneously:
- **[US1]** Developer Imports Sanity Schemas
- **[US2]** Package Dependencies Reference Correct Aliases
- **[US3]** TypeScript Path Mappings Align with New Aliases

**Independent Test Criteria**:
- Type checking passes (`pnpm check-types`) - validates US1 and US3
- Build succeeds (`pnpm build`) - validates US1
- Dependencies install (`pnpm install`) - validates US2
- Dependency tree shows new packages (`pnpm list`) - validates US2
- IDE autocomplete works with new aliases - validates US3

### Tasks

#### 2.1 Update Package Identifiers (Entity 1)

- [ ] T005 [US1][US2][US3] Update sanity-atoms package name in packages/sanity-atoms/package.json
  - File: `packages/sanity-atoms/package.json`
  - Change: `"name": "@walter/sanity-atoms"` → `"name": "@workspace/sanity-atoms"`
  - Line: ~2 (package.json "name" field)

- [ ] T006 [US1][US2][US3] Update sanity-blocks package name in packages/sanity-blocks/package.json
  - File: `packages/sanity-blocks/package.json`
  - Change: `"name": "@walter/sanity-blocks"` → `"name": "@workspace/sanity-blocks"`
  - Line: ~2 (package.json "name" field)

#### 2.2 Update Package Dependency References (Entity 2)

- [ ] T007 [US2] Update sanity-blocks dependency on sanity-atoms in packages/sanity-blocks/package.json
  - File: `packages/sanity-blocks/package.json`
  - Change: `"@walter/sanity-atoms": "workspace:*"` → `"@workspace/sanity-atoms": "workspace:*"`
  - Section: `dependencies`

- [ ] T008 [US2] Update template-studio dependencies in apps/template-studio/package.json
  - File: `apps/template-studio/package.json`
  - Change: Both `@walter/sanity-atoms` and `@walter/sanity-blocks` → `@workspace/*` versions
  - Section: `dependencies` or `devDependencies`

- [ ] T009 [US2] Update template-web dependencies in apps/template-web/package.json
  - File: `apps/template-web/package.json`
  - Change: Both `@walter/sanity-atoms` and `@walter/sanity-blocks` → `@workspace/*` versions
  - Section: `dependencies` or `devDependencies`

#### 2.3 Update TypeScript Path Mappings (Entity 3)

- [ ] T010 [US3] Update root tsconfig.json path mappings in tsconfig.json
  - File: `tsconfig.json` (root)
  - Change: Update all 4 path mappings in `compilerOptions.paths`:
    - `@walter/sanity-atoms/schemas/*` → `@workspace/sanity-atoms/schemas/*`
    - `@walter/sanity-atoms/fragments/*` → `@workspace/sanity-atoms/fragments/*`
    - `@walter/sanity-blocks/schemas/*` → `@workspace/sanity-blocks/schemas/*`
    - `@walter/sanity-blocks/fragments/*` → `@workspace/sanity-blocks/fragments/*`

- [ ] T011 [US3] Check and update workspace-specific tsconfig.json files (if any have custom overrides)
  - Files: Check `apps/template-studio/tsconfig.json`, `apps/template-web/tsconfig.json`, `packages/sanity-atoms/tsconfig.json`, `packages/sanity-blocks/tsconfig.json`
  - Method: Grep for `@walter/sanity-` in each file, update if found
  - Expected: Most likely no custom overrides (root config should be sufficient)

#### 2.4 Update Import Statements (Entity 4)

- [ ] T012 [US1] Bulk find-replace import statements in all TypeScript files
  - **Option A (VS Code)**:
    1. Press `Cmd+Shift+F` (Mac) or `Ctrl+Shift+H` (Windows/Linux)
    2. Search: `@walter/sanity-atoms`, Replace: `@workspace/sanity-atoms`, click "Replace All"
    3. Search: `@walter/sanity-blocks`, Replace: `@workspace/sanity-blocks`, click "Replace All"
  - **Option B (sed command)**:
    ```bash
    # Replace @walter/sanity-atoms → @workspace/sanity-atoms
    find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
      -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" -not -path "*/.turbo/*" \
      -exec sed -i '' 's/@walter\/sanity-atoms/@workspace\/sanity-atoms/g' {} +

    # Replace @walter/sanity-blocks → @workspace/sanity-blocks
    find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
      -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" -not -path "*/.turbo/*" \
      -exec sed -i '' 's/@walter\/sanity-blocks/@workspace\/sanity-blocks/g' {} +
    ```
  - Scope: All .ts and .tsx files excluding node_modules, .next, dist, .turbo
  - Expected: ~52 files updated

---

## Phase 3: Validation & Contract Verification

**Goal**: Verify atomic transformation succeeded and all contracts are satisfied

**Contract Coverage**: This phase validates all contracts defined in contracts/README.md

### Tasks

#### 3.1 Reinstall Dependencies

- [ ] T013 [US2] Reinstall pnpm dependencies to regenerate lockfile and symlinks
  - Command: `pnpm install`
  - Expected: Success, no errors
  - Validates: pnpm workspace resolution contract

- [ ] T014 [US2] Verify new workspace symlinks exist
  - Command: `ls -la node_modules/@workspace/sanity-atoms && ls -la node_modules/@workspace/sanity-blocks`
  - Expected: Both symlinks present

- [ ] T015 [US2] Verify old workspace symlinks are removed
  - Command: `ls node_modules/@walter 2>&1 | grep "No such file or directory"`
  - Expected: Directory does not exist

- [ ] T016 [US2] Verify dependency tree shows new package names
  - Command: `pnpm list --depth=0 | grep @workspace/sanity`
  - Expected: Shows `@workspace/sanity-atoms` and `@workspace/sanity-blocks`

#### 3.2 Type Checking & Build Validation

- [ ] T017 [US1][US3] Run type checking across all workspaces
  - Command: `pnpm check-types`
  - Expected: Success with 0 TypeScript errors
  - Validates: All import statements resolve correctly, path mappings work
  - **Success Criteria**: SC-001 (zero TypeScript compilation errors)

- [ ] T018 [US1] Build all workspaces
  - Command: `pnpm build`
  - Expected: Success, all workspaces build without errors
  - **Success Criteria**: SC-002 (zero build failures)

#### 3.3 Contract Validation via Grep

- [ ] T019 [US1][US2][US3] Validate package identifiers contract
  - Command: `grep -r '"name":.*@walter/sanity' --include="package.json"`
  - Expected: 0 matches (exit code 1)
  - Contract: contracts/package-identifiers.contract.json

- [ ] T020 [US2] Validate package dependencies contract
  - Command: `grep -r '"@walter/sanity-atoms"\|"@walter/sanity-blocks"' --include="package.json"`
  - Expected: 0 matches
  - Contract: contracts/package-dependencies.contract.json

- [ ] T021 [US3] Validate TypeScript path mappings contract
  - Command: `grep -r '@walter/sanity-atoms\|@walter/sanity-blocks' --include="tsconfig.json"`
  - Expected: 0 matches
  - Contract: contracts/tsconfig-paths.contract.json

- [ ] T022 [US1] Validate import statements contract
  - Command: `grep -rn '@walter/sanity-atoms\|@walter/sanity-blocks' --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist`
  - Expected: 0 matches
  - **Success Criteria**: SC-004 (100% of import statements use new alias)
  - Contract: contracts/import-statements.contract.md

#### 3.4 Manual IDE Test

- [ ] T023 [US3] Test IDE autocomplete with new aliases
  - File: Any TypeScript file (e.g., `apps/template-studio/schemaTypes/index.ts`)
  - Action: Start typing `import { imageSchema } from '@workspace/`
  - Expected: IDE suggests `@workspace/sanity-atoms/schemas/...` with autocomplete
  - **Success Criteria**: SC-005 (IDE autocomplete works correctly)

---

## Phase 4: Documentation Updates & Polish

**Goal**: Update documentation to reflect new package names and finalize implementation

### Tasks

#### 4.1 Update Documentation Files

- [ ] T024 Search for documentation references to old aliases
  - Command: `grep -rn '@walter/sanity' --include="*.md" --exclude-dir=node_modules --exclude-dir=specs/011-rename-package-aliases`
  - Expected: List of markdown files requiring updates

- [ ] T025 Update CLAUDE.md references to use @workspace prefix
  - File: `CLAUDE.md`
  - Change: Replace all `@walter/sanity-atoms` and `@walter/sanity-blocks` with `@workspace/*` equivalents
  - **Success Criteria**: SC-006 (documentation updated)

- [ ] T026 Update packages/sanity-atoms/README.md (if exists)
  - File: `packages/sanity-atoms/README.md`
  - Change: Update import examples to use `@workspace/sanity-atoms`

- [ ] T027 Update packages/sanity-blocks/README.md (if exists)
  - File: `packages/sanity-blocks/README.md`
  - Change: Update import examples to use `@workspace/sanity-blocks`

- [ ] T028 Update previous spec files (009, 010) with code examples
  - Files: Check `specs/009-complete-schema-migration/**/*.md` and `specs/010-migrate-web-fragments/**/*.md`
  - Change: Update any code examples showing `@walter/*` imports to `@workspace/*`
  - Rationale: Prevents confusion when reviewing old documentation

#### 4.2 Final Validation

- [ ] T029 Run comprehensive validation script from contracts
  - File: Create `specs/011-rename-package-aliases/contracts/validation.sh` from contracts/README.md
  - Command: `chmod +x specs/011-rename-package-aliases/contracts/validation.sh && specs/011-rename-package-aliases/contracts/validation.sh`
  - Expected: All contracts pass

- [ ] T030 Verify no old aliases remain in codebase (excluding spec 011)
  - Command: `grep -r '@walter/sanity' --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" --exclude-dir=node_modules --exclude-dir=specs/011-rename-package-aliases`
  - Expected: 0 matches (except intentional historical references in old specs)

#### 4.3 Commit Changes

- [ ] T031 Review all changes before commit
  - Command: `git status && git diff`
  - Expected: Changes in package.json files, tsconfig.json files, TypeScript files, markdown files, pnpm-lock.yaml

- [ ] T032 Stage all changes
  - Command: `git add .`

- [ ] T033 Create atomic commit with descriptive message
  - Command:
    ```bash
    git commit -m "Rename package aliases from @walter to @workspace

    - Updated package names in packages/sanity-atoms and packages/sanity-blocks
    - Updated dependency declarations in template-studio and template-web
    - Updated TypeScript path mappings in root and workspace tsconfig.json
    - Updated all import statements from @walter/* to @workspace/*
    - Updated documentation references (CLAUDE.md, README files, spec files)
    - Regenerated pnpm-lock.yaml with new package names

    Validates:
    - Type checking passes (pnpm check-types)
    - Build succeeds (pnpm build)
    - All 52+ files with imports updated
    - Zero references to @walter/sanity-* remain in codebase"
    ```
  - Note: Follows project convention (no Claude branding per CLAUDE.md rules)

- [ ] T034 Verify commit and clean working tree
  - Command: `git status`
  - Expected: "nothing to commit, working tree clean"

- [ ] T035 Run final post-commit validation
  - Command: `pnpm check-types && pnpm build`
  - Expected: Success

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Atomic Transformation) ← MUST be executed atomically
    ↓
Phase 3 (Validation)
    ↓
Phase 4 (Documentation & Commit)
```

**Critical Constraint**: Phase 2 tasks (T005-T012) must ALL be completed before any validation in Phase 3. Partial completion will cause TypeScript and build failures.

### Task Dependencies (Within Phases)

**Phase 1**: All tasks can run in parallel except T004 depends on T001-T003
**Phase 2**: All tasks interdependent - must complete all before validation
- T005-T006 (Package Identifiers) → no dependencies
- T007-T009 (Dependencies) → depends on T005-T006 (package names must exist)
- T010-T011 (Path Mappings) → depends on T005-T006 (aliases must match package names)
- T012 (Import Statements) → depends on T010-T011 (path mappings must resolve)

**Phase 3**: Sequential validation
- T013-T016 (Dependency validation) → depends on T007-T009
- T017-T018 (Type/Build validation) → depends on T013 (dependencies installed)
- T019-T022 (Grep validation) → can run in parallel
- T023 (Manual test) → depends on T017 (type checking passes)

**Phase 4**: Sequential documentation and commit
- T024-T028 (Docs) → can run in parallel
- T029-T030 (Final validation) → depends on T024-T028
- T031-T035 (Commit) → sequential, depends on T030

---

## Parallel Execution Opportunities

### Phase 1 (Setup) - Parallel Tasks
```bash
# Can run simultaneously (different concerns)
T001: git branch --show-current
T002: git status
T003: cp pnpm-lock.yaml pnpm-lock.yaml.backup
```

### Phase 2 (Atomic Transformation) - Sequential Required
**No parallelization** - All changes must be made atomically in sequence:
1. T005-T006 (package names first)
2. T007-T009 (dependencies reference new names)
3. T010-T011 (path mappings match new names)
4. T012 (imports use new path mappings)

### Phase 3 (Validation) - Parallel Grep Checks
```bash
# T019-T022 can run in parallel (independent grep patterns)
T019 & T020 & T021 & T022
```

### Phase 4 (Documentation) - Parallel File Updates
```bash
# T025-T028 can run in parallel (different files)
# Open all files simultaneously in IDE and update
T025 (CLAUDE.md) & T026 (sanity-atoms README) & T027 (sanity-blocks README) & T028 (old specs)
```

---

## Summary

**Total Tasks**: 35
**Estimated Time**: 15-20 minutes (as per quickstart.md)

**Task Breakdown by Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Atomic Transformation): 8 tasks
- Phase 3 (Validation): 11 tasks
- Phase 4 (Documentation & Commit): 12 tasks

**User Story Coverage**:
- **US1** (Developer Imports): Tasks T005-T006, T010-T012, T017-T018, T022
- **US2** (Package Dependencies): Tasks T005-T009, T013-T016, T020
- **US3** (TypeScript Path Mappings): Tasks T005-T006, T010-T011, T017, T021, T023

**Parallel Opportunities**: 11 tasks can be parallelized (T001-T003, T019-T022, T025-T028)

**MVP Scope**: All tasks required (atomic transformation - cannot be split)

**Success Criteria Validation**:
- SC-001: Task T017 (type checking)
- SC-002: Task T018 (build)
- SC-003: Tasks T013-T016 (dependency resolution)
- SC-004: Task T022 (import statements)
- SC-005: Task T023 (IDE autocomplete)
- SC-006: Tasks T025-T028 (documentation)

---

## Rollback Procedure

If issues arise during implementation:

1. **Before commit**: `git reset --hard HEAD && pnpm install`
2. **After commit**: `git revert <commit-hash> && pnpm install`
3. **Restore lockfile**: `mv pnpm-lock.yaml.backup pnpm-lock.yaml && pnpm install`

---

## References

- **Feature Spec**: `specs/011-rename-package-aliases/spec.md`
- **Implementation Plan**: `specs/011-rename-package-aliases/plan.md`
- **Data Model**: `specs/011-rename-package-aliases/data-model.md`
- **Contracts**: `specs/011-rename-package-aliases/contracts/`
- **Quickstart Guide**: `specs/011-rename-package-aliases/quickstart.md`
