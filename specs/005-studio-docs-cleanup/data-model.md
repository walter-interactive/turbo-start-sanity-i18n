# Data Model: Studio Content Types & Documentation Structure

**Feature**: Studio Documentation & Code Organization
**Date**: 2025-11-12
**Status**: Complete

## Overview

This document describes the content type entities in apps/studio and the documentation structure being added. Since this is a documentation-only feature, the "data model" focuses on documenting existing Sanity schemas rather than creating new data structures.

## Documentation Entities

### 1. README.md Sections

**Purpose**: Primary documentation entry point for developers joining the team

**Structure**:
```typescript
interface READMESection {
  sectionName: string;      // e.g., "Quick Start", "Architecture Overview"
  content: string;          // Markdown content
  codeExamples?: string[];  // Optional code snippets
  crossReferences: string[]; // Links to related files/sections
}
```

**Sections to create**:
1. **Quick Start** - Installation, dev server, build commands
2. **Architecture Overview** - Directory structure explanation, design principles
3. **Plugin Ecosystem** - 9 plugins documented with purposes and interactions
4. **Content Type System** - Schema organization (documents/blocks/definitions)
5. **Studio Structure** - structure.ts helper functions and patterns
6. **Common Workflows** - 5 step-by-step guides for frequent tasks
7. **Troubleshooting** - Common issues and solutions
8. **Reference** - Environment variables, scripts, conventions

**Relationships**:
- Cross-references inline code comments (e.g., "See sanity.config.ts:53-65 for plugin configuration")
- Links to specific schema files by category
- References workflow guides from architecture sections

---

### 2. Inline Code Comments

**Purpose**: Contextual documentation within TypeScript files

**Types of comments**:

```typescript
// Block comment (function/section documentation)
interface BlockComment {
  location: string;        // File path + line number
  type: "JSDoc" | "Section";
  target: "function" | "plugin" | "schema" | "config";
  content: {
    summary: string;       // Brief one-liner
    description: string;   // Detailed explanation
    params?: Parameter[];  // For functions
    returns?: string;      // For functions
    examples?: string[];   // Code usage examples
    remarks?: string[];    // Important notes, gotchas
  };
}

// Inline comment (single-line explanation)
interface InlineComment {
  location: string;
  purpose: "why" | "gotcha" | "reference";
  text: string;
}
```

**Comment density targets**:
- sanity.config.ts: ~40-50% comment density (high complexity)
- structure.ts: ~30-40% comment density (already well-commented, maintain standard)
- Schema files: ~20-30% comment density (field explanations)
- Utils: ~15-25% comment density (function purposes and params)

---

## Existing Sanity Content Types (To Be Documented)

### Document Types (schemaTypes/documents/)

#### 1. Page
**Purpose**: Flexible page builder for site content
**Key Fields**:
- `title: string` - Page title
- `slug: slug` - URL-friendly identifier
- `language: string` - Locale (fr/en/es)
- `pageBuilder: pageBuilder[]` - Array of block components
- SEO fields, OG fields

**i18n Support**: ✅ Translatable (registered in documentInternationalization)
**Ordering**: N/A (not orderable)
**Singleton**: ❌

**Special Behaviors**:
- Uses custom slug validation via `use-slug-validation` hook
- Nested pages supported via `nested-page-template` template
- Filtered by DEFAULT_LOCALE in structure.ts

#### 2. Blog
**Purpose**: Blog post content with author attribution
**Key Fields**:
- `title: string`
- `slug: slug`
- `language: string`
- `author: reference` → author document
- `publishedAt: datetime`
- `excerpt: text`
- `body: richText` - Portable text with custom marks/blocks
- `orderRank: string` - For manual ordering (from orderableDocumentList plugin)

**i18n Support**: ✅ Translatable
**Ordering**: ✅ Orderable (drag-and-drop in Studio)
**Singleton**: ❌

**Special Behaviors**:
- Part of blogIndex + blog list structure
- orderRank field quirk: Only updates dragged document, not translations

#### 3. BlogIndex
**Purpose**: Landing page for blog section
**Key Fields**:
- `title: string`
- `description: text`
- `language: string`

**i18n Support**: ✅ Translatable
**Ordering**: N/A
**Singleton**: ✅ (one per language)

#### 4. HomePage
**Purpose**: Site homepage with custom layout
**Key Fields**:
- `title: string`
- `language: string`
- `pageBuilder: pageBuilder[]`

**i18n Support**: ✅ Translatable
**Ordering**: N/A
**Singleton**: ✅ (one per language)

