# Tasks: Complete Schema Migration to Monorepo Packages

**Feature**: Complete Schema Migration to Monorepo Packages
**Branch**: `009-complete-schema-migration`
**Generated**: 2025-11-14
**Related**: [spec.md](./spec.md) | [plan.md](./plan.md) | [quickstart.md](./quickstart.md)

## Overview

This document breaks down the schema migration into actionable tasks organized by user story. Each phase represents an independently testable increment, following the priority order defined in the specification.

**Total Tasks**: 46 tasks across 5 phases
**Parallelization Opportunities**: 24 tasks can run in parallel (marked with [P])
**Estimated Duration**: 2-3 hours for full implementation

---

## Phase 1: Setup

**Goal**: Verify environment and prerequisites

**Tasks**:
- [x] T001 Verify workspace dependencies in apps/template-studio/package.json
- [x] T002 Verify workspace dependencies in packages/sanity-atoms/package.json
- [x] T003 Verify workspace dependencies in packages/sanity-blocks/package.json
- [x] T004 Run `pnpm install` to ensure all dependencies resolved
- [x] T005 Run `pnpm check-types` to establish baseline (should pass)

**Verification**: All workspace dependencies exist, baseline type checking passes

---

## Phase 2: User Story 1 - Migrate Atom Definitions (P1)

**Story Goal**: Move reusable atom definitions (button, customUrl) to `packages/sanity-atoms` so new Sanity projects can import these fundamental building blocks without duplicating code.

**Why P1**: Atoms are foundational building blocks referenced by all blocks. They must be migrated first to avoid circular dependencies.

**Independent Test Criteria**:
- ✅ Create a new Sanity project, add `@walter/sanity-atoms` as dependency
- ✅ Import and use `button` and `customUrl` schemas
- ✅ Verify they work in Sanity Studio interface

**Tasks**:

### T006-T011: Migrate customUrl Atom (First - No Dependencies)
- [x] T006 [P] [US1] Create packages/sanity-atoms/src/custom-url.schema.ts by copying from apps/template-studio/schemaTypes/definitions/custom-url.ts
- [x] T007 [US1] In packages/sanity-atoms/src/custom-url.schema.ts, inline createRadioListLayout helper (replace with direct options object)
- [x] T008 [US1] In packages/sanity-atoms/src/custom-url.schema.ts, inline isValidUrl helper in validation function
- [x] T009 [US1] In packages/sanity-atoms/src/custom-url.schema.ts, rename export from `customUrl` to `customUrlSchema`
- [x] T010 [P] [US1] Create packages/sanity-atoms/src/custom-url.fragment.ts with GROQ fragment (see contracts/atoms.groq)
- [x] T011 [US1] Run `pnpm --filter @walter/sanity-atoms check-types` to verify customUrl migration

### T012-T017: Migrate button Atom (Second - Depends on customUrl)
- [x] T012 [P] [US1] Create packages/sanity-atoms/src/button.schema.ts by copying from apps/template-studio/schemaTypes/definitions/button.ts
- [x] T013 [US1] In packages/sanity-atoms/src/button.schema.ts, inline createRadioListLayout and capitalize helpers
- [x] T014 [US1] In packages/sanity-atoms/src/button.schema.ts, rename export from `button` to `buttonSchema`
- [x] T015 [US1] In packages/sanity-atoms/src/button.schema.ts, verify schema `name` property remains "button"
- [x] T016 [P] [US1] Create packages/sanity-atoms/src/button.fragment.ts with GROQ fragment composing customUrlFragment (see contracts/atoms.groq)
- [x] T017 [US1] Run `pnpm --filter @walter/sanity-atoms check-types` to verify button migration

### T018-T019: Update Atom Package Exports
- [ ] T018 [US1] In packages/sanity-atoms/src/schemas.ts, add exports for buttonSchema and customUrlSchema
- [ ] T019 [US1] In packages/sanity-atoms/src/fragments.ts, add exports for buttonFragment and customUrlFragment
- [ ] T020 [US1] Run `pnpm --filter @walter/sanity-atoms check-types` to verify all atom exports resolve

