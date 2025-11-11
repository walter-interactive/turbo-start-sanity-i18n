# Implementation Plan: Multi-Language Website Support

**Branch**: `001-i18n-localization` | **Date**: 2025-11-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-i18n-localization/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable comprehensive multi-language support for Quebec-based agency clients requiring French and English content. Content editors will manage translations through Sanity Studio using document-level internationalization, while website visitors experience seamless language switching with preference persistence. The solution implements next-intl for frontend routing and UI translation, @sanity/document-internationalization for CMS content management, and proper SEO structure with hreflang tags and language-specific sitemaps. French is the default language to comply with Quebec language requirements.

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js 15.x App Router, Node.js 18+)  
**Primary Dependencies**: next-intl (frontend i18n), @sanity/document-internationalization (CMS plugin), next-sanity (data fetching), groq (queries)  
**Storage**: Sanity Content Lake (cloud-hosted headless CMS)  
**Testing**: pnpm test (unit), pnpm check-types (TypeScript), Sanity Studio manual testing for translation workflows  
**Target Platform**: Web (Next.js SSR/SSG, Sanity Studio SPA)
**Project Type**: Monorepo (TurboRepo) - apps/web (Next.js frontend) + apps/studio (Sanity Studio)  
**Performance Goals**: Language switching < 2 seconds, build time remains < 5 minutes, no impact on existing page load performance  
**Constraints**: Must support subdirectory URL structure (/en/, /fr/), maintain SEO with hreflang tags, support field-level fallback for partial translations  
**Scale/Scope**: 2 initial languages (French, English), extensible to additional languages, affects all translatable document types (pages, blog posts, navigation, settings)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Monorepo Structure & Boundaries ✅ PASS
- **Assessment**: Feature properly spans two workspaces (apps/web, apps/studio) with clear boundaries
- **Compliance**: Shared i18n configuration can be extracted to packages/i18n if needed for reusability
- **Impact**: Minimal - enhances existing workspaces without violating boundaries

### Principle II: TypeScript Strict Mode & Type Safety ✅ PASS
- **Assessment**: All i18n types will be properly defined (locale types, translation keys, document types)
- **Compliance**: next-intl provides built-in TypeScript support, Sanity typegen will generate locale-aware types
- **Impact**: Positive - improves type safety for localized content access

### Principle III: Test Coverage ⚠️ ATTENTION REQUIRED
- **Assessment**: Translation workflows require specialized testing approach
- **Compliance Requirements**:
  - Unit tests for locale detection, language switching logic, fallback behavior
  - Integration tests for GROQ queries returning correct language versions
  - Contract tests for Sanity document structure with language fields
  - Manual E2E testing for Sanity Studio translation UI (no automated E2E framework currently)
- **Action**: Test plan must be included in Phase 2 tasks

### Principle IV: Component Modularity & Reusability ✅ PASS
- **Assessment**: Language switcher will be a reusable component, translation utilities will be shared
- **Compliance**: next-intl's useTranslations hook promotes component reusability with i18n support
- **Impact**: Positive - all components become locale-aware without duplication

### Principle V: API Contracts & Versioning ✅ PASS
- **Assessment**: GROQ query contracts must be updated to include language parameters
- **Compliance**: Existing groq queries will be versioned, new language-aware queries follow established patterns
- **Impact**: Requires contract definition for language-aware content fetching in Phase 1

### Principle VI: Internationalization (i18n) First ✅ PASS (PRIMARY FEATURE)
- **Assessment**: This feature IMPLEMENTS the i18n-first principle for the entire template
- **Compliance**: Establishes translation key conventions, externalizes all UI strings, enables localized CMS content
- **Impact**: Foundational - enables all future features to be i18n-ready by default

### Principle VII: Code Quality & Observability ✅ PASS
- **Assessment**: Standard linting/formatting applies, no special observability needs beyond existing error handling
- **Compliance**: Language fallback errors should be logged, translation status visible in Studio
- **Impact**: Minimal - follows existing patterns

**Overall Gate Status**: ✅ **PASS WITH CONDITIONS**
- Proceed to Phase 0 research
- Must include test strategy in Phase 2 for Principle III compliance
- Re-evaluate after Phase 1 design to ensure API contracts properly defined

## Project Structure

### Documentation (this feature)

```text
specs/001-i18n-localization/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── sanity-schemas.ts           # Language-aware document schemas
│   ├── groq-queries.ts             # Language-aware GROQ queries
│   ├── next-intl-routing.ts        # src/i18n/routing.ts configuration
│   ├── next-intl-navigation.ts     # src/i18n/navigation.ts setup
│   ├── next-intl-request.ts        # src/i18n/request.ts configuration
│   └── middleware.ts               # src/middleware.ts for locale detection
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Monorepo Web Application Structure
apps/web/
├── src/
│   ├── app/
│   │   └── [locale]/           # NEW: Next.js dynamic locale routing
│   │       ├── layout.tsx      # MODIFIED: Locale-aware layout
│   │       ├── page.tsx        # MODIFIED: Locale-aware homepage
│   │       ├── [...slug]/      # MODIFIED: Locale-aware dynamic routes
│   │       └── blog/           # MODIFIED: Locale-aware blog routes
│   ├── components/
│   │   ├── language-switcher.tsx  # NEW: Language selection UI
│   │   ├── navbar.tsx          # MODIFIED: Include language switcher
│   │   └── footer.tsx          # MODIFIED: Include language indicator
│   ├── i18n/                   # NEW: next-intl configuration directory
│   │   ├── routing.ts          # Routing configuration (locales, default locale)
│   │   ├── navigation.ts       # Navigation APIs (Link, redirect, useRouter, etc.)
│   │   └── request.ts          # Request configuration for locale detection
│   ├── lib/
│   │   └── sanity/
│   │       ├── queries.ts      # MODIFIED: Add language parameters to queries
│   │       └── i18n.ts         # NEW: Locale-aware query utilities
│   └── middleware.ts           # NEW: Locale detection/redirect middleware
├── messages/                   # NEW: Translation files (base directory)
│   ├── en.json                 # English UI translations
│   └── fr.json                 # French UI translations
├── next.config.ts              # MODIFIED: Add next-intl plugin configuration
└── package.json                # MODIFIED: Add next-intl dependency

apps/studio/
├── schemaTypes/
│   ├── documents/
│   │   ├── page.ts             # MODIFIED: Add document internationalization
│   │   ├── blog.ts             # MODIFIED: Add document internationalization
│   │   ├── navbar.ts           # MODIFIED: Add document internationalization
│   │   └── footer.ts           # MODIFIED: Add document internationalization
│   └── common.ts               # MODIFIED: Add i18n field definitions
├── plugins/
│   └── document-i18n.ts        # NEW: Configure @sanity/document-internationalization
├── sanity.config.ts            # MODIFIED: Register i18n plugin
└── package.json                # MODIFIED: Add @sanity/document-internationalization
```

**Structure Decision**: Monorepo web application with modifications spanning both apps/web (frontend i18n routing and UI) and apps/studio (CMS translation management). No new workspaces needed - enhancements fit within existing workspace boundaries per Constitution Principle I. All i18n functionality remains within apps/web as next-intl provides comprehensive built-in components and hooks. Language switcher is user-facing only and does not require sharing with Sanity Studio.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations requiring justification. All constitutional principles are satisfied or have clear compliance paths.*

