# Data Model: Complete Schema Migration

**Phase**: 1 - Design & Contracts
**Date**: 2025-11-14
**Related**: [plan.md](./plan.md) | [research.md](./research.md)

## Overview

This document defines the data model for all schemas being migrated to shared workspace packages. The model represents the structure of Sanity schema definitions and their relationships.

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    SANITY CONTENT LAKE                       │
│                  (Existing, No Changes)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ references
                              ▼
┌──────────────────────────────────────────────────────────────┐
│              WORKSPACE PACKAGES (Migration Target)            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────┐        │
│  │   @walter/sanity-atoms (Primitive Types)        │        │
│  ├─────────────────────────────────────────────────┤        │
│  │                                                  │        │
│  │  • button (NEW)                                 │        │
│  │    - variant, text, url (customUrl)            │        │
│  │                                                  │        │
│  │  • customUrl (NEW)                              │        │
│  │    - type, openInNewTab, external, href,       │        │
│  │      internal (reference)                       │        │
│  │                                                  │        │
│  │  • buttons (EXISTING - array of button)        │        │
│  │  • richText (EXISTING)                          │        │
│  │  • customRichText (EXISTING - helper)          │        │
│  └─────────────────────────────────────────────────┘        │
│                          │                                    │
│                          │ imports                           │
│                          ▼                                    │
│  ┌─────────────────────────────────────────────────┐        │
│  │   @walter/sanity-blocks (Complex Types)         │        │
│  ├─────────────────────────────────────────────────┤        │
│  │                                                  │        │
│  │  • faqAccordion (TO COMPLETE)                   │        │
│  │    - eyebrow, title, subtitle                   │        │
│  │    - link { title, description, url }           │        │
│  │    - faqs[] (reference to faq documents)        │        │
│  │                                                  │        │
│  │  • featureCardsIcon (NEW)                       │        │
│  │    - eyebrow, title, richText                   │        │
│  │    - cards[] { icon, title, richText }          │        │
│  │                                                  │        │
│  │  • imageLinkCards (NEW)                         │        │
│  │    - eyebrow, title, richText, buttons          │        │
│  │    - cards[] { title, description, image, url } │        │
│  │                                                  │        │
│  │  • subscribeNewsletter (NEW)                    │        │
│  │    - title, subTitle, helperText                │        │
│  │                                                  │        │
│  │  • hero, cta (EXISTING)                         │        │
│  └─────────────────────────────────────────────────┘        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                              │
                              │ consumes
                              ▼
