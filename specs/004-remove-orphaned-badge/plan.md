# Implementation Plan: Remove Orphaned Translation Badge

**Branch**: `004-remove-orphaned-badge` | **Date**: 2025-11-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-remove-orphaned-badge/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Remove the orphaned translation badge feature from Sanity Studio document list previews (pages, blogs, FAQs) due to high false positive rate (60-80%). The current implementation uses a simplistic check (`language !== DEFAULT_LOCALE`) that incorrectly marks all non-default language documents as orphaned, even when they have corresponding default language versions. This removal will eliminate misleading warnings, provide cleaner document preview subtitles, and remove unused component code.

**Technical Approach**: Systematic removal of `isOrphaned` logic from three document schema files (page.ts, blog.ts, faq.ts) and deletion of the unused badge component file. No replacement implementation is planned due to architectural constraints in Sanity's synchronous preview.prepare() system.

## Technical Context

**Language/Version**: TypeScript 5.x (strictmode enabled per monorepo standards)  
**Primary Dependencies**: 
- Sanity Studio v3 (React-based CMS framework)
- @workspace/i18n-config (monorepo package for locale constants)
- @sanity/icons (icon components - will remain for other status indicators)
- @sanity/ui (UI components - will remain for other status indicators)

**Storage**: Sanity Content Lake (cloud-hosted, no changes required)  
**Testing**: 
- Manual verification: Sanity Studio loads without errors
- Visual verification: Document list previews display correctly
- Type checking: `pnpm --filter studio typecheck`
- Build verification: `pnpm --filter studio build`

**Target Platform**: Web (Sanity Studio runs in browser)  
**Project Type**: Monorepo - changes isolated to `apps/studio` workspace  
**Performance Goals**: No performance impact (removing code)  
**Constraints**: 
- Must not break existing document list preview functionality
- Must preserve all other status indicators (visibility, page builder status, slug)
- Must maintain type safety and pass strict TypeScript compilation

**Scale/Scope**: 
- 3 document schema files to modify
- 1 component file to delete
- ~10 lines of code removal per schema file
- Zero breaking changes to Sanity data model or API

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Monorepo Structure & Boundaries
**Status**: ✅ **PASS**
- Changes isolated to `apps/studio` workspace
- No cross-workspace dependencies affected
- Studio remains independently buildable

### II. TypeScript Strict Mode & Type Safety
**Status**: ✅ **PASS**
- Removing code maintains type safety
- No `any` types introduced
- Preview function signatures remain properly typed

### III. Test Coverage (MANDATORY)
**Status**: ✅ **PASS** (with justification)
- **Justification**: This is a removal feature with no new logic to test
- Manual testing required: Visual verification of document list previews
- Verification steps documented in quickstart.md
- Studio build and typecheck serve as contract tests

### IV. Component Modularity & Reusability
**Status**: ✅ **PASS**
- Removing unused OrphanedBadge component improves codebase cleanliness
- No reusable components affected negatively

### V. API Contracts & Versioning
**Status**: ✅ **PASS** (Not Applicable)
- No API changes (preview configuration is internal to Sanity schemas)
- No frontend/backend contract affected

### VI. Internationalization (i18n) First
**Status**: ✅ **PASS**
- No i18n text removal (badge text was in code, not translation files)
- Translations badge feature remains fully functional
- i18n structure unaffected

### VII. Code Quality & Observability
**Status**: ✅ **PASS**
- Must pass linting: `pnpm lint`
- Must pass type-check: `pnpm check-types`
- Must pass build: `pnpm build`
- No observability/logging changes needed

**Pre-Phase 0 Gate Result**: ✅ **ALL CHECKS PASSED** - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/004-remove-orphaned-badge/
├── spec.md                  # Feature specification (completed)
├── plan.md                  # This file (/speckit.plan command output)
├── research.md              # Phase 0 output (usage verification)
├── quickstart.md            # Phase 1 output (testing guide)
├── checklists/
│   └── requirements.md      # Specification quality checklist (completed)
└── contracts/               # Not applicable for removal feature
```

### Source Code (repository root)

```text
apps/studio/
├── schemaTypes/
│   ├── documents/
│   │   ├── page.ts          # MODIFY: Remove lines 72, 78-79, 86-88
│   │   ├── blog.ts          # MODIFY: Remove isOrphaned logic (lines ~139, 158)
│   │   └── faq.ts           # MODIFY: Remove isOrphaned logic (lines ~39, 44)
│   └── common.ts            # VERIFY: No changes needed (languageField remains)
├── components/
│   └── orphaned-translation-badge.tsx  # DELETE: Entire file (unused)
└── utils/
    └── constant.ts          # VERIFY: No changes needed

packages/i18n-config/
└── src/
    └── index.ts             # VERIFY: DEFAULT_LOCALE export remains (used elsewhere)
