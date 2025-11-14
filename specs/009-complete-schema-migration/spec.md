3 Feature Specification: Complete Schema Migration to Monorepo Packages

**Feature Branch**: `009-complete-schema-migration`  
**Created**: 2025-11-14  
**Status**: Draft  
**Input**: User description: "We just did a major restructure of the code base, now we need to migrate the rest of the blocks and atoms (definitions) schema types from template-studio over to the new monorepo packages/sanity-atoms and /packages/sanity-blocks"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Migrate Atom Definitions (Priority: P1)

As a developer working on the monorepo, I need all reusable atom definitions (button, customUrl) moved to the `packages/sanity-atoms` package so that new Sanity projects can import these fundamental building blocks without duplicating code.

**Why this priority**: Atoms are the foundational building blocks referenced by all blocks. They must be migrated first to avoid circular dependencies and ensure blocks can properly reference them.

**Independent Test**: Create a new Sanity project, add `@walter/sanity-atoms` as a dependency, import and use the `button` and `customUrl` schemas, and verify they work in the Sanity Studio interface.

**Acceptance Scenarios**:

1. **Given** template-studio has `button.ts` and `custom-url.ts` definitions, **When** migration completes, **Then** both schemas exist in `packages/sanity-atoms/src/` with `.schema.ts` suffix and matching fragments in `.fragment.ts` files
2. **Given** atoms are migrated to the package, **When** template-studio imports them from `@walter/sanity-atoms/schemas`, **Then** all blocks and documents using these atoms continue to function without errors
3. **Given** button and customUrl schemas are in the shared package, **When** a developer runs type checking, **Then** all TypeScript types resolve correctly across workspace boundaries
4. **Given** atom schemas include helper utilities (like `createRadioListLayout`), **When** migrating to the package, **Then** these utilities are either included in the package or removed if specific to template-studio

---

### User Story 2 - Migrate Remaining Page Builder Blocks (Priority: P2)

As a content editor, I need all page builder blocks (FAQ accordion, feature cards, image link cards, subscribe newsletter) migrated to the shared package so that new Sanity projects have access to the same proven block library.

**Why this priority**: After atoms are migrated (P1), blocks can safely reference them. This priority ensures the block migration happens in the correct dependency order.

**Independent Test**: Open template-studio, navigate to a page with pageBuilder field, verify all blocks (hero, CTA, FAQ, feature cards, image cards, newsletter) appear in the block menu and can be added/edited/previewed without errors.

**Acceptance Scenarios**:

1. **Given** template-studio has 4 unmigrated blocks (faqAccordion, featureCardsIcon, imageLinkCards, subscribeNewsletter), **When** migration completes, **Then** all 4 blocks exist in `packages/sanity-blocks/src/` with both `.schema.ts` and `.fragment.ts` files
2. **Given** blocks reference atoms like `customUrl` and `button`, **When** blocks are migrated, **Then** they import atom definitions from `@walter/sanity-atoms/schemas` instead of local paths
3. **Given** blocks use shared utilities like `iconField` from `common.ts`, **When** migration completes, **Then** either these utilities are extracted to a shared package or blocks use inline definitions
4. **Given** faqAccordion.schema.ts exists but is empty in the package, **When** migration completes, **Then** it contains the complete schema from template-studio with all fields and validation rules
5. **Given** all blocks are migrated, **When** template-studio imports blocks from `@walter/sanity-blocks/schemas`, **Then** pageBuilder array displays all 6 blocks (hero, CTA, FAQ, features, image cards, newsletter)

---

### User Story 3 - Create GROQ Query Fragments for New Blocks (Priority: P3)

As a frontend developer, I need GROQ query fragments for all migrated blocks so that I can fetch complete block data from Sanity without writing custom queries for each block type.

**Why this priority**: Fragments enable efficient data fetching but aren't required for Studio functionality. They can be added after schemas are working.

**Independent Test**: Import `allBlockFragments` from `@walter/sanity-blocks/fragments`, use it in a GROQ query to fetch page content, and verify the response includes complete data for all block types with no missing fields.

**Acceptance Scenarios**:

1. **Given** blocks are migrated to the package, **When** fragment files are created, **Then** each block has a corresponding `.fragment.ts` file exporting a GROQ fragment string
2. **Given** fragments reference atom fragments (like `buttonsFragment`), **When** block fragments are written, **Then** they import and compose atom fragments from `@walter/sanity-atoms/fragments`
3. **Given** all block fragments exist, **When** `fragments.ts` aggregates them, **Then** it exports `allBlockFragments` array containing all block fragment strings
4. **Given** a GROQ query uses block fragments, **When** data is fetched from Sanity, **Then** nested fields (buttons, customUrl, rich text) are fully populated with no undefined values

---

### User Story 4 - Update Template-Studio Imports and Clean Up Duplicates (Priority: P4)

As a developer maintaining code quality, I need template-studio to import all migrated schemas from packages and have duplicate local files removed so that there is a single source of truth and no confusion about which schema is active.

**Why this priority**: Clean-up ensures the migration is complete and prevents future confusion, but the system can function with duplicates temporarily during migration.

**Independent Test**: Run `pnpm --filter template-studio type` and `pnpm --filter template-studio build`, verify both succeed, then search codebase for duplicate schema definitions and confirm none exist.

**Acceptance Scenarios**:

1. **Given** schemas are migrated to packages, **When** template-studio/schemaTypes/definitions/index.ts is updated, **Then** it imports `button` and `customUrl` from `@walter/sanity-atoms/schemas` instead of local files
2. **Given** schemas are migrated to packages, **When** template-studio/schemaTypes/blocks/index.ts is updated, **Then** it imports all 6 blocks from `@walter/sanity-blocks/schemas`
3. **Given** imports are updated, **When** local duplicate files are deleted, **Then** the following files are removed: `definitions/button.ts`, `definitions/custom-url.ts`, `blocks/faq-accordion.ts`, `blocks/feature-cards-icon.ts`, `blocks/image-link-cards.ts`, `blocks/subscribe-newsletter.ts`
4. **Given** duplicate files are removed, **When** `pnpm check-types` runs at workspace root, **Then** all type checking passes with no errors
5. **Given** migration is complete, **When** developer runs `pnpm --filter template-studio dev`, **Then** Sanity Studio starts without errors and all blocks appear correctly in the UI

---

### Edge Cases

- **What happens when blocks reference template-studio specific utilities** (e.g., `iconField`, `buttonsField` from `common.ts`)?  
  *These fields either need to be: (a) extracted to sanity-atoms package if truly reusable, (b) duplicated in both locations if Studio-specific, or (c) converted to inline definitions within blocks to eliminate the dependency.*

- **What happens when a block uses `customRichText` helper function** that exists in template-studio's `rich-text.ts`?  
  *The `customRichText` helper should be exported from `packages/sanity-atoms/src/richText.schema.ts` to make it available to blocks that need customizable rich text fields.*

- **What happens when `pagebuilder.ts` dynamically builds the block array** from `pageBuilderBlocks` import?  
  *The pagebuilder definition may need to remain in template-studio since it references the local block registry, or it could be refactored to accept blocks as a parameter.*

- **How does the system handle blocks that import from relative paths** like `../common` or `../definitions/rich-text`?  
  *All relative imports to local template-studio files must be replaced with package imports (e.g., `@walter/sanity-atoms/schemas`) or made workspace-local if the dependency is Studio-specific.*

- **What happens when a GROQ fragment references fields that don't exist** in the corresponding schema?  
  *Fragment validation should be added (via TypeScript types or runtime checks) to ensure fragments only query fields defined in their schemas, preventing query errors.*

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create schema files for `button` and `customUrl` in `packages/sanity-atoms/src/` with `.schema.ts` naming convention
- **FR-002**: System MUST create fragment files for `button` and `customUrl` in `packages/sanity-atoms/src/` with `.fragment.ts` naming convention containing GROQ query fragments
- **FR-003**: System MUST create complete schema file for `faqAccordion` in `packages/sanity-blocks/src/faqAccordion.schema.ts` (currently empty)
- **FR-004**: System MUST create schema files for `featureCardsIcon`, `imageLinkCards`, and `subscribeNewsletter` in `packages/sanity-blocks/src/` with `.schema.ts` suffix
- **FR-005**: System MUST create corresponding fragment files for all block schemas in `packages/sanity-blocks/src/` with `.fragment.ts` suffix
- **FR-006**: System MUST update `packages/sanity-atoms/src/schemas.ts` to export all atom schemas including `button` and `customUrl`
- **FR-007**: System MUST update `packages/sanity-atoms/src/fragments.ts` to export all atom fragments including `buttonFragment` and `customUrlFragment`
- **FR-008**: System MUST update `packages/sanity-blocks/src/schemas.ts` to export all block schemas and maintain the `allBlockSchemas` array
- **FR-009**: System MUST update `packages/sanity-blocks/src/fragments.ts` to export all block fragments and maintain the `allBlockFragments` array
- **FR-010**: System MUST update template-studio imports to use `@walter/sanity-atoms/schemas` and `@walter/sanity-blocks/schemas` instead of local file paths
- **FR-011**: System MUST delete duplicate schema files from template-studio after imports are verified working
- **FR-012**: Block schemas MUST import atom dependencies from `@walter/sanity-atoms/schemas` instead of relative template-studio paths
- **FR-013**: Block fragments MUST import and compose atom fragments from `@walter/sanity-atoms/fragments` for nested fields
- **FR-014**: System MUST export the `customRichText` helper function from `packages/sanity-atoms/src/richText.schema.ts` for use by blocks
- **FR-015**: System MUST handle template-studio specific utilities (`iconField`, helper functions) by either extracting to packages or keeping Studio-local

