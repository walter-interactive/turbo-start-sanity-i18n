# Research Findings: De-duplicate i18n Records in Sanity Studio

**Feature**: 003-dedup-studio-records  
**Date**: 2025-11-11  
**Status**: Phase 0 Complete

## Executive Summary

Research confirms that filtering Sanity Studio document lists by language field is achievable through GROQ query modifications. The document-internationalization plugin operates at the UI level (badges, menus, actions) and will not be affected by document list filtering. Custom warning badges for orphaned translations can be implemented using schema preview preparation, with accessibility considerations. **A centralized locale configuration package will be created to provide a single source of truth for both apps/web and apps/studio**, eliminating configuration duplication.

## Research Task 1: Structure Builder Filtering Patterns

### Decision: Filter at GROQ Query Level

**Rationale**: Database-level filtering provides better performance, lower bandwidth usage, and better caching compared to post-fetch filtering in JavaScript.

### Implementation Pattern

Modify the existing `fetchDocuments` function in `apps/studio/components/nested-pages-structure.ts`:

```typescript
import { DEFAULT_LANGUAGE } from '@workspace/i18n-config';

const fetchDocuments = async (
  client: SanityClient,
  schemaType: string,
  language: string = DEFAULT_LANGUAGE
): Promise<DocumentData[]> => {
  try {
    const documents = await client.fetch(
      `*[_type == $schemaType && defined(slug.current) && language == $language] {
        _id,
        title,
        "slug": slug.current,
        language
      }`,
      { schemaType, language }
    );

    if (!Array.isArray(documents)) {
      throw new Error("Invalid documents response");
    }

    return documents;
  } catch (error) {
    throw new Error(
      `Unable to load ${schemaType} documents. ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
