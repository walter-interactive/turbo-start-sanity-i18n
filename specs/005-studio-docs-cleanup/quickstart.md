# Quickstart: Studio Documentation Updates

**Feature**: Studio Documentation & Code Organization
**Date**: 2025-11-12
**For**: Developers maintaining or updating studio documentation

## Purpose

This guide helps developers understand how to maintain and update the apps/studio documentation after this feature is implemented. Use this as a reference when documentation needs updates due to code changes.

---

## Documentation Files Overview

### Primary Documentation

| File | Purpose | When to Update |
|------|---------|----------------|
| `apps/studio/README.md` | Main entry point for new developers | When adding new plugins, changing directory structure, or adding common workflows |
| `apps/studio/sanity.config.ts` | Plugin configuration with inline comments | When adding/removing plugins, changing plugin config, or modifying document templates |
| `apps/studio/structure.ts` | Sidebar structure with JSDoc comments | When adding content types, changing sidebar organization, or modifying helper functions |
| Schema files (`schemaTypes/**/*.ts`) | Content type definitions with header comments | When adding/modifying document types, blocks, or field definitions |
| Utility files (`utils/*.ts`) | Helper functions with JSDoc | When adding/modifying utility functions |

### Feature Documentation

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `specs/005-studio-docs-cleanup/research.md` | Research decisions and rationale | Rarely (only if documentation strategy changes) |
| `specs/005-studio-docs-cleanup/data-model.md` | Content type inventory | When new document types added |
| `specs/005-studio-docs-cleanup/quickstart.md` | This file - maintenance guide | When documentation process changes |

---

## Quick Reference: Adding Documentation

### 1. Adding a New Plugin

**When**: You add a new plugin to `sanity.config.ts`

**Steps**:
1. Add plugin to imports and plugins array in `sanity.config.ts`
2. Add JSDoc comment block above plugin configuration:
   ```typescript
   /**
    * [Plugin Name] - Brief description of purpose
    *
    * Purpose: What this plugin does and why we need it
    * Key Config: Highlight important configuration options
    * Dependencies: What this plugin requires or affects
    *
    * @see https://link-to-official-docs
    */
   [pluginName]({ /* config */ }),
   ```
3. Update README.md "Plugin Ecosystem" section with new plugin entry
4. If plugin interacts with other plugins, document the interaction in README.md

**Example**:
See `sanity.config.ts:53-65` for documentInternationalization plugin documentation

---

### 2. Adding a New Document Type

**When**: You create a new schema in `schemaTypes/documents/`

**Steps**:
1. Create schema file with header comment:
   ```typescript
   /**
    * [Document Type Name] - Brief description
    *
    * Purpose: What this document type represents and when to use it
    * Usage: How this type is used in the site (e.g., "Powers the /services page")
    * i18n Support: Translatable | Not translatable
    *
    * @see Related schemas or frontend usage
    */
   export const documentType = defineType({ /* schema */ });
   ```
2. Add JSDoc comments for complex field configurations
3. Update `data-model.md` in this spec folder with new document type entry
4. If translatable, update README.md workflow guide "Adding a New Translatable Document Type"

**Example**:
See data-model.md for existing document type documentation patterns

---

### 3. Modifying structure.ts

**When**: You change sidebar organization or add helper functions

**Steps**:
1. For new helper functions, add JSDoc with @param, @returns, @example, @remarks:
   ```typescript
   /**
    * Brief description of what this helper does
    *
    * Detailed explanation of purpose and when to use it.
    *
    * @param S - The StructureBuilder instance
    * @param options - Configuration options
    * @returns A structure list item
    *
    * @example
    * ```typescript
    * createHelper({ S, type: "myType", icon: MyIcon })
    * ```
    *
    * @remarks
    * Important notes, gotchas, or edge cases.
    */
   const createHelper = ({ S, options }: Params) => { /* impl */ };
   ```
2. For new sidebar sections, add inline comment explaining purpose
3. Update README.md "Studio Structure" section if adding new patterns

**Example**:
See `structure.ts:71-113` for `createIndexListWithOrderableItems` JSDoc

---

### 4. Updating Common Workflows

**When**: A common task's steps change (e.g., type generation command changes)

**Steps**:
1. Open `apps/studio/README.md`
2. Find the relevant workflow section (e.g., "Adding a New Translatable Document Type")
3. Update the step-by-step checklist
4. Update validation steps if verification process changed
5. Add new gotchas to "Common Issues" if discovered during testing

**Format**:
```markdown
### [Workflow Name]

**When to use**: Scenario description

**Prerequisites**: What must exist before starting

**Steps**:
1. First action with concrete example
2. Second action with file paths
3. Third action with expected output

**Validation**:
- [ ] How to verify step 1 succeeded
- [ ] How to verify step 2 succeeded

**Common Issues**:
- **Issue**: Description of problem
  - **Solution**: How to fix it
```

---

### 5. Adding Schema Field Documentation

**When**: You add a complex field with non-obvious validation or behavior

