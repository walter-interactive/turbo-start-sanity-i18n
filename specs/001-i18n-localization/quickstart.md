# Quickstart: Multi-Language Website Support

**Feature**: 001-i18n-localization  
**Date**: 2025-11-06  
**Audience**: Developers implementing the feature

## Overview

This guide provides step-by-step instructions to implement multi-language support using next-intl and @sanity/document-internationalization.

**Estimated Time**: 2-3 hours for initial setup

---

## Prerequisites

✅ Node.js 18+ installed  
✅ pnpm package manager  
✅ Sanity project created and configured  
✅ Next.js 15+ with App Router  
✅ TurboRepo monorepo structure

---

## Phase 1: Install Dependencies

### Step 1.1: Install next-intl (Web App)

```bash
cd apps/web
pnpm add next-intl
```

### Step 1.2: Install Sanity Plugin (Studio)

```bash
cd apps/studio
pnpm add @sanity/document-internationalization
```

---

## Phase 2: Configure next-intl (Web App)

### Step 2.1: Create Routing Configuration

**File**: `apps/web/src/i18n/routing.ts`

```typescript
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr'
});
```

### Step 2.2: Create Navigation APIs

**File**: `apps/web/src/i18n/navigation.ts`

```typescript
import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
```

### Step 2.3: Create Request Configuration

**File**: `apps/web/src/i18n/request.ts`

```typescript
import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
```

### Step 2.4: Create Middleware

**File**: `apps/web/src/middleware.ts`

```typescript
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

### Step 2.5: Update next.config.ts

**File**: `apps/web/next.config.ts`

```typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl({
  // ... existing Next.js config
});
```

### Step 2.6: Create Message Files

**File**: `apps/web/messages/en.json`

```json
{
  "common": {
    "readMore": "Read more",
    "backToHome": "Back to home"
  },
  "navigation": {
    "home": "Home",
    "about": "About",
    "blog": "Blog",
    "contact": "Contact"
  }
}
```

**File**: `apps/web/messages/fr.json`

```json
{
  "common": {
    "readMore": "Lire la suite",
    "backToHome": "Retour à l'accueil"
  },
  "navigation": {
    "home": "Accueil",
    "about": "À propos",
    "blog": "Blogue",
    "contact": "Contact"
  }
}
```

---

## Phase 3: Update App Router Structure

### Step 3.1: Move Routes into [locale] Segment

**Before**:
```
src/app/
├── layout.tsx
├── page.tsx
└── blog/
    └── page.tsx
```

**After**:
```
src/app/
└── [locale]/
    ├── layout.tsx
    ├── page.tsx
    └── blog/
        └── page.tsx
```

```bash
# Move files
mkdir -p src/app/[locale]
mv src/app/layout.tsx src/app/[locale]/
mv src/app/page.tsx src/app/[locale]/
mv src/app/blog src/app/[locale]/
# Repeat for other routes
```

### Step 3.2: Update Root Layout

**File**: `apps/web/src/app/[locale]/layout.tsx`

```typescript
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {routing} from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;

  // Validate locale
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Load messages
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Step 3.3: Update Pages for Static Rendering

**File**: `apps/web/src/app/[locale]/page.tsx`

```typescript
import {setRequestLocale} from 'next-intl/server';
import {useTranslations} from 'next-intl';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function HomePage({params}: Props) {
  const {locale} = await params;

  // Enable static rendering
  setRequestLocale(locale);

  // Use translations
  const t = useTranslations('HomePage');

  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  );
}
```

---

## Phase 4: Configure Sanity Studio

### Step 4.1: Add Plugin to Sanity Config

**File**: `apps/studio/sanity.config.ts`

```typescript
import {defineConfig} from 'sanity'
import {documentInternationalization} from '@sanity/document-internationalization'

export default defineConfig({
  // ... other config

  plugins: [
    // ... other plugins
    documentInternationalization({
      supportedLanguages: [
        {id: 'fr', title: 'Français'},
        {id: 'en', title: 'English'}
      ],
      schemaTypes: ['page', 'blog', 'navbar', 'footer', 'settings'],
      languageField: 'language'
    })
  ]
})
```