```

### Performance Comparison

| Approach | Dataset Size | Estimated Time | Bandwidth |
|----------|-------------|----------------|-----------|
| GROQ filtering | 10,000 docs | 50-200ms | Minimal (filtered results only) |
| Post-fetch filtering | 10,000 docs | 500-2000ms | High (all documents downloaded) |

**Key advantage**: Performance difference grows exponentially with dataset size.

### Edge Cases Identified

1. **Documents without language field**:
   ```groq
   *[_type == $schemaType && (!defined(language) || language == $language)]
   ```
   Handle legacy documents that may not have the language field populated.

2. **Draft vs Published consistency**:
   - Both draft and published versions must have identical language field values
   - The existing `deduplicateDocuments` function handles draft/published de-duplication
   - Language filtering should happen after draft de-duplication

3. **Empty result sets**:
   - GROQ returns empty array when no documents match
   - UI should handle empty states gracefully with helpful messaging

### Alternatives Considered

**Client-side filtering** (rejected):
- Would fetch all documents then filter in memory
- Wastes bandwidth downloading documents that will be discarded
- Cannot leverage Sanity Content Lake indexes
- Slower for large datasets

## Research Task 2: Document-Internationalization Plugin Integration

### How the Plugin Works

**Automatic UI Components**:
- **Translations Badge**: Rendered automatically in document toolbar for all types in `schemaTypes` array
- **Language Dropdown**: Shows available translations with TranslateIcon button
- **Location**: Plugin adds these via document badges and unstable_languageFilter hooks

### Translation Relationship Model

The plugin uses a separate metadata document type: `translation.metadata`

```typescript
{
  _type: 'translation.metadata',
  _id: string, // UUID
  translations: [
    {
      _key: 'en',
      _type: 'internationalizedArrayReferenceValue',
      value: {
        _type: 'reference',
        _ref: 'page-en-id',
        _weak: true
      }
    },
    {
      _key: 'fr',
      _type: 'internationalizedArrayReferenceValue',
      value: {
        _type: 'reference',
        _ref: 'page-fr-id',
        _weak: true
      }
    }
  ]
}
```

**Key insights**:
- Each language version is a separate document with unique `_id`
- Documents are linked via weak references in metadata document
- Plugin manages metadata documents automatically through UI actions
- `language` field is the source of truth for document's language

### Plugin Configuration

Current configuration in `apps/studio/sanity.config.ts`:

```typescript
documentInternationalization({
  supportedLanguages: [
    { id: "fr", title: "Français" },
    { id: "en", title: "English" },
  ],
  schemaTypes: [
    "page", "blog", "blogIndex", 
    "navbar", "footer", "settings", 
    "homePage", "faq"
  ],
})
```

**Important**: Plugin does not define a "default" language - all languages are equal. First language in array ("fr") is typically used as default by convention.

### Compatibility with Custom Filtering

✅ **Safe Operations**:
- Filter by `language` field in GROQ queries
- Use `translation.metadata` to find related translations
- Display only default language in lists
- Plugin's UI-driven workflow remains intact

❌ **Unsafe Operations**:
- Renaming or removing the `language` field
- Manually modifying `translation.metadata` documents
- Interfering with plugin's delete actions
- Creating duplicate `_id` values

**Key Finding**: Our GROQ query filtering operates at the content retrieval level, while the plugin operates at the UI workflow level. These are separate concerns and will not conflict.

### Singleton Documents Pattern

Singletons (navbar, footer) work correctly because:
1. Each language has a separate document (e.g., `navbar`, `navbar-fr`)
2. Documents are linked via `translation.metadata`
3. Plugin's Translation dropdown allows switching between versions
4. Structure.ts renders each with fixed `documentId`

**Our filtering should follow the same pattern**: Show only default language version in lists, but maintain full translation access through the plugin's UI.

## Research Task 3: Custom Badge/Indicator UI Components

### Recommended Component: Badge from @sanity/ui

Already available in codebase at `apps/studio/components/url-slug/error-states.tsx:2`:

```tsx
import { Badge, Flex, Text } from "@sanity/ui";
import { WarningOutlineIcon } from "@sanity/icons";
```

### Implementation Approach: Schema Preview

Use `preview.prepare()` to render custom badges in document lists:

```tsx
// In schema definition (e.g., schemaTypes/documents/page.ts)
import { DEFAULT_LANGUAGE } from '@workspace/i18n-config';

preview: {
  select: {
    title: "title",
    language: "language",
    slug: "slug.current",
  },
  prepare({ title, language, slug }) {
    const isOrphaned = language !== DEFAULT_LANGUAGE; // Simplified check
    
    return {
      title: title || "Untitled",
      subtitle: slug,
      // Custom badge as media
      media: isOrphaned ? (
        <Badge tone="caution" radius={2} role="alert" aria-label="Orphaned translation warning">
          <Flex align="center" gap={1}>
            <WarningOutlineIcon />
            <Text size={1}>Orphaned</Text>
          </Flex>
        </Badge>
      ) : undefined,
    };
  },
}
```

### Key Badge Props

- `tone`: `"critical"` (red), `"caution"` (yellow), `"positive"` (green), `"primary"` (blue)
- `radius`: Corner radius (e.g., `2`)
- `role`: Accessibility role (`"alert"` for warnings)
- `aria-label`: Screen reader text

### Recommended Icons from @sanity/icons

- `WarningOutlineIcon` - Outlined warning triangle (recommended for orphaned translations)
- `WarningFilledIcon` - Filled warning triangle
- `ErrorOutlineIcon` - Outlined error circle
- `InfoOutlineIcon` - Information circle

### Important Limitation

**Preview media components only display in**:
- Nested list views within document panes
- Reference selection dialogs
- Array item previews

**Not displayed in**:
- Top-level Structure tool document lists

**Workaround for top-level lists**: Use text-based indicators in `subtitle` field:

```tsx
subtitle: language !== DEFAULT_LANGUAGE && isOrphaned ? "⚠️ Orphaned translation" : slug
```

### Accessibility Best Practices

Based on existing `error-states.tsx` implementation:

✅ **Requirements**:
- Use semantic `role="alert"` for warnings
- Provide `aria-label` for screen readers
- Use appropriate tone values (`"caution"` for warnings)
- Include both icon and text when space allows
- Ensure sufficient color contrast

```tsx
<Badge
  role="alert"
  tone="caution"
  aria-label="Orphaned translation - missing default language version"
