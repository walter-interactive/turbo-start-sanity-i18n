# Implementation Plan: Remove Roboto Studio Branding

**Branch**: `002-remove-roboto-branding` | **Date**: Tue Nov 11 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-remove-roboto-branding/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Remove all Roboto Studio branding from the repository while maintaining proper attribution in README.md. This is a content and metadata update that involves modifying documentation files, package metadata, code comments, and SEO defaults to reflect the new ownership. The changes must preserve all functionality while ensuring only the README.md attribution section contains Roboto Studio references.

**Prerequisites Status**: ✅ **ALL CONFIRMED**
- Contact email: `duy@walterinteractive.com`
- Copyright holder: `Walter Interactive`
- Twitter handle: `""` (empty)
- Original license: Existing LICENSE file verified

## Technical Context

**Language/Version**: TypeScript/JavaScript (Node.js 20+)  
**Primary Dependencies**: N/A (content/metadata changes only)  
**Storage**: N/A (no data persistence involved)  
**Testing**: Manual validation via repository search + existing test suite + build verification  
**Target Platform**: Monorepo (TurboRepo with Next.js web app + Sanity Studio)  
**Project Type**: Monorepo with multiple workspaces (apps/web, apps/studio, packages/ui)  
**Performance Goals**: N/A (no runtime performance changes)  
**Constraints**: Must not break existing functionality; must pass all existing tests and builds  
**Scale/Scope**: 5 primary files to update (README, CODE_OF_CONDUCT, SECURITY, LICENSE, SEO config) + verification of entire codebase

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Implementation Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Monorepo Structure & Boundaries** | ✅ PASS | No changes to workspace structure or dependencies |
| **II. TypeScript Strict Mode & Type Safety** | ✅ PASS | No code changes affecting types |
| **III. Test Coverage (MANDATORY)** | ✅ PASS | No new functionality; existing tests must continue to pass |
| **IV. Component Modularity & Reusability** | ✅ PASS | No component changes |
| **V. API Contracts & Versioning** | ✅ PASS | No API changes |
| **VI. Internationalization (i18n) First** | ✅ PASS | No user-facing text changes (only metadata and documentation) |
| **VII. Code Quality & Observability** | ✅ PASS | Changes must pass linting/formatting checks |

**Quality Gates**:
- ✅ TypeScript compilation must succeed (`pnpm check-types`)
- ✅ All linting must pass (`pnpm lint`)
- ✅ All existing tests must pass
- ✅ Build must succeed for all workspaces (`pnpm build`)
- ✅ Repository search for "roboto" must return only README.md attribution

**Verdict**: All constitutional principles satisfied. This is a straightforward content update with no architectural or code quality implications.

### Post-Design Check

**Completed**: Tue Nov 11 2025 (after Phase 1)

| Principle | Status | Design Confirmation |
|-----------|--------|---------------------|
| **I. Monorepo Structure & Boundaries** | ✅ PASS | No workspace dependencies changed; only file content updates |
| **II. TypeScript Strict Mode & Type Safety** | ✅ PASS | Only string literal changes in seo.ts; types unchanged |
| **III. Test Coverage (MANDATORY)** | ✅ PASS | No new functionality to test; existing tests remain valid |
| **IV. Component Modularity & Reusability** | ✅ PASS | No component modifications |
| **V. API Contracts & Versioning** | ✅ PASS | No API surface changes |
| **VI. Internationalization (i18n) First** | ✅ PASS | Changes are metadata-only; no i18n impact |
| **VII. Code Quality & Observability** | ✅ PASS | Linting and formatting verified in quickstart.md |

**Design Review Findings**:
- ✅ All changes are content/metadata only (5 files total)
- ✅ No breaking changes to functionality
- ✅ Verification strategy is comprehensive and automated
- ✅ Rollback plan is trivial (git revert)
- ✅ No new dependencies introduced
- ✅ Build and test infrastructure unchanged

**Final Verdict**: Design maintains full constitutional compliance. No risks identified.

## Project Structure

### Documentation (this feature)

```text
specs/002-remove-roboto-branding/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command) - N/A for this feature
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command) - N/A for this feature
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Monorepo structure (no structural changes)
/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   └── lib/
│   │   │       └── seo.ts      # [UPDATE] Default SEO values
│   │   └── package.json        # [VERIFY] No Roboto Studio references
│   └── studio/                 # Sanity Studio
│       └── package.json        # [VERIFY] No Roboto Studio references
├── packages/
│   ├── ui/
│   │   └── package.json        # [VERIFY] No Roboto Studio references
│   └── typescript-config/
│       └── package.json        # [VERIFY] No Roboto Studio references
├── README.md                   # [UPDATE] Keep credits, update ownership
├── CODE_OF_CONDUCT.md          # [UPDATE] Contact email
├── SECURITY.md                 # [UPDATE] Contact email
├── LICENSE                     # [UPDATE] Copyright holder
├── CONTRIBUTING.md             # [VERIFY] No Roboto Studio references
├── package.json                # [VERIFY] Root package metadata
└── github/                     # [NOTE] Should be .github (separate issue)
    └── workflows/
        └── deploy-sanity.yml   # [VERIFY] No Roboto Studio references
```

