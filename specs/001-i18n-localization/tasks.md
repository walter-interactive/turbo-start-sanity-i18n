# Tasks: Multi-Language Website Support

**Input**: Design documents from `/specs/001-i18n-localization/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Included per Constitution Principle III requirement for test coverage

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a **monorepo** project with:
- **Web app**: `apps/web/`
- **Sanity Studio**: `apps/studio/`
- Shared configs at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and initialize basic configuration

- [X] T001 [P] Install next-intl dependency in apps/web/package.json
- [X] T002 [P] Install @sanity/document-internationalization dependency in apps/studio/package.json
- [X] T003 [P] Create message files directory at apps/web/messages/
- [X] T004 [P] Create i18n configuration directory at apps/web/src/i18n/
- [X] T005 [P] Create initial English message file at apps/web/messages/en.json with common namespace
- [X] T006 [P] Create initial French message file at apps/web/messages/fr.json with common namespace

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core i18n infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Create routing configuration at apps/web/src/i18n/routing.ts with locales ['fr', 'en'] and defaultLocale 'fr'
- [X] T008 Create navigation APIs at apps/web/src/i18n/navigation.ts exporting Link, redirect, useRouter, usePathname, getPathname
- [X] T009 Create request configuration at apps/web/src/i18n/request.ts with message loading logic
- [X] T010 Create middleware at apps/web/src/middleware.ts for locale detection and routing
- [X] T011 Update next.config.ts at apps/web/next.config.ts to integrate next-intl plugin
- [X] T012 Move existing app routes into [locale] segment at apps/web/src/app/[locale]/
- [X] T013 Update root layout at apps/web/src/app/[locale]/layout.tsx with locale validation and NextIntlClientProvider
- [X] T014 Add generateStaticParams to root layout at apps/web/src/app/[locale]/layout.tsx
- [X] T015 Update existing pages to call setRequestLocale for static rendering support

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Content Editor Manages Translations (Priority: P1) 🎯 MVP

**Goal**: Enable content editors to create, manage, and link translated versions of content in Sanity Studio

**Independent Test**: Log into Sanity Studio, create a page document in French, use "Create translation" action to create English version, verify both versions are linked via translation.metadata document and display translation status badges

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T016 [P] [US1] Create manual test checklist for Sanity Studio translation workflow in specs/001-i18n-localization/checklists/studio-translation-tests.md
- [ ] T017 [P] [US1] Create integration test for language field validation in apps/studio/tests/language-field.test.ts (if test framework exists)
- [ ] T018 [P] [US1] Create contract test for translation.metadata document structure in specs/001-i18n-localization/contracts/sanity-schemas.test.ts

### Implementation for User Story 1

- [X] T019 [US1] Configure document internationalization plugin in apps/studio/sanity.config.ts with supportedLanguages and schemaTypes
- [X] T020 [P] [US1] Add language field to page schema at apps/studio/schemaTypes/documents/page.ts
- [X] T021 [P] [US1] Add language field to blog schema at apps/studio/schemaTypes/documents/blog.ts
- [X] T022 [P] [US1] Add language field to blog-index schema at apps/studio/schemaTypes/documents/blog-index.ts
- [X] T023 [P] [US1] Add language field to navbar schema at apps/studio/schemaTypes/documents/navbar.ts
- [X] T024 [P] [US1] Add language field to footer schema at apps/studio/schemaTypes/documents/footer.ts
- [X] T025 [P] [US1] Add language field to settings schema at apps/studio/schemaTypes/documents/settings.ts
- [X] T026 [P] [US1] Add language field to home-page schema at apps/studio/schemaTypes/documents/home-page.ts
- [X] T027 [P] [US1] Add language field to faq schema at apps/studio/schemaTypes/documents/faq.ts
- [x] T028 [US1] Regenerate Sanity TypeScript types by running pnpm --filter studio type
- [X] T029 [US1] Test translation creation workflow in Sanity Studio UI
- [X] T030 [US1] Verify translation.metadata documents are created automatically
- [X] T031 [US1] Verify language badges appear on documents in Studio
- [X] T032 [US1] Test deleting one translation keeps other language versions intact

**Checkpoint**: At this point, content editors can create and manage translations in Sanity Studio. This is a fully functional MVP for the CMS side.

---

## Phase 4: User Story 2 - Website Visitor Views Content in Preferred Language (Priority: P2)

**Goal**: Enable website visitors to view content in their preferred language with seamless language switching

**Independent Test**: Visit website root URL, verify redirect to /fr/, switch to English via language switcher, verify redirect to /en/ and content changes, refresh browser to confirm language preference persists

### Tests for User Story 2

- [ ] T033 [P] [US2] Create unit test for locale detection logic in apps/web/src/i18n/__tests__/routing.test.ts
- [ ] T034 [P] [US2] Create integration test for GROQ queries with language parameter in apps/web/src/lib/sanity/__tests__/i18n-queries.test.ts
- [ ] T035 [P] [US2] Create integration test for language switcher component in apps/web/src/components/__tests__/language-switcher.test.tsx

### Implementation for User Story 2

- [X] T036 [P] [US2] Create language switcher component at apps/web/src/components/language-switcher.tsx
- [X] T037 [P] [US2] Create locale-aware GROQ query utilities at apps/web/src/lib/sanity/i18n.ts
- [X] T038 [US2] Update page queries at apps/web/src/lib/sanity/queries.ts to include language parameter and translation metadata
- [X] T039 [US2] Update blog queries at apps/web/src/lib/sanity/queries.ts to include language parameter
- [X] T040 [US2] Update navbar queries at apps/web/src/lib/sanity/queries.ts to filter by language
- [X] T041 [US2] Update all page components to use locale from params
- [X] T042 [US2] Update homepage at apps/web/src/app/[locale]/page.tsx to fetch content by locale
- [X] T043 [US2] Update dynamic page routes at apps/web/src/app/[locale]/[...slug]/page.tsx to fetch by locale and slug
- [X] T044 [US2] Update blog list page at apps/web/src/app/[locale]/blog/page.tsx to filter by locale
- [X] T045 [US2] Update blog post page at apps/web/src/app/[locale]/blog/[slug]/page.tsx to fetch by locale and slug
- [X] T046 [US2] Add language switcher to navbar component at apps/web/src/components/navbar.tsx
<!-- - [ ] T047 [US2] Implement fallback content notice component at apps/web/src/components/fallback-notice.tsx for untranslated pages - SKIP -->
- [X] T048 [US2] Update 404 page at apps/web/src/app/[locale]/not-found.tsx to be locale-aware
- [X] T049 [US2] Add language translations for UI strings in apps/web/messages/en.json (navigation, common, errors)
- [X] T050 [US2] Add language translations for UI strings in apps/web/messages/fr.json (navigation, common, errors)
- [X] T051 [US2] Test locale detection from URL
- [X] T052 [US2] Test locale detection from cookie
- [X] T053 [US2] Test locale detection from Accept-Language header
- [X] T054 [US2] Test language switching maintains current page path
- [X] T055 [US2] Test language preference persistence across browser sessions
- [X] T056 [US2] Test fallback behavior for untranslated content

**Checkpoint**: At this point, website visitors can view content in their language and switch between French/English. Combined with US1, the complete multi-language experience is functional.

---

## Phase 5: User Story 3 - Search Engines Index Multi-Language Content (Priority: P3)

**Goal**: Enable search engines to properly discover, index, and rank content in each language separately

**Independent Test**: Inspect page source HTML for hreflang tags, verify sitemap.xml includes all language versions with proper annotations, use Google Search Console URL inspection tool to validate proper language signals

### Tests for User Story 3

- [ ] T057 [P] [US3] Create unit test for hreflang generation logic in apps/web/src/lib/__tests__/seo.test.ts
- [ ] T058 [P] [US3] Create integration test for sitemap generation in apps/web/src/app/__tests__/sitemap.test.ts
- [ ] T059 [P] [US3] Create manual SEO validation checklist in specs/001-i18n-localization/checklists/seo-validation.md

### Implementation for User Story 3

- [X] T060 [US3] Create SEO utility functions at apps/web/src/lib/seo.ts for hreflang generation
- [X] T061 [US3] Update metadata generation in root layout at apps/web/src/app/[locale]/layout.tsx to include hreflang alternates
- [X] T062 [US3] Update metadata in pages to include language-specific Open Graph tags
- [X] T063 [US3] Create sitemap route at apps/web/src/app/sitemap.ts to generate language-aware sitemap
- [X] T064 [US3] Create robots.txt route at apps/web/src/app/robots.ts with sitemap reference
- [X] T065 [US3] Update homepage metadata at apps/web/src/app/[locale]/page.tsx with language-specific title/description
- [X] T066 [US3] Update dynamic pages metadata at apps/web/src/app/[locale]/[...slug]/page.tsx with hreflang tags
- [X] T067 [US3] Update blog post metadata at apps/web/src/app/[locale]/blog/[slug]/page.tsx with hreflang tags
- [X] T068 [US3] Ensure HTML lang attribute matches content language in root layout
- [X] T069 [US3] Add JSON-LD structured data with language annotations
- [X] T070 [US3] Test hreflang tags are present on all pages
- [X] T071 [US3] Test sitemap includes all language versions
- [X] T072 [US3] Validate robots.txt is accessible and references sitemap
- [X] T073 [US3] Test Open Graph tags are language-specific
- [X] T074 [US3] Verify HTML lang attribute matches content language
- [X] T075 [US3] Submit sitemap to Google Search Console for validation

**Checkpoint**: All user stories are now independently functional. Search engines can properly index multi-language content.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and optimizations that affect multiple user stories

- [X] T076 [P] Add comprehensive translation keys for all UI strings in apps/web/messages/en.json
- [X] T077 [P] Add comprehensive translation keys for all UI strings in apps/web/messages/fr.json
- [X] T078 [P] Create TypeScript type augmentation for translation keys at apps/web/src/i18n/types.d.ts
- [X] T079 [P] Optimize GROQ queries for performance (add projections, limit fields)
- [X] T080 [P] Add error logging for locale detection failures
- [X] T081 [P] Add analytics tracking for language switching events
- [X] T082 Update documentation at apps/web/README.md with i18n usage instructions
- [X] T083 Update documentation at apps/studio/README.md with translation workflow guide
- [X] T084 Create migration script for adding language field to existing documents at apps/studio/migrations/add-language-field/index.ts
- [X] T085 [P] Run type checking across monorepo with pnpm check-types
- [X] T086 [P] Run linting across monorepo with pnpm lint
- [X] T087 [P] Fix any linting or type errors identified
- [X] T088 Build web app with pnpm --filter web build to verify production build succeeds
- [X] T089 Build Sanity Studio with pnpm --filter studio build to verify Studio build succeeds
- [ ] T090 Validate build time remains under 5 minutes per Constitution constraint
- [ ] T091 Test language switching performance is under 2 seconds
- [X] T092 Run through quickstart.md validation checklist
- [X] T093 Update AGENTS.md with any new patterns or conventions learned

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for content to exist, but can be developed in parallel
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires US2 for pages to exist, but metadata logic can be developed independently

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Schema changes before queries
- Queries before components
- Components before integration
- Core implementation before edge case handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: All 6 setup tasks marked [P] can run in parallel
- **Phase 2**: All foundational tasks can run in parallel after dependencies are met
- **User Story 1**: Tasks T020-T027 (schema updates) marked [P] can run in parallel
- **User Story 2**: Query updates (T038-T040), message files (T049-T050) marked [P] can run in parallel
- **User Story 3**: Metadata updates (T061-T067) can run in parallel once SEO utilities (T060) exist
- **Polish**: Documentation (T076-T078, T082-T083), validation (T085-T087) marked [P] can run in parallel

---

## Parallel Example: User Story 1 (CMS Translation)

```bash
# After plugin config (T019), launch all schema updates together:
Task: "Add language field to page schema at apps/studio/schemaTypes/documents/page.ts"
Task: "Add language field to blog schema at apps/studio/schemaTypes/documents/blog.ts"
Task: "Add language field to blog-index schema at apps/studio/schemaTypes/documents/blog-index.ts"
Task: "Add language field to navbar schema at apps/studio/schemaTypes/documents/navbar.ts"
Task: "Add language field to footer schema at apps/studio/schemaTypes/documents/footer.ts"
Task: "Add language field to settings schema at apps/studio/schemaTypes/documents/settings.ts"
Task: "Add language field to home-page schema at apps/studio/schemaTypes/documents/home-page.ts"
Task: "Add language field to faq schema at apps/studio/schemaTypes/documents/faq.ts"
```

---

## Parallel Example: User Story 2 (Frontend i18n)

```bash
# After i18n utilities (T037), launch query updates together:
Task: "Update page queries at apps/web/src/lib/sanity/queries.ts to include language parameter"
Task: "Update blog queries at apps/web/src/lib/sanity/queries.ts to include language parameter"
Task: "Update navbar queries at apps/web/src/lib/sanity/queries.ts to filter by language"

