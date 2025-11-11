# Sanity Studio

Content management system for the multi-language website powered by Sanity CMS with document-level internationalization.

## 🌍 Translation Workflow

This Sanity Studio supports multi-language content management using the `@sanity/document-internationalization` plugin.

### Supported Languages

- **French (fr)** - Français (default)
- **English (en)** - English

## Getting Started

### Development

```bash
# Install dependencies
pnpm install

# Start Sanity Studio
pnpm dev

# Open browser at http://localhost:3333
```

### Type Generation

After making schema changes, regenerate TypeScript types:

```bash
# Regenerate Sanity types
pnpm type
```

This updates `sanity.typegen.ts` with the latest schema types.

### Build

```bash
# Build for production
pnpm build
```

## Translation Workflow Guide

### Creating Translated Content

#### Step 1: Create Content in Default Language (French)

1. Navigate to the document type (Pages, Blog, etc.)
2. Click **"Create new"**
3. Fill in the content in French
4. The `language` field is automatically set to `fr` (hidden from UI)
5. Click **"Publish"** when ready

#### Step 2: Create Translation

1. Open the published French document
2. Click the **document menu** (three dots `⋮` or down arrow `▼`)
3. Select **"Create translation"**
4. Choose **"English"** from the language list
5. A new document is created with:
   - Duplicated structure
   - Language set to `en`
   - Link to original French document via `translation.metadata`

#### Step 3: Translate Content

1. Edit the English version
2. Translate all text fields (title, description, content, etc.)
3. Keep structural elements (images, layout) or modify as needed
4. Click **"Publish"** when translation is complete

### Translation Status Badges

Documents display language badges showing:
- **Current language** of the document
- **Available translations** with links
- **Missing translations** (languages without content)

### Translation Metadata

The plugin automatically manages `translation.metadata` documents that:
- Link all language versions of the same content
- Enable language switcher on the frontend
- Show translation status in Studio

**You should NOT manually edit `translation.metadata` documents.**

### Editing Translations

Each language version is **independent**:
- Edit any version without affecting others
- Publish/unpublish independently
- Different revision histories per language

To edit a translation:
1. Use the language badge to switch to the desired version
2. Or navigate via the document menu **"Translations"** section
3. Make your changes
4. Publish when ready

### Deleting Translations

To remove a language version:
1. Open the document you want to delete
2. Click document menu → **"Delete"**
3. Confirm deletion
4. Other language versions remain intact
5. Metadata document automatically updates

**Note**: Deleting one translation does NOT delete other language versions.

## Translatable Document Types

The following document types support translations:

| Document Type | Description |
|--------------|-------------|
| **Page** | General pages (About, Contact, etc.) |
| **Blog** | Blog posts |
| **Blog Index** | Blog listing page |
| **Navbar** | Navigation menu |
| **Footer** | Footer content |
| **Settings** | Site settings and metadata |
| **Home Page** | Homepage content |
| **FAQ** | Frequently asked questions |

## Schema Structure

### Language Field

All translatable documents include a `language` field:

```typescript
defineField({
  name: 'language',
  type: 'string',
  readOnly: true,
  hidden: true
})
```

- **Managed by plugin** - Do not edit manually
- **Hidden from UI** - Language selection happens via plugin actions
- **Required for queries** - Frontend filters content by this field

### Adding Translation Support to New Document Types

To make a new document type translatable:

1. **Add language field to schema**:
   ```typescript
   // schemaTypes/documents/my-document.ts
   export const myDocumentType = defineType({
     name: 'myDocument',
     type: 'document',
     fields: [
       defineField({
         name: 'language',
         type: 'string',
         readOnly: true,
         hidden: true
       }),
       // ... other fields
     ]
   });
   ```

2. **Register in plugin config** (`sanity.config.ts`):
   ```typescript
   documentInternationalization({
     supportedLanguages: [
       {id: 'fr', title: 'Français'},
       {id: 'en', title: 'English'}
     ],
     schemaTypes: ['page', 'blog', 'myDocument'], // Add your type here
     languageField: 'language'
   })
   ```

3. **Regenerate types**:
   ```bash
   pnpm type
   ```

## Migration: Adding Language to Existing Content

If you have existing content without language fields:

### Option 1: Use Migration Script (Recommended)

```bash
# Run the migration script
npx tsx scripts/add-language-field.ts
```

This script:
- Finds all documents without a `language` field
- Sets `language: 'fr'` (default)
- Commits changes in a transaction

