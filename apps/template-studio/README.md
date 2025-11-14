# Sanity Studio - Documentation

**Version**: 1.0.0
**Last Updated**: 2025-11-13

This documentation provides comprehensive guidance for developers working with the Sanity Studio application. It covers architecture, plugin ecosystem, content type organization, and common development workflows.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Plugin Ecosystem](#plugin-ecosystem)
4. [Plugin Interactions](#plugin-interactions)
5. [Content Type System](#content-type-system)
6. [Studio Structure (Sidebar)](#studio-structure-sidebar)
7. [Reference](#reference)

---

## Quick Start

### Installation

Install all dependencies from the monorepo root:

```bash
pnpm install
```

### Development Server

Start the Studio development server:

```bash
# From monorepo root
pnpm --filter studio dev

# Or from apps/studio directory
pnpm dev
```

The Studio will be available at `http://localhost:3333` (default Sanity port).

### Building for Production

Build the Studio for deployment:

```bash
# From monorepo root
pnpm --filter studio build

# Or from apps/studio directory
pnpm build
```

Built files are output to the `dist/` directory.

### Type Generation

Generate TypeScript types from Sanity schemas:

```bash
# From monorepo root
pnpm --filter studio type

# Or from apps/studio directory
pnpm type
```

This command:
1. Extracts schema definitions (`sanity schema extract --enforce-required-fields`)
2. Generates TypeScript types (`sanity typegen generate`)
3. Outputs types to `sanity.types.ts`

**Important**: Run this command after any schema changes to keep types in sync.

### Common NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `sanity dev` | Start development server with hot reload |
| `start` | `sanity start` | Start production server (alternative to dev) |
| `build` | `sanity build` | Build Studio for production deployment |
| `deploy` | `sanity deploy` | Deploy Studio to Sanity's hosting |
| `lint` | `npx ultracite lint` | Run linter to check code quality |
| `format` | `npx ultracite fix` | Auto-fix linting issues |
| `check-types` | `tsc --noEmit` | Type-check without emitting files |
| `check` | `npm run lint && npm run check-types` | Run both linting and type checking |
| `type` | `sanity schema extract && sanity typegen generate` | Generate TypeScript types from schemas |
| `deploy-graphql` | `sanity graphql deploy` | Deploy GraphQL API schema |
| `extract` | `sanity schema extract --enforce-required-fields` | Extract schema to JSON |

---

## Architecture Overview

### Directory Structure

```
apps/studio/
├── components/           # Reusable UI components for Studio
│   ├── logo.tsx         # Custom Studio logo component
│   ├── language-filter.ts  # i18n filtering utilities
│   ├── slug-field-component.tsx  # Custom slug input with validation
│   └── ...              # Other custom input components
│
├── hooks/                # Custom React hooks
│   └── use-slug-validation.ts  # Async slug uniqueness validation
│
├── schemaTypes/          # Content type schema definitions
│   ├── blocks/          # Page builder block schemas
│   │   ├── hero.ts      # Hero section with image/video
│   │   ├── cta.ts       # Call-to-action block
│   │   ├── faq-accordion.ts  # FAQ expandable section
│   │   ├── feature-cards-icon.ts  # Icon-based feature grid
│   │   ├── image-link-cards.ts   # Image card grid
│   │   └── subscribe-newsletter.ts  # Newsletter form
│   │
│   ├── documents/        # Main document type schemas
│   │   ├── page.ts      # Flexible page with builder
│   │   ├── blog.ts      # Blog post documents
│   │   ├── blog-index.ts  # Blog landing page
│   │   ├── home-page.ts  # Site homepage
│   │   ├── faq.ts       # FAQ question/answer
│   │   ├── author.ts    # Blog author profiles
│   │   ├── navbar.ts    # Navigation configuration
│   │   ├── footer.ts    # Footer configuration
│   │   ├── settings.ts  # Global site settings
│   │   └── redirect.ts  # URL redirect rules
│   │
│   ├── definitions/      # Reusable field groups
│   │   ├── pagebuilder.ts  # Page builder array field
│   │   ├── rich-text.ts   # Portable Text configuration
│   │   ├── button.ts      # Button field group
│   │   └── custom-url.ts  # Internal/external link field
│   │
│   ├── common.ts         # Shared schema utilities
│   └── index.ts          # Schema aggregation and exports
│
├── utils/                # Utility functions
│   ├── helper.ts        # General helper functions
│   ├── slug.ts          # Slug generation utilities
│   ├── slug-validation.ts  # Slug validation rules
│   ├── seo-fields.ts    # SEO meta field definitions
│   ├── og-fields.ts     # Open Graph field definitions
│   ├── constant.ts      # Constants and configuration
│   └── types.ts         # Type definitions
│
├── migrations/           # One-time data migration scripts
│   └── [migration-name]/ # Each migration in its own directory
│
├── plugins/              # Custom Sanity plugins
│   └── presentation-url.ts  # Preview URL resolver plugin
│
├── static/               # Static assets (logos, icons)
│
├── functions/            # Sanity Functions (serverless)
│
├── scripts/              # Build and setup scripts
│   └── cli-alert-for-data.ts  # Post-install data alert
│
├── sanity.config.ts      # Main Sanity configuration
├── structure.ts          # Sidebar navigation structure
├── location.ts           # Preview URL location resolver
└── README.md             # This documentation
```

### Design Principles

The Studio is organized following these principles:

1. **Separation of Concerns**: Schemas, components, utilities, and configuration are isolated into dedicated directories
2. **Schema Categorization**: Content types are grouped by purpose (documents vs blocks vs definitions)
3. **Flat Hierarchy**: Maximum 2 levels of nesting to reduce complexity
4. **Convention Over Configuration**: Follows Sanity's official patterns and naming conventions
5. **TypeScript Strict Mode**: All code uses strict type checking for reliability

### File Naming Conventions

- **Files**: `kebab-case` (e.g., `slug-validation.ts`, `feature-cards-icon.ts`)
- **Components**: `PascalCase` exports from `kebab-case` files (e.g., `export const SlugFieldComponent`)
- **Schema Types**: `camelCase` for IDs (e.g., `blogIndex`, `homePage`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_LOCALE`)

### Purpose of Major Directories

#### `schemaTypes/`
Contains all Sanity schema definitions organized by purpose:

- **`documents/`**: Full document types that appear in the Studio sidebar (pages, blogs, settings)
- **`blocks/`**: Page builder components that can be added to pageBuilder arrays
- **`definitions/`**: Reusable field groups referenced by multiple schemas (buttons, rich text, page builder)

**When to add files**:
- New top-level content type → `documents/`
- New page builder section → `blocks/`
- Reusable field pattern used in 2+ schemas → `definitions/`

See [sanity.config.ts](sanity.config.ts) line 273 where schemas are registered.

#### `components/`
React components that customize the Studio UI:

- Custom input components (e.g., slug field with validation)
- Preview components for custom document displays
- Utility components (e.g., logo, language filters)

**When to add files**: Creating custom input/preview for a schema field

See schema files using `components.input` property to reference these.

#### `hooks/`
React hooks for reusable logic:

- Form validation hooks
- Data fetching hooks
- State management hooks

**When to add files**: Extracting reusable React logic from components

Example: [use-slug-validation.ts](hooks/use-slug-validation.ts) provides async slug uniqueness checking.

#### `utils/`
Pure utility functions without React dependencies:

- Field definition generators (seo-fields, og-fields)
- Validation logic
- Data transformation helpers
- Constants

**When to add files**: Creating shared logic used across schemas or components

See [structure.ts](structure.ts) line 58 importing `getTitleCase` helper.

#### `migrations/`
One-time data migration scripts for schema changes:

- Adding new required fields to existing documents
- Transforming data structures
- Bulk updates

**When to add files**: Schema changes that require updating existing content

Run migrations with: `sanity exec migrations/[migration-name]/index.ts`

#### `plugins/`
Custom Sanity plugins that extend Studio functionality:

- Currently contains `presentation-url.ts` for preview URL resolution

**When to add files**: Creating reusable Studio functionality that doesn't fit in components/hooks

See [sanity.config.ts](sanity.config.ts) line 98 where custom plugin is registered.

#### `static/`
Static assets served by the Studio:

- Logo images
- Favicon
- Other public assets

**When to add files**: Adding images/files referenced in Studio UI

#### `functions/`
Sanity Functions (serverless functions) for backend logic:

- Custom API endpoints
- Webhooks
- Background jobs

**When to add files**: Creating serverless functions for Studio or frontend

---

## Plugin Ecosystem

The Studio uses 9 plugins that provide essential functionality. Understanding each plugin's purpose and configuration is critical for maintaining and extending the Studio.

| Plugin Name | Purpose | Key Configuration | When to Use |
|-------------|---------|-------------------|-------------|
| **presentationTool** | Live preview integration with frontend (apps/web). Enables side-by-side editing with real-time content preview. | `locations`: Maps Studio documents to frontend URLs via [location.ts](location.ts)<br>`previewUrl.origin`: Frontend URL from env var<br>`previewUrl.previewMode.enable`: Draft mode API route | Required for preview functionality. Configure when adding new document types that need frontend preview. See [sanity.config.ts:52-62](sanity.config.ts#L52-L62) |
| **structureTool** | Defines Studio sidebar navigation and content organization. Controls which documents appear and how they're grouped. | `structure`: Function from [structure.ts](structure.ts) that builds sidebar tree | Core to Studio - always required. Modify when adding new document types or changing sidebar organization. See [sanity.config.ts:80-82](sanity.config.ts#L80-L82) |
| **presentationUrl** | Custom plugin providing URL resolution utilities for presentation mode. Project-specific routing logic. | No configuration (default behavior) | Automatically loaded with presentationTool. Defined in [plugins/presentation-url.ts](plugins/presentation-url.ts). See [sanity.config.ts:98](sanity.config.ts#L98) |
| **visionTool** | Interactive GROQ query playground for testing and debugging data queries. | No configuration (default behavior) | Development tool - available under "Vision" tab in Studio. Use for testing queries before implementing in frontend. See [sanity.config.ts:114](sanity.config.ts#L114) |
| **unsplashImageAsset** | Adds Unsplash as an image source in media picker. Allows importing stock photos directly. | No configuration (default behavior) | Appears as "Unsplash" option in image field picker. No API key required (uses Sanity's integration). See [sanity.config.ts:131](sanity.config.ts#L131) |
| **media** | Enhanced media library replacing default Sanity image picker. Better organization, search, and bulk upload. | No configuration (default behavior) | Automatically replaces default image/file picker UI. Works with unsplashImageAsset. See [sanity.config.ts:148](sanity.config.ts#L148) |
| **iconPicker** | Searchable icon picker component for selecting icons in content (buttons, feature cards, etc.). | No configuration (default behavior) | Used via custom field type in schemas. Provides icon name and provider (e.g., "FiHome" from react-icons). See [sanity.config.ts:165](sanity.config.ts#L165) |
| **assist** | AI-powered content generation and editing assistance. "AI Assist" button in text fields. | No configuration (default behavior) | Requires Sanity AI credits. May incur additional costs based on plan. See [sanity.config.ts:182](sanity.config.ts#L182) |
| **documentInternationalization** | Multi-language content workflow. Adds "Translate" action for creating language variants. | `supportedLanguages`: Array from @workspace/i18n-config (fr, en, es)<br>`schemaTypes`: Document types supporting translation | Required for all translatable content. Add new document types to schemaTypes array. See [sanity.config.ts:215-227](sanity.config.ts#L215-L227) and [Plugin Interactions](#plugin-interactions) section |

---

## Plugin Interactions

While most plugins work independently, some have important interactions that affect Studio behavior and require special handling.

### documentInternationalization + structure.ts Filtering

**Interaction**: The i18n plugin creates language variants for translatable documents, but showing all variants in the sidebar would create duplicate entries (3x for fr/en/es).

**Solution**: [structure.ts](structure.ts) filters sidebar lists to show only `DEFAULT_LOCALE` (French) documents:

```typescript
// See structure.ts:342-353
S.listItem()
  .title("Pages")
  .child(
    S.documentTypeList("page")
      .filter("_type == $type && language == $lang")
      .params({ type: "page", lang: DEFAULT_LOCALE })  // Only show French
      .initialValueTemplates([S.initialValueTemplateItem(`page-${DEFAULT_LOCALE}`)])
  )
```

**Why this matters**:
- Users only see one entry per document (the French default)
- Translations are created via "Translate" action (documentInternationalization UI), not sidebar
- Prevents confusion about which entry to edit

**When to apply**: Every translatable document type added to sidebar must use this filter pattern. See [structure.ts:342-353](structure.ts#L342-L353) for pages, [structure.ts:375-386](structure.ts#L375-L386) for FAQs.

---

### orderableDocumentList + i18n orderRank Quirk

**Interaction**: When using `orderableDocumentListDeskItem` with translatable documents, drag-and-drop reordering only updates the `orderRank` field on the dragged document, NOT its translations.

**Problem**:
- User drags French blog post to new position → `orderRank` updated on French doc
- English/Spanish translations keep old `orderRank` values
- Querying `*[_type == "blog" && language == "en"] | order(orderRank)` shows wrong order

**Solution**: Frontend queries must use coalesce pattern to fall back to base document's orderRank:

```groq
*[_type == "blog" && language == $lang] | order(coalesce(__i18n_base->orderRank, orderRank))
```

**Explanation**:
- `__i18n_base`: Reference to the default language (French) document created by documentInternationalization
- `coalesce(__i18n_base->orderRank, orderRank)`: Use base document's orderRank if available, otherwise use current document's
- This ensures all language variants share the same order

**When to apply**: Any orderable + translatable document type. See [structure.ts:106-132](structure.ts#L106-L132) JSDoc for detailed explanation and [structure.ts:267-290](structure.ts#L267-L290) for implementation in blog structure.

---

### presentationTool + location.ts Integration

**Interaction**: The presentationTool plugin requires a location resolver to map Studio document IDs to frontend URLs for live preview.

**Configuration**: [location.ts](location.ts) defines resolvers for each previewable document type:

```typescript
// See location.ts:4-21
export const locations = {
  blog: defineLocations({
    select: { title: "title", slug: "slug.current" },
    resolve: (doc) => ({
      locations: [
        { title: doc?.title || "Untitled", href: `${doc?.slug}` },
        { title: "Blog", href: "/blog" }
      ]
    })
  }),
  // ... other types
}
```

**How it works**:
1. User edits a blog post in Studio
2. presentationTool calls `locations.blog.resolve()` with document data
3. Resolver returns array of frontend URLs to preview
4. Studio loads these URLs in preview pane with draft mode enabled

**When to modify**:
- Adding new document type that needs preview → Add resolver to `locations` object
- Changing frontend routing → Update `href` patterns in resolvers

See [sanity.config.ts:52-62](sanity.config.ts#L52-L62) for presentationTool configuration and [location.ts](location.ts) for resolver implementations.

---

### Other Plugin Considerations

**media + unsplashImageAsset**: Both plugins enhance image management but don't conflict. Media plugin provides the UI, Unsplash adds an additional source option.

**structureTool + All Document Plugins**: structureTool is foundational - all other document-related plugins (i18n, orderable, presentation) rely on it being configured first.

**visionTool**: Completely standalone - no interactions with other plugins. Safe to remove if not needed for development.

---

## Content Type System

Sanity schemas are organized into three categories: **documents**, **blocks**, and **definitions**. Understanding when to use each category is essential for maintaining a clean, scalable schema architecture.

### Schema Categories

#### Documents (`schemaTypes/documents/`)

**Purpose**: Top-level content types that appear in the Studio sidebar as standalone entities.

**Characteristics**:
- Have their own routes/pages in the Studio
- Can be queried directly with GROQ (e.g., `*[_type == "blog"]`)
- May have i18n support (translatable across languages)
- May be singletons (only one instance) or multi-instance

**When to use**:
- Creating a new type of content that editors will manage independently
- Content needs its own Studio sidebar entry
- Content will be queried by frontend as a top-level entity

**Examples**:
- `page`: Multi-instance, translatable pages (About, Contact, etc.)
- `blog`: Multi-instance, translatable, orderable blog posts
- `homePage`: Singleton, translatable homepage
- `author`: Multi-instance, non-translatable author profiles
- `settings`: Singleton, translatable global settings

**File structure**:
```typescript
// schemaTypes/documents/blog.ts
import { defineType } from 'sanity'

export default defineType({
  name: 'blog',
  type: 'document',  // Always 'document' for this category
  title: 'Blog',
  fields: [
    // ... field definitions
  ]
})
```

---

#### Blocks (`schemaTypes/blocks/`)

**Purpose**: Modular content sections that can be composed into page builder arrays.

**Characteristics**:
- Do NOT appear in sidebar as standalone documents
- Are embedded within document types (typically in pageBuilder arrays)
- Type is `'object'`, not `'document'`
- Represent visual sections (hero, CTA, feature grid, etc.)

**When to use**:
- Creating a new page builder section/component
- Content is always part of a larger document (page, homepage)
- Editors need to mix and match different content blocks

**Examples**:
- `hero`: Hero section with image/video background and CTA buttons
- `cta`: Call-to-action block with heading, description, button
- `faqAccordion`: Expandable FAQ section referencing FAQ documents
- `featureCardsIcon`: Grid of feature cards with icons
- `subscribeNewsletter`: Newsletter subscription form

**File structure**:
```typescript
// schemaTypes/blocks/hero.ts
import { defineType } from 'sanity'

export default defineType({
  name: 'hero',
  type: 'object',  // Always 'object' for blocks
  title: 'Hero',
  fields: [
    // ... field definitions
  ],
  preview: {
    // Preview configuration for page builder UI
  }
})
```

**Usage in documents**:
```typescript
// schemaTypes/definitions/pagebuilder.ts
{
  name: 'pageBuilder',
  type: 'array',
  of: [
    { type: 'hero' },
    { type: 'cta' },
    { type: 'faqAccordion' },
    // ... other blocks
  ]
}
```

See [schemaTypes/definitions/pagebuilder.ts](schemaTypes/definitions/pagebuilder.ts) for the full page builder configuration.

---

#### Definitions (`schemaTypes/definitions/`)

**Purpose**: Reusable field patterns and configurations used across multiple schemas.

**Characteristics**:
- Not standalone content - always embedded in documents or blocks
- Type varies (`'array'`, `'object'`, etc.) based on use case
- Contain complex field configurations to avoid duplication
- Centralize patterns like SEO fields, buttons, links

**When to use**:
- Field pattern is used in 2+ different schemas
- Complex field configuration that would clutter schema files
- Want to ensure consistency (e.g., all buttons have same fields)

**Examples**:
- `pageBuilder`: Array field containing all available page builder blocks
- `richText`: Portable Text configuration with custom marks/blocks
- `button`: Reusable button field group (text, URL, style)
- `customUrl`: Internal or external link field with conditional logic

**File structure**:
```typescript
// schemaTypes/definitions/button.ts
import { defineType } from 'sanity'

export default defineType({
  name: 'button',
  type: 'object',
  title: 'Button',
  fields: [
    { name: 'text', type: 'string', title: 'Button Text' },
    { name: 'url', type: 'customUrl', title: 'Link URL' },
    { name: 'style', type: 'string', options: { list: ['primary', 'secondary'] } }
  ]
})
```

**Usage in other schemas**:
```typescript
// schemaTypes/blocks/hero.ts
{
  name: 'ctaButtons',
  type: 'array',
  of: [{ type: 'button' }]  // References definition
}
```

---

### Common Field Patterns

Several field patterns appear consistently across schemas:

#### Language Field (Translatable Documents)

All translatable documents must include:

```typescript
{
  name: 'language',
  type: 'string',
  readOnly: true,
  hidden: true
}
```

**Purpose**: Required by documentInternationalization plugin to identify document locale.

**Configuration**: See [schemaTypes/common.ts](schemaTypes/common.ts) for the shared language field definition.

**Documents requiring this field**: page, blog, blogIndex, navbar, footer, settings, homePage, faq (all types listed in [sanity.config.ts:217-227](sanity.config.ts#L217-L227))

---

#### SEO Fields

Standard SEO metadata fields:

```typescript
{
  name: 'seo',
  type: 'object',
  fields: [
    { name: 'metaTitle', type: 'string' },
    { name: 'metaDescription', type: 'text' },
    { name: 'keywords', type: 'array', of: [{ type: 'string' }] }
  ]
}
```

**Utility**: Defined in [utils/seo-fields.ts](utils/seo-fields.ts) as reusable field group.

**Usage**: Import and spread into document schemas needing SEO customization.

---

#### Open Graph Fields

Social media preview metadata:

```typescript
{
  name: 'og',
  type: 'object',
  fields: [
    { name: 'ogTitle', type: 'string' },
    { name: 'ogDescription', type: 'text' },
    { name: 'ogImage', type: 'image' }
  ]
}
```

**Utility**: Defined in [utils/og-fields.ts](utils/og-fields.ts) as reusable field group.

**Usage**: Import and spread into documents needing social sharing configuration.

---

### Schema Organization Principles

1. **Documents for top-level entities**: If editors manage it independently → `documents/`
2. **Blocks for page sections**: If it's composed into pages → `blocks/`
3. **Definitions for reusable patterns**: If used in 2+ schemas → `definitions/`
4. **Common utilities**: Shared field configurations → `utils/` (seo-fields, og-fields)
5. **Keep files focused**: One schema type per file, named after the schema

---

## Studio Structure (Sidebar)

The Studio sidebar is customized via [structure.ts](structure.ts), which replaces Sanity's default alphabetical document list with a curated content hierarchy. Understanding how structure.ts works is essential for organizing content and adding new document types.

### How structure.ts Works

**Entry point**: [sanity.config.ts](sanity.config.ts) line 80-82 registers the structure function:

```typescript
structureTool({
  structure,  // Imports from structure.ts
})
```

**Structure function**: [structure.ts](structure.ts) line 314-445 exports a function that builds the sidebar tree:

```typescript
export const structure = (S: StructureBuilder, context: StructureResolverContext) =>
  S.list()
    .title("Content")
    .items([
      // Sidebar items defined here
    ])
```

**How Sanity uses it**:
1. Sanity calls `structure(S, context)` when building the Studio UI
2. `S` (StructureBuilder) provides methods to create list items, document lists, etc.
3. Function returns a nested structure of list items representing sidebar navigation
4. Structure replaces default behavior (alphabetical list of all document types)

---

### Helper Functions

To avoid repetition and ensure consistency, [structure.ts](structure.ts) defines three helper functions for common sidebar patterns:

#### createSingleTon

**Purpose**: Creates a sidebar item for singleton documents (only one instance globally).

**Signature**:
```typescript
createSingleTon({
  S: StructureBuilder,
  type: SingletonType,    // e.g., "homePage", "navbar"
  title?: string,         // Display name (optional, defaults to title-cased type)
  icon?: LucideIcon       // Sidebar icon (optional, defaults to File icon)
})
```

**When to use**:
- Document type should only exist once (homepage, global settings, navbar, footer)
- Want users to click directly into document without seeing a list

**Behavior**:
- Sets `documentId` to match schema type name, ensuring only one instance
- Clicking sidebar item opens the document directly (no list view)
- Does NOT apply language filtering (assumes singleton handles i18n internally)

**Example**:
```typescript
// See structure.ts:325
createSingleTon({ S, type: "homePage", icon: HomeIcon })
```

**Implementation**: [structure.ts:117-123](structure.ts#L117-L123)

---

#### createList

**Purpose**: Creates a sidebar item for standard multi-instance documents without filtering or ordering.

**Signature**:
```typescript
createList({
  S: StructureBuilder,
  type: SchemaType,       // e.g., "author", "redirect"
  title?: string,         // Display name (optional, defaults to title-cased type)
  icon?: LucideIcon,      // Sidebar icon (optional, defaults to File icon)
  id?: string             // Custom list ID (optional, defaults to type name)
})
```

**When to use**:
- Simple multi-instance documents (authors, redirects, tags)
- No language filtering needed (non-translatable)
- No special ordering required

**Behavior**:
- Creates a standard document type list item
- Shows all documents of this type
- No filters applied - displays complete unfiltered list

**Example**:
```typescript
// See structure.ts:393
createList({ S, type: "author", title: "Authors", icon: User })
```

**Important**: This helper does NOT apply filters. For translatable documents, use manual documentTypeList with language filter (see Pages/FAQs sections).

**Implementation**: [structure.ts:185-191](structure.ts#L185-L191)

---

#### createIndexListWithOrderableItems

**Purpose**: Creates a two-level sidebar structure: index singleton + orderable list of documents (e.g., Blog Index + Blog Posts).

**Signature**:
```typescript
createIndexListWithOrderableItems({
  S: StructureBuilder,
  context: StructureResolverContext,
  index: {
    type: SingletonType,  // e.g., "blogIndex"
    icon?: LucideIcon
  },
  list: {
    type: SchemaType,     // e.g., "blog"
    title?: string,       // e.g., "Blogs"
    icon?: LucideIcon
  }
})
```

**When to use**:
- Content type has both a landing page (index) and individual items (posts)
- Items need manual drag-and-drop ordering
- Content is translatable (function applies language filtering automatically)

**Behavior**:
- Creates nested structure: clicking sidebar opens list with 2 items:
  1. Index document (singleton)
  2. Orderable document list (drag-and-drop enabled)
- Automatically filters list to `DEFAULT_LOCALE` (French) only
- Adds `orderRank` field to documents for ordering
- Creates "+ Create" menu item with language-specific template

**Example**:
```typescript
// See structure.ts:364-369
createIndexListWithOrderableItems({
  S,
  index: { type: "blogIndex", icon: BookMarked },
  list: { type: "blog", title: "Blogs", icon: FileText },
  context,
})
```

**Important orderRank quirk**: When using with translatable documents, dragging only updates the dragged document's orderRank, NOT translations. Frontend queries must use:

```groq
*[_type == "blog" && language == $lang] | order(coalesce(__i18n_base->orderRank, orderRank))
```

See [Plugin Interactions](#orderabledocumentlist--i18n-orderrank-quirk) section for detailed explanation.

**Implementation**: [structure.ts:243-293](structure.ts#L243-L293)

---

### Language Filtering Pattern (DEFAULT_LOCALE)

For translatable documents that need manual sidebar configuration (not using helper functions), apply this pattern:

```typescript
// See structure.ts:342-353 (Pages example)
S.listItem()
  .title("Pages")
  .icon(FileIcon)
  .child(
    S.documentTypeList("page")
      .title("Pages")
      // Filter to show only French (default language) documents
      .filter("_type == $type && language == $lang")
      .params({ type: "page", lang: DEFAULT_LOCALE })
      // Only allow creating French pages via "+ Create" button
      .initialValueTemplates([S.initialValueTemplateItem(`page-${DEFAULT_LOCALE}`)])
  )
```

**Why this is needed**:
- documentInternationalization creates 3 documents for each piece of content (fr/en/es)
- Without filtering, sidebar shows 3 entries for every page (confusing for editors)
- Filtering to DEFAULT_LOCALE shows only French (base) documents
- Translations are created via "Translate" action, not sidebar "+ Create" button

**When to apply**:
- Every translatable document type in sidebar
- Can be omitted for non-translatable types (author, redirect)

**Template filtering** (`initialValueTemplates`):
- Forces users to create documents in default language (French) first
- Prevents orphaned translations (translations without a base document)
- Ensures proper i18n workflow: French first, then translate to English/Spanish

See [sanity.config.ts:264-270](sanity.config.ts#L264-L270) for global template filtering logic.

---

### Current Sidebar Structure

The sidebar is organized into these sections (see [structure.ts:320-445](structure.ts#L320-L445)):

```
Content
├── Homepage (singleton)
├── ─────────────────
├── Pages (filtered to fr, manual list)
├── Blogs (index + orderable list)
│   ├── Blog Index (singleton)
│   └── Blogs (orderable, filtered to fr)
├── FAQs (filtered to fr, manual list)
├── Authors (unfiltered, simple list)
├── Redirects (unfiltered, simple list)
├── ─────────────────
└── Site Configuration
    ├── Navigation (singleton)
    ├── Footer (singleton)
    └── Global Settings (singleton)
```

---

### Adding a New Document Type to Sidebar

**Scenario 1: Simple multi-instance, non-translatable** (e.g., tags)

```typescript
// Add to structure.ts items array:
createList({ S, type: "tag", title: "Tags", icon: TagIcon })
```

**Scenario 2: Translatable multi-instance** (e.g., case studies)

```typescript
// Add to structure.ts items array:
S.listItem()
  .title("Case Studies")
  .icon(BriefcaseIcon)
  .child(
    S.documentTypeList("caseStudy")
      .title("Case Studies")
      .filter("_type == $type && language == $lang")
      .params({ type: "caseStudy", lang: DEFAULT_LOCALE })
      .initialValueTemplates([S.initialValueTemplateItem(`caseStudy-${DEFAULT_LOCALE}`)])
  )
```

**Scenario 3: Singleton** (e.g., pricing page)

```typescript
// Add to structure.ts items array:
createSingleTon({ S, type: "pricingPage", title: "Pricing", icon: DollarSignIcon })
```

**Scenario 4: Index + orderable items** (e.g., Products with Product Index)

```typescript
// Add to structure.ts items array:
createIndexListWithOrderableItems({
  S,
  index: { type: "productIndex", icon: PackageIcon },
  list: { type: "product", title: "Products", icon: ShoppingCartIcon },
  context,
})
```

---

## Reference

### Environment Variables

Studio configuration is managed via environment variables. Create a `.env` file in `apps/studio/` based on `.env.example`:

```bash
# Sanity project configuration
SANITY_STUDIO_DATASET=production        # Dataset name (production/staging/development)
SANITY_STUDIO_PROJECT_ID=your-project-id  # Sanity project ID (from sanity.io)
SANITY_STUDIO_TITLE="Your Studio Name"  # Studio title (appears in browser tab)

# Preview integration
SANITY_STUDIO_PRESENTATION_URL=http://localhost:3000  # Frontend URL for live preview

# Production deployment
SANITY_STUDIO_PRODUCTION_HOSTNAME=your-studio-url.sanity.studio  # Production Studio hostname
```

**Required variables**:
- `SANITY_STUDIO_PROJECT_ID`: Sanity project ID (get from sanity.io/manage)
- `SANITY_STUDIO_DATASET`: Dataset name (typically "production")

**Optional variables**:
- `SANITY_STUDIO_TITLE`: Custom Studio title (defaults to "Sanity Studio")
- `SANITY_STUDIO_PRESENTATION_URL`: Frontend URL for preview (defaults to http://localhost:3000)
- `SANITY_STUDIO_PRODUCTION_HOSTNAME`: Custom hostname for Studio deployment

**Finding your project ID**:
1. Log in to sanity.io
2. Go to https://sanity.io/manage
3. Select your project
4. Copy project ID from URL or settings

---

### NPM Scripts Reference

Detailed description of all available commands:

#### Development Commands

**`pnpm dev`**
- Starts Sanity Studio development server with hot module reload
- Default URL: http://localhost:3333
- Watches for file changes and auto-reloads
- **When to use**: Local development, testing schema changes

**`pnpm start`**
- Alternative to `dev`, starts production-like server
- Less common - `dev` is preferred for local work
- **When to use**: Testing production build behavior locally

**`pnpm check-types`**
- Runs TypeScript compiler in check mode (no files emitted)
- Verifies all types are correct across codebase
- **When to use**: Before committing, CI/CD pipelines

**`pnpm lint`**
- Runs Ultracite linter to check code quality and style
- Reports issues but doesn't auto-fix
- **When to use**: Verifying code quality, pre-commit hooks

**`pnpm format`**
- Runs Ultracite linter with auto-fix enabled
- Automatically fixes formatting issues
- **When to use**: Before committing to clean up code style

**`pnpm check`**
- Runs both `lint` and `check-types` sequentially
- Comprehensive code quality check
- **When to use**: Pre-commit verification, CI/CD

---

#### Build & Deployment Commands

**`pnpm build`**
- Builds Studio for production deployment
- Outputs to `dist/` directory
- Minifies code and optimizes assets
- **When to use**: Before deploying to hosting (Vercel, Netlify, etc.)

**`pnpm deploy`**
- Deploys Studio to Sanity's hosting (*.sanity.studio subdomain)
- Runs build automatically before deploy
- Requires authentication (`sanity login`)
- **When to use**: Deploying to Sanity's managed hosting

**`pnpm deploy-graphql`**
- Deploys GraphQL API schema to Sanity
- Required if using Sanity's GraphQL API (not required for GROQ)
- **When to use**: After schema changes if project uses GraphQL

---

#### Type Generation Commands

**`pnpm type`**
- Full type generation workflow: extract schema + generate TypeScript types
- Outputs to `sanity.types.ts`
- **When to use**: After adding/modifying schemas

**`pnpm extract`**
- Extracts schema to JSON format (`schema.json`)
- Validates schema structure
- **When to use**: Debugging schema issues, generating external documentation

---

### Naming Conventions

**Files**:
- Use `kebab-case` for all file names
- Examples: `slug-validation.ts`, `feature-cards-icon.ts`, `use-slug-validation.ts`

**Components**:
- Export using `PascalCase` from `kebab-case` files
- Example: `export const SlugFieldComponent` from `slug-field-component.tsx`

**Schema Types**:
- Use `camelCase` for schema type IDs
- Examples: `blogIndex`, `homePage`, `faqAccordion`
- Exceptions: Multi-word acronyms stay uppercase (e.g., `FAQ` would be `faq`)

**Constants**:
- Use `UPPER_SNAKE_CASE` for constants
- Examples: `DEFAULT_LOCALE`, `SANITY_LANGUAGES`, `MAX_ITEMS`

**Variables/Functions**:
- Use `camelCase` for variables and functions
- Examples: `getTitleCase`, `useSlugValidation`, `isDocumentOrphaned`

---

### Code Style Guidelines

**TypeScript**:
- Strict mode enabled (`tsconfig.json`)
- Explicit return types for exported functions
- Avoid `any` type - use `unknown` or proper types
- Prefer `interface` over `type` for object shapes (Sanity convention)

**JSDoc Comments**:
- All exported functions must have JSDoc comments
- Include `@param`, `@returns`, `@example`, `@remarks` tags where applicable
- See [structure.ts:72-116](structure.ts#L72-L116) for reference standard

**Example**:
```typescript
/**
 * Brief one-line description
 *
 * Detailed explanation of what this function does and why.
 *
 * @param paramName - Description of parameter
 * @returns Description of return value
 *
 * @example
 * ```typescript
 * const result = functionName({ param: value });
 * ```
 *
 * @remarks
 * Important notes, gotchas, or edge cases.
 */
export const functionName = (paramName: string): ReturnType => {
  // implementation
}
```

**Imports**:
- Group imports: external packages → Sanity packages → local files
- Use absolute imports for cross-directory references
- Use relative imports for same-directory references

**Schema Definitions**:
- Use `defineType`, `defineField`, `defineArrayMember` from `sanity` package
- One schema type per file
- Export as default (allows `export default defineType(...)`)

---

### Cross-References to Key Files

This section provides direct links to important code sections for quick reference:

**Plugin Configuration**:
- All plugins: [sanity.config.ts:32-228](sanity.config.ts#L32-L228)
- documentInternationalization: [sanity.config.ts:215-227](sanity.config.ts#L215-L227)
- presentationTool: [sanity.config.ts:52-62](sanity.config.ts#L52-L62)
- structureTool: [sanity.config.ts:80-82](sanity.config.ts#L80-L82)

**Sidebar Structure**:
- Main structure function: [structure.ts:314-445](structure.ts#L314-L445)
- createSingleTon helper: [structure.ts:117-123](structure.ts#L117-L123)
- createList helper: [structure.ts:185-191](structure.ts#L185-L191)
- createIndexListWithOrderableItems helper: [structure.ts:243-293](structure.ts#L243-L293)
- Pages configuration (language filtering): [structure.ts:342-353](structure.ts#L342-L353)
- Blogs configuration (orderable + i18n): [structure.ts:364-369](structure.ts#L364-L369)

**Template Configuration**:
- newDocumentOptions (global "+" menu filtering): [sanity.config.ts:264-270](sanity.config.ts#L264-L270)
- schema.templates (i18n template filtering): [sanity.config.ts:274-367](sanity.config.ts#L274-L367)
- nested-page-template: [sanity.config.ts:349-365](sanity.config.ts#L349-L365)

**Schema Organization**:
- Schema aggregation: [schemaTypes/index.ts](schemaTypes/index.ts)
- Document types: [schemaTypes/documents/](schemaTypes/documents/)
- Block types: [schemaTypes/blocks/](schemaTypes/blocks/)
- Definition types: [schemaTypes/definitions/](schemaTypes/definitions/)

**Utilities**:
- Helper functions: [utils/helper.ts](utils/helper.ts)
- Slug validation: [utils/slug-validation.ts](utils/slug-validation.ts)
- SEO fields: [utils/seo-fields.ts](utils/seo-fields.ts)
- OG fields: [utils/og-fields.ts](utils/og-fields.ts)

**Preview Integration**:
- Location resolvers: [location.ts](location.ts)
- Preview URL plugin: [plugins/presentation-url.ts](plugins/presentation-url.ts)

---

## Common Workflows

This section provides step-by-step guides for common development tasks when working with the Studio.

### Adding a New Translatable Document Type

When adding a new document type that needs to support multiple languages (French, English, Spanish), follow this checklist to ensure proper i18n integration:

**Step 1: Create Schema File**
- Create a new schema file in `schemaTypes/documents/` (e.g., `case-study.ts`)
- Use `defineType()` with `type: 'document'`
- Define your fields following existing schema patterns

**Step 2: Add Language Field**
- Import `languageField` from `common.ts`
- Add it as the first field in your schema:
  ```typescript
  import { languageField } from '../common';

  export const caseStudy = defineType({
    name: 'caseStudy',
    type: 'document',
    fields: [
      languageField,  // Required for i18n support
      // ... your other fields
    ]
  });
  ```

**Step 3: Register in supportedLanguages Array**
- Open `sanity.config.ts`
- Find the `documentInternationalization` plugin configuration (line 215-227)
- Add your schema type name to the `schemaTypes` array:
  ```typescript
  documentInternationalization({
    supportedLanguages: SANITY_LANGUAGES,
    schemaTypes: [
      "page",
      "blog",
      // ... other types
      "caseStudy",  // Add your new type here
    ],
  }),
  ```

**Step 4: Add to i18nTypes Array**
- In the same file (`sanity.config.ts`), find the `schema.templates` configuration (line 274-367)
- Add your type to the `i18nTypes` array (line 286-295):
  ```typescript
  const i18nTypes = [
    "page",
    "blog",
    // ... other types
    "caseStudy",  // Add your new type here
  ];
  ```

**Step 5: Add to Structure.ts**
- Open `structure.ts`
- Add a new list item to the sidebar with language filtering:
  ```typescript
  S.listItem()
    .title("Case Studies")
    .icon(BriefcaseIcon)
    .child(
      S.documentTypeList("caseStudy")
        .title("Case Studies")
        .filter("_type == $type && language == $lang")
        .params({ type: "caseStudy", lang: DEFAULT_LOCALE })
        .initialValueTemplates([S.initialValueTemplateItem(`caseStudy-${DEFAULT_LOCALE}`)])
    )
  ```

**Step 6: Regenerate TypeScript Types**
- Run the type generation command:
  ```bash
  pnpm --filter studio type
  ```
- This updates `sanity.types.ts` with your new schema

**Step 7: Add to newDocumentOptions Filter (Optional)**
- If your document should appear in the global "+" menu, add it to the filter in `sanity.config.ts` (line 267):
  ```typescript
  return prev.filter(doc =>
    ['author', 'page-fr', 'blog-fr', 'caseStudy-fr', 'faq-fr', 'redirect'].includes(doc.templateId)
  )
  ```

### Validation: How to Verify Translation Actions Appear

After completing the steps above, verify your i18n integration is working correctly:

1. **Start the Studio development server**:
   ```bash
   pnpm --filter studio dev
   ```

2. **Create a new document**:
   - Click the global "+" button in Studio
   - You should see only the French template (e.g., "Case Study-fr")
   - Create a new document

3. **Check for "Translate" action**:
   - Open your newly created document
   - Click the three-dot menu (•••) in the top-right corner
   - You should see a "Translate to..." action with language options (English, Spanish)
   - If this action appears, i18n is configured correctly

4. **Test translation creation**:
   - Click "Translate to... English"
   - Studio should create an English variant linked to the French original
   - Both documents should appear in the "Translations" sidebar widget

5. **Verify sidebar filtering**:
   - Go back to the main Studio sidebar
   - Your document list should show only French (default locale) documents
   - No duplicate entries for English/Spanish variants

### Common Issues

**Translation actions not appearing**:
- [ ] Check that `language` field is included in schema (imported from `common.ts`)
- [ ] Verify schema type is in `documentInternationalization.schemaTypes` array (sanity.config.ts:217-227)
- [ ] Verify schema type is in `i18nTypes` array (sanity.config.ts:286-295)
- [ ] Restart Studio dev server after configuration changes
- [ ] Clear browser cache and refresh Studio

**Language field missing or invalid**:
- The language field must be exactly as defined in `common.ts`:
  - `readOnly: true` (prevents manual editing)
  - `hidden: true` (not visible in Studio UI)
  - Uses validation to ensure value is one of the supported languages
- Do NOT create a custom language field - always import from `common.ts`

**OrderRank not syncing across translations**:
- This is a known limitation when using `orderableDocumentList` + i18n
- Frontend queries must use the coalesce pattern to fall back to base document's orderRank:
  ```groq
  *[_type == "blog" && language == $lang]
    | order(coalesce(__i18n_base->orderRank, orderRank))
  ```
- See [Plugin Interactions](#orderabledocumentlist--i18n-orderrank-quirk) section for detailed explanation

---

### Modifying Studio Sidebar Structure

The Studio sidebar structure is defined in [structure.ts](structure.ts) and controls how content is organized and displayed. This workflow guides you through reorganizing content or adjusting the sidebar layout.

#### When to Modify Sidebar Structure

Modify the sidebar structure when you need to:
- Change the order or grouping of content types in the sidebar
- Add new sections or dividers to organize related content
- Create nested content hierarchies (e.g., grouping settings documents)
- Adjust which content types are visible to editors
- Change icons or titles for sidebar items

#### Step-by-Step Guide for Reorganizing Content

**Step 1: Locate the Structure Function**
- Open [structure.ts](structure.ts)
- Find the main `structure()` function (line 314-445)
- The sidebar is defined by the `items` array inside `S.list().title("Content").items([...])`

**Step 2: Understanding Item Order**
- Items appear in the sidebar in the same order they're listed in the array
- Dividers (`S.divider()`) create visual separators between sections
- Each item is either a list item, singleton, or nested group

**Step 3: Moving Content Items**
- Cut the entire item definition (typically a `createSingleTon()`, `createList()`, or `S.listItem()` call)
- Paste it in the desired position within the `items` array
- Add or remove dividers (`S.divider()`) as needed for visual organization

**Example: Moving FAQs before Blogs**
```typescript
// Before:
items([
  createSingleTon({ S, type: "homePage", icon: HomeIcon }),
  S.divider(),
  S.listItem().title("Pages")...,
  createIndexListWithOrderableItems({ /* Blogs */ }),
  S.listItem().title("FAQs")...,
  // ...
])

// After:
items([
  createSingleTon({ S, type: "homePage", icon: HomeIcon }),
  S.divider(),
  S.listItem().title("Pages")...,
  S.listItem().title("FAQs")...,  // Moved up
  createIndexListWithOrderableItems({ /* Blogs */ }),  // Moved down
  // ...
])
```

**Step 4: Creating Nested Groups**
- Use `S.listItem().child(S.list().items([...]))` to create collapsible sections
- Useful for grouping related content types (e.g., "Site Configuration" contains navbar, footer, settings)

**Example: Creating a "Content" Group**
```typescript
S.listItem()
  .title("Content")
  .icon(FileIcon)
  .child(
    S.list()
      .title("Content")
      .items([
        S.listItem().title("Pages")...,
        S.listItem().title("Blogs")...,
        S.listItem().title("FAQs")...,
      ])
  )
```

#### Using Helper Functions

The structure.ts file provides three helper functions to reduce boilerplate and ensure consistency:

**createSingleTon - For Single-Instance Documents**

Use when: Document type should only exist once (homepage, global settings, navbar)

```typescript
createSingleTon({
  S,                        // Required: StructureBuilder instance
  type: "homePage",         // Required: Schema type name (must be in SingletonType union)
  title: "Homepage",        // Optional: Display name (defaults to title-cased type)
  icon: HomeIcon            // Optional: Lucide icon (defaults to File icon)
})
```

**How it works**:
- Sets `documentId` to match schema type, ensuring only one document exists
- Clicking sidebar item opens document directly (no list view)
- Does NOT apply language filtering (singleton handles i18n internally)

**Example from existing structure**:
```typescript
// See structure.ts:325
createSingleTon({ S, type: "homePage", icon: HomeIcon })

// See structure.ts:425-430 (in nested Site Configuration group)
createSingleTon({ S, type: "navbar", title: "Navigation", icon: PanelBottom })
```

---

**createList - For Multi-Instance Documents (Non-Translatable)**

Use when: Simple multi-instance documents without language filtering or special ordering (authors, redirects, tags)

```typescript
createList({
  S,                        // Required: StructureBuilder instance
  type: "author",           // Required: Schema type name (must be in SchemaType union)
  title: "Authors",         // Optional: Display name (defaults to title-cased type)
  icon: User,               // Optional: Lucide icon (defaults to File icon)
  id: "author-list"         // Optional: Custom list ID (defaults to type name)
})
```

**How it works**:
- Creates standard document type list item
- Shows all documents of this type
- NO filters applied - displays complete unfiltered list
- Do NOT use for translatable documents (use manual documentTypeList with filter instead)

**Example from existing structure**:
```typescript
// See structure.ts:393
createList({ S, type: "author", title: "Authors", icon: User })

// See structure.ts:400-405
createList({ S, type: "redirect", title: "Redirects", icon: TrendingUpDown })
```

---

**createIndexListWithOrderableItems - For Index + Orderable List**

Use when: Content type has both a landing page (index) and orderable items (e.g., Blog Index + Blog Posts)

```typescript
createIndexListWithOrderableItems({
  S,                                    // Required: StructureBuilder instance
  context,                              // Required: StructureResolverContext
  index: {
    type: "blogIndex",                  // Required: Singleton schema type for index page
    icon: BookMarked                    // Optional: Icon for index
  },
  list: {
    type: "blog",                       // Required: Schema type for list items
    title: "Blogs",                     // Optional: Display name for list
    icon: FileText                      // Optional: Icon for list items
  }
})
```

**How it works**:
- Creates nested structure: clicking sidebar opens list with 2 items
  1. Index document (singleton landing page)
  2. Orderable document list (drag-and-drop enabled via orderableDocumentListDeskItem)
- Automatically filters list to DEFAULT_LOCALE (French) only
- Adds `orderRank` field to documents for manual ordering
- Creates "+ Create" menu item with language-specific template

**Important orderRank quirk**: When using with translatable documents, dragging only updates the dragged document's orderRank, NOT translations. Frontend queries must use:

```groq
*[_type == "blog" && language == $lang] | order(coalesce(__i18n_base->orderRank, orderRank))
```

See [Plugin Interactions](#orderabledocumentlist--i18n-orderrank-quirk) section for detailed explanation.

**Example from existing structure**:
```typescript
// See structure.ts:364-369
createIndexListWithOrderableItems({
  S,
  context,
  index: { type: "blogIndex", icon: BookMarked },
  list: { type: "blog", title: "Blogs", icon: FileText },
})
```

#### Testing Checklist

After modifying structure.ts, verify your changes:

1. **Restart Dev Server**:
   ```bash
   # Kill existing dev server (Ctrl+C)
   pnpm --filter studio dev
   ```
   Structure changes require a full restart (hot reload doesn't work for structure.ts)

2. **Check Sidebar Appearance**:
   - [ ] Open Studio at http://localhost:3333
   - [ ] Verify all expected items appear in correct order
   - [ ] Check icons and titles display correctly
   - [ ] Confirm dividers appear in expected positions
   - [ ] Test nested groups expand/collapse properly

3. **Verify Filtering (Translatable Documents)**:
   - [ ] Open a translatable document list (Pages, FAQs, Blogs)
   - [ ] Should see only French (default locale) documents
   - [ ] No duplicate entries for English/Spanish variants
   - [ ] Check "+ Create" button only shows French template

4. **Test Document Creation**:
   - [ ] Click "+ Create" button on a list
   - [ ] Verify correct template is used
   - [ ] Create test document, check language field is set correctly
   - [ ] For orderable lists, verify drag-and-drop works

5. **Type Check**:
   ```bash
   pnpm --filter studio check-types
   ```
   Ensure no TypeScript errors from structure changes

---

### Adding a New Singleton Document

Singleton documents are content types that should only exist once globally (homepage, navigation, footer, global settings). This workflow guides you through creating and configuring a new singleton.

#### When to Use Singletons

Use singleton documents when:
- Only one instance of this content should exist (e.g., homepage, site settings)
- Content represents global/site-wide configuration (navbar, footer, analytics settings)
- You want editors to click directly into the document without seeing a list

Do NOT use singletons when:
- Content allows multiple instances (blog posts, pages, authors)
- Content needs to be duplicated or varied (use regular document types instead)

#### Step-by-Step Checklist

**Step 1: Create Schema File**
- Create schema file in `schemaTypes/documents/` (e.g., `pricing-page.ts`)
- Use `defineType()` with `type: 'document'`
- Define fields following existing patterns

```typescript
// schemaTypes/documents/pricing-page.ts
import { defineType } from 'sanity';

export const pricingPage = defineType({
  name: 'pricingPage',        // camelCase ID
  type: 'document',
  title: 'Pricing Page',
  fields: [
    // ... your fields
  ]
});
```

**Step 2: Add to Schema Index**
- Open `schemaTypes/index.ts`
- Import your new schema
- Add to schema types array

```typescript
import { pricingPage } from './documents/pricing-page';

export const schemaTypes = [
  // ... existing schemas
  pricingPage,
];
```

**Step 3: Add to Sidebar Structure**
- Open `structure.ts`
- Import icon (if using custom icon): `import { DollarSignIcon } from 'lucide-react'`
- Add singleton to structure items array using `createSingleTon` helper

```typescript
// Add to structure() function items array:
createSingleTon({
  S,
  type: "pricingPage",          // Must match schema name
  title: "Pricing",             // Optional: Display name
  icon: DollarSignIcon          // Optional: Custom icon
})
```

**Step 4: Regenerate TypeScript Types**
```bash
pnpm --filter studio type
```
This updates `sanity.types.ts` with your new schema

**Step 5: Test Singleton Behavior**
- Restart dev server: `pnpm --filter studio dev`
- Check sidebar - should see new "Pricing" item
- Click item - should open document directly (no list view)
- Create document, save changes
- Navigate away and return - should open same document (reuses documentId)

#### Difference: Singleton vs Translatable Singleton

**Regular Singleton (Non-Translatable)**

Use when: Content is the same across all languages

Example: Author profiles, redirect rules

Schema:
```typescript
export const author = defineType({
  name: 'author',
  type: 'document',
  title: 'Author',
  fields: [
    { name: 'name', type: 'string', title: 'Name' },
    { name: 'bio', type: 'text', title: 'Bio' },
    // NO language field - not translatable
  ]
});
```

Configuration:
- Does NOT include `language` field
- Does NOT appear in `documentInternationalization.schemaTypes` array (sanity.config.ts)
- No translation actions in Studio UI

---

**Translatable Singleton (Multi-Language)**

Use when: Content varies by language (French, English, Spanish versions)

Example: Homepage, global settings, navbar, footer

Schema:
```typescript
import { languageField } from '../common';

export const homePage = defineType({
  name: 'homePage',
  type: 'document',
  title: 'Home Page',
  fields: [
    languageField,  // Required for i18n support
    { name: 'title', type: 'string', title: 'Title' },
    { name: 'description', type: 'text', title: 'Description' },
  ]
});
```

Configuration:
- Includes `language` field (imported from `common.ts`)
- Added to `documentInternationalization.schemaTypes` array:
  ```typescript
  // sanity.config.ts:215-227
  documentInternationalization({
    supportedLanguages: SANITY_LANGUAGES,
    schemaTypes: [
      "page",
      "blog",
      "homePage",  // Add your translatable singleton here
      // ...
    ],
  })
  ```
- Added to `i18nTypes` array for template filtering:
  ```typescript
  // sanity.config.ts:286-295
  const i18nTypes = [
    "page",
    "blog",
    "homePage",  // Add here too
    // ...
  ];
  ```

Studio behavior:
- Editor opens French (default) version by default
- "Translate" action available in document menu to create English/Spanish variants
- All language variants share same documentId pattern (homePage-fr, homePage-en, homePage-es)

**Verification**: Open document, check for "Translate to..." action in three-dot menu. If present, singleton is translatable.

#### Examples from Existing Codebase

**Translatable Singleton**:
- **homePage** (schemaTypes/documents/home-page.ts)
  - Has language field
  - Listed in documentInternationalization plugin
  - Translation actions available in Studio
  - See structure.ts:325 for sidebar configuration

**Non-Translatable Singleton Pattern** (if needed):
```typescript
// Example: If you wanted to create a singleton analytics config
export const analyticsConfig = defineType({
  name: 'analyticsConfig',
  type: 'document',
  title: 'Analytics Configuration',
  fields: [
    { name: 'googleAnalyticsId', type: 'string', title: 'Google Analytics ID' },
    { name: 'facebookPixelId', type: 'string', title: 'Facebook Pixel ID' },
    // No language field - same config across all languages
  ]
});

// structure.ts
createSingleTon({ S, type: "analyticsConfig", title: "Analytics", icon: BarChartIcon })
```

---

### Plugin Configuration Guidelines

The Studio uses 9 plugins that provide essential functionality. Understanding when and how to add new plugins is critical for maintaining a stable, performant Studio.

#### When to Add New Plugins

Consider adding a new plugin when:
- **Functionality Gap**: Required feature is not available in core Sanity or existing plugins
- **Official Sanity Plugin**: Plugin is maintained by Sanity team or reputable community developers
- **Well-Maintained**: Plugin has recent commits, active issues/PRs, and good documentation
- **Compatibility**: Plugin supports current Sanity version (check package.json compatibility)
- **Performance**: Plugin doesn't significantly slow down Studio load time or editing experience

Do NOT add plugins for:
- Features you can build with custom components (avoid plugin bloat)
- Poorly maintained packages (check last update date on npm)
- Experimental/alpha plugins in production environments
- Functionality that overlaps with existing plugins

#### How to Add a New Plugin

**Step 1: Research Plugin**
- Find plugin in [Sanity Plugin Library](https://www.sanity.io/plugins)
- Check npm package page for:
  - Last published date (prefer < 6 months old)
  - Weekly downloads (indicates adoption)
  - GitHub stars/issues (indicates community support)
- Read documentation and examples
- Check compatibility with Sanity v3 (our version)

**Step 2: Install Plugin**
```bash
# From apps/studio directory
pnpm add [plugin-package-name]
```

**Step 3: Add to sanity.config.ts**
- Import plugin at top of file
- Add plugin call to `plugins` array
- Add comprehensive JSDoc comment explaining plugin purpose

**Example**:
```typescript
// Import at top
import { newPlugin } from 'sanity-plugin-new-feature';

export default defineConfig({
  // ...
  plugins: [
    // ... existing plugins

    // ============================================================================
    // NEW PLUGIN - Brief Title
    // ============================================================================
    //
    // Detailed explanation of what this plugin does and why it's needed.
    //
    // Key configuration:
    // - configOption: Description of what this option does
    // - anotherOption: Description of another option
    //
    // Dependencies:
    // - Interactions with other plugins or Studio features
    // - Any environment variables or external services required
    //
    // @see https://www.sanity.io/plugins/plugin-name - Official documentation
    //
    newPlugin({
      configOption: "value",
    }),
  ],
});
```

**Step 4: Update README.md Plugin Ecosystem Table**
- Add row to Plugin Ecosystem table (line 282-291)
- Include: Plugin name, purpose, key configuration, when to use
- Follow format of existing entries

**Step 5: Test Plugin**
```bash
# Restart dev server
pnpm --filter studio dev

# Open Studio, verify plugin functionality
# Check browser console for errors
# Test plugin features
```

**Step 6: Document Plugin Interactions**
- If plugin interacts with existing plugins, add section to "Plugin Interactions" (line 293-391)
- Explain any quirks, limitations, or workarounds
- Provide code examples for common usage patterns

#### Best Practices for Plugin Evaluation

**Performance Check**:
- Monitor Studio load time before/after adding plugin
- Check if plugin lazy-loads or bundles large dependencies
- Test editing experience - does plugin slow down typing/saving?

**Configuration Review**:
- Start with minimal configuration, add options as needed
- Document all configuration options in JSDoc comments
- Use environment variables for API keys or environment-specific settings

**Type Safety**:
- Check if plugin provides TypeScript types
- If not, consider creating ambient type declarations in `types/` directory
- Run `pnpm check-types` to verify no type errors introduced

**Deprecation Check**:
- Check plugin documentation for deprecation notices
- Verify plugin uses current Sanity APIs (not deprecated v2 patterns)
- Plan for plugin upgrades when new versions release

#### Common Plugin Patterns

**Pattern 1: UI Enhancement Plugins** (media, iconPicker, unsplashImageAsset)
- Enhance Studio editing experience
- Usually zero configuration
- Low risk - can be removed without affecting data

**Pattern 2: Workflow Plugins** (documentInternationalization, orderableDocumentList)
- Change how content is created/organized
- Moderate configuration required
- Medium risk - removal may require data migration
- Test thoroughly before deploying

**Pattern 3: Preview/Development Plugins** (presentationTool, visionTool)
- Help developers and editors preview content
- Require configuration (URLs, resolvers)
- Low risk - don't affect data structure

**Pattern 4: AI/External Service Plugins** (assist)
- Connect to external services
- May require API keys or paid plans
- Review cost implications before enabling

#### Plugin Documentation Standards

All plugins in sanity.config.ts must have comprehensive JSDoc comments following this template:

```typescript
// ============================================================================
// [PLUGIN NAME] - [Brief Title]
// ============================================================================
//
// [1-2 sentence description of what plugin does and primary use case]
//
// Key configuration:
// - optionName: Description of option and when to use it
// - anotherOption: Description of another option
//
// Dependencies:
// - Interactions with other plugins
// - External services or APIs required
// - Environment variables used
//
// @see [URL to official documentation]
//
pluginName({
  // configuration options with inline comments for complex settings
}),
```

See existing plugins in [sanity.config.ts:32-228](sanity.config.ts#L32-L228) for reference examples.

---

## Additional Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [Sanity Schema Types Reference](https://www.sanity.io/docs/schema-types)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Document Internationalization Plugin](https://github.com/sanity-io/document-internationalization)
- [Orderable Document List Plugin](https://github.com/sanity-io/orderable-document-list)
- [Sanity Plugin Library](https://www.sanity.io/plugins)

---

**Last Updated**: 2025-11-13
**Maintainer**: Development Team
