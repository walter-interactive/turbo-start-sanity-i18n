# Tasks: Remove Roboto Studio Branding

**Input**: Design documents from `/specs/002-remove-roboto-branding/`  
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md (all complete)

**Tests**: No tests required for this feature (content/metadata changes only)

**Organization**: Tasks are grouped by user story to enable independent implementation and verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a monorepo project. All paths are relative to repository root:
- Documentation: `/LICENSE`, `/README.md`, `/CODE_OF_CONDUCT.md`, `/SECURITY.md`
- Source code: `/apps/web/src/lib/seo.ts`
- Assets: `/turbo-start-sanity-og.png`

---

## Phase 1: Setup & Prerequisites

**Purpose**: Verify prerequisites are confirmed before making changes

- [x] T001 Verify all prerequisite values are confirmed: contact email (`duy@walterinteractive.com`), copyright holder (`Walter Interactive`), Twitter handle (empty)
- [x] T002 Create backup branch or tag for easy rollback if needed (git reset --hard 002-remove-roboto-branding-backup-20251111-153459)

---

## Phase 2: User Story 1 - Repository Ownership and Branding Clarity (Priority: P1) 🎯 MVP

**Goal**: Update all documentation files to reflect Walter Interactive ownership while maintaining proper attribution to Roboto Studio in README.md Credits section

**Independent Test**: Review all documentation files and verify they show Walter Interactive as owner, with Roboto Studio only mentioned in README.md Credits section

### Implementation for User Story 1

- [x] T003 [P] [US1] Update copyright holder in `/LICENSE` from "Roboto Studio" to "Walter Interactive"
- [x] T004 [P] [US1] Replace contact email in `/CODE_OF_CONDUCT.md` from "hrithik@robotostudio.com" to "duy@walterinteractive.com"
- [x] T005 [P] [US1] Replace contact email in `/SECURITY.md` from "hrithik@robotostudio.com" to "duy@walterinteractive.com"
- [x] T006 [US1] Update title in `/README.md` from "Next.js Monorepo with Sanity CMS" to "Next.js Sanity i18n Starter"
- [x] T007 [US1] Update description in `/README.md` to emphasize bilingual application support
- [x] T008 [US1] Verify `/README.md` Credits section (lines 182-188) remains intact with proper Roboto Studio attribution and links

### Verification for User Story 1

- [x] T009 [US1] Run `rg "hrithik@robotostudio.com" --iglob '!node_modules' --iglob '!.git' --iglob '!specs'` and verify no results
- [x] T010 [US1] Verify `/LICENSE` displays "Copyright (c) 2025 Walter Interactive"
- [x] T011 [US1] Verify `/README.md` Credits section properly attributes Roboto Studio with link to robotostudio/turbo-start-sanity
- [x] T012 [US1] Manually review all updated documentation files for consistency and correctness

**Checkpoint**: At this point, all documentation reflects Walter Interactive ownership with proper Roboto Studio attribution. User Story 1 is complete and independently verifiable.

---

## Phase 3: User Story 2 - Clean Codebase Identity (Priority: P2)

**Goal**: Update SEO configuration defaults and verify no Roboto Studio references remain in codebase (except README.md Credits)

**Independent Test**: Search entire codebase for "roboto" and verify only README.md Credits section contains references

### Implementation for User Story 2

- [x] T013 [US2] Update `title` in `/apps/web/src/lib/seo.ts` from "Roboto Studio Demo" to "Next.js Sanity i18n Starter"
- [x] T014 [US2] Update `description` in `/apps/web/src/lib/seo.ts` to "A modern full-stack monorepo template with Next.js, Sanity CMS, and comprehensive i18n support"
- [x] T015 [US2] Update `twitterHandle` in `/apps/web/src/lib/seo.ts` from "@studioroboto" to empty string ""
- [x] T016 [US2] Update `keywords` array in `/apps/web/src/lib/seo.ts` to ["nextjs", "sanity", "i18n", "monorepo", "typescript", "template", "react", "tailwind"]

### Verification for User Story 2

- [x] T017 [US2] Run `rg -i "roboto" --iglob '!node_modules' --iglob '!.git' --iglob '!pnpm-lock.yaml' --iglob '!specs' --iglob '!.opencode'` and verify only `/README.md` Credits section appears
- [x] T018 [US2] Run `rg -i "robotostudio" --iglob '!node_modules' --iglob '!.git' --iglob '!pnpm-lock.yaml' --iglob '!specs' --iglob '!.opencode'` and verify only `/README.md` Credits section appears
- [x] T019 [US2] Run `rg -i "studioroboto" --iglob '!node_modules' --iglob '!.git' --iglob '!pnpm-lock.yaml' --iglob '!specs' --iglob '!.opencode'` and verify no results
- [x] T020 [US2] Run `rg -i "roboto" --glob "package.json" --iglob '!node_modules'` and verify no results (package.json files are clean)
- [x] T021 [US2] Verify `/apps/web/src/lib/seo.ts` has all updated values with correct TypeScript syntax

