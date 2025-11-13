# JSDoc Templates for Studio Documentation

**Feature**: Studio Documentation & Code Organization
**Date**: 2025-11-13
**Status**: Reference Guide

## Overview

This document provides copy-paste JSDoc templates for documenting Studio code. All templates follow TSDoc standards for IDE IntelliSense integration.

---

## 1. Function Documentation Template

Use this template for all exported functions, helper functions, and complex utility functions.

```typescript
/**
 * Brief one-line description of what this function does
 *
 * Detailed explanation of the function's purpose and when to use it.
 * Include context about common use cases and why this function exists
 * in the codebase.
 *
 * @param paramName - Description of what this parameter controls and its expected format
 * @param anotherParam - Another parameter description with constraints or valid values
 * @returns Description of the return value, including type information and what it represents
 *
 * @example
 * ```typescript
 * // Concrete usage example from the actual codebase
 * const result = functionName({
 *   paramName: "example-value",
 *   anotherParam: 42
 * });
 * ```
 *
 * @remarks
 * Important notes, gotchas, or edge case behaviors that developers should know.
 * Use this section to explain non-obvious implementation details or warn about
 * common mistakes.
 */
```

### Example: Actual Usage in structure.ts

```typescript
/**
 * Creates a Studio sidebar list item for an index document with orderable child items
 *
 * This helper function builds a two-level navigation structure: an index/landing page
 * (e.g., "Blog Index") followed by a list of related documents (e.g., individual blog posts)
 * that support drag-and-drop reordering via the orderableDocumentList plugin.
 *
 * @param S - Sanity structure builder instance (passed from structure() function)
 * @param title - Display title for the sidebar section (e.g., "Blog")
 * @param indexSchemaType - Schema type for the index/landing document (e.g., "blogIndex")
 * @param indexQueryFilter - GROQ filter to find the index document
 * @param itemSchemaType - Schema type for the orderable list items (e.g., "blog")
 * @param itemQueryFilter - GROQ filter for list items (should filter by language)
 * @returns Sanity list item containing index document + orderable child list
 *
 * @example
 * ```typescript
 * // Create blog section with French blog index + orderable French blog posts
 * createIndexListWithOrderableItems(
 *   S,
 *   "Blog",
 *   "blogIndex",
 *   `_type == "blogIndex" && language == "${DEFAULT_LOCALE}"`,
 *   "blog",
 *   `language == "${DEFAULT_LOCALE}"`
 * )
 * ```
 *
 * @remarks
 * IMPORTANT: orderRank field quirk with i18n
 *
 * The orderableDocumentList plugin only updates the `orderRank` field on the document
 * being dragged, NOT on its translations. This creates a synchronization issue where:
 *
 * 1. User drags French blog post (orderRank: "a0" → "a5")
 * 2. English translation still has old orderRank ("a0")
 * 3. Querying English posts without compensation shows incorrect order
 *
 * SOLUTION: Always use this GROQ pattern in frontend queries:
 *
 * ```groq
 * *[_type == "blog" && language == $lang]
 *   | order(coalesce(__i18n_base->orderRank, orderRank))
 * ```
 *
 * This falls back to the default language document's orderRank if the translation
 * doesn't have an updated value.
 */
```

---

## 2. Plugin Configuration Comment Template

Use this template for each plugin in `sanity.config.ts` to explain its purpose and configuration.

```typescript
// ============================================================================
// [PLUGIN NAME] - Brief purpose description
// ============================================================================
//
// What this plugin does:
// - Primary functionality point 1
// - Primary functionality point 2
// - Primary functionality point 3
//
// Key configuration options explained:
// - configOption1: What it controls and why we set this value
// - configOption2: What it controls and why we set this value
//
// Dependencies/interactions:
// - Dependency 1: How this plugin relates to other parts of the system
// - Dependency 2: Any quirks or gotchas when using with other plugins
//
// When to modify:
// - Scenario 1: Description of when you'd need to change this config
// - Scenario 2: Another modification scenario
//
```

### Example: documentInternationalization Plugin

