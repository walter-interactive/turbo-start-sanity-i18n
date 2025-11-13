# Tasks: Co-locate Page Builder Block Modules

**Input**: Design documents from `/specs/007-colocate-pagebuilder-modules/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), quickstart.md (complete)

**Tests**: Not requested - verification via type checking, build validation, and dev server smoke tests only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo structure**: `packages/`, `apps/web/`, `apps/studio/`
- **Shared package**: `packages/sanity-blocks/src/`
- **Web components**: `apps/web/src/blocks/`
- **Studio schemas**: `apps/studio/schemaTypes/blocks/`

---

## Phase 1: Setup (Shared Package Infrastructure)

**Purpose**: Create shared workspace package for schemas and fragments

- [X] T001 Create directory structure packages/sanity-blocks/src/
- [X] T002 Create packages/sanity-blocks/package.json with @workspace/sanity-blocks config and Sanity dependency (see research.md:L141-153 for structure: name "@workspace/sanity-blocks", private: true, main/types: "./src/index.ts", dependencies: {"sanity": "workspace:*"})
- [X] T003 Create packages/sanity-blocks/tsconfig.json with TypeScript config (should extend root tsconfig, include "src/**/*", enable ES modules with proper module resolution)
- [X] T004 Add @workspace/sanity-blocks dependency to apps/studio/package.json
- [X] T005 Add @workspace/sanity-blocks dependency to apps/web/package.json
- [X] T006 Run pnpm install to link workspace dependencies

---

## Phase 2: Foundational (Core Directory Structure)

**Purpose**: Create directory structures needed by all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 [P] Create directory apps/web/src/blocks/
- [X] T008 [P] Create directory apps/web/src/lib/sanity/fragments/atomic/
- [X] T009 [P] Create directory apps/web/src/lib/sanity/fragments/reusable/
- [X] T010 [P] Create directory apps/web/src/lib/sanity/fragments/pageBuilder/
- [X] T011 [P] Create directory apps/web/src/lib/sanity/queries/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Developer Discovers Block Components (Priority: P1) 🎯 MVP

**Goal**: Reorganize all 6 page builder blocks so schemas and fragments are co-located in shared package, components in dedicated blocks directory

**Independent Test**: Navigate to packages/sanity-blocks/src/hero-section/ and verify hero-section.schema.ts and hero-section.fragment.ts exist. Navigate to apps/web/src/blocks/HeroSection/ and verify HeroSection.tsx exists.

### Hero Block Migration

- [ ] T012 [US1] Create directory packages/sanity-blocks/src/hero-section/
- [ ] T013 [US1] Copy apps/studio/schemaTypes/blocks/hero.ts to packages/sanity-blocks/src/hero-section/hero-section.schema.ts
- [ ] T014 [US1] Rename export constant in hero-section.schema.ts from hero to heroSectionSchema (e.g., `export const hero` → `export const heroSectionSchema`). Note: the schema's "name" property inside defineType should remain "heroSection" for consistency
- [ ] T015 [US1] Extract hero block fragment from apps/web/src/lib/sanity/query.ts to packages/sanity-blocks/src/hero-section/hero-section.fragment.ts
- [ ] T016 [US1] Rename fragment export to heroSectionFragment in hero-section.fragment.ts
- [ ] T017 [US1] Create directory apps/web/src/blocks/HeroSection/
- [ ] T018 [US1] Move apps/web/src/components/sections/hero.tsx to apps/web/src/blocks/HeroSection/HeroSection.tsx
- [ ] T019 [US1] Update imports in HeroSection.tsx to reference types from @/lib/sanity/sanity.types

### CTA Block Migration

- [ ] T020 [P] [US1] Create directory packages/sanity-blocks/src/cta/
- [ ] T021 [P] [US1] Copy apps/studio/schemaTypes/blocks/cta.ts to packages/sanity-blocks/src/cta/cta.schema.ts and rename export to ctaSchema
- [ ] T022 [P] [US1] Extract cta block fragment from apps/web/src/lib/sanity/query.ts to packages/sanity-blocks/src/cta/cta.fragment.ts and rename to ctaFragment
- [ ] T023 [P] [US1] Create directory apps/web/src/blocks/Cta/ and move apps/web/src/components/sections/cta.tsx to apps/web/src/blocks/Cta/Cta.tsx

### FAQ Accordion Block Migration

- [ ] T024 [P] [US1] Create directory packages/sanity-blocks/src/faq-accordion/
- [ ] T025 [P] [US1] Copy apps/studio/schemaTypes/blocks/faq-accordion.ts to packages/sanity-blocks/src/faq-accordion/faq-accordion.schema.ts and rename export to faqAccordionSchema
- [ ] T026 [P] [US1] Extract faqAccordion block fragment from apps/web/src/lib/sanity/query.ts to packages/sanity-blocks/src/faq-accordion/faq-accordion.fragment.ts and rename to faqAccordionFragment
- [ ] T027 [P] [US1] Create directory apps/web/src/blocks/FaqAccordion/ and move apps/web/src/components/sections/faq-accordion.tsx to apps/web/src/blocks/FaqAccordion/FaqAccordion.tsx

### Feature Cards Icon Block Migration

- [ ] T028 [P] [US1] Create directory packages/sanity-blocks/src/feature-cards-icon/
- [ ] T029 [P] [US1] Copy apps/studio/schemaTypes/blocks/feature-cards-icon.ts to packages/sanity-blocks/src/feature-cards-icon/feature-cards-icon.schema.ts and rename export to featureCardsIconSchema
- [ ] T030 [P] [US1] Extract featureCardsIcon block fragment from apps/web/src/lib/sanity/query.ts to packages/sanity-blocks/src/feature-cards-icon/feature-cards-icon.fragment.ts and rename to featureCardsIconFragment
- [ ] T031 [P] [US1] Create directory apps/web/src/blocks/FeatureCardsIcon/ and move apps/web/src/components/sections/feature-cards-with-icon.tsx to apps/web/src/blocks/FeatureCardsIcon/FeatureCardsIcon.tsx

### Image Link Cards Block Migration

- [ ] T032 [P] [US1] Create directory packages/sanity-blocks/src/image-link-cards/
- [ ] T033 [P] [US1] Copy apps/studio/schemaTypes/blocks/image-link-cards.ts to packages/sanity-blocks/src/image-link-cards/image-link-cards.schema.ts and rename export to imageLinkCardsSchema
- [ ] T034 [P] [US1] Extract imageLinkCards block fragment from apps/web/src/lib/sanity/query.ts to packages/sanity-blocks/src/image-link-cards/image-link-cards.fragment.ts and rename to imageLinkCardsFragment
- [ ] T035 [P] [US1] Create directory apps/web/src/blocks/ImageLinkCards/ and move apps/web/src/components/sections/image-link-cards.tsx to apps/web/src/blocks/ImageLinkCards/ImageLinkCards.tsx

### Subscribe Newsletter Block Migration

- [ ] T036 [P] [US1] Create directory packages/sanity-blocks/src/subscribe-newsletter/
- [ ] T037 [P] [US1] Copy apps/studio/schemaTypes/blocks/subscribe-newsletter.ts to packages/sanity-blocks/src/subscribe-newsletter/subscribe-newsletter.schema.ts and rename export to subscribeNewsletterSchema
- [ ] T038 [P] [US1] Extract subscribeNewsletter block fragment from apps/web/src/lib/sanity/query.ts to packages/sanity-blocks/src/subscribe-newsletter/subscribe-newsletter.fragment.ts and rename to subscribeNewsletterFragment
- [ ] T039 [P] [US1] Create directory apps/web/src/blocks/SubscribeNewsletter/ and move apps/web/src/components/sections/subscribe-newsletter.tsx to apps/web/src/blocks/SubscribeNewsletter/SubscribeNewsletter.tsx

### Central Registry Updates

- [ ] T040 [US1] Create packages/sanity-blocks/src/index.ts with barrel exports for all schemas, fragments, and allBlockSchemas array
  - [ ] T040a Create packages/sanity-blocks/src/index.ts file
  - [ ] T040b Export all individual schemas: `export { heroSectionSchema } from './hero-section/hero-section.schema'` (repeat for all 6 blocks: heroSection, cta, faqAccordion, featureCardsIcon, imageLinkCards, subscribeNewsletter)
  - [ ] T040c Export all individual fragments: `export { heroSectionFragment } from './hero-section/hero-section.fragment'` (repeat for all 6 blocks)
  - [ ] T040d Create and export allBlockSchemas array: `export const allBlockSchemas = [heroSectionSchema, ctaSchema, faqAccordionSchema, featureCardsIconSchema, imageLinkCardsSchema, subscribeNewsletterSchema]`
- [ ] T041 [US1] Update apps/studio/schemaTypes/blocks/index.ts to import from @workspace/sanity-blocks instead of relative paths (replace relative imports with `import { allBlockSchemas } from '@workspace/sanity-blocks'` and export as pageBuilderBlocks)
- [ ] T042 [US1] Update apps/web/src/components/pagebuilder.tsx to import components from @/blocks/ instead of @/components/sections/
  - [ ] T042a Update import statements to use @/blocks/ paths (e.g., `import { HeroSection } from '@/blocks/HeroSection/HeroSection'`)
  - [ ] T042b Verify BLOCK_COMPONENTS mapping object keys match schema names (heroSection → HeroSection component)
- [ ] T043 [US1] Delete old schema files from apps/studio/schemaTypes/blocks/ (hero.ts, cta.ts, faq-accordion.ts, feature-cards-icon.ts, image-link-cards.ts, subscribe-newsletter.ts)
- [ ] T044 [US1] Delete old component files from apps/web/src/components/sections/ directory

### Verification for User Story 1

- [ ] T045 [US1] Run pnpm --filter studio type to regenerate Sanity types
- [ ] T046 [US1] Run pnpm --filter studio check-types to verify studio type safety
- [ ] T047 [US1] Run pnpm --filter web check-types to verify web type safety
- [ ] T048 [US1] Run pnpm --filter studio build to verify studio builds successfully
- [ ] T049 [US1] Run pnpm --filter web build to verify web builds successfully
- [ ] T050 [US1] Start pnpm --filter studio dev and verify no errors (smoke test)
- [ ] T051 [US1] Start pnpm --filter web dev and verify no errors (smoke test)

**Checkpoint**: At this point, all 6 blocks should be reorganized with schemas/fragments in shared package and components in dedicated directories. Developers can locate all files for a block within 5 seconds.

---

## Phase 4: User Story 2 - Developer Adds New Block Type (Priority: P2)

**Goal**: Update central registries and fragment aggregators to make adding new blocks straightforward

**Independent Test**: Add a test "Testimonials" block following quickstart.md guide and verify it appears in Studio and renders on frontend

### Add Test Block Following New Pattern

- [ ] T052 [US2] Create directory packages/sanity-blocks/src/testimonials/
- [ ] T053 [US2] Create packages/sanity-blocks/src/testimonials/testimonials.schema.ts with basic schema (heading and array of testimonial objects)
- [ ] T054 [US2] Create packages/sanity-blocks/src/testimonials/testimonials.fragment.ts with GROQ fragment
- [ ] T055 [US2] Add testimonials exports to packages/sanity-blocks/src/index.ts
- [ ] T056 [US2] Create directory apps/web/src/blocks/Testimonials/
- [ ] T057 [US2] Create apps/web/src/blocks/Testimonials/Testimonials.tsx component that renders testimonial data
- [ ] T058 [US2] Import testimonialsSchema in apps/studio/schemaTypes/blocks/index.ts from @workspace/sanity-blocks
- [ ] T059 [US2] Add testimonialsFragment to apps/web/src/lib/sanity/fragments/pageBuilder/index.ts
- [ ] T060 [US2] Register Testimonials component in apps/web/src/components/pagebuilder.tsx BLOCK_COMPONENTS mapping
- [ ] T060a [US2] Verify SC-007: Confirm exactly 3 central registry files were modified (apps/studio/schemaTypes/blocks/index.ts, packages/sanity-blocks/src/index.ts, apps/web/src/components/pagebuilder.tsx)

### Verification for User Story 2

- [ ] T061 [US2] Run pnpm --filter studio type to regenerate types with new block
- [ ] T062 [US2] Run pnpm check-types to verify type safety
- [ ] T063 [US2] Run pnpm build to verify builds succeed
- [ ] T064 [US2] Start studio dev server and verify Testimonials block appears in pageBuilder array
- [ ] T065 [US2] Create a test page with Testimonials block and verify it renders correctly on frontend

### Cleanup Test Block

- [ ] T066 [US2] Remove testimonials block files from packages/sanity-blocks/src/testimonials/
- [ ] T067 [US2] Remove testimonials exports from packages/sanity-blocks/src/index.ts
- [ ] T068 [US2] Remove Testimonials component from apps/web/src/blocks/Testimonials/
- [ ] T069 [US2] Remove testimonials imports from studio and web registries
- [ ] T070 [US2] Run pnpm --filter studio type and pnpm check-types to verify cleanup

**Checkpoint**: At this point, the pattern for adding new blocks is verified. Adding a new block requires creating 3 files in shared package + 1 component + updating 3 registry files.

---

## Phase 5: User Story 3 - Developer Finds Document-Specific Queries (Priority: P2)

**Goal**: Reorganize monolithic query.ts file into document-type specific query files

**Independent Test**: Navigate to apps/web/src/lib/sanity/queries/ and verify separate files exist for home.ts, page.ts, blog.ts, navbar.ts, footer.ts, settings.ts

### Extract Atomic and Reusable Fragments

- [ ] T071 [US3] Extract imageFields, customLinkFragment, markDefsFragment from apps/web/src/lib/sanity/query.ts to apps/web/src/lib/sanity/fragments/atomic/index.ts
- [ ] T072 [US3] Extract imageFragment, richTextFragment, buttonsFragment, blogCardFragment from apps/web/src/lib/sanity/query.ts to apps/web/src/lib/sanity/fragments/reusable/index.ts

### Create PageBuilder Fragment Aggregator

- [ ] T073 [US3] Create apps/web/src/lib/sanity/fragments/pageBuilder/index.ts that imports all block fragments from @workspace/sanity-blocks (see research.md:L203-226 for template literal composition pattern with conditional GROQ syntax)
- [ ] T074 [US3] Define pageBuilderFragment in pageBuilder/index.ts that composes all block fragments

### Split Document-Type Queries

- [ ] T075 [P] [US3] Create apps/web/src/lib/sanity/queries/home.ts with queryHomePageData
- [ ] T076 [P] [US3] Create apps/web/src/lib/sanity/queries/page.ts with querySlugPageData and queryAllLocalizedPages
- [ ] T077 [P] [US3] Create apps/web/src/lib/sanity/queries/blog.ts with queryBlogIndexPageData and queryBlogSlugPageData
- [ ] T078 [P] [US3] Create apps/web/src/lib/sanity/queries/navbar.ts with queryNavbarData
- [ ] T079 [P] [US3] Create apps/web/src/lib/sanity/queries/footer.ts with queryFooterData
- [ ] T080 [P] [US3] Create apps/web/src/lib/sanity/queries/settings.ts with querySettingsData

### Create Barrel Export for Backward Compatibility

- [ ] T081 [US3] Create apps/web/src/lib/sanity/queries/index.ts that re-exports all queries from document-type files

### Update Query Imports Throughout Web App

- [ ] T082 [US3] Find all imports from @/lib/sanity/query in apps/web/src/ and update to import from @/lib/sanity/queries/ or @/lib/sanity/fragments/ (use search pattern: `rg "from ['\"]@/lib/sanity/query['\"]" apps/web/src/`)
- [ ] T083 [US3] Update apps/web/src/app/[locale]/page.tsx imports (queryHomePageData → @/lib/sanity/queries/home)
- [ ] T084 [US3] Update apps/web/src/app/[locale]/[slug]/page.tsx imports (querySlugPageData, queryAllLocalizedPages → @/lib/sanity/queries/page)
- [ ] T085 [US3] Update apps/web/src/app/[locale]/blog/page.tsx imports (queryBlogIndexPageData → @/lib/sanity/queries/blog)
- [ ] T086 [US3] Update apps/web/src/app/[locale]/blog/[slug]/page.tsx imports (queryBlogSlugPageData → @/lib/sanity/queries/blog)
- [ ] T087 [US3] Update any other files importing from old query.ts location (use search pattern from T082)

### Cleanup Old Query File

- [ ] T088 [US3] Verify all content from apps/web/src/lib/sanity/query.ts has been extracted to new locations
- [ ] T089 [US3] Delete apps/web/src/lib/sanity/query.ts

### Verification for User Story 3

- [ ] T090 [US3] Run pnpm --filter web check-types to verify all imports resolve correctly
- [ ] T091 [US3] Run pnpm --filter web build to verify build succeeds
- [ ] T092 [US3] Start web dev server and navigate to home page, verify it renders correctly
- [ ] T093 [US3] Navigate to a regular page (/about), verify it renders correctly
- [ ] T094 [US3] Navigate to blog index (/blog), verify it renders correctly
- [ ] T095 [US3] Navigate to a blog post (/blog/post-slug), verify it renders correctly

**Checkpoint**: At this point, queries are organized by document type. Developers can find blog queries in queries/blog.ts within 5 seconds.

---

## Phase 6: User Story 4 - Developer Understands Query Structure (Priority: P3)

**Goal**: Ensure fragment hierarchy is clear and well-documented for new developers

**Independent Test**: Examine apps/web/src/lib/sanity/fragments/ directory structure and verify atomic/, reusable/, and pageBuilder/ subdirectories clearly show fragment composition hierarchy

### Add Fragment Documentation

- [ ] T096 [US4] Add comment header to apps/web/src/lib/sanity/fragments/atomic/index.ts explaining "Atomic fragments are the smallest reusable GROQ units"
- [ ] T097 [US4] Add comment header to apps/web/src/lib/sanity/fragments/reusable/index.ts explaining "Reusable fragments compose atomic fragments for common patterns"
- [ ] T098 [US4] Add comment header to apps/web/src/lib/sanity/fragments/pageBuilder/index.ts explaining "PageBuilder fragment aggregates all block-specific fragments from @workspace/sanity-blocks"

### Add Query Organization Documentation

- [ ] T099 [US4] Add comment header to apps/web/src/lib/sanity/queries/index.ts explaining "Queries organized by document type for easy discovery"

### Verify Quickstart Guide Accuracy

- [ ] T100 [US4] Follow quickstart.md "Adding a New Block" section step-by-step to verify accuracy
- [ ] T101 [US4] Follow quickstart.md "Modifying an Existing Block" section to verify accuracy
- [ ] T102 [US4] Verify all file paths in quickstart.md match actual reorganized structure

**Checkpoint**: All user stories should now be independently functional. Fragment hierarchy is clear, queries are organized, and documentation is accurate.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [ ] T103 [P] Verify all 6 original blocks work identically to before reorganization
- [ ] T104 [P] Run pnpm check-types across all workspaces and verify no errors
- [ ] T105 [P] Run pnpm build across all workspaces and verify success
- [ ] T106 [P] Test all pages in dev server (home, regular pages, blog index, blog posts) and verify identical rendering
- [ ] T107 Update CLAUDE.md if any new patterns emerged during implementation
- [ ] T108 Run final verification: start both studio and web dev servers and verify no console errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - reorganizes all blocks
  - User Story 2 (P2): Depends on User Story 1 - tests adding new blocks to reorganized structure
  - User Story 3 (P2): Can run in parallel with User Story 2 - independent query reorganization
  - User Story 4 (P3): Depends on User Stories 1 and 3 - documents final structure
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 (must have reorganized structure to test adding blocks)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent of User Story 1 (query organization is separate from block organization)
- **User Story 4 (P3)**: Depends on User Stories 1 and 3 (needs final structure to document)

### Within Each User Story

- **User Story 1**: Block migrations can run in parallel (T020-T039 marked [P]), registry updates must be sequential
- **User Story 2**: Test block creation is sequential (each step builds on previous)
- **User Story 3**: Document-type query creation can run in parallel (T075-T080 marked [P]), import updates are sequential
- **User Story 4**: Documentation tasks are mostly parallel

### Parallel Opportunities

- All Setup tasks (T001-T006) can run sequentially but are fast
- All Foundational directory creation tasks (T007-T011) marked [P] can run in parallel
- User Story 1: All 6 block migrations (Hero, CTA, FAQ, Feature Cards, Image Links, Subscribe) can be done in parallel by different developers once Hero pattern is established
- User Story 3: All document-type query file creation (T075-T080) marked [P] can run in parallel

---

## Parallel Example: User Story 1 Block Migrations

```bash
# After establishing Hero block pattern (T012-T019), launch all other blocks in parallel:

