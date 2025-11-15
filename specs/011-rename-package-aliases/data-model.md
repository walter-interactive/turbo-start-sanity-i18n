# Data Model: Rename Package Aliases from @walter to @workspace

**Date**: 2025-11-15
**Feature**: 011-rename-package-aliases

## Overview

This feature is a **metadata-only transformation** - no runtime data structures or business entities are involved. Instead, the "entities" are configuration artifacts in the monorepo that define package identity, dependency relationships, and module resolution.

This document models these configuration entities and their relationships to ensure complete and consistent rename across all affected files.

---

## Entity Definitions

### 1. Package Identifier

**Definition**: The canonical name of a workspace package as declared in its `package.json` "name" field.

**Purpose**: Serves as the primary key for package resolution in pnpm workspaces and npm ecosystem.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `name` | string | Must match npm package name spec: `@scope/package-name` | The scoped package name (e.g., `@workspace/sanity-atoms`) |
| `scope` | string | Must start with `@`, lowercase, no spaces | The namespace prefix (e.g., `@workspace`) |
| `packageName` | string | Lowercase, hyphens allowed, no spaces | The package identifier within the scope (e.g., `sanity-atoms`) |
| `filePath` | string | Absolute path to package.json | Location of the package.json file declaring this identifier |

**Validation Rules**:
- `name` must be unique across all workspace packages
- `name` must follow npm naming conventions (no uppercase, no special chars except `-` and `/`)
- `scope` must match the new convention: `@workspace`

**Current State** (before rename):
| Package | Current Name | File Path |
|---------|--------------|-----------|
| sanity-atoms | `@walter/sanity-atoms` | `/packages/sanity-atoms/package.json` |
| sanity-blocks | `@walter/sanity-blocks` | `/packages/sanity-blocks/package.json` |

**Target State** (after rename):
| Package | New Name | File Path |
|---------|----------|-----------|
| sanity-atoms | `@workspace/sanity-atoms` | `/packages/sanity-atoms/package.json` |
| sanity-blocks | `@workspace/sanity-blocks` | `/packages/sanity-blocks/package.json` |

---

### 2. Package Dependency Reference

**Definition**: A reference to a workspace package from another package's `dependencies`, `devDependencies`, or `peerDependencies` field.

**Purpose**: Declares that a workspace package depends on another workspace package, enabling pnpm to resolve and link them correctly.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `dependentPackage` | string | Must be a valid Package Identifier | The package declaring the dependency (e.g., `@workspace/sanity-blocks`) |
| `dependencyName` | string | Must match a Package Identifier `name` | The package being depended upon (e.g., `@workspace/sanity-atoms`) |
| `versionSpec` | string | Typically `workspace:*` for internal deps | The version or workspace protocol |
| `dependencyType` | enum | `dependencies` \| `devDependencies` \| `peerDependencies` | Which dependency section contains this reference |
| `filePath` | string | Absolute path to package.json | Location of the package.json file declaring this dependency |

**Validation Rules**:
- `dependencyName` must exist as a valid Package Identifier in the workspace
- `versionSpec` should use `workspace:*` for internal dependencies (ensures pnpm resolves to local package)
- No circular dependencies (though unaffected by rename)

**Current State** (before rename):
| Dependent Package | Dependency Name | Version Spec | Dependency Type | File Path |
|-------------------|-----------------|--------------|-----------------|-----------|
| `@walter/sanity-blocks` | `@walter/sanity-atoms` | `workspace:*` | `dependencies` | `/packages/sanity-blocks/package.json` |
| `apps/template-studio` | `@walter/sanity-blocks` | `workspace:*` | `dependencies` | `/apps/template-studio/package.json` |
| `apps/template-studio` | `@walter/sanity-atoms` | `workspace:*` | `dependencies` | `/apps/template-studio/package.json` |
| `apps/template-web` | `@walter/sanity-blocks` | `workspace:*` | `dependencies` | `/apps/template-web/package.json` |
| `apps/template-web` | `@walter/sanity-atoms` | `workspace:*` | `dependencies` | `/apps/template-web/package.json` |

**Target State** (after rename):
| Dependent Package | Dependency Name | Version Spec | Dependency Type | File Path |
|-------------------|-----------------|--------------|-----------------|-----------|
| `@workspace/sanity-blocks` | `@workspace/sanity-atoms` | `workspace:*` | `dependencies` | `/packages/sanity-blocks/package.json` |
| `apps/template-studio` | `@workspace/sanity-blocks` | `workspace:*` | `dependencies` | `/apps/template-studio/package.json` |
| `apps/template-studio` | `@workspace/sanity-atoms` | `workspace:*` | `dependencies` | `/apps/template-studio/package.json` |
| `apps/template-web` | `@workspace/sanity-blocks` | `workspace:*` | `dependencies` | `/apps/template-web/package.json` |
| `apps/template-web` | `@workspace/sanity-atoms` | `workspace:*` | `dependencies` | `/apps/template-web/package.json` |

---

### 3. TypeScript Path Mapping

**Definition**: A key-value pair in `tsconfig.json` "paths" that maps an import alias to physical file paths for TypeScript module resolution.