┌──────────────────────────────────────────────────────────────┐
│          apps/template-studio (Sanity Studio App)             │
├──────────────────────────────────────────────────────────────┤
│  Imports schemas from packages, registers in Studio           │
│  Uses blocks in pageBuilder array                             │
└──────────────────────────────────────────────────────────────┘
```

## Entities

### 1. button (Atom)

**Purpose**: Reusable button configuration for CTAs, navigation, and actions

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| variant | string | No | One of: default, secondary, outline, link | Visual style of button |
| text | string | No | None | Button label text |
| url | customUrl | No | None | Link destination (internal or external) |

**Relationships**:
- References: `customUrl` (composition)
- Used by: `buttons` field (array of button), block schemas

**Preview Logic**:
```typescript
title: text || "Untitled Button"
subtitle: `${Capitalize(variant)} • ${url}${newTabIndicator}`
```

**Special Behaviors**:
- Initial value: `variant = "default"`
- Radio list layout: Horizontal display of variant options
- New tab indicator: Shows "↗" in preview if `url.openInNewTab = true`

---

### 2. customUrl (Atom)

**Purpose**: Flexible link configuration supporting internal page references and external URLs

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| type | string | Yes | One of: internal, external | Link type selector |
| openInNewTab | boolean | No | None | Whether link opens in new browser tab |
| external | string | Conditional | Required if type=external, must be valid URL or relative path | External URL or relative path |
| href | string | No | None | Technical field (hidden, readOnly) |
| internal | reference | Conditional | Required if type=internal | Reference to page, blog, or blogIndex document |

**Relationships**:
- Referenced by: `button`, `faqAccordion.link.url`, `imageLinkCards.cards[].url`
- References: page, blog, blogIndex documents (via `internal` field)

**Validation Rules**:
1. `type` is required
2. If `type = "external"`, then `external` must not be empty and must be a valid URL (absolute) or relative path (starts with /, #, or ?)
3. If `type = "internal"`, then `internal._ref` must not be empty

**Preview Logic**:
```typescript
title: `${type === "external" ? "External" : "Internal"} Link`
subtitle: `${url}${newTabIndicator}`
```

**Special Behaviors**:
- Initial value: `type = "external"`
- Conditional visibility: `external` field hidden when `type = "internal"`, `internal` field hidden when `type = "external"`
- URL validation: Uses `isValidUrl()` helper (inlined: tries `new URL(url)`, falls back to `isRelativeUrl()`)

---

### 3. faqAccordion (Block)

**Purpose**: Displays FAQ items in expandable accordion format with optional header and link

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| eyebrow | string | No | None | Small text above title |
| title | string | Yes | Required | Main heading |
| subtitle | string | No | None | Additional context below title |
| link | object | No | None | Optional link with title, description, url |
| link.title | string | No | None | Link text |
| link.description | string | No | None | Link description |
| link.url | customUrl | No | None | Link destination |
| faqs | array | Yes | Required, unique items | References to faq documents |

**Relationships**:
- References: `customUrl` (in link.url), `faq` documents (in faqs array)
- Used in: pageBuilder array

**Preview Logic**:
```typescript
title: title ?? "Untitled"
subtitle: "FAQ Accordion"
```

**Special Behaviors**:
- Nested link object: Not a separate schema, defined inline
- FAQ references: Uses reference field (not inline content) for reusability
- Unique validation: Prevents duplicate FAQ references in array

---

### 4. featureCardsIcon (Block)

**Purpose**: Grid of feature cards with icons, titles, and descriptions

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| eyebrow | string | No | None | Text above main title |
| title | string | No | None | Main heading |
| richText | richText | No | None | Intro text (block style only) |
| cards | array | No | None | Array of featureCardIcon objects |
| cards[].icon | iconPicker | No | None | Icon from sanity-plugin-icon-picker |
| cards[].title | string | No | None | Card heading |
| cards[].richText | richText | No | None | Card description (block style only) |

**Relationships**:
- Uses: `customRichText` helper from sanity-atoms (block style only)
- Used in: pageBuilder array

**Preview Logic**:
```typescript
// Block preview
title: title
subtitle: "Feature Cards with Icon"

// Card preview
title: title ?? "Untitled"
media: preview(icon)  // From sanity-plugin-icon-picker
```

**Special Behaviors**:
- Icon picker: Uses `sanity-plugin-icon-picker` with `storeSvg: true`, provider: "fi" (Feather Icons)
- Nested card object: `featureCardIcon` defined inline, not separate schema
- Multiple richText fields: Both block and card use `customRichText(["block"])`

---

### 5. imageLinkCards (Block)

**Purpose**: Collection of clickable cards with images, titles, descriptions, and links

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| eyebrow | string | No | None | Text above title |
| title | string | Yes | Required | Main heading |
| richText | richText | No | None | Intro text (block style only) |
| buttons | array | No | None | Array of button objects |
| cards | array | No | None | Array of imageLinkCard objects |
| cards[].title | string | Yes | Required | Card title |
| cards[].description | text | Yes | Required | Card description (plain text) |
| cards[].image | image | No | None | Card image |
| cards[].url | customUrl | No | None | Card link destination |

**Relationships**:
- Uses: `customRichText` helper, `buttonsFieldSchema` from sanity-atoms
- References: `button` (via buttons field), `customUrl` (in cards[].url)
- Used in: pageBuilder array

**Preview Logic**:
```typescript
// Block preview
title: title || "Image Link Cards"
subtitle: `${eyebrow ? eyebrow + ' • ' : ''}${cards.length} card${cards.length === 1 ? '' : 's'}`