# And message files in parallel:
Task: "Add UI translations in apps/web/messages/en.json"
Task: "Add UI translations in apps/web/messages/fr.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T015) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T016-T032)
4. **STOP and VALIDATE**: Test US1 independently in Sanity Studio
5. Optional: Add migration script (T084) if existing content needs language field

**Result**: Content editors can create and manage translations. This is a functional CMS MVP.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo Sanity Studio (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo full i18n experience
4. Add User Story 3 → Test independently → Deploy/Demo with SEO optimization
5. Add Polish → Production-ready multi-language site

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers after Foundational phase completion:

1. **Developer A**: User Story 1 (T016-T032) - Sanity Studio i18n
2. **Developer B**: User Story 2 (T033-T056) - Frontend i18n (can start schemas/stubs in parallel)
3. **Developer C**: User Story 3 (T057-T075) - SEO optimization (can start metadata patterns in parallel)

Stories complete and integrate independently. Developer B should wait for Developer A to complete T028 (type generation) before using new Sanity types.

---

## Task Summary

**Total Tasks**: 93
- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 9 tasks (BLOCKING)
- **Phase 3 (US1 - CMS)**: 17 tasks (3 tests + 14 implementation)
- **Phase 4 (US2 - Frontend)**: 24 tasks (3 tests + 21 implementation)
- **Phase 5 (US3 - SEO)**: 19 tasks (3 tests + 16 implementation)
- **Phase 6 (Polish)**: 18 tasks

**User Story Breakdown**:
- **US1**: 17 tasks → Content editors can manage translations
- **US2**: 24 tasks → Visitors can view and switch languages
- **US3**: 19 tasks → Search engines properly index multi-language content

**Parallel Opportunities**: 32 tasks marked with [P] across all phases

**Independent Test Criteria**:
- **US1**: Create page in French, create English translation, verify both exist and are linked
- **US2**: Visit site, switch languages, verify content changes and preference persists
- **US3**: Inspect HTML source, verify hreflang tags and sitemap include all languages

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 32 tasks for functional CMS translation management

---

## Format Validation

✅ All tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
✅ Task IDs sequential (T001-T093) in execution order
✅ [P] marker present for parallelizable tasks (32 tasks)
✅ [Story] labels present for user story phases (US1, US2, US3)
✅ File paths included in all implementation tasks
✅ Test tasks included per Constitution Principle III
✅ Each user story independently testable

---

## Notes

- Commit after completing each user story phase
- Run `pnpm check-types` before committing
- Run `pnpm --filter studio type` after schema changes (T028)
- Test each user story independently at its checkpoint
- US2 can begin component/UI work in parallel with US1, but needs US1's type generation (T028) completed first
- Constitution compliance: Test coverage requirement satisfied with tests in each user story phase
- Follow file naming convention: kebab-case for all new files
- Use `import type` for TypeScript type imports
- Never use `type any` - use generated Sanity types or define specific interfaces