#### 5. FAQ
**Purpose**: Frequently asked questions
**Key Fields**:
- `question: string`
- `answer: richText`
- `language: string`

**i18n Support**: ✅ Translatable
**Ordering**: N/A
**Singleton**: ❌

#### 6. Author
**Purpose**: Blog post authors
**Key Fields**:
- `name: string`
- `bio: text`
- `image: image`

**i18n Support**: ❌ Not translatable (authors are global)
**Ordering**: N/A
**Singleton**: ❌

#### 7. Navbar
**Purpose**: Site navigation configuration
**Key Fields**:
- `language: string`
- `menuItems: navigationItem[]`

**i18n Support**: ✅ Translatable
**Ordering**: N/A
**Singleton**: ✅ (one per language)

#### 8. Footer
**Purpose**: Site footer configuration
**Key Fields**:
- `language: string`
- `columns: footerColumn[]`

**i18n Support**: ✅ Translatable
**Ordering**: N/A
**Singleton**: ✅ (one per language)

#### 9. Settings
**Purpose**: Global site settings
**Key Fields**:
- `language: string`
- `siteName: string`
- `siteUrl: url`
- `defaultSeo: seoFields`

**i18n Support**: ✅ Translatable
**Ordering**: N/A
**Singleton**: ✅ (one per language)

#### 10. Redirect
**Purpose**: URL redirects (e.g., /old-path → /new-path)
**Key Fields**:
- `from: string` - Source path
- `to: string` - Destination path
- `permanent: boolean` - 301 vs 302

**i18n Support**: ❌ Not translatable (redirects are global)
**Ordering**: N/A
**Singleton**: ❌

---

### Block Types (schemaTypes/blocks/)

#### 1. Hero
**Purpose**: Hero section with image/video background
**Key Fields**:
- `heading: string`
- `subheading: text`
- `backgroundImage: image`
- `ctaButtons: button[]`

**Usage**: Page builder component

#### 2. CTA (Call to Action)
**Purpose**: Call-to-action section with button
**Key Fields**:
- `heading: string`
- `description: text`
- `button: button`

**Usage**: Page builder component

#### 3. FAQ Accordion
**Purpose**: Expandable FAQ section
**Key Fields**:
- `heading: string`
- `faqs: reference[]` → faq documents

**Usage**: Page builder component

#### 4. Feature Cards (Icon)
**Purpose**: Grid of feature cards with icons
**Key Fields**:
- `heading: string`
- `cards: featureCard[]`

**Usage**: Page builder component

#### 5. Image Link Cards
**Purpose**: Cards with images and links
**Key Fields**:
- `heading: string`
- `cards: imageLinkCard[]`

**Usage**: Page builder component

#### 6. Subscribe Newsletter
**Purpose**: Newsletter subscription form
**Key Fields**:
- `heading: string`
- `placeholder: string`
- `buttonText: string`

**Usage**: Page builder component

---

### Definition Types (schemaTypes/definitions/)

#### 1. PageBuilder
**Purpose**: Array field containing block types
**Block Types Allowed**:
- hero
- cta
- faqAccordion
- featureCardsIcon
- imageLinkCards
- subscribeNewsletter

**Usage**: Used in page and homePage documents

#### 2. RichText
**Purpose**: Portable Text configuration with custom marks/blocks
**Custom Marks**:
- `link` - Internal/external links
- `highlight` - Text highlighting

**Custom Blocks**:
- Standard block styles (h2, h3, h4, normal, blockquote)

**Usage**: Used in blog body, FAQ answers, etc.

#### 3. Button
**Purpose**: Reusable button field group
**Key Fields**:
- `text: string`
- `url: customUrl` - Internal or external link
- `style: string` - primary/secondary/outline

**Usage**: CTAs, hero sections, feature cards

#### 4. CustomUrl
**Purpose**: Link field supporting internal references or external URLs
**Key Fields**:
- `linkType: string` - "internal" | "external"
- `internalLink: reference` - Reference to page/blog
- `externalUrl: url` - External URL

**Usage**: Buttons, navigation items

---

## Plugin-Generated Fields

### 1. Language Field (documentInternationalization)
**Added to**: All translatable document types
**Field Name**: `language`
**Type**: `string`
**Values**: `fr | en | es` (from SANITY_LANGUAGES)
**Purpose**: Identifies document locale

