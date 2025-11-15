# TODO
- [ ] Reconfigure tsconfig for the entire code base (add build steps, tsconfig.build.json, tsconfig.lint.json if necessary) Try barrel export again to see if it would work
- [ ] Extract logger to package
- [ ] Extract remaining queries in query.ts to package
- [ ] Create factory methods for i18n-config creation to be reused in other projects
- [ ] Find any other potentially reusable code that should be extracted to common packages
- [ ] Configure vitest + playwright for automated test runners

# 008-multi-tenant-template

## Phase 6: User Story 5 - Developer Manages I18n Configuration (Priority: P2)

**Goal**: Document i18n configuration package for future refactoring (no changes in Phase 1)

**Why Deferred**: I18n config refactoring is deferred to Phase 3 of overall project (per plan.md out-of-scope OS-003). This user story validates existing i18n functionality remains intact.

**Independent Test**: Verify existing i18n-config package unchanged and template apps continue to use i18n configuration without errors

### Validation for User Story 5

- [ ] T055 [US5] Verify packages/i18n-config/ package unchanged (no files modified)
- [ ] T056 [US5] Verify template apps still import from i18n-config successfully
- [ ] T057 [US5] Document i18n-config package for future Phase 3 refactoring in packages/i18n-config/README.md (if not exists)

**Checkpoint**: I18n functionality preserved - no disruption to multi-language content

---

# 009-complete-schema-migration

---

# 010-migrate-web-fragments

## Snapshot Testing for Query Fragment Migration (Priority: P2)

**Goal**: Implement automated snapshot testing to verify query result equivalence for fragment migrations

**Why Deferred**: Early development phase with no production data at risk. Limited time for current migration. Manual QA and TypeScript compilation provide sufficient confidence for now. Can be added retroactively if issues arise.

**Independent Test**: Create Vitest snapshots for all GROQ queries to verify future fragment changes don't alter query results

**Recommended Approach**: Use simple Vitest snapshot tests (not full Jest setup) or manual JSON comparison script

### Validation for Snapshot Testing

- [ ] Create baseline snapshots for all queries (queryHomePageData, querySlugPageData, queryBlogIndexPageData, queryBlogSlugPageData, queryNavbarData, queryFooterData, querySettingsData, queryAllLocalizedPages)
- [ ] Set up Vitest in template-web workspace (if not already configured)
- [ ] Create `apps/template-web/tests/query-snapshots.test.ts` with snapshot tests
- [ ] Run snapshots on every PR to catch unintended query changes
- [ ] Document snapshot testing workflow in template-web README

**Alternative (Lightweight)**: Manual JSON comparison script (see 010-migrate-web-fragments/research.md "Technology Recommendations" section for Option B implementation)

**Checkpoint**: Query result equivalence verified programmatically - prevents regressions in future fragment refactors

**Related**: 010-migrate-web-fragments/research.md, 010-migrate-web-fragments/quickstart.md Phase 6
