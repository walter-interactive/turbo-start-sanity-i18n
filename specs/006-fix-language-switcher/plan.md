# Implementation Plan: Fix Language Switcher Translation Navigation

**Branch**: `006-fix-language-switcher` | **Date**: 2025-11-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-fix-language-switcher/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Fix the language switcher component to navigate to the correct translated slug (e.g., `/fr/blogue/abc` → `/en/blog/xyz`) instead of maintaining the same slug across languages. Implementation follows the proven conciliainc.com pattern with key enhancements: fetch all localized documents at app startup, create a bidirectional slug-to-translations lookup map, provide the mapping via React Context, and update the language switcher to use next-intl's Link component with pathname patterns. Major additions: configure next-intl pathnames for localized routes (`/blog` → `/blogue` for French), normalize slugs to support legacy format (`/blog/post` → `post`), and update Sanity Studio slug validation and URL preview to show localized URLs.

## Technical Context

**Language/Version**: TypeScript 5.9.2, Node.js 20+
**Primary Dependencies**: Next.js 15.x (App Router), next-intl (i18n routing), next-sanity (Sanity client), React 19.x, @sanity/document-internationalization (translation metadata)
**Storage**: Sanity Content Lake (cloud-hosted CMS with translation metadata)
**Testing**: Vitest (unit tests), Playwright (e2e tests - per monorepo standards)
**Target Platform**: Web (SSR/SSG via Next.js App Router), browsers (modern ES2020+)
**Project Type**: Web application (TurboRepo monorepo with apps/web and apps/studio workspaces)
**Performance Goals**: <200ms language switch navigation, <150ms initial load time increase from translation mapping
**Constraints**: Fetch all translations at app startup (assumes <1000 localized documents), bidirectional slug mapping for instant lookups, no additional API calls during language switching
**Scale/Scope**: 2 locales (English default, French), 4 document types (page, blog, homePage, blogIndex), estimated <500 total documents

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Monorepo Structure & Boundaries ✅
- **Compliance**: Changes are isolated to apps/web workspace (new context file, locale-mapper utility, language-switcher updates)
- **No cross-workspace violations**: Dependencies use existing workspace packages (@workspace/i18n-config)
- **Independent buildable**: apps/web remains independently testable and buildable

### Principle II: TypeScript Strict Mode & Type Safety ✅
- **Compliance**: All new files will use strict TypeScript with comprehensive type definitions
- **No `any` types**: LocaleMapping, Translation objects, and context will have complete interfaces
- **Type assertions**: Any necessary type assertions will be documented with safety justifications

### Principle III: Test Coverage (MANDATORY) ✅
- **Compliance**: Feature will include:
  - Unit tests for `createLocaleMapping()` utility function (edge cases, different document types)
  - Integration tests for LocaleContext provider and useLocale() hook
  - E2E tests for language switcher navigation (successful translation, missing translation 404)
- **Coverage target**: 80%+ for business logic (locale mapping creation and lookup)

### Principle IV: Component Modularity & Reusability ✅
- **Compliance**:
  - LocaleProvider is a pure container component with clear props interface
  - useLocale() hook separates business logic from presentation
  - Language switcher component updated to use hook (maintains single responsibility)
- **No new shared UI components**: Using existing @workspace/ui components

### Principle V: API Contracts & Versioning ✅
- **Compliance**:
  - LocaleContext API defined with TypeScript interfaces
  - GROQ query extension for `queryAllLocalizedPages` follows existing query patterns
  - No breaking changes to existing APIs
- **Contract tests**: Will validate GROQ query structure and locale mapping output

### Principle VI: Internationalization (i18n) First ✅
- **Compliance**: This feature directly enhances i18n support
- **No hard-coded strings**: All user-facing text already externalized via next-intl
- **Translation structure**: Leverages existing Sanity @sanity/document-internationalization plugin

### Principle VII: Code Quality & Observability ✅
- **Compliance**:
  - Code will pass Ultracite linting and formatting
  - Build and type-check required before merge
  - Language switch analytics already tracked in existing component
  - Error logging for missing translations (404 scenarios)

### Pre-Merge Requirements Gate
All standard gates apply:
1. ✅ TypeScript compilation (`pnpm check-types`)
2. ✅ Linting passes (`pnpm lint`)
3. ✅ Tests pass (unit, integration, e2e)
4. ✅ Build succeeds (`pnpm build`)
5. ✅ Code review approval
6. ✅ Documentation updated (inline JSDoc, component usage examples)

### Performance Budgets Gate ✅
- **Compliance**:
  - Initial page load impact: <150ms (within acceptable range, no bundle bloat)
  - No route chunk size increase (server-side data fetching only)
  - Development rebuild: No impact (no build-time changes)

