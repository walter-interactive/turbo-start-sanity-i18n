# Research: Multi-Tenant Agency Template Architecture

**Feature**: 008-multi-tenant-template
**Date**: 2025-11-14
**Status**: Complete

## Overview

This document consolidates research findings for transforming the monorepo into a multi-tenant agency template architecture. Since this is a code reorganization refactor (not introducing new technologies), research focuses on best practices for:

1. Monorepo package organization patterns
2. File naming conventions (flat vs nested structures)
3. Dependency management in workspaces
4. Migration strategies for preserving git history
5. Atomic design principles for CMS schemas

## Research Areas

### 1. Flat vs Nested Directory Structures for Shared Packages

**Research Question**: Should package source files use flat structure (all files in `src/`) or nested structure (files grouped in subdirectories like `src/hero-section/`)?

**Decision**: **Flat structure with camelCase file naming**

**Rationale**:

**Advantages of Flat Structure**:
- **Faster file location**: Developer can scan all files in single directory (<5 seconds, measured in SC-004)
- **Simpler import paths**: `import { heroSectionSchema } from './heroSection.schema'` vs `import { heroSectionSchema } from './hero-section/hero-section.schema'`
- **Reduced TypeScript path resolution complexity**: Fewer directory traversals
- **Better grep/search performance**: All files at same depth
- **No "which directory?" cognitive overhead**: Only one place to look
- **Easier refactoring**: Moving files doesn't require updating nested paths
- **Scales linearly**: Adding more blocks doesn't create deeper nesting

**Disadvantages of Flat Structure**:
- Can become crowded with many files (mitigated by clear naming convention)
- No visual grouping of related files in file explorer (mitigated by file naming prefix: `heroSection.schema.ts`, `heroSection.fragment.ts`)

**Alternatives Considered**:
- **Nested structure** (current state): `src/hero-section/hero-section.schema.ts`
  - Rejected: Adds cognitive overhead, slower file location, more complex imports
  - Observation: Current codebase only has 3 blocks, already creating navigation friction
- **Hybrid approach**: Flat for simple files, nested for complex blocks
  - Rejected: Inconsistency creates confusion about where to put new files

**Evidence from Industry**:
- **React**: Core library uses flat structure for hooks (`react/src/`)
- **Vue**: Flat structure for reactivity system (`vue/packages/reactivity/src/`)
- **Turborepo examples**: Many examples use flat src/ for packages
- **Sanity.io patterns**: Official Sanity examples often use flat schemas directories

**Supporting References**:
- Constraint C-004: "Must use flat file structure with camelCase naming"
- Success Criteria SC-004: "Developer can locate any block schema file in under 5 seconds"
- Assumption A-011: "CamelCase naming... to simplify imports and align with TypeScript/JavaScript conventions"

---

### 2. File Naming Conventions: kebab-case vs camelCase

**Research Question**: Should files use `kebab-case` (hero-section.schema.ts) or `camelCase` (heroSection.schema.ts)?

**Decision**: **camelCase for file names**

**Rationale**:

**Advantages of camelCase**:
- **Aligns with TypeScript/JavaScript conventions**: Variables, functions, properties all use camelCase
- **Import-export consistency**: `export const heroSectionSchema` matches `heroSection.schema.ts`
- **Less mental translation**: No need to convert kebab-case filename to camelCase variable name
- **Simpler for generated code**: Tools can derive filenames from variable names directly
- **Follows existing patterns**: Many TypeScript projects use camelCase files (Remix, tRPC, Drizzle ORM)

**Disadvantages of camelCase**:
- Less common in web ecosystem (many projects use kebab-case)
- Case-insensitive filesystems (macOS, Windows) can cause issues if files differ only in case
  - Mitigated: Our naming convention prevents same-name files with different casing

**Alternatives Considered**:
- **kebab-case**: `hero-section.schema.ts`
  - Rejected: Requires mental translation from filename to export name
  - Creates inconsistency: `import { heroSectionSchema } from './hero-section.schema'`
- **PascalCase**: `HeroSection.schema.ts`
  - Rejected: PascalCase typically reserved for classes/components in TypeScript
  - Schemas are exported as const values (camelCase convention)

**Supporting References**:
- Assumption A-011: "CamelCase naming (e.g., `heroSection.schema.ts`) is preferred over kebab-case for flat file structure to simplify imports and align with TypeScript/JavaScript conventions"
- Constraint C-004: "Must use flat file structure with camelCase naming (e.g., `heroSection.schema.ts`) for simplicity and TypeScript/JavaScript alignment"

---

### 3. Atomic Design Principles for Sanity Schemas

**Research Question**: How should we organize Sanity schema types to maximize reusability and consistency?

**Decision**: **Atomic Content Types (atoms) as separate package**

**Rationale**:

