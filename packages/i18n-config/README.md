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