**Purpose**: Enables TypeScript compiler and IDEs to resolve imports like `import { schema } from '@workspace/sanity-atoms/schemas/image'` to the actual file `./packages/sanity-atoms/src/image.schema.ts`.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `alias` | string | Must match package name + path pattern | The import path pattern (e.g., `@workspace/sanity-atoms/schemas/*`) |
| `physicalPaths` | string[] | Array of file path patterns | Actual file locations (e.g., `["./packages/sanity-atoms/src/*.schema.ts"]`) |
| `configFile` | string | Absolute path to tsconfig.json | The tsconfig.json file containing this mapping |
| `scope` | enum | `root` \| `workspace` | Whether this is in root tsconfig or workspace-specific config |

**Validation Rules**:
- `alias` must match the Package Identifier `name` plus a valid subpath (e.g., `/schemas/*`, `/fragments/*`)
- `physicalPaths` must point to existing files or valid glob patterns
- No conflicting aliases (same alias mapping to different paths)

**Current State** (before rename):
| Alias | Physical Paths | Config File | Scope |
|-------|----------------|-------------|-------|
| `@walter/sanity-atoms/schemas/*` | `["./packages/sanity-atoms/src/*.schema.ts"]` | `/tsconfig.json` | root |
| `@walter/sanity-atoms/fragments/*` | `["./packages/sanity-atoms/src/*.fragment.ts"]` | `/tsconfig.json` | root |
| `@walter/sanity-blocks/schemas/*` | `["./packages/sanity-blocks/src/*.schema.ts"]` | `/tsconfig.json` | root |
| `@walter/sanity-blocks/fragments/*` | `["./packages/sanity-blocks/src/*.fragment.ts"]` | `/tsconfig.json` | root |

**Target State** (after rename):
| Alias | Physical Paths | Config File | Scope |
|-------|----------------|-------------|-------|
| `@workspace/sanity-atoms/schemas/*` | `["./packages/sanity-atoms/src/*.schema.ts"]` | `/tsconfig.json` | root |
| `@workspace/sanity-atoms/fragments/*` | `["./packages/sanity-atoms/src/*.fragment.ts"]` | `/tsconfig.json` | root |
| `@workspace/sanity-blocks/schemas/*` | `["./packages/sanity-blocks/src/*.schema.ts"]` | `/tsconfig.json` | root |
| `@workspace/sanity-blocks/fragments/*` | `["./packages/sanity-blocks/src/*.fragment.ts"]` | `/tsconfig.json` | root |

**Notes**:
- Workspace-specific tsconfig.json files may also contain custom path mappings - these must be identified via grep
- Path mappings in nested configs can override root config mappings

---

### 4. Import Statement

**Definition**: A TypeScript/JavaScript import declaration that references a package using a scoped alias.

**Purpose**: Allows source code to import types, functions, or values from workspace packages.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `importPath` | string | Must match a Package Identifier name + subpath | The module specifier (e.g., `@workspace/sanity-atoms/schemas/image`) |
| `importedSymbols` | string[] | Valid exported identifiers | Names being imported (e.g., `["imageSchema"]`) |
| `importType` | enum | `named` \| `default` \| `namespace` \| `type` | Import statement style |
| `sourceFile` | string | Absolute path to .ts/.tsx file | The file containing this import statement |
| `lineNumber` | number | Positive integer | Line number of the import statement |

**Validation Rules**:
- `importPath` must match a valid TypeScript Path Mapping `alias` pattern
- `importedSymbols` must be exported by the target module (validated by TypeScript compiler)

**Current State** (before rename):
- 52 files contain import statements with `@walter/sanity-atoms` or `@walter/sanity-blocks`
- Exact locations identified via `grep -rn "@walter/sanity-atoms\|@walter/sanity-blocks" --include="*.ts" --include="*.tsx"`

**Target State** (after rename):
- All 52 files have import paths updated from `@walter/sanity-*` to `@workspace/sanity-*`
- No files contain `@walter/sanity-atoms` or `@walter/sanity-blocks` imports
- TypeScript compiler validates all imports resolve correctly (`pnpm check-types` passes)

**Example Transformation**:
```typescript
// BEFORE
import { imageSchema } from '@walter/sanity-atoms/schemas/image'
import { heroSectionFragment } from '@walter/sanity-blocks/fragments/hero-section'

// AFTER
import { imageSchema } from '@workspace/sanity-atoms/schemas/image'
import { heroSectionFragment } from '@workspace/sanity-blocks/fragments/hero-section'
```

---

## Entity Relationships

```
┌─────────────────────┐
│ Package Identifier  │
│ (package.json name) │
└──────────┬──────────┘
           │
           │ 1:N (a package can be depended upon by many packages)
           │
           ▼
┌─────────────────────────┐
│ Package Dependency Ref  │
│ (package.json deps)     │
└──────────┬──────────────┘
           │
           │ 1:N (a package can have many path mappings)
           │
           ▼
┌─────────────────────────┐
│ TypeScript Path Mapping │
│ (tsconfig.json paths)   │
└──────────┬──────────────┘
           │
           │ 1:N (a path mapping can be used in many import statements)
           │
           ▼
┌─────────────────────────┐
│ Import Statement        │
│ (source code imports)   │
└─────────────────────────┘
```