>
  <Flex align="center" gap={1}>
    <WarningOutlineIcon aria-label="Warning" />
    <Text size={1} weight="medium">Orphaned</Text>
  </Flex>
</Badge>
```

### Alternatives Considered

**Custom list item components** (rejected):
- More complex implementation
- Would require overriding Structure Builder patterns
- Preview preparation is simpler and follows Sanity conventions

**Document badges** (rejected):
- Only appear in document toolbar, not in lists
- Not suitable for list-level indicators

## Research Task 4: Centralized Locale Configuration

### Decision: Create Shared Workspace Package

**Rationale**: Eliminates configuration duplication, provides single source of truth, enables type-safe imports across apps, and follows existing monorepo patterns.

### Problem Statement

**Current configuration requires updates in 3 locations**:

| Source | Value | Purpose | Location |
|--------|-------|---------|----------|
| Web app i18n | `DEFAULT_LOCALE = "fr"` | Frontend routing and translations | `apps/web/src/i18n/routing.ts` |
| Sanity plugin | `supportedLanguages[0] = "fr"` | Studio translation workflow | `apps/studio/sanity.config.ts` |
| Studio utils | `DEFAULT_LANGUAGE = "fr"` (proposed) | Studio list filtering | `apps/studio/utils/constant.ts` |

**This violates**:
- DRY principle (Don't Repeat Yourself)
- Single Source of Truth principle
- Constitution Principle I (Monorepo Structure & Boundaries)

### Solution: Create `@workspace/i18n-config` Package

**Structure**:
```text
packages/i18n-config/
├── src/
│   └── index.ts           # Centralized locale configuration
├── package.json
├── tsconfig.json
└── README.md
```

**Package Configuration** (`packages/i18n-config/package.json`):

```json
{
  "name": "@workspace/i18n-config",
  "version": "0.0.1",
  "type": "module",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "lint": "npx ultracite lint",
    "format": "npx ultracite fix",
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {
    "@workspace/typescript-config": "workspace:*",
    "typescript": "^5.9.2"
  }
}
```

**TypeScript Configuration** (`packages/i18n-config/tsconfig.json`):

```json
{
  "extends": "@workspace/typescript-config/base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Core Configuration** (`packages/i18n-config/src/index.ts`):

```typescript
/**
 * Centralized i18n configuration for the entire monorepo
 * 
 * This is the SINGLE SOURCE OF TRUTH for:
 * - Supported locales/languages
 * - Default locale/language
 * - Locale types and metadata
 * 
 * Used by:
 * - apps/web (Next.js routing, translations)
 * - apps/studio (Sanity document filtering, plugin config)
 */

// ============================================================================
// CORE CONFIGURATION (EDIT HERE TO CHANGE LOCALES)
// ============================================================================

/**
 * List of all supported locales
 * Order matters: First locale is treated as default for Quebec compliance (Bill 101)
 * 
 * @example
 * import { LOCALES } from '@workspace/i18n-config';
 * console.log(LOCALES); // ["fr", "en"]
 */
export const LOCALES = ["fr", "en"] as const;

/**
 * Default locale for the application
 * Derived from LOCALES[0] for single source of truth
 * 
 * French is default for Quebec compliance (Bill 101)
 * 
 * @example
 * import { DEFAULT_LOCALE } from '@workspace/i18n-config';
 * console.log(DEFAULT_LOCALE); // "fr"
 */
export const DEFAULT_LOCALE = LOCALES[0];

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Locale type derived from LOCALES array
 * Ensures type safety across the monorepo
 * 
 * @example
 * import type { Locale } from '@workspace/i18n-config';
 * const locale: Locale = "fr"; // ✅ Valid
 * const invalid: Locale = "es"; // ❌ Type error
 */
export type Locale = (typeof LOCALES)[number];

/**
 * Language configuration for Sanity plugin
 * Maps locale codes to human-readable titles
 */
export interface LanguageConfig {
  id: Locale;
  title: string;
}

// ============================================================================
// LOCALE METADATA
// ============================================================================

/**
 * Display metadata for each locale
 * Used for UI components (language switchers, locale selectors)
 */
export const LOCALE_METADATA: Record<
  Locale,
  {
    name: string;
    nativeName: string;
    direction: "ltr" | "rtl";
  }
> = {
  fr: {
    name: "French",
    nativeName: "Français",
    direction: "ltr",
  },
  en: {
    name: "English",
    nativeName: "English",
    direction: "ltr",
  },
} as const;

/**
 * Language configurations for Sanity document-internationalization plugin
 * Matches the structure required by @sanity/document-internationalization
 * 
 * @example
 * import { SANITY_LANGUAGES } from '@workspace/i18n-config';
 * 
 * documentInternationalization({
 *   supportedLanguages: SANITY_LANGUAGES,
 *   // ...
 * })
 */
export const SANITY_LANGUAGES: LanguageConfig[] = LOCALES.map((locale) => ({
  id: locale,
  title: LOCALE_METADATA[locale].nativeName,
}));

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Type guard to check if a string is a valid locale
 * 
 * @param locale - String to validate as a locale
 * @returns True if the locale is valid
 * 
 * @example
 * import { isValidLocale } from '@workspace/i18n-config';
 * 
 * if (isValidLocale(userInput)) {
 *   // TypeScript knows userInput is 'fr' | 'en'
 *   const t = await getTranslations({ locale: userInput });
 * }
 */
export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

/**
 * Get locale from string with fallback to default locale
 * 
 * @param locale - Optional locale string to validate
 * @returns Valid locale or default locale
 * 
 * @example
 * import { getValidLocale } from '@workspace/i18n-config';
 * 
 * const locale = getValidLocale(params.locale); // Always returns valid locale
 */
export function getValidLocale(locale: string | undefined): Locale {
  if (locale && isValidLocale(locale)) {
    return locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Get display name for a locale
 * 
 * @param params - Configuration object
 * @param params.locale - ISO locale code to get name for
 * @param params.native - Whether to return native name (default: true)
 * @returns Display name for the locale
 * 
 * @example
 * import { getLocaleName } from '@workspace/i18n-config';
 * 
 * getLocaleName({ locale: 'fr' }); // 'Français'
 * getLocaleName({ locale: 'fr', native: false }); // 'French'
 */
export function getLocaleName(params: {
  locale: Locale;
  native?: boolean;
}): string {
  const { locale, native = true } = params;
  return native
    ? LOCALE_METADATA[locale].nativeName
    : LOCALE_METADATA[locale].name;
}

/**
 * Generate static params for all locales
 * Used in Next.js generateStaticParams
 * 
 * @returns Array of locale params for generateStaticParams
 * 
 * @example
 * import { getStaticLocaleParams } from '@workspace/i18n-config';
 * 
 * export function generateStaticParams() {
 *   return getStaticLocaleParams();
 * }
 */
export function getStaticLocaleParams(): Array<{ locale: Locale }> {
  return LOCALES.map((locale) => ({ locale }));
}
```

**README** (`packages/i18n-config/README.md`):

```markdown
# @workspace/i18n-config

Centralized internationalization configuration for the entire monorepo.

## Purpose

This package provides a **single source of truth** for locale/language configuration across all apps and packages in the monorepo.

## Usage

### In Web App (Next.js)

```typescript
// apps/web/src/i18n/routing.ts
import { LOCALES, DEFAULT_LOCALE } from '@workspace/i18n-config';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always' as const,
});
```

### In Studio (Sanity)

```typescript
// apps/studio/sanity.config.ts
import { SANITY_LANGUAGES } from '@workspace/i18n-config';
import { documentInternationalization } from '@sanity/document-internationalization';