### Step 4.2: Add Language Field to Schemas

**File**: `apps/studio/schemaTypes/documents/page.ts`

```typescript
import {defineField, defineType} from 'sanity'

export const pageType = defineType({
  name: 'page',
  type: 'document',
  title: 'Page',
  fields: [
    // Add language field (plugin manages this)
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true
    }),

    // ... rest of your fields
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule) => Rule.required()
    }),

    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {source: 'title'},
      validation: (Rule) => Rule.required()
    }),

    defineField({
      name: 'content',
      type: 'array',
      title: 'Content',
      of: [{type: 'block'}]
    })
  ]
})
```

**Repeat for all translatable document types**: blog, navbar, footer, settings, etc.

### Step 4.3: Regenerate Sanity Types

```bash
cd apps/studio
pnpm type
```

This creates `sanity.typegen.ts` with language-aware types.

---

## Phase 5: Update GROQ Queries

### Step 5.1: Update Existing Queries

**Before**:
```typescript
const query = groq`*[_type == "page" && slug.current == $slug][0]`
```

**After**:
```typescript
const query = groq`
  *[_type == "page" && slug.current == $slug && language == $language][0]{
    _id,
    title,
    content,
    language,
    "_translations": *[
      _type == "translation.metadata" && references(^._id)
    ][0].translations[].value->{
      _id,
      language,
      "slug": slug.current,
      title
    }
  }
`
```

### Step 5.2: Update Data Fetching

**File**: `apps/web/src/lib/sanity/queries.ts`

```typescript
import {defineQuery} from 'next-sanity'
import {groq} from 'next-sanity'

export const getPageBySlugQuery = defineQuery(groq`
  *[
    _type == "page"
    && slug.current == $slug
    && language == $language
  ][0]{
    _id,
    title,
    "slug": slug.current,
    content,
    "_translations": *[
      _type == "translation.metadata" && references(^._id)
    ][0].translations[].value->{
      _id,
      language,
      "slug": slug.current
    }
  }
`)
```

**Usage**:
```typescript
import {client} from '@/lib/sanity/client'
import {getPageBySlugQuery} from '@/lib/sanity/queries'

const page = await client.fetch(getPageBySlugQuery, {
  slug: 'about',
  language: locale
})
```

---

## Phase 6: Create Language Switcher

**File**: `apps/web/src/components/language-switcher.tsx`

```typescript
'use client'

import {usePathname, useRouter} from '@/i18n/navigation'
import {useLocale} from 'next-intl'
import {routing} from '@/i18n/routing'

export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = useLocale()

  const handleChange = (newLocale: string) => {
    router.replace(pathname, {locale: newLocale})
  }

  return (
    <select
      value={currentLocale}
      onChange={(e) => handleChange(e.target.value)}
      className="border rounded px-2 py-1"
    >
      {routing.locales.map((locale) => (
        <option key={locale} value={locale}>
          {locale.toUpperCase()}
        </option>
      ))}
    </select>
  )
}
```

**Add to Navbar**:
```typescript
import {LanguageSwitcher} from '@/components/language-switcher'

export function Navbar() {
  return (
    <nav>
      {/* ... other nav items */}
      <LanguageSwitcher />
    </nav>
  )
}
```

---

## Phase 7: Testing

### Step 7.1: Test Web App

```bash
cd apps/web
pnpm dev
```

**Manual Tests**:
1. ✅ Visit `/` → redirects to `/fr`
2. ✅ Visit `/fr` → loads French homepage
3. ✅ Visit `/en` → loads English homepage
4. ✅ Switch languages → changes URL and content
5. ✅ Cookie persists → refresh page, language stays
6. ✅ Translations load → UI strings in correct language

### Step 7.2: Test Sanity Studio