**Relationship Rules**:
1. A **Package Identifier** change cascades to all **Package Dependency References** that reference it
2. A **Package Identifier** change cascades to all **TypeScript Path Mappings** that use it as an alias
3. A **TypeScript Path Mapping** change cascades to all **Import Statements** that use the old alias pattern
4. All four entity types must be updated atomically to maintain consistency

---

## State Transition

**Preconditions**:
- Current state: All entities use `@walter/sanity-atoms` and `@walter/sanity-blocks`
- Git branch: `011-rename-package-aliases`
- No uncommitted changes in workspace packages

**Transformation Sequence** (must be atomic):
1. **Update Package Identifiers**: Modify `name` field in `packages/sanity-atoms/package.json` and `packages/sanity-blocks/package.json`
2. **Update Package Dependency References**: Find-replace all `@walter/sanity-*` in package.json `dependencies` sections
3. **Update TypeScript Path Mappings**: Find-replace all `@walter/sanity-*` in tsconfig.json `paths` sections
4. **Update Import Statements**: Find-replace all `@walter/sanity-*` in .ts/.tsx files
5. **Reinstall Dependencies**: Run `pnpm install` to update pnpm-lock.yaml and node_modules symlinks
6. **Validate Transformation**: Run `pnpm check-types && pnpm build`

**Postconditions**:
- All entities use `@workspace/sanity-atoms` and `@workspace/sanity-blocks`
- Zero references to `@walter/sanity-atoms` or `@walter/sanity-blocks` in codebase (verified via grep)
- TypeScript compilation succeeds
- Build succeeds
- pnpm-lock.yaml reflects new package names

---

## Validation Queries

**Query 1: Find all Package Identifiers to rename**
```bash
grep -r '"name":.*@walter/sanity' --include="package.json"
# Expected: 2 results (sanity-atoms, sanity-blocks)
```

**Query 2: Find all Package Dependency References to update**
```bash
grep -r '"@walter/sanity-atoms"\|"@walter/sanity-blocks"' --include="package.json"
# Expected: 5 results (sanity-blocks deps on atoms, studio deps on both, web deps on both)
```

**Query 3: Find all TypeScript Path Mappings to update**
```bash
grep -r '@walter/sanity-atoms\|@walter/sanity-blocks' --include="tsconfig.json"
# Expected: At least root tsconfig.json, possibly workspace-specific configs
```

**Query 4: Find all Import Statements to update**
```bash
grep -rn '@walter/sanity-atoms\|@walter/sanity-blocks' --include="*.ts" --include="*.tsx" --exclude-dir=node_modules
# Expected: 52 files (identified in Technical Context)
```

**Query 5: Verify no old aliases remain (post-transformation)**
```bash
grep -r '@walter/sanity' --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" --exclude-dir=node_modules --exclude-dir=specs
# Expected: 0 results (except in old spec files if we decide to preserve historical context)
```

---

## Edge Cases

### Case 1: Workspace-specific tsconfig.json with custom path mappings

**Scenario**: `apps/template-studio/tsconfig.json` extends root config but overrides path mappings

**Detection**: Grep all tsconfig.json files for `@walter/sanity-*`

**Resolution**: Update custom path mappings in workspace-specific configs in addition to root config

---

### Case 2: Type-only imports

**Scenario**: Import statements using `import type { ... } from '@walter/sanity-atoms/schemas/image'`

**Detection**: Same grep pattern catches both `import` and `import type`

**Resolution**: No special handling needed - find-replace updates all import variants

---

### Case 3: Dynamic imports

**Scenario**: Code using `import('@walter/sanity-atoms/schemas/image')` (dynamic import syntax)

**Detection**: Same grep pattern catches string literals in dynamic imports

**Resolution**: Find-replace updates string literals in dynamic imports

---

### Case 4: Re-exported types

**Scenario**: A package re-exports types from `@walter/sanity-*` packages

**Detection**: Grep catches `export { ... } from '@walter/sanity-atoms'` patterns

**Resolution**: Find-replace updates export-from statements

---

### Case 5: pnpm-lock.yaml references

**Scenario**: pnpm-lock.yaml contains old package names

**Detection**: Implicit - `pnpm install` regenerates lockfile

**Resolution**: No manual edits needed - `pnpm install` automatically updates lockfile based on new package.json names

---

## Summary

This feature transforms **4 entity types**:
1. **2 Package Identifiers** (sanity-atoms, sanity-blocks)
2. **5+ Package Dependency References** (sanity-blocks → atoms, studio → both, web → both)
3. **4+ TypeScript Path Mappings** (root tsconfig.json, possibly workspace configs)
4. **52+ Import Statements** (all .ts/.tsx files importing from these packages)

All transformations are **metadata-only** - no runtime data structures or business logic changes. Validation is achieved through TypeScript compiler type checking and build processes, ensuring completeness and correctness.