```

**Structure Decision**: This is a **monorepo modification** targeting the `apps/studio` workspace. Changes are isolated to Sanity Studio schema definitions and one unused component. The feature follows the monorepo principle of clear workspace boundaries - no changes required in `apps/web` or `packages/*` workspaces.

## Complexity Tracking

**Status**: No constitutional violations - table not required

---

## Phase 0: Research & Validation

### Research Objectives

1. **Verify unused component**: Confirm `orphaned-translation-badge.tsx` has no imports
2. **Audit language field usage**: Confirm `language` field in preview.select is only used for orphaned check
3. **Document current behavior**: Screenshot examples of false positive warnings
4. **Identify test strategy**: Determine manual verification steps

### Research Questions

- **Q1**: Are there any imports of `OrphanedBadge` component in the codebase?
  - **Method**: Search all TypeScript files for `orphaned-translation-badge` or `OrphanedBadge`
  - **Expected**: Zero imports found (component defined but never used)

- **Q2**: Is the `language` field used elsewhere in preview.select beyond orphaned detection?
  - **Method**: Review preview.prepare() functions in page.ts, blog.ts, faq.ts
  - **Expected**: Only used for `isOrphaned` variable, safe to remove

- **Q3**: What other document types might have this pattern?
  - **Method**: Search all schema files for `isOrphaned` variable
  - **Expected**: Only page.ts, blog.ts, faq.ts (confirmed in investigation doc)

- **Q4**: What is the format of the subtitle after removal?
  - **Method**: Document expected subtitle format without orphaned text
  - **Expected**: `${statusEmoji} ${builderEmoji} | 🔗 ${slug}`

### Research Output

Results will be documented in `research.md` with:
- Search results for component usage
- Analysis of language field necessity
- Before/after subtitle format examples
- Manual testing checklist

---

## Phase 1: Design & Testing Guide

### Data Model

**Status**: ✅ **NOT APPLICABLE** - This is a removal feature with no data model changes

- Sanity document schemas remain unchanged (no field additions/removals)
- Preview configuration is internal to schema definitions
- No database migrations required

### API Contracts

**Status**: ✅ **NOT APPLICABLE** - No API contracts affected

- Preview configuration is not an external API
- No frontend/backend integration changes
- No contract tests required

### Quickstart Guide

Output will be `quickstart.md` containing:

1. **Pre-removal verification**: 
   - Navigate to Studio Pages list
   - Screenshot documents showing "⚠️ Orphaned translation" warnings
   
2. **Post-removal verification**:
   - Start Studio: `pnpm --filter studio dev`
   - Check Pages list: Verify no orphaned warnings
   - Check Blogs list: Verify no orphaned warnings
   - Check FAQs list: Verify no orphaned warnings
   - Verify subtitle format: `${statusEmoji} ${builderEmoji} | 🔗 ${slug}`

3. **Type and build verification**:
   - Run `pnpm --filter studio typecheck` (must pass)
   - Run `pnpm --filter studio build` (must succeed)
   - Run `pnpm lint` (must pass)

4. **Functional verification**:
   - Verify Translations badge still works (open document, check badge)
   - Verify language switching still works
   - Verify other preview elements display correctly (title, image, status icons)

---

## Phase 2: Task Breakdown

**Status**: Deferred to `/speckit.tasks` command

Task breakdown will be created in `tasks.md` and will include:

### Expected Tasks

1. **T001**: Search codebase for OrphanedBadge imports (research)
2. **T002**: Verify language field usage in preview.select (research)
3. **T003**: Remove isOrphaned logic from page.ts preview.prepare()
4. **T004**: Remove language field from page.ts preview.select (if only used for orphaned check)
5. **T005**: Remove isOrphaned logic from blog.ts preview.prepare()
6. **T006**: Remove language field from blog.ts preview.select (if only used for orphaned check)
7. **T007**: Remove isOrphaned logic from faq.ts preview.prepare()
8. **T008**: Remove language field from faq.ts preview.select (if only used for orphaned check)
9. **T009**: Delete orphaned-translation-badge.tsx component file
10. **T010**: Run typecheck and fix any type errors
11. **T011**: Run build and verify success
12. **T012**: Manual testing - verify Studio loads and previews display correctly
13. **T013**: Run lint and fix any issues
14. **T014**: Update spec 003 documentation to note FR-010 removal

### Task Dependencies

- T001-T002 (research) must complete before T003-T009 (implementation)
- T003-T009 (removal) must complete before T010-T011 (verification)
- T010-T011 (verification) must pass before T012 (manual testing)
- All tasks must complete before T014 (documentation update)

---

## Risk Assessment

### Low Risk

- **Removal of unused component**: Zero impact (no imports found)
- **Preview simplification**: Reduces complexity, improves reliability
- **Type safety**: Removing code cannot introduce type errors

### Medium Risk

- **Manual testing required**: No automated tests for preview appearance
  - **Mitigation**: Comprehensive quickstart checklist with screenshots

### Zero Risk

- **Data loss**: No data model changes, no content affected
- **API breaking changes**: No public APIs modified
- **Performance degradation**: Removing code improves performance

---

## Post-Phase 1 Constitution Re-Check

**Status**: ✅ **ALL CHECKS PASSED** (no changes from pre-Phase 0)

- Phase 0 research confirmed no additional constitutional concerns
- Phase 1 design maintains all passing checks from pre-Phase 0 gate
- Ready to proceed to Phase 2 (tasks) via `/speckit.tasks` command

---

## Success Metrics

- ✅ TypeScript compilation succeeds
- ✅ Studio build completes without errors
- ✅ Linting passes with zero violations
- ✅ Document list previews display without orphaned warnings
- ✅ Preview subtitle format is clean and consistent
- ✅ Translations badge functionality preserved
- ✅ No component import errors
- ✅ Zero false positive warnings visible to content editors

---

## Notes

- This plan follows the removal approach recommended in `specs/issues/003-T058-orphaned-badge-investigation.md` (Option 1)
- No alternative implementation planned due to Sanity preview system architectural constraints
- Future enhancement (accurate orphaned detection) would require custom plugin with async data loading, tracked separately
- This removal addresses FR-010 from spec 003-dedup-studio-records which introduced the flawed feature
