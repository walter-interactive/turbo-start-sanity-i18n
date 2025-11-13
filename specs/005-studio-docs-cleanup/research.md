# Research: Studio Documentation Best Practices

**Feature**: Studio Documentation & Code Organization
**Date**: 2025-11-12
**Status**: Complete

## Overview

This document consolidates research findings for creating comprehensive documentation for apps/studio to enable team handoff. Since this is a documentation-only feature with no code functionality changes, research focuses on documentation best practices, understanding the existing codebase structure, and identifying areas requiring detailed explanation.

## Research Areas

### 1. Documentation Strategy for Sanity Studio Projects

**Decision**: Multi-layered documentation approach with README.md as primary entry point + inline JSDoc comments for code context

**Rationale**:
- **Progressive disclosure**: README provides high-level overview and navigation, inline comments provide deep technical detail
- **Searchability**: Developers can use Cmd+F in README for quick lookup, IDE IntelliSense for inline comments
- **Maintenance**: Inline comments stay with code during refactoring, reducing documentation drift
- **Onboarding efficiency**: New developers read README first for mental model, then dive into code with comments as guide

**Alternatives considered**:
- **Separate documentation website/wiki**: Rejected - adds maintenance burden, requires context switching, likely to go stale
- **Video tutorials**: Rejected - harder to maintain, not searchable, time-consuming to create/update
- **TypeDoc auto-generation**: Rejected - overkill for Studio config, still requires writing JSDoc comments, generates too much noise

**References**:
- Sanity's own documentation structure at docs.sanity.io
- Next.js documentation approach (high-level guides + API reference)
- TSDoc/JSDoc standards for inline documentation

---

### 2. Critical Areas Requiring Documentation

**Decision**: Focus documentation efforts on four critical areas in priority order:

1. **sanity.config.ts** - Plugin configuration and interactions
2. **structure.ts** - Studio sidebar structure and helper functions
3. **README.md** - Architecture overview and common workflows
4. **Schema files** (schemaTypes/) - Document type purposes and field explanations

**Rationale**:
- **sanity.config.ts impact**: This is the central nervous system - mistakes here break the entire studio. Plugins like documentInternationalization and orderableDocumentList have complex interactions that aren't obvious.
- **structure.ts complexity**: The structure builder pattern is highly unintuitive for Sanity beginners. Helper functions (createSingleTon, createList, createIndexListWithOrderableItems) use closure patterns that confuse developers.
- **README as entry point**: First file developers read - must provide mental model of how everything fits together.
- **Schema discoverability**: 20+ schema files scattered across blocks/, documents/, definitions/ - without comments, developers don't know which schema to reference for new features.

**Alternatives considered**:
- **Document everything equally**: Rejected - would create information overload, dilute focus on critical paths
- **Only README without inline comments**: Rejected - forces context switching, doesn't explain *why* code is written a certain way
- **Focus on utils/ and components/ first**: Rejected - these are relatively straightforward; the config and structure files are the real pain points

**Evidence from codebase**:
- `structure.ts:114-113` already has detailed JSDoc for `createIndexListWithOrderableItems` explaining orderRank quirks with i18n - this is the level of detail needed throughout
- `sanity.config.ts:68-74` has newDocumentOptions logic that isn't explained - developers won't understand why certain templates are filtered
- Current README.md (10KB) covers basics but lacks architecture overview, plugin ecosystem explanation, and common workflows

---

### 3. Sanity Studio Plugin Ecosystem Understanding

**Decision**: Document all 9 plugins with purpose, configuration, and inter-dependencies

**Plugins identified from sanity.config.ts**:

1. **presentationTool** (lines 33-43)
   - Purpose: Live preview integration with apps/web frontend
   - Key config: locations resolver, previewUrl with draft mode API route
   - Dependencies: Requires apps/web running, uses getPresentationUrl() utility

2. **structureTool** (lines 44-46)
   - Purpose: Defines Studio sidebar navigation and content organization
   - Key config: structure function from structure.ts
   - Dependencies: Core to Studio, all other tools build on this

3. **documentInternationalization** (lines 53-65)
   - Purpose: Enables translation workflow for multi-language content
   - Key config: supportedLanguages from @workspace/i18n-config, schemaTypes array
   - Dependencies: Requires `language` field in schemas, creates translation metadata documents, affects structure.ts filtering (DEFAULT_LOCALE pattern)