### 2. Translation Metadata (documentInternationalization)
**Document Type**: `translation.metadata`
**Purpose**: Links translations together
**Key Fields**:
- `translations: reference[]` - Array of related documents in different languages
- `__i18n_base: reference` - Reference to base/default language document
- `__i18n_lang: string` - Language code

**Auto-managed**: Created/updated by plugin

### 3. OrderRank Field (orderableDocumentList)
**Added to**: blog (any type using orderableDocumentListDeskItem)
**Field Name**: `orderRank`
**Type**: `string`
**Purpose**: Stores fractional index for drag-and-drop ordering

**Gotcha**: Only updates dragged document's orderRank, not translations. Queries must use:
```groq
*[_type == "blog" && language == $lang] | order(coalesce(__i18n_base->orderRank, orderRank))
```

---

## Documentation Relationships

### Cross-References Map

```
README.md (Architecture Overview)
  └─> sanity.config.ts (Plugin configuration section)
      └─> documentInternationalization config (lines 53-65)
          └─> SANITY_LANGUAGES constant (@workspace/i18n-config)
      └─> structure.ts (structureTool config)
          └─> createIndexListWithOrderableItems function (lines 114-164)
              └─> orderableDocumentList plugin interaction

README.md (Content Type System)
  └─> schemaTypes/documents/*.ts (Document schemas)
      └─> schemaTypes/definitions/*.ts (Reusable field groups)
          └─> schemaTypes/blocks/*.ts (Page builder blocks)

README.md (Common Workflows → Add Translatable Document)
  └─> Step 1: Create schema in schemaTypes/documents/
  └─> Step 2: Add language field from common.ts
  └─> Step 3: Register in sanity.config.ts:55-64 (schemaTypes array)
  └─> Step 4: Add to sanity.config.ts:80-88 (i18nTypes array)
  └─> Step 5: Add to structure.ts with language filter
  └─> Step 6: Run `pnpm type` to regenerate types
```

### File Documentation Priority

**Priority 1 (Critical - Handoff Blockers)**:
1. `sanity.config.ts` - Plugin configuration and template logic
2. `structure.ts` - Helper functions and sidebar structure
3. `README.md` - Architecture overview and workflows

**Priority 2 (Important - Frequently Modified)**:
4. `schemaTypes/documents/*.ts` - Document type schemas
5. `utils/helper.ts` - Shared utility functions
6. `utils/slug-validation.ts` - Custom validation logic

**Priority 3 (Nice to Have - Occasionally Modified)**:
7. `schemaTypes/blocks/*.ts` - Page builder blocks
8. `schemaTypes/definitions/*.ts` - Reusable field groups
9. `components/*.tsx` - Custom UI components

---

## Validation Rules (Existing, To Be Documented)

### Slug Validation
**Location**: `utils/slug-validation.ts`
**Rules**:
- Must be unique per language
- Cannot use reserved paths (e.g., `/blog`, `/api`)
- Must be URL-safe (lowercase, hyphens, no spaces)

**Implementation**: Custom async validation function used in page/blog schemas

### Required Fields by Type
**Translatable Documents**: Must have `language` field
**Orderable Documents**: Must have `orderRank` field (auto-added by plugin)
**Singleton Documents**: Must use singleton pattern in structure.ts

---

## State Transitions (Document Lifecycle)

### Translatable Document Creation Flow
1. **User clicks "Create New [Type]"** in Studio
2. **Template selection**: Only `[type]-fr` template available (DEFAULT_LOCALE)
3. **Document created**: With `language: "fr"` field pre-populated
4. **Translation action available**: User can create en/es translations via plugin UI
5. **Translation metadata created**: Plugin generates `translation.metadata` document linking all locales
6. **Sidebar filtering**: Only `fr` documents visible (structure.ts filters by DEFAULT_LOCALE)

### Orderable Document Reordering Flow
1. **User drags document** in Studio sidebar (e.g., blog post)
2. **orderRank updated**: Dragged document's `orderRank` field recalculated
3. **Translations NOT updated**: Other language versions keep old `orderRank`
4. **Query compensation required**: Frontend must use `coalesce(__i18n_base->orderRank, orderRank)` pattern

---

## Summary

This data model documents:
- **8 sections** of README.md to be created
- **10 document types** in schemaTypes/documents/
- **6 block types** in schemaTypes/blocks/
- **4 definition types** in schemaTypes/definitions/
- **3 plugin-generated fields** (language, translation metadata, orderRank)
- **Cross-reference map** showing documentation interconnections
- **Validation rules** and **state transitions** for existing schemas

All entities are existing - this feature adds documentation only, no schema changes.
