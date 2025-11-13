# Next.js Sanity i18n Starter

A modern, full-stack monorepo template built with Next.js App Router, Sanity CMS, Shadcn UI, and TurboRepo with comprehensive multi-language support for bilingual applications.

## Table of Contents

- [Features](#features)
  - [Monorepo Structure](#monorepo-structure)
  - [Frontend (Web)](#frontend-web)
  - [Content Management (Studio)](#content-management-studio)
- [Getting Started](#getting-started)
  - [Installing the template](#installing-the-template)
  - [Adding content with Sanity](#adding-content-with-sanity)
- [Architecture Overview](#architecture-overview)
  - [Project Organization](#project-organization)
- [Multi-Language Support](#multi-language-support)
  - [Supported Languages](#supported-languages)
  - [Features](#features-1)
  - [For Developers](#for-developers)
  - [For Content Editors](#for-content-editors)
- [Deployment](#deploying-your-application-and-inviting-editors)
  - [Deploy Sanity Studio](#1-deploy-sanity-studio)
  - [Deploy Next.js app to Vercel](#2-deploy-nextjs-app-to-vercel)
  - [Invite a collaborator](#3-invite-a-collaborator)
- [Troubleshooting](#troubleshooting)
  - [Translation actions not appearing](#translation-actions-not-appearing)
  - [OrderRank not working across languages](#orderrank-not-working-across-languages)
  - [Preview not loading](#preview-not-loading)
  - [Type generation errors](#type-generation-errors)
- [Credits](#credits)

## Features

### Monorepo Structure

- Apps: web (Next.js frontend) and studio (Sanity Studio)
- Shared packages: UI components, TypeScript config, ESLint config
- Turborepo for build orchestration and caching

### Frontend (Web)

- Next.js App Router with TypeScript
- Shadcn UI components with Tailwind CSS
- Server Components and Server Actions
- SEO optimization with metadata
- Blog system with rich text editor
- Table of contents generation
- Responsive layouts
- **Multi-language support with next-intl (French/English)**
- **Locale-aware routing and navigation**
- **Automatic language detection and preference persistence**

### Content Management (Studio)

- Sanity Studio v3
- Custom document types (Blog, FAQ, Pages)
- Visual editing integration
- Structured content with schemas
- Live preview capabilities
- Asset management
- **Document-level internationalization plugin**
- **Translation workflow with language badges**
- **Independent publishing per language**

## Getting Started

### Installing the template

#### 1. Initialize template with Sanity CLI

Run the command in your Terminal to initialize this template on your local computer.

See the documentation if you are [having issues with the CLI](https://www.sanity.io/help/cli-errors).

```shell
npm create sanity@latest -- --template walter-interactive/turbo-start-sanity-i18n
```

#### 2. Run Studio and Next.js app locally

Navigate to the template directory using `cd <your app name>`, and start the development servers by running the following command

```shell
pnpm run dev
```

#### 3. Open the app and sign in to the Studio

Open the Next.js app running locally in your browser on [http://localhost:3000](http://localhost:3000).

Open the Studio running locally in your browser on [http://localhost:3333](http://localhost:3333). You should now see a screen prompting you to log in to the Studio. Use the same service (Google, GitHub, or email) that you used when you logged in to the CLI.

### Adding content with Sanity

#### 1. Publish your first document

The template comes pre-defined with a schema containing `Author`, `Blog`, `BlogIndex`, `FAQ`, `Footer`, `HomePage`, `Navbar`, `Page`, and `Settings` document types.

From the Studio, click "+ Create" and select the `Blog` document type. Go ahead and create and publish the document.

Your content should now appear in your Next.js app ([http://localhost:3000](http://localhost:3000)) as well as in the Studio on the "Presentation" Tab

#### 2. Sample Content

When you initialize the template using the Sanity CLI, sample content is not automatically imported into your project. However, you can import it after the init is done. This data includes example blog posts, authors, and other content types to help you get started quickly (see next step).

#### 3. Seed data using script

To add sample data programmatically, run the following command:

```shell
cd apps/studio
npx sanity dataset import ./seed-data.tar.gz production --replace
```

This command imports seed content into your Sanity dataset.

#### 4. Extending the Sanity schema

The schemas for all document types are defined in the `studio/schemaTypes/documents` directory. You can [add more document types](https://www.sanity.io/docs/schema-types) to the schema to suit your needs.

## Architecture Overview

### Project Organization

This monorepo follows a structured organization pattern for maintainability and scalability:

#### Where to Put What

**Schema Files** (`apps/studio/schemaTypes/`):
- `documents/`: Full document types (pages, blog posts, settings)
  - Use for: Content types that appear in Studio sidebar
  - Examples: `page.ts`, `blog.ts`, `home-page.ts`, `settings.ts`
- `blocks/`: Page builder content blocks (hero, CTA, FAQ)
  - Use for: Reusable page sections in pageBuilder array
  - Examples: `hero.ts`, `cta.ts`, `faq-accordion.ts`
- `definitions/`: Reusable field configurations (button, rich text, URL)
  - Use for: Shared field types used across multiple schemas
  - Examples: `button.ts`, `custom-url.ts`, `pagebuilder.ts`, `rich-text.ts`
- `common.ts`: Shared field definitions (languageField, buttonsField)
  - Use for: Fields used in 3+ document types
  - Examples: Language selector, slug field, icon picker

**Utility Files** (`apps/studio/utils/`):
- `helper.ts`: General-purpose helper functions
  - Use for: String formatting, URL validation, array manipulation
- `slug-validation.ts`: Slug validation logic (single source of truth)
  - Use for: All slug validation, generation, and cleaning
- `constant.ts`: App-wide constants (field groups, defaults)
- `og-fields.ts`, `seo-fields.ts`: Reusable field collections

**Component Files** (`apps/studio/components/`):
- Custom input components (e.g., `slug-field-component.tsx`)
- Structure helpers (e.g., `language-filter.ts`)
- Deprecated features kept for reference (e.g., `nested-pages-structure.ts`)

**Configuration Files**:
- `apps/studio/sanity.config.ts`: Studio configuration and plugins
- `apps/studio/structure.ts`: Sidebar navigation structure
- `packages/i18n-config/`: Shared i18n constants (languages, defaults)

#### File Naming Conventions

**Schema Files**:
- Use **kebab-case** for all schema files: `home-page.ts`, `faq-accordion.ts`
- Match schema name to filename: `export const homePage = defineType({ name: "homePage" })`
- Exception: `common.ts` for shared definitions

**Component Files**:
- Use **kebab-case** with suffix: `slug-field-component.tsx`, `language-filter.ts`
- Add `.tsx` for React components, `.ts` for utilities

**Utility Files**:
- Use **kebab-case**: `slug-validation.ts`, `helper.ts`
- Group related functions in single file (e.g., all slug logic in one file)

**Type Files**:
- Use **kebab-case** with `-types` suffix if separate from implementation
- Prefer co-location: Define types in same file as functions when possible

**Consistency Rules**:
- Never mix camelCase and kebab-case in same directory
- Always use lowercase for file names (no PascalCase files)
- Use descriptive names that match exported content
- Group related files in subdirectories (e.g., `blocks/`, `documents/`)

## Multi-Language Support

This template includes comprehensive internationalization (i18n) support out of the box.

### Supported Languages

- **French (fr)** - Default language (Quebec compliance)
- **English (en)** - Secondary language

### Features

- **Subdirectory routing**: `/fr/` for French, `/en/` for English
- **Automatic locale detection**: From URL, cookie, or browser preference
- **Language switcher**: Built-in component in navigation bar
- **Document-level translations**: Independent content versions per language
- **SEO optimization**: hreflang tags, language-specific metadata, localized sitemaps
- **Type-safe translations**: TypeScript support for translation keys

### For Developers

See detailed i18n implementation guides:
- **Frontend**: [`apps/web/README.md`](apps/web/README.md)
- **CMS**: [`apps/studio/README.md`](apps/studio/README.md)
- **Specification**: [`specs/001-i18n-localization/`](specs/001-i18n-localization/)

### For Content Editors

To create translated content:
1. Create content in French (default language)
2. Publish the French version
3. Click "Create translation" in the document menu
4. Select English and translate the content
5. Publish the English version independently

Both language versions can be edited and published separately without affecting each other.

### Deploying your application and inviting editors

#### 1. Deploy Sanity Studio

Your Next.js frontend (`/web`) and Sanity Studio (`/studio`) are still only running on your local computer. It's time to deploy and get it into the hands of other content editors.

> **⚠️ Important**: When initializing the template with the Sanity CLI, the `.github` folder may not be included or might be renamed to `github` (without the dot). If you don't see a `.github` folder in your project root, you'll need to manually create it and copy the GitHub Actions workflows from the [template repository](https://github.com/walter-interactive/turbo-start-sanity-i18n/tree/main/.github) for the deployment automation to work.

The template includes a GitHub Actions workflow [`deploy-sanity.yml`](https://raw.githubusercontent.com/walter-interactive/turbo-start-sanity-i18n/main/.github/workflows/deploy-sanity.yml) that automatically deploys your Sanity Studio whenever changes are pushed to the `studio` directory.

> **Note**: To use the GitHub Actions workflow, make sure to configure the following secrets in your repository settings:
>
> - `SANITY_DEPLOY_TOKEN`
> - `SANITY_STUDIO_PROJECT_ID`
> - `SANITY_STUDIO_DATASET`
> - `SANITY_STUDIO_TITLE`
> - `SANITY_STUDIO_PRESENTATION_URL`
> - `SANITY_STUDIO_PRODUCTION_HOSTNAME`

Set `SANITY_STUDIO_PRODUCTION_HOSTNAME` to whatever you want your deployed Sanity Studio hostname to be. Eg. for `SANITY_STUDIO_PRODUCTION_HOSTNAME=my-cool-project` you'll get a studio URL of `https://my-cool-project.sanity.studio` (and `<my-branch-name>-my-cool-project.sanity.studio` for PR previews builds done automatically via the `deploy-sanity.yml` github CI workflow when you open a PR.)

Set `SANITY_STUDIO_PRESENTATION_URL` to your web app front-end URL (from the Vercel deployment). This URL is required for production deployments and should be:
- Set in your GitHub repository secrets for CI/CD deployments
- Set in your local environment if deploying manually with `npx sanity deploy`
- Not needed for local development, where preview will automatically use http://localhost:3000

You can then manually deploy from your Studio directory (`/studio`) using:

```shell
npx sanity deploy
```

**Note**: To use the live preview feature, your browser needs to enable third party cookies.

#### 2. Deploy Next.js app to Vercel

You have the freedom to deploy your Next.js app to your hosting provider of choice. With Vercel and GitHub being a popular choice, we'll cover the basics of that approach.

1. Create a GitHub repository from this project. [Learn more](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github).
2. Create a new Vercel project and connect it to your Github repository.
3. Set the `Root Directory` to your Next.js app (`/apps/web`).
4. Configure your Environment Variables.

#### 3. Invite a collaborator

Now that you've deployed your Next.js application and Sanity Studio, you can optionally invite a collaborator to your Studio. Open up [Manage](https://www.sanity.io/manage), select your project and click "Invite project members"

They will be able to access the deployed Studio, where you can collaborate together on creating content.

## Troubleshooting

This section covers common issues you might encounter when working with the Studio's internationalization features.

### Translation actions not appearing

If the "Create translation" or "Manage translations" actions are missing from document menus:

**Checklist**:
1. Verify the document type is registered in `documentInternationalization` plugin
   - Open `apps/studio/sanity.config.ts`
   - Check that your document type is in the `schemaTypes` array (line 53-65)
   - Example: `schemaTypes: ["page", "blog", "homePage"]`

2. Ensure the document has a `language` field
   - Open the schema file (e.g., `apps/studio/schemaTypes/documents/page.ts`)
   - Verify `languageField` is included in the fields array
   - The field should be imported from `../common.ts`

3. Check that the document is published
   - Translation actions only appear for published documents
   - Draft-only documents cannot be translated

4. Verify supported languages are configured
   - Check `packages/i18n-config/src/index.ts` has both languages defined
   - Ensure `supportedLanguages` in sanity.config.ts matches i18n-config

**Solution**: If all above checks pass but translations still don't work, restart the dev server (`pnpm --filter studio dev`).

### OrderRank not working across languages

If drag-and-drop reordering only affects one language version of a document:

**The Problem**: The `orderableDocumentList` plugin only updates the `orderRank` field on the document being dragged, not its translations. This is expected behavior due to how the plugin works.

**Solution**: Use the coalesce pattern in your GROQ queries to fall back to the base document's orderRank:

```groq
// ✅ Correct: Falls back to base document's orderRank
*[_type == "blog" && language == $language] | order(coalesce(__i18n_base->orderRank, orderRank) asc)

// ❌ Incorrect: Only uses the translation's orderRank
*[_type == "blog" && language == $language] | order(orderRank asc)
```

**How it works**:
- `__i18n_base->orderRank`: Fetches orderRank from the French (default language) document
- `orderRank`: Falls back to the current document's orderRank if base is unavailable
- This pattern ensures consistent ordering across all language versions

**Example from structure.ts** (lines 106-108):
```typescript
createIndexListWithOrderableItems({
  // ...other config
  orderBy: [
    { field: 'coalesce(__i18n_base->orderRank, orderRank)', direction: 'asc' }
  ]
})
```

**Note**: This is a known architectural limitation documented in `apps/studio/structure.ts:71-113` (see JSDoc for `createIndexListWithOrderableItems`).

### Preview not loading

If the Presentation tool preview iframe shows errors or won't load:

**Checklist**:
1. Verify the frontend is running
   - Open [http://localhost:3000](http://localhost:3000) in a browser
   - You should see the Next.js app running
   - If not, run `pnpm --filter web dev` from project root

2. Check presentationTool configuration
   - Open `apps/studio/sanity.config.ts` (lines 33-43)
   - Verify `previewUrl` points to correct frontend URL
   - Local dev should use: `http://localhost:3000` (not https)
   - Production should use your deployed Vercel URL

3. Verify location resolvers exist
   - Open `apps/studio/location.ts`
   - Check that your document type has a location resolver
   - Example: `blog`, `page`, `home` types are defined

4. Check document has a valid slug
   - Open the document in Studio
   - Verify the `slug` field is populated and valid
   - Try clicking "Generate" button if slug is empty

5. Check browser console for errors
   - Open DevTools (F12) in Studio
   - Look for CORS errors, 404s, or connection refused messages
   - CORS errors usually mean preview URL is misconfigured

**Solution**: If preview still doesn't load, try:
- Clear browser cache and reload Studio
- Check that third-party cookies are enabled (required for iframe previews)
- Verify `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` env vars match in both apps

### Type generation errors

If `pnpm run typegen` fails or generates incorrect types:

**Common Issues**:

1. **"Schema type not found" errors**:
   - Verify all schema files are exported in `apps/studio/schemaTypes/index.ts`
   - Check for typos in schema names
   - Ensure schema files don't have syntax errors

2. **Circular reference errors**:
   - Check for circular imports between schema files
   - Use `type: "reference"` with string type names, not direct imports
   - Example: `type: "reference", to: [{type: "author"}]` (not `to: [author]`)

3. **Missing types after generation**:
   - Run type generation: `pnpm --filter studio typegen`
   - Check output in `apps/studio/sanity.types.ts`
   - Verify the generated file is not in `.gitignore`

4. **TypeScript errors in web app**:
   - Regenerate types in Studio first
   - Types are automatically copied to web app via turbo task
   - Restart TypeScript server in VSCode (Cmd+Shift+P → "Restart TS Server")

**Solution workflow**:
```bash
# 1. Clean generated types
rm apps/studio/sanity.types.ts

# 2. Verify schema syntax
pnpm --filter studio check-types

# 3. Regenerate types
pnpm --filter studio typegen

# 4. Verify types in web app
pnpm --filter web check-types
```

**If errors persist**: Check `apps/studio/sanity.config.ts` lines 19-21 for the schema configuration. Ensure all document types, blocks, and definitions are imported and included in the `types` array.

## Credits

This template is built upon the excellent work by [Roboto Studio](https://github.com/robotostudio) and their [turbo-start-sanity](https://github.com/robotostudio/turbo-start-sanity) template. We've extended it with comprehensive multi-language support (French/English) using next-intl and Sanity's document internationalization plugin.

**Original Template**: [robotostudio/turbo-start-sanity](https://github.com/robotostudio/turbo-start-sanity)

Thank you to the Roboto Studio team for creating such a solid foundation for Next.js + Sanity projects!