4. **orderableDocumentList** (used in structure.ts:138)
   - Purpose: Allows drag-and-drop reordering of documents
   - Key config: Adds `orderRank` field, used in structure.ts helper
   - Dependencies: Interacts poorly with documentInternationalization (orderRank not synced across translations)

5. **visionTool** (line 48)
   - Purpose: GROQ query testing playground
   - Key config: None (default)
   - Dependencies: None, standalone development tool

6. **media** (line 50)
   - Purpose: Enhanced media library for asset management
   - Key config: None (default)
   - Dependencies: Replaces default image picker

7. **iconPicker** (line 51)
   - Purpose: UI component for selecting icons in schemas
   - Key config: None (default)
   - Dependencies: Used in CTA buttons, feature cards schemas

8. **assist** (line 52)
   - Purpose: Sanity AI assistant for content generation
   - Key config: None (default)
   - Dependencies: Requires Sanity AI credits

9. **unsplashImageAsset** (line 49)
   - Purpose: Import images from Unsplash stock library
   - Key config: None (default)
   - Dependencies: None

**Critical interactions to document**:
- **documentInternationalization + structure filtering**: structure.ts uses `DEFAULT_LOCALE` filter to show only French (default) documents in sidebar - prevents overwhelming users with duplicate translations
- **orderableDocumentList + i18n quirk**: Reordering only updates `orderRank` on the dragged document, not its translations. Queries must use `coalesce(__i18n_base->orderRank, orderRank)` pattern (see structure.ts:106-108)
- **presentationTool + location.ts**: Preview requires location resolver to map Studio documents to frontend routes

**Rationale for documenting all plugins**:
- Prevents accidental removal during "cleanup" efforts
- Enables informed decisions when adding new plugins
- Explains project-specific configuration choices (why these plugins vs alternatives)

---

### 4. Common Developer Workflows to Document

**Decision**: Create step-by-step guides for 5 most common tasks based on feature spec user stories

**Workflows identified**:

1. **Adding a new translatable document type** (User Story 2)
   - Steps: Schema creation → Add `language` field → Register in documentInternationalization → Add to structure.ts → Generate types
   - Validation: Translation actions appear in Studio, all locales createable
   - Gotchas: Must filter by language in structure.ts, must add to i18nTypes array in config templates

2. **Adding a new singleton document** (User Story 4)
   - Steps: Schema creation → Add to structure.ts with createSingleTon → Generate types
   - Validation: Document appears in sidebar, only one instance creatable
   - Gotchas: Singleton vs translatable singleton (e.g., homePage is both)

3. **Modifying Studio sidebar structure** (User Story 4)
   - Steps: Edit structure.ts → Use helper functions → Restart dev server
   - Validation: Changes appear in sidebar navigation
   - Gotchas: Must maintain language filtering for i18n types

4. **Creating custom field components** (User Story 3)
   - Steps: Create component in components/ → Export → Reference in schema's `components.input`
   - Validation: Custom UI appears in Studio form
   - Example: slug-field-component.tsx with validation

5. **Running data migrations** (User Story 3)
   - Steps: Create migration in migrations/ → Use sanity exec → Verify changes
   - Validation: Documents updated in dataset
   - Example: migrations/add-language-field/

**Rationale**:
- These 5 workflows cover 80% of day-to-day studio maintenance tasks
- Each workflow is self-contained and testable
- Directly maps to user stories in spec.md (P1 and P2 priorities)

**Format**: Each guide will include:
- **When to use**: Scenario description
- **Prerequisites**: What must exist before starting
- **Steps**: Numbered checklist
- **Validation**: How to verify success
- **Common issues**: Troubleshooting tips
- **Example**: Reference to actual file in codebase

---

### 5. Directory Structure Organization Principles

**Decision**: Document existing structure without reorganization - current layout is sound

**Current structure analysis**:

```
apps/studio/
├── components/       # Reusable UI components (7 files)
├── hooks/            # React hooks (1 file: use-slug-validation)
├── migrations/       # One-time data migrations (1 folder)
├── plugins/          # Custom Sanity plugins (1 file)
├── schemaTypes/      # Content type definitions (organized by category)
│   ├── blocks/       # Page builder block schemas (6 files)
│   ├── documents/    # Main document types (10 files)
│   ├── definitions/  # Reusable field groups (4 files)
│   ├── common.ts     # Shared schema utilities
│   └── index.ts      # Schema exports
├── scripts/          # Build/setup scripts
├── static/           # Static assets (logos, icons)
├── utils/            # Utility functions (7 files)
├── functions/        # Sanity Functions (serverless)
├── sanity.config.ts  # Main config
├── structure.ts      # Sidebar structure
└── README.md         # Documentation
```

**Why this structure is sound**:
- **Clear separation of concerns**: Schemas, components, utils, config are isolated
- **Scalable categorization**: schemaTypes/ subdivided by purpose (blocks vs documents vs definitions)
- **Follows Sanity conventions**: Matches official Sanity documentation examples
- **Flat within categories**: No excessive nesting (max 2 levels deep)

**What needs documentation, not reorganization**:
- **Purpose of each directory**: When to add files to components/ vs utils/
- **Schema categorization logic**: Why pagebuilder.ts is in definitions/ not blocks/
- **Naming conventions**: kebab-case for files, PascalCase for components
- **Index file patterns**: schemaTypes/index.ts aggregates all schemas

**Rationale for no reorganization**:
- Spec.md explicitly states "Assumptions: current directory structure is generally sound"
- Reorganization risks breaking imports and requires updating documentation in multiple places
- Team familiarity with current structure - changes would temporarily slow development
- Focus on documentation provides higher ROI for onboarding

---

### 6. JSDoc Comment Standards

**Decision**: Use TSDoc-compliant JSDoc with @param, @returns, @example, @remarks tags

**Standard format**:
```typescript
/**
 * Brief one-line description of function purpose
 *
 * Detailed explanation of what this function does and why it exists.
 * Include context about when to use it and common use cases.
 *
 * @param paramName - Description of what this parameter controls
 * @param anotherParam - Another parameter description
 * @returns What this function returns and its type
 *
 * @example
 * ```typescript
 * // Concrete usage example from the codebase
 * const result = functionName({ param: value });
 * ```
 *
 * @remarks
 * Additional notes, gotchas, or important behaviors.
 * Use this section for warnings about edge cases.
 */
```

**Rationale**:
- **IDE integration**: VSCode shows JSDoc as IntelliSense hover tooltips
- **Industry standard**: TSDoc is TypeScript's official documentation format
- **Backward compatible**: Works with existing TypeScript tooling
- **Scannable**: Tagged sections make it easy to find specific info (params vs examples)

**Examples from existing codebase**:
- `structure.ts:71-113` demonstrates good JSDoc with @param, @returns, @example, @remarks
- `utils/helper.ts` lacks JSDoc - will need comprehensive comments added

**Where to apply**:
- All exported functions in utils/
- All helper functions in structure.ts (createSingleTon, createList, etc.)
- Complex schema field configurations
- Custom component props interfaces

---

### 7. README.md Structure

**Decision**: Organize README.md with progressive disclosure - overview → architecture → guides → reference

**Proposed outline**:

```markdown
# Sanity Studio - Documentation

## Quick Start
- Installation
- Running dev server
- Building for production

## Architecture Overview
- Directory structure explained
- Design principles (why organized this way)
- Key files and their purposes

## Plugin Ecosystem
- Plugin reference table (name, purpose, config highlights)
- Plugin interactions and dependencies
- When to add new plugins

## Content Type System
- Understanding schemas (documents vs blocks vs definitions)
- Schema organization principles
- Common field patterns

## Studio Structure (Sidebar)
- How structure.ts works
- Helper function reference
- Language filtering pattern

## Common Workflows
- Adding translatable document type (step-by-step)
- Adding singleton document
- Creating custom components
- Modifying sidebar structure
- Running migrations

## Troubleshooting
- Translation actions not appearing
- OrderRank not working across languages
- Preview not loading
- Type generation errors

## Reference
- Environment variables
- NPM scripts
- File naming conventions
- Code style guidelines
```

**Rationale**:
- **Quick Start first**: Gets developers running immediately
- **Architecture before guides**: Mental model before task-specific instructions
- **Workflows as checklists**: Actionable steps developers can follow
- **Troubleshooting separate**: Easy to find when debugging specific issues
- **Reference last**: Lookup information, not narrative flow