**Structure Decision**: This is a monorepo using TurboRepo with clear workspace boundaries. The branding removal affects only metadata and documentation files, not the codebase structure itself. No new directories or files will be created; only existing files will be modified.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No complexity tracking needed - all constitutional principles pass without violations.*

---

## Phase 0: Research

**Goal**: Identify all Roboto Studio references and determine replacement values.

### Research Tasks

1. **Current Branding Audit**
   - Search entire repository for "roboto", "robotostudio" (case-insensitive)
   - Document all locations where references appear
   - Classify references by type: documentation, code, config, assets

2. **Replacement Values Decision**
   - Determine new organization name/branding
   - Decide on contact email for CODE_OF_CONDUCT and SECURITY
   - Confirm LICENSE type and new copyright holder
   - Define new default SEO values (title, description, keywords, Twitter handle)

3. **Attribution Format**
   - Review common OSS attribution patterns
   - Draft proposed "Credits" section wording for README.md
   - Ensure proper acknowledgment and link to original template

4. **Testing Strategy**
   - Define search pattern to verify complete removal
   - Identify which tests/builds to run for verification
   - Plan manual review checklist

**Output**: `research.md` with findings and decisions

---

## Phase 1: Design & Contracts

**Goal**: Create detailed file-by-file modification plan.

### Artifacts

Since this feature involves only content updates (not new functionality or data), the standard Phase 1 outputs are adapted:

1. **`data-model.md`**: Not applicable (no data entities)
2. **`contracts/`**: Not applicable (no API contracts)
3. **`quickstart.md`**: Implementation guide with file-by-file changes

### File Modification Plan

Document in `quickstart.md`:

#### Files to Update

1. **README.md**
   - Lines 1-5: Update title and description (remove Roboto Studio ownership implication)
   - Lines 182-188: Keep as "Credits" section, potentially enhance acknowledgment
   - Lines throughout: Update any references from Roboto Studio's repo to ours

2. **CODE_OF_CONDUCT.md**
   - Replace `hrithik@robotostudio.com` with new contact email

3. **SECURITY.md**
   - Replace `hrithik@robotostudio.com` with new contact email

4. **LICENSE**
   - Update `Copyright (c) 2025 Roboto Studio` to new copyright holder
   - Verify license type remains appropriate

5. **apps/web/src/lib/seo.ts**
   - Line 7: Update `title: "Roboto Studio Demo"`
   - Line 8: Update `description: "Roboto Studio Demo"`
   - Line 9: Update `twitterHandle: "@studioroboto"`
   - Line 10: Update `keywords` array to remove "roboto" and "studio"

#### Files to Verify (No Changes Expected)

- All `package.json` files (root, apps/web, apps/studio, packages/*)
- `CONTRIBUTING.md`
- `github/workflows/deploy-sanity.yml`
- All source code files (should contain no Roboto Studio references)

#### Post-Change Verification

1. Run: `rg -i "roboto" --iglob '!node_modules' --iglob '!.git' --iglob '!pnpm-lock.yaml' --iglob '!specs'`
2. Verify only README.md Credits section appears
3. Run: `pnpm check-types` (verify TypeScript compilation)
4. Run: `pnpm lint` (verify linting passes)
5. Run: `pnpm build` (verify all workspaces build successfully)

**Output**: `quickstart.md` with complete modification checklist

### Agent Context Update

After creating the quickstart, run:

```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This updates the agent-specific context file with any new patterns or approaches from this feature (though this is primarily a content change, so minimal context updates expected).

---

## Phase 2: Implementation Tasks

**Note**: This phase is executed by the `/speckit.tasks` command (NOT by `/speckit.plan`).

The `tasks.md` file will break down the implementation into granular, testable tasks based on the design from Phase 1. Each task will be independently verifiable and mapped to the user stories from the feature spec.

---

## Notes

### Risk Assessment

**Low Risk**: This feature involves only content and metadata changes with no code logic modifications. The primary risk is missing a reference during search, which would be caught by the final verification step.

### Dependencies

- **Decision Required**: New organization name, contact email, and branding values must be decided before implementation
- **License Review**: Confirm that the original license permits rebranding and derivative works

### Testing Approach

Since this is content-only:
1. Automated verification via repository search
2. Build and lint checks ensure no accidental breaking changes
3. Manual review of changed files for quality
4. No new unit/integration tests required

### Post-Implementation

After merging this feature:
1. Update any external references to the repository
2. Consider updating the OG image (`turbo-start-sanity-og.png`) in a follow-up task
3. Communicate rebrand to any existing users/contributors