```bash
cd apps/studio
pnpm dev
```

**Manual Tests**:
1. ✅ Create page document → language field is hidden
2. ✅ Document menu shows "Create translation" action
3. ✅ Create translation → new document with same structure
4. ✅ translation.metadata document is created automatically
5. ✅ Language badges appear on documents
6. ✅ Both language versions can be edited independently

### Step 7.3: Test Type Safety

```bash
# From root
pnpm check-types
```

Should compile without errors.

---

## Phase 8: Migration (Existing Content)

### Step 8.1: Add Language to Existing Documents

**Create Migration Script**: `apps/studio/scripts/add-language-field.ts`

```typescript
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

async function addLanguageField() {
  const types = ['page', 'blog', 'navbar', 'footer', 'settings']

  const docs = await client.fetch(
    `*[_type in $types && !defined(language)]`,
    {types}
  )

  console.log(`Found ${docs.length} documents without language field`)

  const transaction = docs.reduce((tx, doc) => {
    return tx.patch(doc._id, {set: {language: 'fr'}}) // Default to French
  }, client.transaction())

  await transaction.commit()
  console.log('✅ Language field added to all documents')
}

addLanguageField()
```

**Run Migration**:
```bash
cd apps/studio
npx tsx scripts/add-language-field.ts
```

---

## Troubleshooting

### Issue: "locale not found" error

**Solution**: Ensure `generateStaticParams()` is added to layout:

```typescript
export function generateStaticParams() {
  return [{locale: 'fr'}, {locale: 'en'}]
}
```

### Issue: Translations not loading

**Solution**: Check message file paths match import:
- Files in: `messages/en.json`
- Import: `import(\`../../messages/${locale}.json\`)`

### Issue: GROQ query returns empty

**Solution**: Verify language filter and that documents have language field:

```groq
*[_type == "page" && language == "fr"]
```

### Issue: Static rendering opt-out

**Solution**: Add `setRequestLocale(locale)` before using any next-intl hooks.

### Issue: Sanity plugin not showing

**Solution**: 
1. Verify plugin is in plugins array
2. Check schemaTypes includes your document types
3. Restart Studio dev server

---

## Verification Checklist

### Web App
- [ ] Middleware runs on all requests
- [ ] Root `/` redirects to `/fr`
- [ ] `/fr` and `/en` routes work
- [ ] Language switcher changes locale
- [ ] Cookie `NEXT_LOCALE` persists
- [ ] Translations load correctly
- [ ] Static generation works (`pnpm build`)
- [ ] No TypeScript errors

### Sanity Studio
- [ ] Plugin appears in Studio
- [ ] "Create translation" action available
- [ ] Language badges show on documents
- [ ] translation.metadata documents created
- [ ] Both language versions editable
- [ ] Types regenerated (`pnpm type`)

### Integration
- [ ] GROQ queries filter by language
- [ ] Pages fetch correct language content
- [ ] Switching languages loads translations
- [ ] 404 pages are localized
- [ ] SEO metadata is language-specific

---

## Next Steps

After completing setup:

1. **Add more languages**: Update routing config, add message files, update Sanity config
2. **Implement SEO**: Add hreflang tags, language-specific sitemaps
3. **Add field-level translations**: Use sanity-plugin-internationalized-array for mixed content
4. **Set up CI/CD**: Ensure build process handles all locales
5. **Monitor performance**: Check build times stay under 5 minutes

---

## Resources

- **next-intl docs**: https://next-intl.dev/docs/routing/setup
- **Sanity i18n docs**: https://www.sanity.io/docs/studio/localization
- **Plugin repo**: https://github.com/sanity-io/document-internationalization
- **Contract files**: See `/specs/001-i18n-localization/contracts/`
- **Research**: See `/specs/001-i18n-localization/research.md`

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review contract files for implementation details
3. Consult official documentation
4. Check plugin GitHub issues

---

**Quickstart Status**: ✅ Complete  
**Ready for Implementation**: Yes