**Length estimate**: ~3000-4000 words, ~200-250 lines markdown (3-4x current README size)

---

### 8. Code Comment Density Guidelines

**Decision**: Target 1 comment per 3-5 lines of complex code, 1 per 10-15 lines for straightforward code

**Complex code requiring dense comments**:
- sanity.config.ts plugin configuration (each plugin gets comment block)
- structure.ts helper functions (already well-documented, maintain that standard)
- Schema field arrays with non-obvious validation rules
- Custom components with Sanity-specific hooks

**Straightforward code requiring sparse comments**:
- Simple util functions (e.g., getTitleCase - self-explanatory)
- Schema fields with obvious purpose (e.g., `title: string`)
- Standard React component patterns

**Format guidelines**:
- **Block comments** for function/section headers (/** ... */)
- **Inline comments** for non-obvious logic (// Why we do this specific thing)
- **Avoid redundant comments** - Don't comment `const title = "Blog"` with "// Set title to Blog"
- **Focus on WHY not WHAT** - Code shows what it does, comments explain rationale

**Example from structure.ts** (target standard):
```typescript
// Lines 71-113: createIndexListWithOrderableItems
// This function has:
// - 12-line JSDoc explaining purpose, params, returns
// - @example section with code sample
// - @remarks section with 20 lines explaining orderRank + i18n quirk
// - Ratio: ~32 lines documentation : ~50 lines code = ~64% comment density
```

**Rationale**:
- Spec.md requirement: "provide more detailed documentation in both markdown files and code comments explaining very clearly what the code is doing and why"
- Studio configuration is domain-specific knowledge - not obvious from code alone
- High comment density justified for handoff scenario (team unfamiliar with Sanity)

---

## Technology Decisions

### Documentation Tooling

**Decision**: Use standard Markdown + JSDoc, no additional tooling required

**Technologies**:
- Markdown for README.md (GitHub-flavored)
- JSDoc/TSDoc for inline code comments
- Existing VSCode IntelliSense for comment consumption

**Alternatives rejected**:
- Docusaurus/VitePress: Overkill for single workspace documentation
- Storybook: Useful for component library, but Studio doesn't have isolated UI components
- TypeDoc: Generates API reference, but doesn't provide narrative guides

**Rationale**: Keep it simple - no build step, no deployment, works in any editor

---

### Validation Strategy

**Decision**: Manual team review + onboarding trial with unfamiliar developer

**Validation steps**:
1. Internal review: Check documentation accuracy against actual code
2. Onboarding trial: Have developer unfamiliar with Sanity follow documentation
3. Iterate: Fix gaps discovered during trial
4. Acceptance: Success criteria from spec.md (SC-001 through SC-007)

**Success metrics** (from spec.md):
- New developer can locate any file within 5 minutes (SC-001)
- Can add translatable document type in 45 minutes (SC-002)
- 100% of critical config sections have comments (SC-003)
- 90% can explain 4/5 major plugins (SC-004)
- Onboarding time < 1 hour (SC-005)

**Rationale**: Documentation quality is measured by usability, not just coverage

---

## Open Questions (All Resolved)

All technical context questions have been resolved through codebase analysis:

- ✅ Plugin list and purposes: Documented above (9 plugins identified)
- ✅ Directory structure rationale: Analyzed and documented (no changes needed)
- ✅ Common workflows: Identified 5 critical workflows from user stories
- ✅ Documentation format: Markdown + JSDoc decided
- ✅ Comment density: Guidelines established (1:3-5 for complex, 1:10-15 for simple)

---

## Next Steps

Phase 1 (Design):
1. Generate data-model.md - Document content type entities and relationships
2. Generate contracts/ - Not applicable (no APIs for documentation feature)
3. Generate quickstart.md - Quick reference guide for documentation updates
4. Update CLAUDE.md via update-agent-context.sh

---

## References

- Sanity Documentation: https://www.sanity.io/docs
- TSDoc Specification: https://tsdoc.org/
- Existing codebase: /Users/walter-mac/walter-interactive/turbo-start-sanity-i18n/apps/studio
- Feature spec: ../spec.md
