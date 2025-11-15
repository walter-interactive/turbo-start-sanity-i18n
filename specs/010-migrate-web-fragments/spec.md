# Feature Specification: Migrate Web Query Fragments to Shared Packages

**Feature Branch**: `010-migrate-web-fragments`
**Created**: 2025-11-14
**Status**: Draft
**Input**: User description: "We are currently in the process of migrating the locally defined schemas and query fragments from inside /apps/template-studio and /apps/template-web into shared /packages/sanity-block and /packages/sanity-atoms for this multi-tenant monorepo sanity nextjs repository. Previously we've already extracted all the reusable schemas from /apps/template-studio into the shared packages. Now we need to do the same and extract all the reusable query fragments from /apps/template-web into the shared packages as well so that they are co-located with their correct module for better developer experience and efficiency. We'll also need to ensure that we do not alter any existing functionalities, this spec is just purely code organization only."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Adds New Block with Co-located Fragment (Priority: P1)

A developer needs to create a new content block for the CMS. They should find both the schema definition and its corresponding query fragment in the same location within the shared packages, reducing search time and preventing inconsistencies.

**Why this priority**: This is the primary value proposition of the migration - improving developer experience by co-locating related code. Without this, the migration provides no tangible benefit.

**Independent Test**: Can be fully tested by creating a new block (e.g., "testimonialGrid") by adding both schema and fragment files to the appropriate shared package directory, then verifying the block works end-to-end in both Studio and Web without needing to touch multiple workspace directories.

**Acceptance Scenarios**:

1. **Given** a developer creates a new block schema in `/packages/sanity-blocks/src/testimonial-grid/`, **When** they also create the fragment file in the same directory, **Then** both files export correctly and can be imported by template-studio and template-web
2. **Given** all fragments are migrated to shared packages, **When** a developer searches for "hero-section", **Then** they find the schema, fragment, and component files through clear directory navigation (blocks in sanity-blocks, atoms in sanity-atoms)
3. **Given** fragment files are co-located with schemas, **When** a developer updates a block's data structure, **Then** they can update both schema and fragment in the same directory without switching between workspaces

---

### User Story 2 - Maintain Identical Query Results After Migration (Priority: P1)

After migrating query fragments to shared packages, all existing pages and content must render identically to before the migration. No data should be lost, no fields should be missing, and performance characteristics should remain unchanged.

**Why this priority**: This is a code organization refactor with zero tolerance for functional changes. Any deviation breaks the "purely code organization" constraint and could cause production issues.

**Independent Test**: Can be fully tested by comparing query results before and after migration using automated snapshot testing - capture GROQ query outputs for all page types, run migration, re-run queries, verify byte-for-byte identical results.

**Acceptance Scenarios**:

1. **Given** the system is currently using local fragments in template-web, **When** queries are executed for all document types (pages, blog posts, settings, navbar, footer), **Then** capture baseline JSON snapshots of results
2. **Given** fragments have been migrated to shared packages, **When** the same queries are re-executed, **Then** results match baseline snapshots exactly (no missing fields, no extra fields, same data types)
3. **Given** the migration is complete, **When** rendering any page in the web application, **Then** visual output is pixel-perfect identical to pre-migration state
4. **Given** blocks with existing fragment duplicates (imageLinkCardsBlock, subscribeNewsletterBlock, featureCardsIconBlock), **When** migration reconciles these duplicates, **Then** chosen implementation produces identical query results as the current template-web version

---

### User Story 3 - Eliminate Fragment Duplication (Priority: P2)

Currently, several fragments exist in both template-web and shared packages with different implementations. Developers should have a single source of truth for each fragment to prevent divergence and maintenance burden.

**Why this priority**: While important for long-term maintainability, the system currently works with duplicates. Resolving this is cleanup work that doesn't block the primary co-location goal.

**Independent Test**: Can be fully tested by searching the entire codebase for fragment definitions (e.g., `imageFragment =`), verifying only one definition exists per fragment, and confirming all imports reference the shared package version.

**Acceptance Scenarios**:

1. **Given** `imageFragment` is defined in both sanity-atoms and template-web, **When** migration is complete, **Then** only the sanity-atoms version exists and template-web imports from the shared package
2. **Given** `customLinkFragment` and `markDefsFragment` are hidden inside `rich-text.fragment.ts`, **When** migration exposes these as public exports, **Then** template-web removes its local duplicates and imports from sanity-atoms
3. **Given** three block fragments have duplicates with different implementations, **When** migration reconciles them, **Then** a single authoritative version exists in sanity-blocks with documented reasoning for the chosen approach

---

### User Story 4 - Standardize Fragment Export Patterns (Priority: P3)

All shared packages should follow consistent export conventions for fragments, making them discoverable and easy to import. Developers should not need to guess which fragments are available or how to import them.

**Why this priority**: This is a nice-to-have improvement for developer experience but not critical for the migration's core goal. The system can function with inconsistent exports.

**Independent Test**: Can be fully tested by reviewing all index.ts barrel exports in sanity-blocks and sanity-atoms, verifying they export all fragment files, and confirming documentation lists all available fragments.

**Acceptance Scenarios**:

1. **Given** shared packages export fragments, **When** a developer imports from `@workspace/sanity-blocks`, **Then** they can access all block fragments through named imports (e.g., `import { heroSectionFragment, ctaFragment } from '@workspace/sanity-blocks'`)
2. **Given** sanity-atoms contains atomic fragments, **When** a developer imports from `@workspace/sanity-atoms`, **Then** they can access all atom fragments including previously hidden ones (customLinkFragment, markDefsFragment, imageFragment)
3. **Given** all fragments follow naming conventions, **When** a developer reviews the codebase, **Then** fragment names clearly indicate their purpose and match their schema names (e.g., `heroSectionSchema` → `heroSectionFragment`)

---

### Edge Cases

- What happens when a fragment in template-web uses a different GROQ projection strategy (spread `...` vs explicit fields) than the shared package version?
  - **Resolution**: Document both approaches, choose the one that matches current template-web behavior to maintain identical query results, and standardize future fragments.

- How does the system handle fragments that reference other fragments (composition/dependencies)?
  - **Resolution**: Migration maintains existing import chains - if `pageBuilderFragment` imports `heroSectionFragment`, this pattern continues unchanged, just with updated import paths.

- What happens if a fragment is used in multiple locations with slight variations?
  - **Resolution**: Identify if variations are intentional or accidental. If intentional, create separate fragments with descriptive names (e.g., `imageFragmentCompact`, `imageFragmentFull`). If accidental, standardize on one version.

- How does the system handle fragments that are only used in template-web and not truly reusable?
  - **Resolution**: Fragments specific to template-web stay in template-web. Only migrate fragments that are schema-coupled (blocks/atoms) or genuinely reusable across tenants.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST co-locate query fragments with their corresponding schemas in shared packages (blocks in sanity-blocks, atoms in sanity-atoms)
- **FR-002**: System MUST maintain identical query results before and after migration (verified through manual QA and TypeScript compilation)
- **FR-003**: System MUST eliminate all fragment duplicates by establishing a single source of truth in shared packages
- **FR-004**: System MUST export previously hidden fragments (customLinkFragment, markDefsFragment) as public API from sanity-atoms
- **FR-005**: System MUST update all import statements in template-web to reference shared package fragments instead of local definitions
- **FR-006**: System MUST preserve existing fragment composition patterns (fragments importing other fragments)
- **FR-007**: System MUST maintain type safety throughout migration (TypeScript compilation must succeed without errors)
- **FR-008**: System MUST reconcile conflicting implementations for duplicate fragments (imageLinkCardsBlock, subscribeNewsletterBlock, featureCardsIconBlock) by choosing the approach that matches current template-web behavior
- **FR-009**: System MUST document migration decisions, especially for fragment duplicates and implementation choices
- **FR-010**: System MUST follow established naming conventions for fragment files (e.g., `hero-section.fragment.ts`, exported as `heroSectionFragment`)

### Key Entities