**Phase 2 Verification** (US1 Independent Test):
- [ ] T021 [US1] Import `buttonSchema` and `customUrlSchema` from `@walter/sanity-atoms/schemas` in a test file and verify TypeScript resolves types correctly
- [ ] T022 [US1] Run `pnpm check-types` at workspace root to verify cross-package type resolution

**Parallel Execution** (Phase 2):
- Tasks T006 and T010 can run in parallel (different files)
- Tasks T012 and T016 can run in parallel after T011 completes (different files)

---

## Phase 3: User Story 2 - Migrate Remaining Page Builder Blocks (P2)

**Story Goal**: Migrate all page builder blocks (FAQ accordion, feature cards, image link cards, subscribe newsletter) to shared package so new Sanity projects have access to the proven block library.

**Why P2**: After atoms are migrated (P1), blocks can safely reference them. Ensures correct dependency order.

**Independent Test Criteria**:
- ✅ Open template-studio, navigate to page with pageBuilder field
- ✅ Verify all 6 blocks (hero, CTA, FAQ, feature cards, image cards, newsletter) appear in block menu
- ✅ Verify blocks can be added/edited/previewed without errors

**Tasks**:

### T023-T025: Complete faqAccordion Schema (Currently Empty)
- [ ] T023 [P] [US2] Copy content from apps/template-studio/schemaTypes/blocks/faq-accordion.ts to packages/sanity-blocks/src/faqAccordion.schema.ts
- [ ] T024 [US2] In packages/sanity-blocks/src/faqAccordion.schema.ts, update import to use `customRichText` from `@walter/sanity-atoms/schemas`
- [ ] T025 [US2] In packages/sanity-blocks/src/faqAccordion.schema.ts, rename export from `faqAccordion` to `faqAccordionSchema`

### T026-T030: Migrate featureCardsIcon Block
- [ ] T026 [P] [US2] Create packages/sanity-blocks/src/featureCardsIcon.schema.ts by copying from apps/template-studio/schemaTypes/blocks/feature-cards-icon.ts
- [ ] T027 [US2] In packages/sanity-blocks/src/featureCardsIcon.schema.ts, remove iconField import and inline definition (7 lines from common.ts)
- [ ] T028 [US2] In packages/sanity-blocks/src/featureCardsIcon.schema.ts, update import to use `customRichText` from `@walter/sanity-atoms/schemas`
- [ ] T029 [US2] In packages/sanity-blocks/src/featureCardsIcon.schema.ts, rename export from `featureCardsIcon` to `featureCardsIconSchema`
- [ ] T030 [US2] In packages/sanity-blocks/src/featureCardsIcon.schema.ts, verify nested `featureCardIcon` object remains inline (do not extract)

### T031-T035: Migrate imageLinkCards Block
- [ ] T031 [P] [US2] Create packages/sanity-blocks/src/imageLinkCards.schema.ts by copying from apps/template-studio/schemaTypes/blocks/image-link-cards.ts
- [ ] T032 [US2] In packages/sanity-blocks/src/imageLinkCards.schema.ts, update imports to use `buttonsFieldSchema` and `customRichText` from `@walter/sanity-atoms/schemas`
- [ ] T033 [US2] In packages/sanity-blocks/src/imageLinkCards.schema.ts, replace `buttonsField` reference with `buttonsFieldSchema`
- [ ] T034 [US2] In packages/sanity-blocks/src/imageLinkCards.schema.ts, rename export from `imageLinkCards` to `imageLinkCardsSchema`
- [ ] T035 [US2] In packages/sanity-blocks/src/imageLinkCards.schema.ts, verify nested `imageLinkCard` object remains inline (do not extract)

