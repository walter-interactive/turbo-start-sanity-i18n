# Implementation Plan: Rename Package Aliases from @walter to @workspace

**Branch**: `011-rename-package-aliases` | **Date**: 2025-11-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-rename-package-aliases/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature renames the package aliases for `packages/sanity-atoms` and `packages/sanity-blocks` from `@walter/*` to `@workspace/*` for consistency across the monorepo. The rename affects package.json "name" fields, dependency declarations, TypeScript path mappings in tsconfig.json files, and all import statements across the codebase. The goal is to establish consistent naming conventions that align with existing workspace packages like `@workspace/typescript-config`.

## Technical Context

**Language/Version**: TypeScript 5.9.2, Node.js 20+
**Primary Dependencies**: TurboRepo 2.5.4, pnpm 10.21.0 (workspace management), TypeScript compiler
**Storage**: N/A (metadata-only rename, no data persistence)
**Testing**: TypeScript type checking (`pnpm check-types`), build validation (`pnpm build`), dependency resolution (`pnpm install`)
**Target Platform**: Node.js development environment (monorepo tooling)
**Project Type**: Monorepo configuration (affects multiple workspaces: apps/template-studio, apps/template-web, packages/sanity-atoms, packages/sanity-blocks)
**Performance Goals**: Zero build time increase, zero runtime impact (compile-time only change)
**Constraints**: Must maintain backward compatibility for workspace dependencies, must not break any builds or type checking
**Scale/Scope**: 52 files containing references to `@walter/sanity-atoms` or `@walter/sanity-blocks` (identified via grep), 7 tsconfig.json files, 4 affected workspaces

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Monorepo Structure & Boundaries** | ✅ PASS | Rename preserves workspace boundaries. Package dependencies remain explicit via workspace:* protocol. No impact on build independence. |
| **II. TypeScript Strict Mode & Type Safety** | ✅ PASS | Rename is purely nominal - no type signatures change. Type checking enforced via success criteria (SC-001). No use of `any` type. |
| **III. Test Coverage (MANDATORY)** | ✅ PASS | Feature is metadata-only (package names, import paths). Tests validate via existing type checking and build processes. No new runtime logic requiring unit tests. |
| **IV. Component Modularity & Reusability** | ✅ N/A | Not applicable - no components modified, only import paths updated. |
| **V. API Contracts & Versioning** | ✅ PASS | Internal workspace dependencies only. No public API exposure. Breaking change contained within monorepo via atomic rename. |
| **VI. Internationalization (i18n) First** | ✅ N/A | Not applicable - no user-facing text involved. |
| **VII. Code Quality & Observability** | ✅ PASS | Linting and formatting enforced via Ultracite. Build and type-check validated via success criteria (SC-001, SC-002). |

**Pre-Merge Quality Gates**:
- ✅ TypeScript compilation: Covered by SC-001 (`pnpm check-types`)
- ✅ Linting: Will pass Ultracite checks (import path changes only)
- ✅ Tests: Validated via type checking and build success
- ✅ Build: Covered by SC-002 (all workspaces must build)
- ✅ Documentation: Covered by FR-006 (update docs referencing old alias)

**Verdict**: ✅ **PASS** - All applicable constitutional principles satisfied. No violations requiring justification.

---

**Post-Phase 1 Re-evaluation** (2025-11-15):

After completing Phase 1 design artifacts (research.md, data-model.md, contracts/, quickstart.md), the Constitution Check remains **✅ PASS**. Key confirmations:

- **Principle III (Test Coverage)**: Validated via contract-based testing approach in `contracts/README.md` - comprehensive validation through type checking, build processes, and grep-based verification ensures correctness
- **Principle VII (Code Quality)**: Success criteria explicitly require `pnpm check-types` and `pnpm build` to pass, ensuring quality gates are enforced
- **Documentation Requirements**: quickstart.md provides comprehensive implementation guide; contracts provide validation specs

No new violations introduced. All design decisions align with constitutional principles.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Monorepo structure (TurboRepo + pnpm workspaces)
/
├── apps/
│   ├── template-studio/        # Sanity Studio app (imports @workspace/sanity-*)
│   │   ├── package.json        # Dependencies: @workspace/sanity-blocks, @workspace/sanity-atoms
│   │   ├── tsconfig.json       # May have custom path mappings
│   │   └── schemaTypes/        # Import statements using @workspace/*
│   └── template-web/           # Next.js web app (imports @workspace/sanity-*)
│       ├── package.json        # Dependencies: @workspace/sanity-blocks, @workspace/sanity-atoms
│       ├── tsconfig.json       # May have custom path mappings
│       └── src/lib/sanity/     # Import statements using @workspace/*
│
├── packages/
│   ├── sanity-atoms/           # 🎯 PRIMARY TARGET: Rename @walter → @workspace
│   │   ├── package.json        # "name": "@walter/sanity-atoms" → "@workspace/sanity-atoms"
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── *.schema.ts
│   │       └── *.fragment.ts
│   ├── sanity-blocks/          # 🎯 PRIMARY TARGET: Rename @walter → @workspace
│   │   ├── package.json        # "name": "@walter/sanity-blocks" → "@workspace/sanity-blocks"
│   │   │                       # Dependencies: "@walter/sanity-atoms" → "@workspace/sanity-atoms"
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── *.schema.ts
│   │       └── *.fragment.ts
│   ├── i18n-config/
│   ├── ui/
│   └── typescript-config/      # Already uses @workspace prefix (reference example)
│
├── tsconfig.json               # Root config with path mappings @walter/* → @workspace/*
├── package.json                # Root workspace config
├── pnpm-workspace.yaml         # pnpm workspace definition
└── specs/
    └── 011-rename-package-aliases/  # This feature's documentation
```

**Structure Decision**: This is a TurboRepo monorepo with pnpm workspaces. The feature affects **configuration and metadata files only** - no source code logic changes. The rename cascades through:

1. **Package identity**: `packages/sanity-atoms/package.json` and `packages/sanity-blocks/package.json` "name" fields
2. **Dependencies**: References to `@walter/sanity-atoms` in `packages/sanity-blocks/package.json` and consuming apps
3. **Path mappings**: Root `tsconfig.json` and workspace-specific tsconfig.json files
4. **Import statements**: All TypeScript files importing from `@walter/sanity-atoms` or `@walter/sanity-blocks`
5. **Documentation**: README.md, CLAUDE.md, and spec files referencing the old alias

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - table not needed. Constitution Check passed all applicable principles.