Task: "CTA block migration (T020-T023)"
Task: "FAQ Accordion block migration (T024-T027)"
Task: "Feature Cards Icon block migration (T028-T031)"
Task: "Image Link Cards block migration (T032-T035)"
Task: "Subscribe Newsletter block migration (T036-T039)"

# All blocks follow same pattern:
# 1. Create directory in packages/sanity-blocks/src/[block-name]/
# 2. Copy and rename schema file
# 3. Extract and rename fragment file
# 4. Create directory in apps/web/src/blocks/[BlockName]/
# 5. Move component file
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (shared package infrastructure)
2. Complete Phase 2: Foundational (directory structure)
3. Complete Phase 3: User Story 1 (reorganize all 6 blocks)
4. **STOP and VALIDATE**: Verify all blocks work identically, type checking passes, builds succeed
5. This is a functional reorganization MVP - all blocks are co-located

### Incremental Delivery

1. Complete Setup + Foundational → Infrastructure ready
2. Add User Story 1 → Test independently → All blocks reorganized (MVP!)
3. Add User Story 2 → Test independently → New block pattern validated
4. Add User Story 3 (can run parallel with US2) → Test independently → Queries organized
5. Add User Story 4 → Test independently → Documentation complete
6. Each story adds organizational value without breaking functionality

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 - Hero block pattern (establish pattern first)
   - After Hero pattern established:
     - Developer A: CTA and FAQ blocks
     - Developer B: Feature Cards and Image Links blocks
     - Developer C: Subscribe Newsletter block + registries
   - Developer D: User Story 3 (query organization - parallel with block work)
3. After US1 and US3 complete:
   - Developer A: User Story 2 (test new block pattern)
   - Developer B: User Story 4 (documentation)

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each logical group of tasks (e.g., after each block migration)
- Stop at any checkpoint to validate story independently
- SC-002 critical: All pages must render identically before and after reorganization
- Run type checking and builds frequently to catch import path errors early
- Keep old files until verification passes, then delete in cleanup tasks
