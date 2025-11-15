# Research: Rename Package Aliases from @walter to @workspace

**Date**: 2025-11-15
**Feature**: 011-rename-package-aliases

## Overview

This document consolidates research findings for renaming package aliases from `@walter/*` to `@workspace/*` in the turbo-start-sanity-i18n monorepo. Since this is a metadata-only change (no runtime logic changes), research focuses on tooling compatibility, monorepo best practices, and migration safety.

## Research Questions & Findings

### 1. pnpm Workspace Package Naming Best Practices

**Question**: What are the best practices for naming packages in pnpm workspaces? Are there conventions for scoped package names?

**Decision**: Use `@workspace/*` prefix for all internal workspace packages

**Rationale**:
- **Consistency**: The monorepo already uses `@workspace/typescript-config`, establishing a precedent
- **Clarity**: `@workspace` clearly signals "internal to this monorepo" vs external npm packages
- **Tooling Support**: pnpm, TypeScript, and TurboRepo all support arbitrary scoped package names without special configuration
- **Conflict Avoidance**: Using a generic scope like `@workspace` prevents potential conflicts with published npm packages
- **Migration Safety**: The `workspace:*` protocol in dependencies ensures pnpm resolves to local packages regardless of scope name

**Alternatives Considered**:
- `@walter/*`: Current state, but inconsistent with existing `@workspace/typescript-config`
- `@turbo-start/*` or `@sanity-i18n/*`: More project-specific, but unnecessarily couples package names to project name (reduces reusability if packages are extracted)
- Unscoped names (`sanity-atoms`): Less clear about internal vs external packages, higher risk of npm name conflicts

**References**:
- pnpm workspace documentation: Supports any valid npm package name as workspace packages
- Existing codebase: `@workspace/typescript-config` proves pattern is already functional

---

### 2. TypeScript Path Mapping Rename Strategy

**Question**: How should TypeScript path mappings be updated to minimize errors? Should all tsconfig.json files be updated simultaneously or incrementally?

**Decision**: Update all tsconfig.json files atomically in a single commit

**Rationale**:
- **Atomic Consistency**: TypeScript compiler resolves paths based on tsconfig.json at compile time - partial updates would cause immediate compilation failures
- **Dependency Graph**: Root `tsconfig.json` defines base path mappings that workspace-specific configs may extend or override
- **Build Cache Safety**: TurboRepo caching requires consistent builds - mixed states would invalidate caches unpredictably
- **Testing Simplicity**: Atomic update allows single validation pass (`pnpm check-types`) rather than managing intermediate states

**Alternatives Considered**:
- Incremental per-workspace updates: Rejected because TypeScript compiler would fail on first workspace referencing updated paths before other workspaces are ready
- Add both old and new paths temporarily: Rejected because it would allow mixed import styles to persist, complicating future maintenance

**Implementation Approach**:
1. Update root `tsconfig.json` path mappings
2. Update workspace-specific tsconfig.json files (apps/template-studio, apps/template-web, packages/sanity-atoms, packages/sanity-blocks)
3. Validate no other tsconfig.json files contain custom path mappings for `@walter/sanity-*`

---

### 3. Import Statement Migration Tools

**Question**: Should import statements be updated manually or using automated tools (e.g., `sed`, find-replace, codemod)?

**Decision**: Use bulk find-replace via `sed` or IDE find-replace-all for import statement updates

**Rationale**:
- **Scale**: 52 files identified via grep - manual updates are error-prone and time-consuming
- **Consistency**: Automated replacement ensures exact pattern matching (e.g., `from '@walter/sanity-atoms` → `from '@workspace/sanity-atoms`)
- **Verification**: TypeScript compiler will immediately catch any missed or incorrect replacements via type errors
- **Simplicity**: Import statements follow predictable patterns - no complex AST transformations needed

**Alternatives Considered**:
- Manual updates: Rejected due to scale (52 files) and high error risk
- AST-based codemod (e.g., jscodeshift): Overkill for simple string replacement, adds tooling complexity
- TypeScript language service rename: Not applicable - renaming package imports isn't a standard refactor operation in TS language service

**Validation Strategy**:
1. Use grep to identify all files with `@walter/sanity-atoms` or `@walter/sanity-blocks`
2. Perform bulk find-replace for both package names
3. Run `pnpm check-types` to catch any missed imports (will fail with "Cannot find module" errors)
4. Run `pnpm build` to ensure no runtime issues (though none expected for import path changes)

---

### 4. Dependency Resolution Impact

**Question**: Will changing package names in package.json affect pnpm's dependency graph or lockfile? Do we need to reinstall dependencies?

**Decision**: Run `pnpm install` after renaming to update pnpm-lock.yaml and node_modules symlinks