- **Query Fragment**: A reusable GROQ query snippet that defines how to fetch data for a specific schema type. Contains field selections, nested projections, and data transformations. Lives alongside its schema definition.
- **Block Fragment**: Fragment for page builder blocks (complex content sections like hero, CTA, FAQ). Located in `/packages/sanity-blocks/src/[block-name]/[block-name].fragment.ts`
- **Atom Fragment**: Fragment for atomic/primitive content types (images, links, buttons, rich text). Located in `/packages/sanity-atoms/src/[atom-name].fragment.ts`
- **Fragment Composition**: Pattern where fragments import and embed other fragments (e.g., `pageBuilderFragment` includes all block fragments)
- **Duplicate Fragment**: Fragment defined in multiple locations with potentially different implementations, requiring reconciliation during migration

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can locate both schema and fragment for any block/atom in under 30 seconds (measured by directory navigation depth - max 3 levels)
- **SC-002**: Zero query result deviations after migration (100% match rate on snapshot tests across all document types)
- **SC-003**: Fragment duplication reduced from 7 instances to 0 instances (verified by codebase search for fragment definitions)
- **SC-004**: Build and type-check processes complete successfully with zero errors after migration (pnpm check-types && pnpm build pass)
- **SC-005**: All web pages render identically before and after migration (verified through visual regression testing or manual QA checklist)
- **SC-006**: Fragment discoverability improves - all fragments exported through package index files and documented in package README (100% export coverage)

## Assumptions *(optional)*

- Template-web is the authoritative source for query behavior - when conflicts arise, template-web implementation takes precedence
- Existing fragment naming follows kebab-case for files and camelCase for exports (e.g., `hero-section.fragment.ts` → `heroSectionFragment`)
- TypeScript strict mode is enabled and must remain error-free throughout migration
- The migration will not change any schema definitions, only move fragment files
- All fragments in template-web that correspond to schemas in shared packages should be migrated (not just a subset)
- Visual regression testing may be manual if automated tooling is not available

## Scope Boundaries *(optional)*

### In Scope

- Moving fragment definitions from `/apps/template-web/src/lib/sanity/query.ts` to appropriate shared package locations
- Updating import statements in template-web to reference shared packages
- Resolving fragment duplicates between template-web and shared packages
- Exporting previously hidden fragments as public API
- Verifying query result equivalence through manual QA and TypeScript compilation (snapshot tests deferred to backlog)
- Documenting migration decisions and fragment usage patterns
- Standardizing fragment export patterns in shared package index files

### Out of Scope

- Modifying fragment logic or GROQ query structure (beyond resolving duplicates)
- Changing schema definitions or field structures
- Migrating template-studio code (schemas already migrated in previous work)
- Performance optimization of queries
- Adding new fragments or extending existing ones
- Changing component rendering logic in template-web
- Multi-tenant considerations (this is template-only organization work)
- Refactoring fragment composition patterns (maintain existing structure)

## Dependencies & Constraints *(optional)*

### Dependencies

- **Previous Migration**: Schemas were already migrated to shared packages in spec 007-colocate-pagebuilder-modules - this work builds on that foundation
- **Package Dependencies**: Both template-web and template-studio already depend on `@workspace/sanity-blocks` and `@workspace/sanity-atoms` in package.json
- **Type Generation**: After schema or fragment changes, `pnpm --filter studio type` must be run to regenerate TypeScript types
- **Build System**: Turborepo monorepo build system must successfully resolve cross-workspace imports

### Constraints

- **Zero Functional Changes**: This is purely a code organization refactor - no behavioral changes allowed
- **Backward Compatibility**: All existing queries must continue to work without modification
- **Type Safety**: TypeScript strict mode must pass at all times
- **Naming Conventions**: Must follow established patterns from spec 007 (schema.ts, fragment.ts files co-located)
- **Monorepo Best Practices**: No cross-workspace imports between apps (only apps → packages allowed)

## Open Questions *(optional)*

None - based on the exploration analysis, all technical details are clear. The migration path is straightforward: resolve duplicates, move files, update imports, verify results.
