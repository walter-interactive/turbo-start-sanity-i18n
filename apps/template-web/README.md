# Web Application

Next.js 15 web application with multi-language support powered by next-intl and Sanity CMS.

## 🌍 Internationalization (i18n)

This application supports multiple languages using next-intl with subdirectory routing.

### Supported Languages

- **French (fr)** - Default language (Quebec compliance)
- **English (en)** - Secondary language

### URL Structure

- French: `/fr/` or `/fr/a-propos`
- English: `/en/about`
- Root `/` redirects based on browser preference or default locale (French)

## Getting Started

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser at http://localhost:3000
```

The development server will be available at `http://localhost:3000`.

### Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Type Checking

```bash
# Run TypeScript type checking
pnpm typecheck
```

### Linting

```bash
# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## i18n Implementation Guide

### Using Translations in Components

#### Server Components

```typescript
import {getTranslations} from 'next-intl/server';

export default async function MyPage() {
  const t = await getTranslations('MyPage');
  
  return <h1>{t('title')}</h1>;
}
```

#### Client Components

```typescript
'use client'

import {useTranslations} from 'next-intl';

export function MyComponent() {
  const t = useTranslations('MyComponent');
  
  return <p>{t('description')}</p>;
}
```

### Adding Translation Keys

Add your translation keys to the message files:

**`messages/en.json`**
```json
{
  "MyPage": {
    "title": "My Page Title",
    "description": "Page description"
  }
}
```

**`messages/fr.json`**
```json
{
  "MyPage": {
    "title": "Titre de ma page",
    "description": "Description de la page"
  }
}
```

### Navigation with Locale Support

Always use the locale-aware navigation APIs instead of Next.js defaults:

```typescript
import {Link, useRouter, usePathname} from '@/i18n/navigation';

// Use Link component
<Link href="/about">About</Link>

// Use router for programmatic navigation
const router = useRouter();
router.push('/contact');

// Get current pathname (without locale prefix)
const pathname = usePathname(); // Returns "/about" for both /fr/about and /en/about
```

### Creating New Pages

When creating new pages, always include locale support:

```typescript
// app/[locale]/my-page/page.tsx
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';

type Props = {
  params: Promise<{locale: Locale}>;
};

export default async function MyPage({params}: Props) {
  const {locale} = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  // Your page implementation
  return <div>My Page</div>;
}
```

### Fetching Localized Content from Sanity

Always filter content by the current locale:

```typescript
import {client} from '@/lib/sanity/client';
import {defineQuery} from 'next-sanity';

const query = defineQuery(`
  *[_type == "page" && slug.current == $slug && language == $locale][0]{
    _id,
    title,
    content
  }
`);

const page = await client.fetch(query, {
  slug: 'about',
  locale: locale
});
```

### Getting Translation Metadata

To display language switcher or get alternate versions:

```typescript
import {defineQuery} from 'next-sanity';

const query = defineQuery(`
  *[_type == "page" && slug.current == $slug && language == $locale][0]{
    _id,
    title,
    "_translations": *[
      _type == "translation.metadata" && references(^._id)
    ][0].translations[].value->{
      _id,
      language,
      "slug": slug.current,
      title
    }
  }
`);
```

### Language Switcher

The `LanguageSwitcher` component is already integrated into the navbar. To use it elsewhere:

```typescript
import {LanguageSwitcher} from '@/components/language-switcher';

export function MyComponent() {
  return (
    <div>
      <LanguageSwitcher />
    </div>
  );
}
```

## SEO and Metadata

### Adding Language-Specific Metadata

```typescript
import type {Metadata} from 'next';
import type {Locale} from '@/i18n/routing';

type Props = {
  params: Promise<{locale: Locale}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  
  return {
    title: locale === 'fr' ? 'Mon Site' : 'My Site',
    description: locale === 'fr' ? 'Description en français' : 'English description',
    alternates: {
      languages: {
        'fr': '/fr',
        'en': '/en',
        'x-default': '/fr'
      }
    }
  };
}
```

### hreflang Tags

hreflang tags are automatically added by the metadata configuration. Ensure each page includes alternate language URLs in metadata.

## Configuration

### i18n Configuration

The i18n configuration is located in `src/i18n/`:

- **`routing.ts`** - Defines available locales and default locale
- **`navigation.ts`** - Exports locale-aware navigation components
- **`request.ts`** - Handles locale detection and message loading

### Middleware

The middleware (`src/middleware.ts`) automatically:
- Detects user's preferred locale
- Redirects to appropriate locale prefix
- Sets `NEXT_LOCALE` cookie for persistence

## Locale Detection Priority

1. **User selection** (stored in `NEXT_LOCALE` cookie)
2. **URL locale segment** (`/fr/` or `/en/`)
3. **Accept-Language header** (browser preference)
4. **Default locale** (French)

## Best Practices

### DO

✅ Use `setRequestLocale(locale)` in all pages for static rendering
✅ Use locale-aware navigation APIs (`@/i18n/navigation`)
✅ Filter Sanity queries by `language == $locale`
✅ Add translation keys for all user-facing strings
✅ Include `${translationsFragment}` in GROQ queries for language switcher support

### DON'T

❌ Use Next.js `<Link>` or `useRouter()` directly (use locale-aware versions)
❌ Hard-code language-specific text in components
❌ Forget to filter Sanity content by locale
❌ Skip `setRequestLocale()` in page components (breaks static rendering)

## Troubleshooting

### Issue: "locale not found" error

**Solution**: Ensure `generateStaticParams()` is added to your layout:

```typescript
export function generateStaticParams() {
  return [{locale: 'fr'}, {locale: 'en'}];
}
```

### Issue: Translations not loading

**Solution**: Check that message files exist and are properly imported:
- Files should be in: `messages/en.json` and `messages/fr.json`
- Import path in `request.ts`: `import(\`../../messages/${locale}.json\`)`

### Issue: Language switcher not working

**Solution**: Verify you're using the locale-aware router:

```typescript
import {useRouter} from '@/i18n/navigation'; // ✅ Correct
// NOT: import {useRouter} from 'next/navigation'; // ❌ Wrong
```

## Adding a New Language

To add a new language (e.g., Spanish):

1. **Update routing config** (`src/i18n/routing.ts`):
   ```typescript
   export const routing = defineRouting({
     locales: ['fr', 'en', 'es'], // Add 'es'
     defaultLocale: 'fr'
   });
   ```

2. **Create message file**: `messages/es.json`

3. **Update Sanity Studio** (see Studio README)

4. **Rebuild**: `pnpm build`

## Resources

- **next-intl Documentation**: https://next-intl.dev/
- **Sanity i18n Guide**: https://www.sanity.io/docs/localization
- **Project Specification**: `/specs/001-i18n-localization/`
- **Quickstart Guide**: `/specs/001-i18n-localization/quickstart.md`

## Architecture

This is a monorepo using TurboRepo:
- **apps/web** - Next.js frontend (this app)
- **apps/studio** - Sanity Studio CMS
- **packages/ui** - Shared UI components
- **packages/typescript-config** - Shared TypeScript configurations

## Support

For questions or issues:
1. Check troubleshooting section above
2. Review specification docs in `/specs/001-i18n-localization/`
3. Consult next-intl documentation
4. Check Sanity i18n plugin documentation