### Key Entities *(include if feature involves data)*

- **Atom Schema**: Reusable Sanity schema definitions for primitive types (button, customUrl). Attributes: name, type, fields, validation, preview logic
- **Block Schema**: Reusable Sanity schema definitions for page builder content blocks (heroSection, cta, faqAccordion, etc.). Attributes: name, type, icon, fields, preview logic, validation rules
- **GROQ Fragment**: String template for querying Sanity content. Attributes: fragment name, queried fields, composed fragments (for nested data)
- **Package Export Index**: Aggregated export file (`schemas.ts`, `fragments.ts`). Attributes: exported items array, convenience exports (allBlockSchemas, allBlockFragments)
- **Schema Dependency**: Relationship between schemas where one references another. Examples: blocks reference atoms, fragments compose other fragments

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can import all 6 page builder block schemas from a single package import in under 5 seconds of discovery time
- **SC-002**: Type validation passes across all workspace packages with zero errors after migration completes
- **SC-003**: Template-studio development server starts successfully with all blocks appearing in the pageBuilder block menu
- **SC-004**: Build processes complete successfully for both template-studio and root workspace with no schema-related errors
- **SC-005**: Content queries using block fragments return complete data for all 6 block types with no missing or undefined nested fields
- **SC-006**: Search for duplicate schema definitions (same schema name in both packages and template-studio) returns zero results after cleanup phase
- **SC-007**: New projects can add atom and block packages as dependencies and immediately use all schemas without additional configuration

## Assumptions *(optional)*

- Template-studio has no uncommitted changes that would conflict with file deletions
- The existing `richText` schema in `packages/sanity-atoms/src/richText.schema.ts` is functionally identical to template-studio's version
- GROQ fragments will follow the same naming convention as schemas (e.g., `faqAccordion` schema → `faqAccordionFragment`)
- The monorepo uses pnpm workspaces with proper workspace protocol dependencies
- TypeScript compilation is configured to resolve workspace dependencies correctly
- Sanity Studio has `sanity-plugin-icon-picker` available globally (used by feature-cards-icon block)
- Frontend consuming these fragments expects nested atom data (buttons, customUrl) to be fully expanded in query results

## Dependencies *(optional)*

- **Workspace Protocol**: Packages must use workspace protocol for internal dependencies (e.g., `"@walter/sanity-atoms": "workspace:*"`)
- **Previous Migration**: Completion of T001-T054 (spec 008) which migrated hero and CTA blocks and established the package structure
- **Sanity Plugins**: `sanity-plugin-icon-picker` must remain available for blocks using iconField
- **TypeScript Configuration**: Workspace TypeScript config must support cross-package type resolution
- **Build Tools**: Turbo configuration must properly handle package dependencies during builds

## Out of Scope *(optional)*

- Migrating document schemas (page, blog, author, etc.) - these remain template-specific
- Migrating template-studio specific utilities (`common.ts`, slug validation, helpers)
- Creating React components to render blocks on the frontend
- Migrating the `pageBuilder` definition itself (may need to stay template-local)
- Adding new blocks or modifying existing block functionality
- Performance optimization of GROQ queries
- Adding additional validation rules beyond what currently exists
- Internationalization (i18n) configuration for blocks
- Setting up automated testing for schema validation