```typescript
// ============================================================================
// DOCUMENT INTERNATIONALIZATION - Translation Management
// ============================================================================
//
// What this plugin does:
// - Enables multi-language content workflow for documents
// - Adds "Translate" action to Studio UI for creating language variants
// - Creates/manages translation.metadata documents to link related translations
// - Filters new document templates to only show language-specific options
//
// Key configuration options explained:
// - supportedLanguages: Pulls from @workspace/i18n-config (fr, en, es)
// - schemaTypes: Array of document types that should be translatable
// - weakReferences: Set to true to allow deleting translations independently
//
// Dependencies/interactions:
// - Requires `language` field in all schemas listed in schemaTypes array
// - Interacts with structure.ts: DEFAULT_LOCALE filter shows only French docs in sidebar
// - Affects newDocumentOptions: Templates filtered by language (line 68-74 in config)
// - Creates __i18n_base and __i18n_lang fields automatically on documents
//
// When to modify:
// - Adding new translatable document type: Add to schemaTypes array (line 57-61)
// - Adding new language: Update SANITY_LANGUAGES in @workspace/i18n-config
// - Changing translation deletion behavior: Modify weakReferences setting
//
documentInternationalization({
  supportedLanguages: SANITY_LANGUAGES,
  schemaTypes: i18nTypes,
  weakReferences: true,
}),
```

---

## 3. Schema Header Comment Template

Use this template at the top of each schema file to explain the document type's purpose.

```typescript
/**
 * [Schema Type Name] Document Schema
 *
 * PURPOSE:
 * High-level explanation of what this document type represents and when to use it.
 *
 * KEY FEATURES:
 * - Feature 1: Description
 * - Feature 2: Description
 * - Feature 3: Description
 *
 * I18N SUPPORT: [Yes/No] - Whether this document type is translatable
 * ORDERING: [Yes/No] - Whether this supports drag-and-drop reordering
 * SINGLETON: [Yes/No] - Whether only one instance is allowed (per language if translatable)
 *
 * SPECIAL BEHAVIORS:
 * - Behavior 1: Explanation of non-obvious schema logic
 * - Behavior 2: Any validation rules or custom components
 *
 * RELATED TYPES:
 * - Related schema 1: How they connect
 * - Related schema 2: How they connect
 *
 * USAGE LOCATIONS:
 * - Where this document type appears in Studio sidebar (structure.ts reference)
 * - Where this document type is queried in frontend (if known)
 */

import { defineField, defineType } from 'sanity';
// ... rest of schema definition
```

### Example: Blog Schema

```typescript
/**
 * Blog Post Document Schema
 *
 * PURPOSE:
 * Represents individual blog posts with author attribution, rich text content,
 * and manual ordering support. Used for the main blog section of the website.
 *
 * KEY FEATURES:
 * - Rich text editor with custom marks (links, highlights) and blocks
 * - Author reference for attribution
 * - SEO fields (meta description, OG image, etc.)
 * - Custom slug validation to prevent duplicates per language
 * - Manual ordering via drag-and-drop in Studio
 *
 * I18N SUPPORT: Yes - Fully translatable (French, English, Spanish)
 * ORDERING: Yes - Uses orderableDocumentList plugin for manual ordering
 * SINGLETON: No - Multiple blog posts allowed
 *
 * SPECIAL BEHAVIORS:
 * - orderRank field quirk: Only updates on dragged document, NOT translations
 *   (see structure.ts:106-132 remarks for frontend query workaround)
 * - Slug validation: Must be unique per language, cannot use reserved paths
 *   (see utils/slug-validation.ts for implementation)
 * - Template filtering: Only `blog-fr` template shown by default (line 68-74 in config)
 *
 * RELATED TYPES:
 * - blogIndex: Landing page for blog section
 * - author: Referenced for author attribution
 * - richText (definition): Used for body field
 *
 * USAGE LOCATIONS:
 * - Studio sidebar: Apps/studio/structure.ts:138-145 (Blog section with orderable items)
 * - Frontend queries: apps/web likely queries by language + orderRank
 */

import { defineField, defineType } from 'sanity';
import { languageField } from './common';
// ... rest of schema definition
```

---

## 4. Inline Comment Guidelines

Use inline comments to explain non-obvious logic within functions or configurations.

### Format: Explain WHY, not WHAT

```typescript
// ❌ BAD: Explains what code does (obvious from reading code)
const title = "Blog"; // Set title to Blog

// ✅ GOOD: Explains why this value/approach is used
const title = "Blog"; // Matches frontend route structure (/blog)
```