export default defineConfig({
  // ...
  plugins: [
    documentInternationalization({
      supportedLanguages: SANITY_LANGUAGES,
      schemaTypes: ['page', 'blog', 'faq'],
    }),
  ],
});
```

```typescript
// apps/studio/components/nested-pages-structure.ts
import { DEFAULT_LOCALE } from '@workspace/i18n-config';

const fetchDocuments = async (
  client: SanityClient,
  schemaType: string,
  language: string = DEFAULT_LOCALE
) => {
  // ...
};
```

## API

### Constants

- `LOCALES`: Array of supported locale codes
- `DEFAULT_LOCALE`: Default locale (first in LOCALES array)
- `LOCALE_METADATA`: Display metadata for each locale
- `SANITY_LANGUAGES`: Locale config for Sanity plugin

### Types

- `Locale`: Union type of all supported locale codes
- `LanguageConfig`: Interface for Sanity language configuration

### Functions

- `isValidLocale(locale: string): locale is Locale`
- `getValidLocale(locale?: string): Locale`
- `getLocaleName({ locale, native? }): string`
- `getStaticLocaleParams(): Array<{ locale: Locale }>`

## Changing Locales

To add/remove/reorder locales:

1. Edit the `LOCALES` array in `src/index.ts`
2. Add corresponding entries to `LOCALE_METADATA`
3. Run `pnpm build` to ensure type safety across all apps
4. All apps will automatically use the new configuration

## Design Decisions

- **First locale is default**: Follows Quebec Bill 101 compliance
- **No environment variables**: Configuration is compile-time, not runtime
- **Type-safe**: All locale codes are validated via TypeScript
- **No dependencies**: Pure TypeScript, no external libs
```