### Option 2: Manual Migration

1. Open each document in Studio
2. The plugin will prompt to set a language
3. Select the appropriate language
4. Save and publish

### Migration Script Template

```typescript
// scripts/add-language-field.ts
import {getCliClient} from 'sanity/cli';

const client = getCliClient();

async function addLanguageField() {
  const types = ['page', 'blog', 'navbar', 'footer', 'settings'];
  
  const docs = await client.fetch(
    `*[_type in $types && !defined(language)]`,
    {types}
  );

  console.log(`Found ${docs.length} documents without language field`);

  const transaction = docs.reduce((tx, doc) => {
    return tx.patch(doc._id, {set: {language: 'fr'}});
  }, client.transaction());

  await transaction.commit();
  console.log('✅ Language field added to all documents');
}

addLanguageField();
```

## Best Practices

### Content Creation

✅ **DO**: Create content in the default language (French) first
✅ **DO**: Use "Create translation" action for new language versions
✅ **DO**: Publish each language version independently
✅ **DO**: Review translation status badges before publishing

❌ **DON'T**: Manually create separate documents for translations
❌ **DON'T**: Edit `translation.metadata` documents
❌ **DON'T**: Delete language field from schemas
❌ **DON'T**: Assume deleting one version deletes all

### Translation Quality

✅ Translate all text fields (titles, descriptions, content)
✅ Keep slug URLs SEO-friendly in each language
✅ Review formatting in both languages
✅ Test language switcher on frontend after publishing

### Content Updates

When updating existing content:
1. Update the source language version first
2. Check if translations need updating
3. Update each translation independently
4. No automatic sync between language versions

## Plugin Configuration

The document internationalization plugin is configured in `sanity.config.ts`:

```typescript
import {documentInternationalization} from '@sanity/document-internationalization';

export default defineConfig({
  // ... other config
  
  plugins: [
    documentInternationalization({
      // Supported languages
      supportedLanguages: [
        {id: 'fr', title: 'Français'},
        {id: 'en', title: 'English'}
      ],
      
      // Document types that support translations
      schemaTypes: [
        'page',
        'blog',
        'blogIndex',
        'navbar',
        'footer',
        'settings',
        'homePage',
        'faq'
      ],
      
      // Field name for language tracking
      languageField: 'language',
      
      // Use strong references (recommended)
      weakReferences: false,
      
      // API version
      apiVersion: '2025-02-19'
    })
  ]
});
```

## Adding a New Language

To add a new language (e.g., Spanish):

1. **Update plugin configuration** (`sanity.config.ts`):
   ```typescript
   supportedLanguages: [
     {id: 'fr', title: 'Français'},
     {id: 'en', title: 'English'},
     {id: 'es', title: 'Español'} // Add new language
   ]
   ```

2. **Update web app configuration** (see `apps/web/README.md`)

3. **Restart Studio**:
   ```bash
   pnpm dev
   ```

4. **Create translations** using the Studio UI as normal

## Troubleshooting

### Issue: "Create translation" action missing

**Solution**: 
1. Verify document type is listed in `schemaTypes` array in plugin config
2. Verify `language` field exists in the schema
3. Restart Studio dev server

### Issue: Language badge not showing

**Solution**:
1. Check that the document has a `language` field value
2. Verify plugin is properly configured
3. Clear browser cache and reload

### Issue: Translation metadata not created

**Solution**:
1. Ensure plugin `weakReferences` is set to `false`
2. Check Studio console for errors
3. Verify both documents (source and translation) are published
4. Try creating translation again

### Issue: Can't delete translation

**Solution**:
1. Unpublish the document first
2. Then delete the draft
3. Or use Studio's "Delete" action which handles both

## Frontend Integration

Content editors should know:

- **Language switcher** appears on the website automatically when translations exist
- **Each language version** can be independently published/unpublished
- **URLs change** based on language: `/fr/a-propos` vs `/en/about`
- **SEO tags** are automatically generated per language

## Resources

- **Plugin Documentation**: https://github.com/sanity-io/document-internationalization
- **Sanity i18n Guide**: https://www.sanity.io/docs/localization
- **Project Specification**: `/specs/001-i18n-localization/`
- **Quickstart Guide**: `/specs/001-i18n-localization/quickstart.md`

## Support

For questions or issues:
1. Check troubleshooting section above
2. Review specification docs in `/specs/001-i18n-localization/`
3. Consult plugin documentation
4. Check Sanity community forum