**Atomic Design Hierarchy** (adapted for Sanity CMS):
1. **Atoms** (`@walter/sanity-atoms`): Primitive field definitions (buttons, image, richText)
   - Smallest reusable units
   - No dependencies on other atoms
   - Used across multiple blocks and documents
2. **Molecules/Blocks** (`@walter/sanity-blocks`): Composed sections (heroSection, cta)
   - Compose multiple atoms
   - Depend on atoms package
   - Reusable across pages/documents
3. **Organisms/Documents** (future `@walter/sanity-documents`): Full content types (page, blog post)
   - Compose blocks
   - Depend on blocks package (which depends on atoms)

**Benefits of Separation**:
- **Single source of truth**: All buttons use same schema definition
- **Consistency**: Changing button schema updates all blocks automatically
- **Dependency clarity**: atoms → blocks → documents (clear hierarchy)
- **Independent versioning**: Can version atoms separately from blocks
- **Reduced duplication**: Button schema defined once, imported everywhere

**Alternatives Considered**:
- **Keep atoms in blocks package**: `@walter/sanity-blocks/src/shared/`
  - Rejected: Violates separation of concerns; atoms should be independently reusable
  - Creates unclear dependency: are atoms "part of blocks" or "used by blocks"?
- **Inline atoms in each block**:
  - Rejected: Maximum duplication; inconsistency across blocks

**Industry Patterns**:
- **Atomic Design** (Brad Frost): Proven methodology for component systems
- **Design Systems**: Separate primitive components from composed components
- **Sanity Plugins**: Official plugins often provide reusable field definitions

**Supporting References**:
- User Story 4: "Developer Manages Shared Atomic Content Types (Priority: P1)"
- Key Entity: "Atomic Content Type: A reusable, foundational Sanity field definition... These are the smallest building blocks"
- Constraint C-007: "Must maintain clear separation of concerns: atoms are primitive fields, blocks compose atoms into reusable sections"
- FR-009 to FR-019: All requirements for creating atoms package
- FR-036: "Block schemas MUST import atomic types from `@walter/sanity-atoms/schemas`"

---

### 4. Workspace Package Naming: @workspace vs @walter

**Research Question**: Should shared packages use `@workspace/*` scope or `@walter/*` scope?