### Migration Strategy

**1. Create the package**:
```bash
mkdir -p packages/i18n-config/src
# Create files as shown above
```

**2. Add dependency to apps**:

`apps/web/package.json`:
```json
{
  "dependencies": {
    "@workspace/i18n-config": "workspace:*",
    // ... other deps
  }
}
```

`apps/studio/package.json`:
```json
{
  "dependencies": {
    "@workspace/i18n-config": "workspace:*",
    // ... other deps
  }
}
```

**3. Update apps/web/src/i18n/routing.ts**:

```typescript
// BEFORE
export const LOCALES = ["fr", "en"] as const;
export const DEFAULT_LOCALE = LOCALES[0];

// AFTER
import { LOCALES, DEFAULT_LOCALE, type Locale } from '@workspace/i18n-config';

// Use imported constants instead of defining locally
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always" as const,
});

// Re-export type for backward compatibility
export type { Locale };
```

**4. Update apps/studio/sanity.config.ts**:

```typescript
// BEFORE
documentInternationalization({
  supportedLanguages: [
    { id: "fr", title: "Français" },
    { id: "en", title: "English" },
  ],
  // ...
})

// AFTER
import { SANITY_LANGUAGES } from '@workspace/i18n-config';

documentInternationalization({
  supportedLanguages: SANITY_LANGUAGES,
  // ...
})
```

**5. Use in new Studio filtering code**:

```typescript
// apps/studio/components/language-filter.ts
import { DEFAULT_LOCALE, type Locale } from '@workspace/i18n-config';

export const filterDocumentsByLanguage = (language: Locale = DEFAULT_LOCALE) => {
  // Implementation
};
```

### Benefits

✅ **Single source of truth**: Edit locales in one place  
✅ **Type safety**: TypeScript enforces consistency across apps  
✅ **Easy maintenance**: Adding a new locale requires one file change  
✅ **Follows constitution**: Adheres to Principle I (Monorepo Boundaries)  
✅ **No circular dependencies**: Pure config package with no app dependencies  
✅ **Fast compilation**: No runtime overhead, compile-time constants  