### Format: Gotchas and Edge Cases

```typescript
// ❌ BAD: Missing explanation of why filter is needed
.filter((template) => template.id.includes('-fr'))

// ✅ GOOD: Explains the reasoning behind the filter
// Only show French (default locale) templates by default to avoid overwhelming
// users with duplicate templates for every language. Translations are created
// via the "Translate" action in the document menu.
.filter((template) => template.id.includes('-fr'))
```

### Format: Reference Links

```typescript
// ✅ GOOD: Links to related code/documentation
// Note: This query pattern compensates for orderRank not syncing across translations
// See structure.ts:106-132 for detailed explanation of this quirk
const query = `*[_type == "blog"] | order(coalesce(__i18n_base->orderRank, orderRank))`;
```

### When to Add Inline Comments

**DO add comments for**:
- Plugin configuration sections (each plugin block in sanity.config.ts)
- Non-obvious filters or transformations
- Workarounds for known issues/quirks
- Business logic that isn't self-explanatory
- Magic numbers or strings with specific meaning

**DON'T add comments for**:
- Self-explanatory variable assignments
- Standard patterns (e.g., `import { defineType } from 'sanity'`)
- Obvious function calls (e.g., `console.log()`)
- TypeScript type annotations (types are self-documenting)

---

## 5. Utility Function Template (Simple)

For simple utility functions with obvious purpose, use abbreviated JSDoc.

```typescript
/**
 * Brief one-line description
 *
 * @param paramName - Parameter description
 * @returns Return value description
 *
 * @example
 * ```typescript
 * functionName("input") // => "output"
 * ```
 */
```

### Example: Simple Utility

```typescript
/**
 * Converts string to title case (first letter of each word capitalized)
 *
 * @param str - Input string to convert
 * @returns Title-cased string
 *
 * @example
 * ```typescript
 * getTitleCase("hello world") // => "Hello World"
 * getTitleCase("SCREAMING_SNAKE_CASE") // => "Screaming Snake Case"
 * ```
 */
export function getTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

---

## 6. Component Props Interface Template

For React components, document the props interface.

```typescript
/**
 * Props for [ComponentName] component
 *
 * @property propName - Description of what this prop controls
 * @property anotherProp - Another prop description
 */
interface ComponentNameProps {
  /** Brief description of prop */
  propName: string;

  /** Brief description of prop with constraints */
  anotherProp?: number; // Optional props use ?
}
```

### Example: Custom Input Component Props

```typescript
/**
 * Props for SlugFieldComponent custom input
 *
 * Used in page and blog schemas to provide real-time slug validation
 * with duplicate detection per language.
 */
interface SlugFieldProps {
  /** Current document ID (used to exclude self from duplicate check) */
  documentId: string;

  /** Current language code (fr/en/es) for language-scoped validation */
  language: string;

  /** Document type name (e.g., "page", "blog") for type-scoped validation */
  schemaType: string;

  /** Callback fired when validation state changes */
  onChange?: (isValid: boolean) => void;
}
```

---

## Comment Density Targets by File Type

Based on complexity analysis from research.md:

| File Type | Target Density | Rationale |
|-----------|---------------|-----------|
| `sanity.config.ts` | 40-50% | High complexity, critical for Studio functionality |
| `structure.ts` | 30-40% | Already well-commented, maintain current standard |
| Schema files (documents/) | 20-30% | Field explanations and special behaviors |
| Schema files (blocks/) | 15-25% | Simpler structure, less context needed |
| Utils | 15-25% | Function purposes and parameter explanations |
| Components | 15-25% | Props interfaces and usage context |

**Density calculation**: (Lines of comments / Total lines of code) × 100%

---

## VSCode IntelliSense Integration

All JSDoc comments using this format will automatically appear in VSCode:

1. **Hover tooltips**: Hover over function name to see full JSDoc
2. **Parameter hints**: See `@param` descriptions while typing function calls
3. **Autocomplete**: Function descriptions appear in autocomplete dropdown
4. **Go to Definition**: Jump to function to read full documentation

**No build step required** - JSDoc works natively with TypeScript.

---

## References

- TSDoc specification: https://tsdoc.org/
- TypeScript JSDoc reference: https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html
- Existing well-documented code: `apps/studio/structure.ts:71-132`
