  ---
  New Multi-Tenant Agency Template Architecture

  Target Structure (After All Phases)

  turbo-start-sanity-i18n/                    # Agency Template Monorepo
  ├── apps/
  │   ├── template-studio/                    # Reference Sanity Studio (renamed from studio)
  │   ├── template-web/                       # Reference Next.js app (renamed from web)
  │   ├── client-a-studio/                    # Real client projects (added in Phase 4+)
  │   ├── client-a-web/
  │   └── ...
  │
  ├── packages/
  │   ├── sanity-blocks/                      # @walter/sanity-blocks
  │   │   ├── src/
  │   │   │   ├── hero-section/
  │   │   │   │   ├── hero-section.schema.ts
  │   │   │   │   └── hero-section.fragment.ts
  │   │   │   ├── cta/
  │   │   │   ├── faq-accordion/
  │   │   │   ├── feature-cards-icon/
  │   │   │   ├── image-link-cards/
  │   │   │   ├── subscribe-newsletter/
  │   │   │   ├── shared/                     # Shared field definitions
  │   │   │   │   ├── buttons/
  │   │   │   │   ├── image/
  │   │   │   │   └── rich-text/
  │   │   │   ├── fragments.ts                # Exports all fragments
  │   │   │   └── schemas.ts                  # Exports all schemas
  │   │   ├── package.json                    # name: "@walter/sanity-blocks"
  │   │   └── README.md
  │   │
  │   ├── sanity-documents/                   # @walter/sanity-documents (Phase 2+)
  │   │   └── (future: page, blog, FAQ, form schemas)
  │   │
  │   ├── i18n-config/                        # @walter/i18n-config (refactored in Phase 1)
  │   │   ├── src/
  │   │   │   ├── types.ts                    # Locale, LocaleMetadata types
  │   │   │   ├── factory.ts                  # createI18nConfig()
  │   │   │   ├── metadata.ts                 # ALL_LOCALE_METADATA (fr, en, es, de, etc.)
  │   │   │   └── index.ts
  │   │   └── package.json
  │   │
  │   ├── ui/                                 # @walter/ui (existing, unchanged)
  │   └── typescript-config/                  # @walter/typescript-config (existing)
  │
  └── templates/                              # (Phase 5: CLI scaffolding templates)
      ├── studio-template/
      └── web-template/

  ---
  Package Responsibilities

  @walter/sanity-blocks

  What it contains:
  - ✅ Page builder block schemas (Sanity schema definitions)
  - ✅ GROQ fragments for querying blocks
  - ✅ Shared field schemas (buttons, image, rich-text)
  - ❌ NO React components
  - ❌ NO document type schemas (those go in @walter/sanity-documents later)

  Who uses it:
  - apps/template-studio → imports schemas for CMS
  - apps/template-web → imports fragments for queries
  - All future client apps

  Exports:
  // From @walter/sanity-blocks/schemas
  export { heroSectionSchema, ctaSchema, faqAccordionSchema, ... }
  export { allBlockSchemas } // Array of all schemas for easy Studio setup

  // From @walter/sanity-blocks/fragments
  export { heroSectionFragment, ctaFragment, faqAccordionFragment, ... }

  ---
  @walter/i18n-config (Refactored)

  What it contains:
  - ✅ Factory function for creating client-specific i18n config
  - ✅ Metadata for all supported locales (fr, en, es, de, pt, etc.)
  - ✅ Utility functions (isValidLocale, getLocaleName, etc.)
  - ✅ Sanity i18n plugin config generator

  Who uses it:
  - All client studio apps (to configure Sanity i18n plugin)
  - All client web apps (to configure next-intl)

  Usage:
  // apps/template-studio/sanity.config.ts
  import { createI18nConfig } from '@walter/i18n-config'

  const i18n = createI18nConfig({
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
  })

  export default defineConfig({
    plugins: [documentInternationalization(i18n.SANITY_LANGUAGES)],
  })

  // apps/template-web/src/i18n.config.ts
  import { createI18nConfig } from '@walter/i18n-config'

  export const { LOCALES, DEFAULT_LOCALE, PATHNAMES } = createI18nConfig({
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
  })

  ---
  @walter/ui (Unchanged)

  What it contains:
  - ✅ Radix UI component wrappers
  - ✅ Tailwind CSS utilities
  - ✅ Shared React hooks

  Note: This is a design system for reference. Clients can use it or create their own.

  ---
  @walter/sanity-documents (Phase 2+)

  Future package for common document type schemas:
  - page.schema.ts + page.fragment.ts
  - blog.schema.ts + blog.fragment.ts
  - faq.schema.ts + faq.fragment.ts
  - author.schema.ts + author.fragment.ts
  - form.schema.ts + form.fragment.ts

  ---
  Client App Structure (Template Example)

  apps/template-studio/

  template-studio/
  ├── schemaTypes/
  │   ├── index.ts                # Imports allBlockSchemas from @walter/sanity-blocks
  │   ├── documents/              # Document schemas (still local until Phase 2)
  │   │   ├── page.ts
  │   │   ├── blog.ts
  │   │   └── ...
  │   └── custom/                 # Template-specific custom schemas
  │
  ├── sanity.config.ts            # Uses createI18nConfig()
  └── package.json
      ├── dependencies:
      │   ├── @walter/sanity-blocks
      │   └── @walter/i18n-config

  apps/template-web/

  template-web/
  ├── src/
  │   ├── blocks/                 # Template's React components (NOT shared)
  │   │   ├── HeroSection/
  │   │   │   ├── HeroSection.tsx
  │   │   │   └── HeroSection.module.css
  │   │   ├── Cta/
  │   │   └── ...
  │   │
  │   ├── lib/
  │   │   └── sanity/
  │   │       ├── client.ts
  │   │       ├── fragments/      # Organized fragments
  │   │       │   ├── atomic.ts
  │   │       │   ├── reusable.ts
  │   │       │   └── pageBuilder.ts  # Imports from @walter/sanity-blocks
  │   │       └── queries/        # Organized by document type
  │   │           ├── page.ts
  │   │           ├── blog.ts
  │   │           ├── navbar.ts
  │   │           └── index.ts
  │   │
  │   └── i18n.config.ts          # Uses createI18nConfig()
  │
  └── package.json
      ├── dependencies:
      │   ├── @walter/sanity-blocks  # For fragments only
      │   ├── @walter/i18n-config
      │   └── @walter/ui

  ---
  Phase 1: Foundation Setup

  Scope of Work

  1. Rename Current Apps ✏️

  - apps/studio → apps/template-studio
  - apps/web → apps/template-web
  - Update all import paths, package.json names, turbo.json references

  ---
  2. Rename & Reorganize Shared Sanity Package 📦

  Current: packages/sanity/ (package name: @workspace/sanity)
  New: packages/sanity-blocks/ (package name: @walter/sanity-blocks)

  Tasks:
  - Rename directory: packages/sanity/ → packages/sanity-blocks/
  - Update package.json: name: "@walter/sanity-blocks"
  - Update exports in package.json:
  {
    "name": "@walter/sanity-blocks",
    "exports": {
      "./schemas": "./src/schemas.ts",
      "./fragments": "./src/fragments.ts"
    }
  }
  - Migrate remaining blocks:
    - ✅ hero-section (already done)
    - ✅ cta (already done)
    - ❌ faq-accordion (migrate schema + fragment)
    - ❌ feature-cards-icon (migrate schema + fragment)
    - ❌ image-link-cards (migrate schema + fragment)
    - ❌ subscribe-newsletter (migrate schema + fragment)
  - Create allBlockSchemas export in schemas.ts
  - Update all imports in template-studio and template-web

  ---
  3. Refactor i18n-config to Factory Pattern 🏭

  Current: Hardcoded LOCALES = ['fr', 'en'], DEFAULT_LOCALE = 'fr'
  New: Factory function that accepts config

  Tasks:
  - Create src/types.ts:
  export type Locale = string
  export type LocaleMetadata = { /* ... */ }
  export type I18nConfig = { /* ... */ }
  - Create src/metadata.ts:
  export const ALL_LOCALE_METADATA: Record<string, LocaleMetadata> = {
    fr: { /* ... */ },
    en: { /* ... */ },
    es: { /* ... */ },
    de: { /* ... */ },
    // ... more locales
  }
  - Create src/factory.ts:
  export const createI18nConfig = (opts: {
    locales: Locale[]
    defaultLocale: Locale
  }): I18nConfig => {
    return {
      LOCALES: opts.locales,
      DEFAULT_LOCALE: opts.defaultLocale,
      LOCALE_METADATA: /* filtered from ALL_LOCALE_METADATA */,
      SANITY_LANGUAGES: /* generated */,
      PATHNAMES: /* generated */,
      // ... utilities
    }
  }
  - Update template-studio to use factory
  - Update template-web to use factory
  - Test with current fr/en config (should work identically)

  ---
  4. Reorganize template-web Queries 🗂️

  Current: Monolithic lib/sanity/query.ts (434 lines)
  New: Organized by document type with extracted fragments

  Directory structure:
  apps/template-web/src/lib/sanity/
  ├── fragments/
  │   ├── atomic.ts               # imageFields, customLinkFragment, markDefsFragment
  │   ├── reusable.ts            # imageFragment, buttonsFragment, richTextFragment
  │   └── pageBuilder.ts         # Imports from @walter/sanity-blocks
  │
  ├── queries/
  │   ├── page.ts                # querySlugPageData, queryAllLocalizedPages
  │   ├── blog.ts                # queryBlogIndexPageData, queryBlogSlugPageData
  │   ├── home.ts                # queryHomePageData
  │   ├── navbar.ts              # queryNavbarData
  │   ├── footer.ts              # queryFooterData
  │   ├── settings.ts            # querySettingsData, querySitemapData
  │   └── index.ts               # Re-exports all queries
  │
  ├── client.ts                  # (unchanged)
  ├── live.ts                    # (unchanged)
  └── sanity.types.ts            # (auto-generated, unchanged)

  Tasks:
  - Create fragments/atomic.ts (extract from query.ts)
  - Create fragments/reusable.ts (extract from query.ts)
  - Create fragments/pageBuilder.ts (import from @walter/sanity-blocks)
  - Split query.ts into separate files by document type
  - Create queries/index.ts barrel export
  - Update all imports in template-web components
  - Delete old query.ts

  ---
  5. Update Documentation 📚

  Tasks:
  - Archive spec 007 (mark as superseded)
  - Create new spec: specs/multi-tenant-architecture/
    - overview.md - Architecture vision, package responsibilities
    - phase-1.md - This phase's work
    - adding-a-block.md - How to add new blocks to @walter/sanity-blocks
    - adding-a-client.md - How to create new client apps (for Phase 4+)
  - Update root CLAUDE.md with new architecture summary
  - Update packages/sanity-blocks/README.md with usage examples

  ---
  6. Validation & Testing ✅

  Tasks:
  - Run type checking: pnpm check-types (all workspaces)
  - Run builds: pnpm build (all workspaces)
  - Run linting: pnpm lint
  - Test template-studio:
    - Dev server starts: pnpm --filter template-studio dev
    - All blocks appear in page builder
    - Can create/edit content
  - Test template-web:
    - Dev server starts: pnpm --filter template-web dev
    - All pages render correctly
    - All blocks display properly
    - i18n routing works (fr/en)
  - Verify no broken imports or missing dependencies

  ---
  Success Criteria for Phase 1

  ✅ Apps Renamed: template-studio, template-web
  ✅ Package Renamed: @walter/sanity-blocks (all 6 blocks migrated)
  ✅ i18n Refactored: Factory pattern supports any locale configuration
  ✅ Queries Organized: Fragments and queries split by document type
  ✅ All Tests Pass: Type checking, builds, linting all green
  ✅ Documentation Updated: New architecture documented clearly
  ✅ Template Apps Work: Both studio and web run without errors

  ---
  What's NOT in Phase 1

  ❌ Creating @walter/sanity-documents package (Phase 2)
  ❌ Moving template-web components to blocks/ directory (optional, not critical)
  ❌ Creating second client apps (Phase 4)
  ❌ CLI tooling for client creation (Phase 5)
  ❌ Publishing packages to npm registry (future consideration)

  ---
  Estimated Effort

  - Rename apps: 30 minutes
  - Rename & migrate blocks package: 2-3 hours
  - Refactor i18n-config: 2 hours
  - Reorganize queries: 3-4 hours
  - Documentation: 2 hours
  - Testing & validation: 1-2 hours

  Total: ~10-14 hours of focused work

  ---
  Key Architectural Principles

  1. Schemas are contracts: Backend data structure is shared, frontend implementation is free
  2. Additive changes only: Never rename/remove fields, only add optional ones
  3. Client autonomy: Each client can use/ignore shared schemas as needed
  4. Type safety: Auto-generated types flow from schemas to components
  5. Clear boundaries: Backend (@walter/sanity-*) vs frontend (client apps)

  ---