### Comparison Table

| Approach | Files to Update | Type Safety | Maintainability | Constitution Compliant |
|----------|----------------|-------------|-----------------|----------------------|
| **Current (3 locations)** | 3 | ❌ Partial | ❌ Poor | ❌ No |
| **Shared package** | 1 | ✅ Full | ✅ Excellent | ✅ Yes |
| **Environment variables** | N/A | ❌ None | ❌ Poor | ❌ No |
| **Root config file** | 1 | ⚠️ Limited | ⚠️ Moderate | ⚠️ Unclear |

### Alternatives Considered

**Environment variables** (rejected):
- No compile-time type safety
- Cannot derive TypeScript types
- Runtime overhead
- Not suitable for static configuration

**Root-level config file** (rejected):
- Breaks TurboRepo workspace boundaries
- Harder to manage imports
- No clear package.json exports structure

**Studio imports from Web** (rejected):
- Creates coupling between apps
- Violates Principle I (workspace independence)
- Studio would depend on Web app internals

## Implementation Recommendations

### Phase 1 Priorities

1. **Create @workspace/i18n-config package** (High Priority):
   - Set up package structure
   - Define core constants and types
   - Add comprehensive JSDoc documentation

2. **Modify fetchDocuments function** (High Priority):
   - Import DEFAULT_LOCALE from @workspace/i18n-config
   - Add language parameter
   - Update GROQ query with language filter
   - Handle documents without language field

3. **Update apps/web to use shared config** (High Priority):
   - Import from @workspace/i18n-config
   - Remove local LOCALES/DEFAULT_LOCALE definitions
   - Verify Next.js i18n routing still works

4. **Update apps/studio to use shared config** (High Priority):
   - Import SANITY_LANGUAGES for plugin config
   - Import DEFAULT_LOCALE for filtering
   - Update structure.ts to apply filters

5. **Add orphaned translation badges** (Medium Priority):
   - Implement in schema preview.prepare()
   - Use text-based fallback for top-level lists
   - Ensure accessibility compliance

### Testing Strategy

**Manual testing checklist** (no automated tests per AGENTS.md):

1. ✅ @workspace/i18n-config builds without errors
2. ✅ apps/web builds and runs with shared config
3. ✅ apps/studio builds and runs with shared config
4. ✅ Document lists show only FR (default) versions
5. ✅ EN documents not visible in lists
6. ✅ Opening a document shows Translations badge
7. ✅ Can switch between languages using Translations dropdown
8. ✅ Orphaned translations show warning indicator
9. ✅ Creating new translations still works
10. ✅ Deleting translations still works
11. ✅ No performance degradation with 100+ documents
12. ✅ Changing LOCALES in package updates both apps correctly

### Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Breaking existing apps during migration | High | Migrate one app at a time, test thoroughly before next |
| Type errors across workspaces | Medium | Ensure pnpm install after creating package |
| Documents without language field | Medium | Add fallback filter: `(!defined(language) \|\| language == $language)` |
| Plugin workflow breaks | High | Test all translation actions (create, edit, delete) |
| Performance degradation | Medium | Use parameterized GROQ queries, monitor Content Lake query performance |

## Conclusion

All research tasks resolved successfully with improved approach:

✅ **Filtering approach**: GROQ-level filtering (performant, simple)  
✅ **Plugin compatibility**: Verified - no conflicts with translation workflow  
✅ **Badge implementation**: Preview preparation with @sanity/ui Badge  
✅ **Configuration**: **NEW - Create @workspace/i18n-config package for centralized configuration**  

**Key Improvement**: The shared package approach eliminates configuration duplication and provides true single source of truth while maintaining type safety and following monorepo best practices.

**Ready to proceed to Phase 1**: Data model and contracts design, including @workspace/i18n-config package specification.