**Checkpoint**: At this point, codebase search returns Roboto Studio references only in README.md Credits section. User Story 2 is complete and independently verifiable.

---

## Phase 4: User Story 3 - Asset and Visual Identity Cleanup (Priority: P3)

**Goal**: Verify visual assets are neutral or reflect Walter Interactive branding (no Roboto Studio logos/watermarks)

**Independent Test**: Review all image assets and confirm none contain Roboto Studio branding elements

### Verification for User Story 3

- [x] T022 [US3] Manually inspect `/turbo-start-sanity-og.png` for any Roboto Studio logos or watermarks (research indicates it's already neutral)
- [x] T023 [US3] Search for other image files: `find . -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.svg" \) -not -path "*/node_modules/*" -not -path "*/.git/*"` and review each
- [x] T024 [US3] Verify all images referenced in `/README.md` are either neutral or reflect Walter Interactive branding

**Checkpoint**: At this point, all visual assets have been reviewed and confirmed to be neutral or branded appropriately. User Story 3 is complete.

**Note**: If Roboto Studio branding is found in images during verification, add implementation tasks to replace/remove those assets. Research indicates OG image is already neutral/generic.

---

## Phase 5: Polish & Cross-Cutting Verification

**Purpose**: Final quality checks and build verification across all changes

### Build & Type Safety Verification

- [x] T025 Run `pnpm check-types` from repository root and verify TypeScript compilation succeeds (exit code 0)
- [x] T026 Run `pnpm lint` from repository root and verify all linting passes (exit code 0)
- [x] T027 Run `pnpm format` from repository root to auto-fix any formatting issues
- [x] T028 Run `pnpm build` from repository root and verify all workspaces (web, studio, ui) build successfully

### Integration Testing

- [x] T029 Run `pnpm dev` and verify development servers start without errors
- [x] T030 Open `http://localhost:3000` in browser and verify page title shows "Next.js Sanity i18n Starter" (from SEO config)
- [x] T031 Check page source at `http://localhost:3000` for meta tags and verify description matches new SEO config
- [x] T032 Open `http://localhost:3333` (Sanity Studio) and verify it loads without errors

### Final Success Criteria Verification

- [x] T033 Verify **SC-001**: Repository search for "roboto"/"robotostudio" returns results only in `/README.md` Credits section
- [x] T034 Verify **SC-002**: All documentation files reference Walter Interactive as owner within first 3 paragraphs
- [x] T035 Verify **SC-003**: `/README.md` contains Credits section with link to robotostudio/turbo-start-sanity
- [x] T036 Verify **SC-004**: All package.json files contain Walter Interactive info (0% reference Roboto Studio) - already verified as clean
- [x] T037 Verify **SC-005**: Existing test suite (if any) passes with 100% success rate
- [x] T038 Verify **SC-006**: Build process completes successfully for all packages (web, studio, ui)
- [x] T039 Verify **SC-007**: No Roboto Studio branding in markdown headings/titles (excluding Credits)
- [x] T040 Verify **SC-008**: All documentation links point to walter-interactive repository (except Credits attribution)

### Manual Quality Review

- [x] T041 Review all changed files (`git diff`) for accuracy, consistency, and correct replacement values
- [x] T042 Verify no broken links in documentation files
- [x] T043 Confirm all changes align with `quickstart.md` implementation guide
- [x] T044 Run final repository-wide search: `rg -i "roboto" --iglob '!node_modules' --iglob '!.git' --iglob '!pnpm-lock.yaml' --iglob '!specs' --iglob '!.opencode' | grep -v "README.md.*Credits"` and verify no unexpected results

**Checkpoint**: All quality gates passed. Feature is ready for commit and PR.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup completion
- **User Story 2 (Phase 3)**: Independent of US1, but should follow in priority order (P1 → P2)
- **User Story 3 (Phase 4)**: Independent of US1/US2, follows in priority order (P2 → P3)
- **Polish (Phase 5)**: Depends on completion of all user stories (US1, US2, US3)

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Setup - No dependencies on US1 (different files)
- **User Story 3 (P3)**: Can start after Setup - No dependencies on US1/US2 (verification only)

### Within Each User Story

- **US1**: All implementation tasks (T003-T008) can run in parallel (marked [P]), then verification tasks (T009-T012) run sequentially
- **US2**: All implementation tasks (T013-T016) run sequentially (same file), then verification tasks (T017-T021) can run in parallel
- **US3**: All verification tasks (T022-T024) run sequentially (manual review)

### Parallel Opportunities

**Within User Story 1** (after Setup):
- T003, T004, T005 can run in parallel (different files: LICENSE, CODE_OF_CONDUCT.md, SECURITY.md)
- T006, T007, T008 are sequential (same file: README.md)

**Across User Stories** (if team capacity allows):
- US1, US2, US3 can all start in parallel after Phase 1 (different files)
- However, recommended to follow priority order for incremental delivery

**Polish Phase**:
- Build verification tasks (T025-T028) run sequentially (each depends on previous)
- Success criteria verification (T033-T040) can mostly run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all documentation file updates together (different files):
Task: "Update copyright holder in /LICENSE"
Task: "Replace contact email in /CODE_OF_CONDUCT.md"
Task: "Replace contact email in /SECURITY.md"

# Then update README.md sequentially (same file):
Task: "Update title in /README.md"
Task: "Update description in /README.md"
Task: "Verify README.md Credits section"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: User Story 1 (T003-T012)
3. **STOP and VALIDATE**: Verify all documentation shows Walter Interactive ownership
4. Optional: Run basic build check (`pnpm build`)
5. Decision point: Proceed to US2/US3 or deploy MVP

### Incremental Delivery

1. Setup (Phase 1) → Prerequisites confirmed
2. User Story 1 (Phase 2) → Documentation complete → **Deliverable: Proper ownership in docs**
3. User Story 2 (Phase 3) → Codebase clean → **Deliverable: SEO config updated, verification complete**
4. User Story 3 (Phase 4) → Assets reviewed → **Deliverable: Visual identity confirmed**
5. Polish (Phase 5) → All quality gates passed → **Ready for PR**

### Single Developer Strategy

Work sequentially in priority order:
1. Complete Setup
2. Complete US1 (P1) → Verify independently
3. Complete US2 (P2) → Verify independently
4. Complete US3 (P3) → Verify independently
5. Complete Polish → Final verification
6. Estimated total time: ~90 minutes (including all verification)

### Parallel Team Strategy (if 3+ developers available)

With multiple developers after Setup:
- **Developer A**: User Story 1 (documentation files)
- **Developer B**: User Story 2 (SEO config + search verification)
- **Developer C**: User Story 3 (asset review)
- **All together**: Polish phase (build verification, final quality checks)

Estimated time with parallelization: ~45 minutes

---

## Task Summary

**Total Tasks**: 44 tasks across 5 phases

**Breakdown by Phase**:
- Phase 1 (Setup): 2 tasks
- Phase 2 (US1 - Documentation): 10 tasks (6 implementation + 4 verification)
- Phase 3 (US2 - Codebase): 9 tasks (4 implementation + 5 verification)
- Phase 4 (US3 - Assets): 3 tasks (verification only)
- Phase 5 (Polish): 20 tasks (build, integration, success criteria, quality review)

**Parallel Opportunities**:
- 3 tasks in US1 can run in parallel (T003, T004, T005)
- All 3 user stories can run in parallel (if team capacity allows)
- Multiple verification tasks can run in parallel

**Critical Path** (sequential execution):
Setup → US1 → US2 → US3 → Polish
Estimated: ~90 minutes total

**Independent Test Criteria**:
- **US1**: All documentation files show Walter Interactive ownership; README.md Credits properly attributes Roboto Studio
- **US2**: Repository search shows Roboto Studio only in README.md Credits section; SEO config has updated values
- **US3**: All image assets reviewed and confirmed neutral/appropriate branding

**MVP Scope**: User Story 1 (Phase 2) provides immediate value - proper ownership in all documentation

---

## Notes

- **No tests required**: This is content/metadata changes only; existing test suite should continue to pass
- **[P] marker**: Tasks that can run in parallel (different files, no dependencies)
- **[Story] label**: Maps task to specific user story for traceability and independent testing
- **Each user story independently completable**: Can stop after any user story and have a working, verifiable increment
- **Verification tasks**: Each user story has dedicated verification tasks to ensure it works independently
- **Success criteria**: Phase 5 includes explicit verification of all 8 success criteria from spec.md
- **Rollback plan**: If issues found, `git revert` or `git checkout HEAD~1 -- [FILE]` for individual files
- **File conflicts**: Minimal risk - only README.md is touched multiple times (within same story, sequential tasks)
- **Commit strategy**: Recommend committing after each user story phase for clean history and easy rollback

---

## References

- **Spec**: `/specs/002-remove-roboto-branding/spec.md` - User stories and success criteria
- **Plan**: `/specs/002-remove-roboto-branding/plan.md` - Technical context and structure
- **Research**: `/specs/002-remove-roboto-branding/research.md` - Audit findings and replacement values
- **Quickstart**: `/specs/002-remove-roboto-branding/quickstart.md` - Detailed implementation steps
- **Constitution**: `/.specify/memory/constitution.md` - Quality gates and principles
