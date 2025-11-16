# TODO
- [x] Reconfigure tsconfig for the entire code base (add build steps, tsconfig.build.json, tsconfig.lint.json if necessary) Try barrel export again to see if it would work - DOES NOT WORK
- [x] Extract logger to package
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
