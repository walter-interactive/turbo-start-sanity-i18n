# Feature Specification: Rename Package Aliases from @walter to @workspace

**Feature Branch**: `011-rename-package-aliases`
**Created**: 2025-11-15
**Status**: Draft
**Input**: User description: "I want to rename the alias @walter for the packages/sanity-atoms and packages/sanity-blocks to @workspace for consistency."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Imports Sanity Schemas (Priority: P1)

A developer needs to import Sanity schema definitions from the shared packages using the updated `@workspace` alias instead of the legacy `@walter` alias.

**Why this priority**: This is the most critical user journey because it affects all active development and ensures consistency across the monorepo package naming conventions.

**Independent Test**: Can be fully tested by running type checking (`pnpm check-types`) and build processes across all workspaces, verifying that all imports resolve correctly with the new alias.

**Acceptance Scenarios**:

1. **Given** the developer is working in `apps/template-studio`, **When** they import a schema using `import { imageSchema } from '@workspace/sanity-atoms/schemas/image'`, **Then** the import resolves successfully without errors
2. **Given** the developer is working in `apps/template-web`, **When** they import a fragment using `import { imageFragment } from '@workspace/sanity-atoms/fragments/image'`, **Then** the TypeScript compiler recognizes the import path
3. **Given** the developer runs the build process, **When** the build compiles all workspaces, **Then** no import resolution errors occur related to the renamed aliases

---

### User Story 2 - Package Dependencies Reference Correct Aliases (Priority: P1)

Package.json files across the monorepo reference the correct `@workspace` package names for internal dependencies, ensuring proper workspace resolution.

**Why this priority**: Equally critical as imports because pnpm workspace resolution depends on consistent package naming in package.json files.

**Independent Test**: Can be fully tested by running `pnpm install` and verifying all workspace dependencies resolve correctly, then running `pnpm list` to confirm dependency graph is valid.

**Acceptance Scenarios**:

1. **Given** `packages/sanity-blocks/package.json` has a dependency on sanity-atoms, **When** the dependency is declared as `"@workspace/sanity-atoms": "workspace:*"`, **Then** pnpm resolves the workspace dependency correctly
2. **Given** consuming applications like `apps/template-studio` depend on the shared packages, **When** they declare `"@workspace/sanity-blocks": "workspace:*"` in their package.json, **Then** the dependency is recognized and installed
3. **Given** a developer runs `pnpm install` after the changes, **When** the installation completes, **Then** all workspace packages are linked correctly without errors

---

### User Story 3 - TypeScript Path Mappings Align with New Aliases (Priority: P1)

TypeScript path mappings in tsconfig.json files throughout the monorepo use the `@workspace` prefix, enabling proper IDE autocomplete and type checking.

**Why this priority**: Critical for developer experience - without correct path mappings, IDE features like autocomplete, go-to-definition, and type checking fail.

**Independent Test**: Can be fully tested by opening the project in an IDE, attempting to import from the new aliases, and verifying autocomplete suggestions appear and type checking passes.

**Acceptance Scenarios**:

1. **Given** the root `tsconfig.json` contains path mappings for `@workspace/sanity-atoms/*` and `@workspace/sanity-blocks/*`, **When** a developer uses an IDE with TypeScript support, **Then** autocomplete suggestions appear for imports from these packages
2. **Given** workspace-specific tsconfig.json files extend the root configuration, **When** TypeScript compiler resolves imports, **Then** all path mappings align with the new `@workspace` prefix
3. **Given** a developer runs `tsc --noEmit` for type checking, **When** the command executes, **Then** no errors related to unresolved module paths occur

---

### Edge Cases

- What happens when old imports using `@walter` remain in the codebase after the rename?
  - Type checking and build processes should fail with clear "module not found" errors
- How does the system handle partial renames (e.g., only package.json updated but not tsconfig)?
  - Build and type checking should fail, preventing incomplete migrations from being committed
- What if external documentation or comments reference the old `@walter` alias?
  - Documentation and comments should be updated to reflect the new naming convention to avoid developer confusion

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Package names in `packages/sanity-atoms/package.json` and `packages/sanity-blocks/package.json` MUST be updated from `@walter/*` to `@workspace/*`
- **FR-002**: All internal dependencies referencing `@walter/sanity-atoms` or `@walter/sanity-blocks` in package.json files MUST be updated to use `@workspace/*` prefix
- **FR-003**: TypeScript path mappings in root `tsconfig.json` MUST be updated from `@walter/*` to `@workspace/*` for both schemas and fragments
- **FR-004**: All TypeScript import statements across the codebase MUST be updated from `@walter/(sanity-atoms|sanity-blocks)` to `@workspace/(sanity-atoms|sanity-blocks)`
- **FR-005**: All workspace-specific tsconfig.json files with custom path mappings MUST be updated to use `@workspace/*` prefix
- **FR-006**: Documentation files (README.md, CLAUDE.md, spec files) referencing the old alias MUST be updated to reflect the new naming convention
- **FR-007**: Type checking MUST pass for all workspaces after the rename (`pnpm check-types`)
- **FR-008**: Build processes MUST succeed for all workspaces after the rename
- **FR-009**: Dependency installation MUST complete without errors (`pnpm install`)

### Key Entities

- **Package Identifier**: The scoped package name (e.g., `@workspace/sanity-atoms`) used in package.json "name" field and as dependency references
- **TypeScript Path Mapping**: Key-value pairs in tsconfig.json "paths" that map import aliases to physical file locations
- **Import Statement**: TypeScript/JavaScript import declarations that reference packages using the scoped alias

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero TypeScript compilation errors occur when running `pnpm check-types` across all workspaces
- **SC-002**: Zero build failures occur when running build commands for all workspaces
- **SC-003**: Zero module resolution errors occur during `pnpm install` and dependency installation completes successfully
- **SC-004**: 100% of import statements use the new `@workspace/*` alias (zero references to old `@walter/*` alias remain in code)
- **SC-005**: All IDE autocomplete features work correctly when importing from `@workspace/sanity-atoms` and `@workspace/sanity-blocks`
- **SC-006**: Documentation and comments referencing package aliases are updated to use `@workspace/*` prefix (manual verification)