**Steps**:
1. Add inline comment explaining the field's purpose:
   ```typescript
   defineField({
     name: 'complexField',
     type: 'string',
     // This field controls [X behavior]. It must be [validation rule] because [reason].
     // Example: "home-page" (not "homepage" - requires hyphen for URL routing)
     validation: (Rule) => Rule.required(),
   }),
   ```
2. For field groups (objects/arrays), add header comment:
   ```typescript
   // Navigation items configuration
   // Each item can be a simple link or a dropdown menu with sub-items.
   // Used in navbar schema for site header navigation.
   defineField({
     name: 'menuItems',
     type: 'array',
     // ...
   }),
   ```

---

## Maintenance Checklist

Use this checklist when making significant code changes to apps/studio:

### When Adding Features
- [ ] Added header comment to new files explaining purpose
- [ ] Added JSDoc to exported functions with @param, @returns, @example
- [ ] Updated README.md if new plugin, directory, or common workflow
- [ ] Updated data-model.md if new content type
- [ ] Verified inline comments explain *why*, not just *what*

### When Modifying Existing Code
- [ ] Updated inline comments if logic changed
- [ ] Updated JSDoc if function signature or behavior changed
- [ ] Updated README.md if workflow steps changed
- [ ] Verified cross-references still accurate (e.g., line numbers in README)

### When Removing Code
- [ ] Removed related documentation from README.md
- [ ] Removed JSDoc comments for deleted functions
- [ ] Checked for broken cross-references (search for file/function name in README)
- [ ] Updated data-model.md if content type removed

---

## Documentation Standards Reference

### Comment Density Guidelines

| Code Complexity | Target Ratio | Example |
|----------------|--------------|---------|
| High (plugin config, structure helpers) | 1 comment per 3-5 lines | `sanity.config.ts`, `structure.ts` |
| Medium (schemas, custom components) | 1 comment per 5-10 lines | `schemaTypes/**/*.ts` |
| Low (simple utils, obvious logic) | 1 comment per 10-15 lines | `utils/helper.ts` |

### JSDoc Tags to Use

```typescript
/**
 * @param {Type} name - Description
 * @returns {Type} Description
 * @example ```typescript
 * // Usage example
 * ```
 * @remarks Special notes, gotchas, edge cases
 * @see Related files or documentation
 * @throws {ErrorType} When this error occurs
 */
```

### Inline Comment Style

```typescript
// ✅ Good: Explains WHY
// We filter by DEFAULT_LOCALE to prevent duplicate translations from cluttering the sidebar

// ❌ Bad: Explains WHAT (redundant with code)
// Filter the documents by language
```

---

## Troubleshooting Documentation Issues

### Documentation is Out of Date

**Problem**: Comments reference old code that no longer exists

**Solution**:
1. Search for references to deleted code: `rg "oldFunctionName" apps/studio/`
2. Update or remove stale comments
3. Update README.md cross-references if line numbers changed significantly

### Too Much Documentation

**Problem**: Developers report information overload

**Solution**:
1. Review comment density - ensure following guidelines above
2. Remove redundant comments that just restate obvious code
3. Move detailed explanations to README.md, keep inline comments concise
4. Use progressive disclosure: brief comment with `@see README.md#section` for details

### Not Enough Documentation

**Problem**: Developers still asking questions about certain areas

**Solution**:
1. Identify the knowledge gap (what's being asked repeatedly)
2. Add FAQ entry to README.md Troubleshooting section
3. Add inline comments explaining the confusing code
4. Consider adding a workflow guide if it's a common task

---

## File Locations Quick Reference

```
apps/studio/
├── README.md                    # Main documentation (update frequently)
├── sanity.config.ts             # Plugin docs (update when plugins change)
├── structure.ts                 # Sidebar docs (update when structure changes)
├── schemaTypes/
│   ├── documents/*.ts           # Document type docs (add headers when creating)
│   ├── blocks/*.ts              # Block docs (add headers when creating)
│   └── definitions/*.ts         # Definition docs (add headers when creating)
└── utils/*.ts                   # Utility docs (add JSDoc to exports)

specs/005-studio-docs-cleanup/
├── research.md                  # Documentation strategy (rarely update)
├── data-model.md                # Content type inventory (update when types added)
└── quickstart.md                # This file (update when process changes)
```

---

## Common Commands

```bash
# Type checking (before committing documentation changes)
pnpm --filter studio check-types

# Regenerate types after schema changes
pnpm --filter studio type

# Start dev server to verify changes
pnpm --filter studio dev

# Build to verify no errors
pnpm --filter studio build
```

---

## Questions?

If you're unsure whether documentation needs updating:
- **Rule of thumb**: If a new developer wouldn't understand the change without asking you, add documentation
- **Ask yourself**: "Would I understand this in 6 months without context?"
- **When in doubt**: Add a comment - easier to remove excessive comments than to add missing ones later

For questions about this documentation feature:
- See `specs/005-studio-docs-cleanup/spec.md` for original requirements
- See `specs/005-studio-docs-cleanup/research.md` for documentation strategy decisions