### T036-T039: Migrate subscribeNewsletter Block
- [ ] T036 [P] [US2] Create packages/sanity-blocks/src/subscribeNewsletter.schema.ts by copying from apps/template-studio/schemaTypes/blocks/subscribe-newsletter.ts
- [ ] T037 [US2] In packages/sanity-blocks/src/subscribeNewsletter.schema.ts, update import to use `customRichText` from `@walter/sanity-atoms/schemas`
- [ ] T038 [US2] In packages/sanity-blocks/src/subscribeNewsletter.schema.ts, rename export from `subscribeNewsletter` to `subscribeNewsletterSchema`
- [ ] T039 [US2] In packages/sanity-blocks/src/subscribeNewsletter.schema.ts, verify custom richText field names (subTitle, helperText) are preserved

### T040-T041: Update Block Package Schema Exports
- [ ] T040 [US2] In packages/sanity-blocks/src/schemas.ts, add imports for all 4 new block schemas
- [ ] T041 [US2] In packages/sanity-blocks/src/schemas.ts, update allBlockSchemas array to include all 6 blocks (hero, cta, faqAccordion, featureCardsIcon, imageLinkCards, subscribeNewsletter)
- [ ] T042 [US2] Run `pnpm --filter @walter/sanity-blocks check-types` to verify all block schema exports resolve

**Phase 3 Verification** (US2 Partial - Schemas Only):
- [ ] T043 [US2] Import all 6 block schemas from `@walter/sanity-blocks/schemas` in a test file and verify TypeScript resolves types
- [ ] T044 [US2] Run `pnpm check-types` at workspace root to verify cross-package imports work

**Parallel Execution** (Phase 3):
- Tasks T023, T026, T031, T036 can run in parallel (different files, no interdependencies)

---

## Phase 4: User Story 3 - Create GROQ Query Fragments (P3)

**Story Goal**: Create GROQ query fragments for all migrated blocks so frontend developers can fetch complete block data without writing custom queries.

**Why P3**: Fragments enable efficient data fetching but aren't required for Studio functionality. Can be added after schemas are working.

**Independent Test Criteria**:
- ✅ Import `allBlockFragments` from `@walter/sanity-blocks/fragments`
- ✅ Use in GROQ query to fetch page content
- ✅ Verify response includes complete data for all block types with no missing fields

**Tasks**:

### T045-T048: Create Block GROQ Fragments
- [ ] T045 [P] [US3] Create packages/sanity-blocks/src/faqAccordion.fragment.ts with GROQ fragment (see contracts/blocks.groq)
- [ ] T046 [P] [US3] Create packages/sanity-blocks/src/featureCardsIcon.fragment.ts with GROQ fragment (see contracts/blocks.groq)
- [ ] T047 [P] [US3] Create packages/sanity-blocks/src/imageLinkCards.fragment.ts with GROQ fragment (see contracts/blocks.groq)
- [ ] T048 [P] [US3] Create packages/sanity-blocks/src/subscribeNewsletter.fragment.ts with GROQ fragment (see contracts/blocks.groq)

### T049-T050: Update Block Package Fragment Exports
- [ ] T049 [US3] In packages/sanity-blocks/src/fragments.ts, add imports for all 4 new block fragments
- [ ] T050 [US3] In packages/sanity-blocks/src/fragments.ts, update allBlockFragments array to include all 6 block fragments
- [ ] T051 [US3] Run `pnpm --filter @walter/sanity-blocks check-types` to verify fragment exports resolve

**Phase 4 Verification** (US3 Independent Test):
- [ ] T052 [US3] Import `allBlockFragments` from `@walter/sanity-blocks/fragments` and verify all 6 fragments are accessible
- [ ] T053 [US3] Manually test GROQ query in Sanity Vision tab using pageBuilderFragment to verify complete data fetching

**Parallel Execution** (Phase 4):
- Tasks T045, T046, T047, T048 can all run in parallel (different files, no interdependencies)

---

## Phase 5: User Story 4 - Update Template-Studio & Clean Up (P4)

**Story Goal**: Update template-studio to import all migrated schemas from packages and remove duplicate local files to establish single source of truth.

**Why P4**: Clean-up ensures migration is complete and prevents confusion. System can function with duplicates temporarily during migration.