// Card preview
title: title || "Untitled Card"
subtitle: description + (url ? ` • ${url}${newTabIndicator}` : "")
media: image
```

**Special Behaviors**:
- Nested card object: `imageLinkCard` defined inline, not separate schema
- Uses buttons field: Imports `buttonsFieldSchema` from sanity-atoms
- Card description: Uses `text` type (plain text), not richText

---

### 6. subscribeNewsletter (Block)

**Purpose**: Newsletter subscription section with title, subtitle, and helper text

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| title | string | No | None | Main heading |
| subTitle | richText | No | None | Additional context (block style only) |
| helperText | richText | No | None | Form instructions, privacy policy, disclaimers (block style only) |

**Relationships**:
- Uses: `customRichText` helper from sanity-atoms (block style only)
- Used in: pageBuilder array

**Preview Logic**:
```typescript
title: title ?? "Untitled"
subtitle: "Subscribe Newsletter"
```

**Special Behaviors**:
- Multiple customRichText fields: Each field uses custom name (subTitle, helperText)
- Frontend integration: Block provides content only; email capture logic implemented in frontend
- Minimal schema: No form fields or submission logic (handled by frontend)

---

## Schema Dependency Graph

```
customUrl  ───────┐
                  │
                  ├──> button ──> buttons (array) ──┐
                  │                                   │
                  │                                   ├──> imageLinkCards
                  │                                   │
                  ├──> faqAccordion                  │
                  │                                   │
                  └──> imageLinkCards                │
                                                      │
customRichText ──┬──> heroSection (existing)        │
                 ├──> cta (existing)                 │
                 ├──> featureCardsIcon               │
                 ├──> imageLinkCards ←───────────────┘
                 └──> subscribeNewsletter