**Rationale**:
- **Lockfile Updates**: pnpm-lock.yaml stores package names - renaming requires lockfile regeneration
- **Symlink Updates**: pnpm creates `node_modules/@walter/sanity-atoms` symlinks - these must be recreated as `node_modules/@workspace/sanity-atoms`
- **Workspace Resolution**: The `workspace:*` protocol instructs pnpm to resolve to local workspace packages, but pnpm needs to re-index the workspace after package.json "name" field changes
- **Safety**: Fresh install validates that all dependencies resolve correctly with new names

**Alternatives Considered**:
- Skip reinstall and rely on existing node_modules: Rejected - stale symlinks would cause module resolution failures
- Use `pnpm update` instead of `pnpm install`: Rejected - `install` is more comprehensive for structural changes

**Post-Install Validation**:
1. Verify `node_modules/@workspace/sanity-atoms` and `node_modules/@workspace/sanity-blocks` exist
2. Verify `node_modules/@walter/*` no longer exists
3. Run `pnpm list --depth=0` to confirm workspace dependencies are recognized

---

### 5. Documentation and Comment Updates

**Question**: Which documentation files need updates? Are there code comments referencing the old alias?

**Decision**: Update README.md, CLAUDE.md, and all spec files referencing `@walter/sanity-*`

**Rationale**:
- **Developer Onboarding**: README.md is the primary entry point for new developers - outdated import examples would cause confusion
- **AI Context**: CLAUDE.md provides context for AI-assisted development - outdated package names would generate incorrect code
- **Historical Accuracy**: Past spec files (009, 010) document features using `@walter/*` - updating them prevents future confusion when reviewing old docs
- **Completeness**: Success criteria SC-006 requires documentation updates - systematic search ensures nothing is missed

**Alternatives Considered**:
- Update only README.md and CLAUDE.md: Rejected - old spec files would remain confusing
- Add "deprecated" notices instead of renaming in old specs: Rejected - full rename is clearer and prevents copy-paste errors

**Search Strategy**:
1. Use grep to find all markdown files with `@walter/sanity` references
2. Manually review each match to determine if it's a code example (update) or historical context (evaluate case-by-case)
3. Update all code examples and import paths to use `@workspace/*`

---

### 6. Rollback Strategy

**Question**: If the rename causes unexpected issues, what's the safest rollback approach?

**Decision**: Git branch isolation + pre-merge validation gates ensure rollback is simply abandoning the branch

**Rationale**:
- **Git Safety**: All changes are on `011-rename-package-aliases` branch - main branch remains untouched
- **Atomic Commit**: Single commit containing all rename changes allows clean revert if needed post-merge
- **Validation Gates**: Success criteria (SC-001 through SC-006) must pass before merge - prevents broken state from entering main branch
- **No Data Impact**: Metadata-only change means no database migrations or data corruption risk

**Rollback Procedure** (if needed post-merge):
1. `git revert <commit-hash>` to create inverse commit
2. `pnpm install` to restore old symlinks
3. `pnpm check-types && pnpm build` to validate revert succeeded

**Alternatives Considered**:
- Incremental commits per workspace: Rejected - creates broken intermediate states that complicate rollback
- Feature flag: Not applicable - no runtime behavior to toggle

---

## Technology Stack Summary

| Component | Version | Purpose | Notes |
|-----------|---------|---------|-------|
| pnpm | 10.21.0 | Workspace package manager | Handles `workspace:*` protocol and package resolution |
| TypeScript | 5.9.2 | Type checking and compilation | Path mappings in tsconfig.json |
| TurboRepo | 2.5.4 | Monorepo build orchestration | Caching unaffected (no build logic changes) |
| Node.js | 20+ | Runtime environment | No runtime impact (compile-time only change) |
| Ultracite | 5.6.2 | Linting and formatting | Will validate import statement formatting |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missed import statement | Medium | High (build failure) | Automated grep + TypeScript type checking catches all misses |
| Stale tsconfig.json path mapping | Low | High (build failure) | Systematic grep for all tsconfig.json files |
| pnpm lockfile corruption | Very Low | Medium (reinstall required) | Backup current pnpm-lock.yaml before changes |
| Documentation drift | Low | Low (confusion) | Grep-based search for all markdown files with old alias |
| IDE cache issues | Medium | Low (developer annoyance) | Document IDE restart in quickstart.md |

**Overall Risk Level**: **LOW** - Metadata-only change with comprehensive validation gates. TypeScript compiler and pnpm tooling provide strong error detection.

---

## Open Questions

**None** - All technical clarifications resolved. Feature is ready for Phase 1 (Design & Contracts).

---

## Next Steps

Phase 1 deliverables:
1. **data-model.md**: Document the "entities" involved (Package Identifier, TypeScript Path Mapping, Import Statement)
2. **contracts/**: Define the expected state of package.json, tsconfig.json, and import statements post-rename
3. **quickstart.md**: Step-by-step guide for executing the rename safely
4. **Update agent context**: Add technology stack info to CLAUDE.md via update script