**GATE STATUS**: ✅ **PASSED** - All constitutional principles satisfied, no violations to justify

---

## Post-Design Constitution Re-check

*Re-evaluated after Phase 1 design completion*

### Design Artifacts Review

**Generated artifacts**:
- ✅ research.md - Comprehensive technical decisions and best practices
- ✅ data-model.md - Complete data structures with validation rules
- ✅ contracts/locale-context-api.ts - TypeScript interfaces with 600+ lines of documentation
- ✅ quickstart.md - Step-by-step implementation guide with test examples

### Constitutional Compliance After Design

All constitutional principles remain satisfied after detailed design:

1. **Principle I (Monorepo Boundaries)** ✅
   - Design confirms isolation to apps/web workspace
   - No cross-workspace dependencies introduced
   - Uses existing @workspace/i18n-config package correctly

2. **Principle II (TypeScript Strict Mode)** ✅
   - Contract defines comprehensive interfaces for all data structures
   - No `any` types in design
   - All type assertions documented with safety rationale

3. **Principle III (Test Coverage)** ✅
   - Quickstart includes 3 test phases: unit, integration, e2e
   - Specific test cases defined for all modules
   - Coverage target confirmed at 80%+ for business logic

4. **Principle IV (Component Modularity)** ✅
   - LocaleProvider separated from business logic (locale-mapper)
   - useLocale() hook provides clean abstraction
   - No coupling to UI components

5. **Principle V (API Contracts)** ✅
   - Complete TypeScript contract with versioning (1.0.0)
   - 15+ interfaces with JSDoc documentation
   - Usage examples and error handling patterns documented

6. **Principle VI (i18n First)** ✅
   - Design directly enhances i18n capabilities
   - Leverages existing Sanity i18n plugin structure
   - No hard-coded strings introduced

7. **Principle VII (Code Quality)** ✅
   - Comprehensive JSDoc comments throughout design
   - Error logging patterns defined
   - Performance benchmarks established (<150ms impact)

### Performance Budgets After Design

**Confirmed within budgets**:
- Initial load impact: <150ms (design estimates 50ms query + 5ms mapping + 10ms hydration = 65ms)
- Bundle size: No increase (server-side data fetching only)
- Memory usage: ~260KB for 500 documents (well within limits)

**FINAL GATE STATUS**: ✅ **PASSED** - Design maintains full constitutional compliance

## Project Structure

### Documentation (this feature)

```text
specs/006-fix-language-switcher/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── locale-context-api.ts  # LocaleContext TypeScript interface contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (TurboRepo Monorepo)

```text
apps/web/                                    # Next.js 15 web application
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       └── layout.tsx                   # [MODIFY] Fetch translations, create mapping, provide context
│   ├── components/
│   │   └── language-switcher.tsx            # [MODIFY] Use locale context + next-intl Link with pathname patterns
│   ├── contexts/
│   │   └── locale-context.tsx               # [CREATE] LocaleProvider + useLocale hook
│   ├── i18n/
│   │   └── routing.ts                       # [MODIFY] Add pathnames config for localized routes
│   ├── lib/
│   │   └── sanity/
│   │       ├── i18n.ts                      # [EXISTING] translationsFragment
│   │       ├── query.ts                     # [MODIFY] Add queryAllLocalizedPages
│   │       └── locale-mapper.ts             # [CREATE] createLocaleMapping with slug normalization
│   └── __tests__/                           # [CREATE] Test suite for this feature
│       ├── unit/
│       │   ├── locale-mapper.test.ts        # Unit tests for createLocaleMapping + slug normalization
│       │   └── locale-context.test.tsx      # Unit tests for useLocale hook
│       ├── integration/
│       │   └── language-switcher.test.tsx   # Integration tests for switcher + context + next-intl
│       └── e2e/
│           └── language-switching.spec.ts   # E2E tests for navigation flows (includes /blogue routes)

apps/studio/                                 # Sanity Studio application
├── utils/
│   └── slug-validation.ts                   # [MODIFY] Remove /blog/ prefix requirement
└── components/
    └── slug-field-component.tsx             # [MODIFY] Update URL preview to show localized URLs

packages/i18n-config/                        # [EXISTING] Shared i18n configuration
└── src/
    └── index.ts                             # Exports LOCALES, DEFAULT_LOCALE, Locale type
```

**Structure Decision**: This is a TurboRepo monorepo with multiple workspaces. Changes span two workspaces:
- **apps/web**: Core language switcher fix (2 new modules, 4 modified files)
- **apps/studio**: Slug validation and URL preview updates (2 modified files)

The feature maintains clear boundaries between workspaces. All new code follows existing workspace structure and testing patterns. Sanity Studio changes are isolated to slug handling and do not affect the CMS schema.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations. This section is not applicable.