```

**Migration Order (based on dependencies)**:
1. `customUrl` (no dependencies)
2. `button` (depends on customUrl)
3. `faqAccordion`, `featureCardsIcon`, `imageLinkCards`, `subscribeNewsletter` (depend on atoms)

---

## Validation Rules

### Field-Level Validation

| Entity | Field | Rule | Error Message |
|--------|-------|------|---------------|
| customUrl | type | Required | (Sanity default) |
| customUrl | external | Required if type=external | "URL can't be empty" |
| customUrl | external | Must be valid URL or relative path | "Invalid URL" |
| customUrl | internal | Required if type=internal | "internal can't be empty" |
| button | (none) | All fields optional | N/A |
| faqAccordion | title | Required | (Sanity default) |
| faqAccordion | faqs | Required, unique items | (Sanity default) |
| featureCardsIcon | (none) | All fields optional | N/A |
| imageLinkCards | title | Required | (Sanity default) |
| imageLinkCards | cards[].title | Required | (Sanity default) |
| imageLinkCards | cards[].description | Required | (Sanity default) |
| subscribeNewsletter | (none) | All fields optional | N/A |

### Uniqueness Validation

- `faqAccordion.faqs`: Array items must be unique (prevents duplicate FAQ references)

### Custom Validation Logic

**customUrl.external validation**:
```typescript
Rule.custom((value, { parent }) => {
  const type = parent?.type;
  if (type === "external") {
    if (!value) return "URL can't be empty";
    const isValid = isValidUrl(value);  // Inlined utility
    if (!isValid) return "Invalid URL";
  }
  return true;
})
```

**isValidUrl helper** (inlined in schema):
```typescript
// Try to parse as absolute URL, fallback to relative path check
try {
  new URL(url);
  return true;
} catch {
  return url.startsWith("/") || url.startsWith("#") || url.startsWith("?");
}
```

---

## State Transitions

**Note**: Sanity schemas are stateless data contracts. No state transitions exist at the schema level. Content documents may have draft/published states managed by Sanity's document system, but that is outside the scope of schema definitions.

---

## Data Integrity Constraints

### Type Safety (TypeScript)

All schemas use TypeScript strict mode:
- `defineType()` for schema definitions
- `defineField()` for field definitions
- Auto-generated types from `sanity typegen generate`

### Reference Integrity

- `customUrl.internal`: References must point to existing `page`, `blog`, or `blogIndex` documents
- `faqAccordion.faqs[]`: References must point to existing `faq` documents
- Sanity enforces referential integrity (no dangling references)

### Import Integrity

- All atom imports must resolve to `@walter/sanity-atoms/schemas`
- All block imports must resolve to `@walter/sanity-atoms/schemas` or `@walter/sanity-blocks/schemas`
- No relative imports to template-studio allowed in package schemas

---

## Migration Impact Analysis

### Breaking Changes

**None** - This is a structural migration only. Schema contracts remain unchanged.

### Schema Compatibility

| Schema | Before | After | Compatible? |
|--------|--------|-------|-------------|
| button | `apps/template-studio/schemaTypes/definitions/button.ts` | `@walter/sanity-atoms/schemas` | ✅ Yes (same name, fields) |
| customUrl | `apps/template-studio/schemaTypes/definitions/custom-url.ts` | `@walter/sanity-atoms/schemas` | ✅ Yes (same name, fields) |
| faqAccordion | `apps/template-studio/schemaTypes/blocks/faq-accordion.ts` | `@walter/sanity-blocks/schemas` | ✅ Yes (same name, fields) |
| featureCardsIcon | `apps/template-studio/schemaTypes/blocks/feature-cards-icon.ts` | `@walter/sanity-blocks/schemas` | ✅ Yes (same name, fields) |
| imageLinkCards | `apps/template-studio/schemaTypes/blocks/image-link-cards.ts` | `@walter/sanity-blocks/schemas` | ✅ Yes (same name, fields) |
| subscribeNewsletter | `apps/template-studio/schemaTypes/blocks/subscribe-newsletter.ts` | `@walter/sanity-blocks/schemas` | ✅ Yes (same name, fields) |

### Content Migration

**Not Required** - Existing content in Sanity Content Lake is unaffected. Schema names and field structures remain identical.

---

## Performance Considerations

### Bundle Size

- Atom schemas: ~5-10 KB each (minified)
- Block schemas: ~10-20 KB each (minified)
- No impact on runtime performance (schemas used only in Studio build)

### Type Generation

- `sanity typegen generate` execution time: < 5 seconds
- Auto-generated types file size: ~100-200 KB for all schemas

### Build Time

- Expected build time increase: < 5 seconds (additional schema files)
- Turbo caching: No cache invalidation (new packages, not changed files)

---

## Security Considerations

### Input Validation

- URL validation prevents JavaScript injection via `javascript:` URLs (Sanity's built-in URL validation)
- Rich text fields sanitized by Sanity's Portable Text spec
- No user-provided executable code in schemas

### Access Control

- Schema definitions do not contain access control logic
- Access control managed by Sanity Studio via document-level permissions (out of scope)

### Data Privacy

- No PII stored in schema definitions
- Newsletter subscription: Schema provides UI only, no email storage (handled by frontend integration)

---

## Future Considerations

### Extensibility

- New blocks can follow same pattern: create schema + fragment in packages
- Additional atom types (e.g., `link`, `socialMedia`) can be added to sanity-atoms
- Package structure supports unlimited schemas (no architectural limits)

### Versioning

- Breaking schema changes would require new schema names (e.g., `buttonV2`)
- Sanity supports schema migrations via migration scripts (not needed for this migration)
- Package versions remain `0.0.0` (internal packages, not published to npm)

### Multi-Tenancy

- Migrated schemas immediately available to new Sanity Studio instances via workspace dependencies
- Enables multi-tenant architecture (multiple Studio apps sharing schema packages)
- Aligns with spec 008 multi-tenant template goals