**Independent Test Criteria**:
- ✅ Run `pnpm --filter template-studio type` and `pnpm --filter template-studio build` - both succeed
- ✅ Search codebase for duplicate schema definitions - confirm none exist
- ✅ Studio dev server starts without errors, all blocks appear in UI

**Tasks**:

### T054-T056: Update Template-Studio Imports
- [ ] T054 [P] [US4] In apps/template-studio/schemaTypes/definitions/index.ts, replace local imports with `buttonSchema` and `customUrlSchema` from `@walter/sanity-atoms/schemas`
- [ ] T055 [P] [US4] In apps/template-studio/schemaTypes/blocks/index.ts, replace local block imports with all 6 schemas from `@walter/sanity-blocks/schemas`
- [ ] T056 [US4] Run `pnpm --filter template-studio check-types` to verify imports resolve correctly

### T057: Verify Studio Build Before Deletion
- [ ] T057 [US4] Run `pnpm --filter template-studio build` to verify Studio builds successfully with package imports

### T058-T063: Delete Duplicate Schema Files
- [ ] T058 [P] [US4] Delete apps/template-studio/schemaTypes/definitions/button.ts
- [ ] T059 [P] [US4] Delete apps/template-studio/schemaTypes/definitions/custom-url.ts
- [ ] T060 [P] [US4] Delete apps/template-studio/schemaTypes/blocks/faq-accordion.ts
- [ ] T061 [P] [US4] Delete apps/template-studio/schemaTypes/blocks/feature-cards-icon.ts
- [ ] T062 [P] [US4] Delete apps/template-studio/schemaTypes/blocks/image-link-cards.ts
- [ ] T063 [P] [US4] Delete apps/template-studio/schemaTypes/blocks/subscribe-newsletter.ts

### T064-T068: Final Verification
- [ ] T064 [US4] Search codebase for duplicate schema definitions using `rg "name: \"button\"|name: \"customUrl\"|name: \"faqAccordion\"|name: \"featureCardsIcon\"|name: \"imageLinkCards\"|name: \"subscribeNewsletter\"" apps/template-studio/schemaTypes` - should return 0 results
- [ ] T065 [US4] Run `pnpm check-types` at workspace root to verify all type checking passes
- [ ] T066 [US4] Run `pnpm build` at workspace root to verify all builds succeed
- [ ] T067 [US4] Run `pnpm --filter template-studio dev` and verify Studio starts without errors
- [ ] T068 [US4] Manually verify all 6 blocks (hero, CTA, FAQ, feature cards, image cards, newsletter) appear in pageBuilder block menu in Studio UI

**Phase 5 Verification** (US4 Independent Test - Final Acceptance):
- ✅ Type checking passes (`pnpm check-types`)
- ✅ Builds succeed (`pnpm build`)
- ✅ No duplicate schema definitions found
- ✅ Studio starts and displays all blocks correctly

**Parallel Execution** (Phase 5):
- Tasks T054, T055 can run in parallel (different files)
- Tasks T058-T063 can ALL run in parallel (different files, simple deletions)

---

## Phase 6: Polish & Documentation

**Goal**: Final cleanup, regenerate types, and ensure documentation is complete

**Tasks**:

### T069-T072: Type Generation & Documentation
- [ ] T069 [P] Run `pnpm --filter template-studio type` to regenerate Sanity types with all migrated schemas
- [ ] T070 [P] Verify quickstart.md reflects actual implementation (no updates needed - was used as guide)
- [ ] T071 [P] Verify data-model.md reflects final implementation (no updates needed)
- [ ] T072 Run final smoke test: Start Studio, create test page, add all 6 block types, verify preview and save functionality
- [ ] T073 Review inlined utility code (isValidUrl, capitalize) for correctness and consider extracting to shared package if 3+ schemas use the same logic

**Phase 6 Verification**:
- ✅ Auto-generated types include all migrated schemas
- ✅ Documentation accurately reflects implementation
- ✅ End-to-end Studio workflow functions correctly