**Decision**: **@walter/* for shared packages**

**Rationale**:

**Advantages of @walter/***:
- **Agency branding**: Represents the agency identity (Walter Interactive)
- **Clear ownership**: Indicates these are agency-maintained packages
- **Distinguishes from project scope**: `@workspace` feels generic; `@walter` is specific
- **Future publishing potential**: If packages become open-source, `@walter` is publishable scope
- **Consistent with client naming**: Future client packages can use `@clientname` scopes

**Disadvantages of @walter/***:
- Requires updating existing imports from `@workspace/sanity` to `@walter/sanity-blocks`
  - Acceptable: Part of the refactoring work (FR-037, FR-038)

**Alternatives Considered**:
- **@workspace/***: Generic workspace scope
  - Rejected: Lacks identity; doesn't represent agency ownership
- **@turbo-start-sanity-i18n/***: Project name as scope
  - Rejected: Too long; project name may change; not agency-branded

**Supporting References**:
- Assumption A-009: "The workspace scope `@walter` is preferred over `@workspace` for shared packages to better represent the agency brand"
- FR-010: `name: "@walter/sanity-atoms"`
- FR-021: `name: "@walter/sanity-blocks"`

---

### 5. Migration Strategy: Preserving Git History

**Research Question**: How should we rename/move files while preserving git history for `git blame` and `git log`?

**Decision**: **Use `git mv` for all file relocations**

**Rationale**:

**Git History Preservation**:
- `git mv old-path new-path` preserves file history automatically
- Git detects renames/moves up to ~50% content similarity (configurable with `diff.renameLimit`)
- Helps with:
  - `git blame` shows original authors of code
  - `git log --follow` tracks file across renames
  - Code archaeology remains possible

**Best Practices**:
1. **Separate commits**: Move files in one commit, modify content in separate commit
   - Helps git detect renames more reliably
2. **Avoid simultaneous rename + modification**: Keep moves and edits separate where possible
3. **Directory renames**: Use `git mv` for entire directories when renaming packages

**Migration Sequence** (from implementation perspective):
1. Create new `packages/sanity-atoms/` structure (new files, so no history to preserve)
2. Use `git mv` to rename `packages/sanity/` → `packages/sanity-blocks/`
3. Use `git mv` to move block files from nested to flat structure
4. Update imports/package.json in separate commit after moves complete
5. Use `git mv` to rename `apps/studio/` → `apps/template-studio/`
6. Use `git mv` to rename `apps/web/` → `apps/template-web/`

**Supporting References**:
- FR-001, FR-002: App directory renaming
- FR-020: Package directory renaming
- FR-025 to FR-030: Block file migrations

---

### 6. Package.json Exports Pattern for Sub-paths

**Research Question**: What's the best pattern for exporting schemas and fragments from packages?

**Decision**: **Sub-path exports with TypeScript entry points**

**Rationale**:

**Package.json Exports Configuration**:
```json
{
  "name": "@walter/sanity-blocks",
  "exports": {
    "./schemas": "./src/schemas.ts",
    "./fragments": "./src/fragments.ts"
  }
}
```

**Benefits**:
- **Explicit API surface**: Only exports what's intended for consumers
- **Tree-shakeable**: Consumers import only what they need
- **TypeScript-friendly**: Direct TypeScript entry points (no compilation needed for workspace packages)
- **Clear separation**: Schemas vs fragments as distinct imports
- **Prevents deep imports**: Consumers can't directly import internal files

**Usage in Consuming Apps**:
```typescript
// Studio app
import { heroSectionSchema, allBlockSchemas } from '@walter/sanity-blocks/schemas'

// Web app
import { heroSectionFragment } from '@walter/sanity-blocks/fragments'
```

**Alternatives Considered**:
- **Single default export**: `import * as blocks from '@walter/sanity-blocks'`
  - Rejected: Less tree-shakeable; mixes schemas and fragments
- **Separate packages**: `@walter/sanity-blocks-schemas` and `@walter/sanity-blocks-fragments`
  - Rejected: Unnecessarily splits closely related code; harder to maintain
- **Deep imports**: `import { heroSectionSchema } from '@walter/sanity-blocks/src/heroSection.schema'`
  - Rejected: Exposes internal structure; breaks encapsulation

**Supporting References**:
- FR-011, FR-012: Atoms package exports
- FR-023, FR-024: Blocks package exports
- FR-016: "Package MUST export schemas via `./schemas` export path"
- User Story 3 Acceptance #4: "developer imports from `@walter/sanity-blocks/schemas` or `@walter/sanity-blocks/fragments`"

---

### 7. Template App Naming Convention

**Research Question**: How should we distinguish template apps from future client apps?

**Decision**: **`template-*` prefix for reference implementations**

**Rationale**:

**Naming Strategy**:
- **Template apps**: `template-studio`, `template-web` (reference implementations)
- **Client apps** (future): `client-a-studio`, `client-a-web`, `client-b-studio`, etc.

**Benefits**:
- **Immediately identifiable**: Developer knows at a glance which apps are templates
- **Prevents accidental edits**: Clear distinction reduces risk of modifying client work
- **Scales with clients**: Pattern supports unlimited client projects
- **Consistent with industry**: Many templates/starters use `template-` prefix

**Alternatives Considered**:
- **`reference-*` prefix**: `reference-studio`
  - Rejected: "Template" better conveys "use this as starting point"
- **`agency-*` prefix**: `agency-studio`
  - Rejected: Less clear; could be confused with agency's own website
- **`_template` suffix**: `studio_template`
  - Rejected: Suffix less visible when scanning directory lists alphabetically

**Supporting References**:
- FR-001, FR-002: Renaming apps with `template-` prefix
- User Story 2: "Template apps serve as the 'source of truth' for best practices"
- Success Criteria SC-001: "Developer can navigate to `apps/` directory and immediately distinguish template apps from client apps by directory name (100% clarity)"

---

## Summary of Decisions

| Decision Area | Choice | Key Rationale |
|---------------|--------|---------------|
| **Directory Structure** | Flat structure (`src/*.ts`) | Faster file location, simpler imports, better scalability |
| **File Naming** | camelCase (`heroSection.schema.ts`) | Aligns with TypeScript conventions, reduces mental translation |
| **Atoms Package** | Separate `@walter/sanity-atoms` | Atomic design principles, clear dependency hierarchy |
| **Package Scope** | `@walter/*` | Agency branding, clear ownership |
| **Git Migration** | Use `git mv` | Preserves file history for blame/log |
| **Package Exports** | Sub-path exports (`./schemas`, `./fragments`) | Explicit API surface, tree-shakeable |
| **Template Naming** | `template-*` prefix | Immediate identification, prevents accidental edits |

## Implementation Notes

**No Additional Research Required**: All technical decisions are resolved. The implementation is straightforward file/directory reorganization with well-established patterns.

**Key Success Factors**:
1. Maintain backward compatibility (schema names unchanged)
2. Use `git mv` to preserve history
3. Update all import paths in apps after package restructuring
4. Verify build/type-check passes after each major migration step
5. Test Studio and Web apps manually after completion

**Risk Mitigation**:
- TypeScript compiler will catch all broken imports (FR-042)
- Build system will catch dependency resolution issues (FR-043)
- Success criteria define measurable acceptance tests (SC-005 to SC-012)