**Parallel Execution** (Phase 6):
- Tasks T069, T070, T071 can all run in parallel (independent verification tasks)

---

## Dependency Graph

```
Phase 1 (Setup)
├── T001-T005 (verify environment)
│
└──> Phase 2 (User Story 1 - Atoms) - BLOCKS Phase 3
     ├── T006-T011 (customUrl atom)
     ├── T012-T017 (button atom - DEPENDS ON customUrl)
     ├── T018-T020 (atom package exports)
     └── T021-T022 (verification)
     │
     └──> Phase 3 (User Story 2 - Blocks) - REQUIRES Atoms Complete
          ├── T023-T025 (faqAccordion) [P]
          ├── T026-T030 (featureCardsIcon) [P]
          ├── T031-T035 (imageLinkCards) [P]
          ├── T036-T039 (subscribeNewsletter) [P]
          ├── T040-T042 (block package exports)
          └── T043-T044 (verification)
          │
          └──> Phase 4 (User Story 3 - Fragments) - OPTIONAL but recommended
               ├── T045-T048 (block fragments) [ALL P]
               ├── T049-T051 (fragment exports)
               └── T052-T053 (verification)
               │
               └──> Phase 5 (User Story 4 - Cleanup) - REQUIRES All Schemas Complete
                    ├── T054-T056 (update imports) [P]
                    ├── T057 (verify build)
                    ├── T058-T063 (delete duplicates) [ALL P]
                    └── T064-T068 (final verification)
                    │
                    └──> Phase 6 (Polish) - FINAL PHASE
                         └── T069-T072 (type generation, docs, smoke test)
```

**Key Dependencies**:
- **Phase 2 → Phase 3**: Atoms MUST be complete before blocks (blocks import atoms)
- **Phase 3 → Phase 4**: Block schemas MUST exist before fragments (fragments reference schemas)
- **Phase 3 → Phase 5**: Blocks MUST be migrated before cleanup (Studio needs package imports working)
- **Phase 5 → Phase 6**: Cleanup MUST be complete before final type generation

**No Dependencies** (Can be done independently):
- Phases 1, 2, 3, 4, 5, 6 are SEQUENTIAL (must follow order)
- Within each phase: tasks marked [P] can run in parallel

---

## Parallel Execution Examples

### Within Phase 2 (Atoms):
```bash
# Step 1: Create both schema files in parallel
parallel <<EOF
# Terminal 1: Create customUrl schema
[T006] Create packages/sanity-atoms/src/customUrl.schema.ts

# Terminal 2: Create customUrl fragment
[T010] Create packages/sanity-atoms/src/customUrl.fragment.ts
EOF

# Step 2: After customUrl is complete, create button files in parallel
parallel <<EOF
# Terminal 1: Create button schema
[T012] Create packages/sanity-atoms/src/button.schema.ts

# Terminal 2: Create button fragment
[T016] Create packages/sanity-atoms/src/button.fragment.ts
EOF
```

### Within Phase 3 (Blocks):
```bash
# All 4 block schemas can be created simultaneously
parallel <<EOF
[T023] Copy faqAccordion schema
[T026] Copy featureCardsIcon schema
[T031] Copy imageLinkCards schema
[T036] Copy subscribeNewsletter schema
EOF
```

### Within Phase 4 (Fragments):
```bash
# All 4 fragments can be created simultaneously
parallel <<EOF
[T045] Create faqAccordion fragment
[T046] Create featureCardsIcon fragment
[T047] Create imageLinkCards fragment
[T048] Create subscribeNewsletter fragment
EOF
```

### Within Phase 5 (Cleanup):
```bash
# Step 1: Update imports in parallel
parallel <<EOF
[T054] Update definitions/index.ts
[T055] Update blocks/index.ts
EOF

# Step 2: Delete all duplicate files in parallel (after build verification)
parallel <<EOF
[T058] Delete button.ts
[T059] Delete custom-url.ts
[T060] Delete faq-accordion.ts
[T061] Delete feature-cards-icon.ts
[T062] Delete image-link-cards.ts
[T063] Delete subscribe-newsletter.ts
EOF
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
**Recommended First Iteration**: Complete Phase 1, Phase 2, and Phase 3 only

This provides:
- ✅ All schemas migrated to packages
- ✅ Type-safe imports working
- ✅ Blocks available in Studio
- ⏸️ Fragments can be added later (Phase 4)
- ⏸️ Cleanup can be done after testing (Phase 5)

**Estimated MVP Time**: 1.5-2 hours

### Full Implementation
**All Phases**: Complete Phases 1-6

This provides:
- ✅ All schemas migrated
- ✅ All fragments created
- ✅ No duplicate files
- ✅ Complete documentation
- ✅ Full type generation

**Estimated Full Time**: 2.5-3 hours

### Incremental Delivery Milestones
1. **Milestone 1** (Phase 1-2): Atoms migrated, can be imported by external projects
2. **Milestone 2** (Phase 3): Blocks migrated, Studio has all 6 blocks available
3. **Milestone 3** (Phase 4): Fragments available, frontend can query complete data
4. **Milestone 4** (Phase 5): Cleanup complete, single source of truth established
5. **Milestone 5** (Phase 6): Polish complete, ready for production

---

## Success Metrics

### Per User Story

**US1 Success** (Atoms Migrated):
- ✅ SC-002: Type validation passes across all workspace packages
- ✅ SC-007: New projects can import and use atom schemas

**US2 Success** (Blocks Migrated):
- ✅ SC-001: Developers can import all 6 blocks from single package
- ✅ SC-003: Studio starts successfully with all blocks in menu
- ✅ SC-004: Build processes complete successfully

**US3 Success** (Fragments Created):
- ✅ SC-005: Content queries return complete data with no missing fields

**US4 Success** (Cleanup Complete):
- ✅ SC-006: Zero duplicate schema definitions found
- ✅ All acceptance criteria from spec.md met

### Overall Success
- ✅ All 68 tasks completed
- ✅ All 7 success criteria from spec.md met
- ✅ Independent test criteria for each user story verified
- ✅ No TypeScript errors across workspace
- ✅ No build errors across workspace
- ✅ Studio functions correctly with all migrated schemas

---

## Common Issues & Troubleshooting

### Issue: Type errors after creating schema files

**Symptom**: TypeScript reports "Cannot find module '@walter/sanity-atoms/schemas'"

**Solution**:
1. Verify schema.ts exports include the new schema
2. Run `pnpm install` to refresh workspace links
3. Restart TypeScript server in IDE

**Related Tasks**: T018, T040

---

### Issue: Studio fails to start after import updates

**Symptom**: `pnpm --filter template-studio dev` fails with schema not found

**Solution**:
1. Verify schema names match between export and import
2. Check schema.ts includes schema in `allBlockSchemas` array
3. Verify package.json has workspace dependency

**Related Tasks**: T054-T055, T057

---

### Issue: Blocks don't appear in Studio UI

**Symptom**: All 6 blocks don't show in pageBuilder block menu

**Solution**:
1. Check pagebuilder.ts definition includes all block types
2. Verify schemaTypes/index.ts imports and exports all schemas
3. Clear Studio cache: delete `.sanity` folder and restart

**Related Tasks**: T068

---

### Issue: Fragment returns undefined fields

**Symptom**: GROQ query returns incomplete data for nested fields

**Solution**:
1. Verify fragment imports atom fragments (buttons, customUrl, richText)
2. Check fragment syntax matches schema field names exactly
3. Test fragment in Sanity Vision tab to isolate issue

**Related Tasks**: T045-T048, T053

---

## Notes

- All file paths are absolute from repository root
- Tasks marked [P] can be parallelized with other [P] tasks in same phase
- Each phase must complete before next phase begins (sequential phases)
- Verification tasks (type checking, builds) should not be skipped
- Follow quickstart.md for detailed implementation guidance per task
- Refer to contracts/ directory for exact GROQ fragment syntax
- Refer to data-model.md for entity definitions and validation rules
