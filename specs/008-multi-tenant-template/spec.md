# Feature Specification: Multi-Tenant Agency Template Architecture

**Feature Branch**: `008-multi-tenant-template`
**Created**: 2025-11-14
**Status**: Draft
**Input**: User description: "Multi-tenant agency template architecture with shared packages for blocks, documents, and i18n configuration - Phase 1: Foundation Setup including app renaming and sanity-blocks package reorganization"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Sets Up New Client Project (Priority: P1)

An agency developer needs to create a new client website project using the proven template architecture without copying/pasting code from previous client projects.

**Why this priority**: This is the core value proposition - enabling rapid client project scaffolding while maintaining consistency across all client sites. Without this, the entire multi-tenant architecture provides no practical benefit.

**Independent Test**: Can be fully tested by attempting to scaffold a new client project (`client-a-studio` and `client-a-web`) and verifying that all shared packages (`@walter/sanity-blocks`, `@walter/i18n-config`) are properly imported and functional without any code duplication from the template apps.

**Acceptance Scenarios**:

1. **Given** the monorepo contains template apps and shared packages, **When** a developer creates a new client project structure, **Then** the new project can import schemas from `@walter/sanity-blocks` and i18n configuration from `@walter/i18n-config` without copying any code
2. **Given** a new client project is created, **When** the developer adds a new page builder block, **Then** both the client project and template reference projects can use the same block schema from the shared package
3. **Given** shared packages are updated with bug fixes or new features, **When** the developer runs package updates, **Then** all client projects and template apps receive the updates automatically through dependency resolution

---

### User Story 2 - Developer Maintains Template Reference Apps (Priority: P2)

An agency developer needs to maintain and update the reference implementation (template apps) to test new features, patterns, and updates before rolling them out to client projects.

**Why this priority**: The template apps serve as the "source of truth" for best practices and tested patterns. They must remain clearly distinguished from real client projects to prevent confusion and accidental modifications to client work.

**Independent Test**: Can be fully tested by verifying that `apps/template-studio` and `apps/template-web` are clearly named, documented as reference implementations, and can be modified/tested without affecting any client projects.

**Acceptance Scenarios**:

1. **Given** the monorepo contains both template and client apps, **When** a developer browses the `apps/` directory, **Then** template apps are clearly identifiable by naming convention (`template-*` prefix)
2. **Given** a developer needs to test a new Sanity schema pattern, **When** they modify `apps/template-studio`, **Then** no client projects are affected until they explicitly update dependencies
3. **Given** template apps use shared packages, **When** the developer runs the template apps locally, **Then** they successfully import and use all shared block schemas, fragments, and i18n configuration

---

### User Story 3 - Developer Manages Shared Block Library (Priority: P1)

An agency developer needs to maintain a centralized library of page builder blocks (schemas + GROQ fragments) in a flat, simple directory structure that can be used across all client projects without duplication or complex path resolution.

**Why this priority**: Preventing code duplication is essential for maintainability. Having block schemas scattered across multiple projects leads to inconsistencies, bugs, and maintenance nightmares. A flat structure simplifies TypeScript configuration, import paths, and reduces cognitive overhead when locating files.

**Independent Test**: Can be fully tested by verifying that all page builder blocks (hero-section, cta, faq-accordion, feature-cards-icon, image-link-cards, subscribe-newsletter) exist as flat files in `packages/sanity-blocks/src/` directory (e.g., `heroSection.schema.ts`, `heroSection.fragment.ts`), and that these can be imported successfully in both template and client apps with simple import paths.

**Acceptance Scenarios**:

1. **Given** a page builder block exists in the shared package as flat files (e.g., `heroSection.schema.ts`), **When** a developer imports the schema in any Sanity Studio app, **Then** the block appears in the CMS page builder interface
2. **Given** a block's GROQ fragment is updated in the shared package, **When** a developer rebuilds the Next.js web app, **Then** all queries using that fragment retrieve the updated data structure
3. **Given** all six blocks are migrated to the shared package as flat files, **When** a developer imports `allBlockSchemas` from the convenience export, **Then** they receive an array containing all block schemas ready for Sanity Studio registration
4. **Given** the shared package provides convenience re-exports, **When** a developer imports from `@walter/sanity-blocks/schemas` or `@walter/sanity-blocks/fragments`, **Then** they can access all schemas or fragments from a single import without navigating nested directories
5. **Given** the flat file structure, **When** a developer needs to locate a block's schema file, **Then** they can find it in under 5 seconds by simply opening `packages/sanity-blocks/src/` and scanning flat file list

---

### User Story 4 - Developer Manages Shared Atomic Content Types (Priority: P1)

An agency developer needs to maintain a centralized library of reusable, atomic Sanity content types (buttons, images, rich-text, etc.) that are composed into larger blocks and documents, ensuring consistency across all projects.

**Why this priority**: Atomic content types are the fundamental building blocks used within page builder blocks and document schemas. Extracting them to a shared package prevents duplication and ensures consistent field definitions (e.g., all buttons have the same schema structure) across all client projects. This is foundational because blocks depend on these atoms.

**Independent Test**: Can be fully tested by verifying that all atomic content types currently in `packages/sanity/src/shared/` (buttons, image, rich-text) are migrated to `packages/sanity-atoms/src/` as flat files (e.g., `buttons.schema.ts`, `image.schema.ts`), and that page builder blocks in `@walter/sanity-blocks` successfully import and use these atoms without errors.

**Acceptance Scenarios**:

1. **Given** atomic content types exist in `@walter/sanity-atoms`, **When** a block schema imports an atom (e.g., `buttonsSchema`), **Then** the atom's field definitions are correctly embedded in the block's schema
2. **Given** an atomic type is updated in the shared package (e.g., adding a new button variant), **When** a developer rebuilds any app using that atom, **Then** all blocks and documents using the atom reflect the updated schema
3. **Given** the package provides convenience re-exports, **When** a developer imports from `@walter/sanity-atoms/schemas`, **Then** they can access all atomic schemas from a single import
4. **Given** blocks depend on atoms, **When** `@walter/sanity-blocks` package imports atoms from `@walter/sanity-atoms`, **Then** the dependency graph is correct (blocks → atoms, not vice versa)

---

### User Story 5 - Developer Manages I18n Configuration Across Projects (Priority: P2)

An agency developer needs to maintain consistent internationalization configuration (supported locales, locale metadata, routing logic) across multiple client projects that may support different language combinations.

**Why this priority**: While important for consistency, i18n configuration is more straightforward than block management and has less immediate impact on the multi-tenant architecture foundation. It's a quality-of-life improvement that prevents configuration drift.

**Independent Test**: Can be fully tested by verifying that `packages/i18n-config` exports locale types, metadata for all supported languages (fr, en, es, de, etc.), and a factory function that allows each project to configure its specific locale subset without duplicating the metadata definitions.

**Acceptance Scenarios**:

1. **Given** `@walter/i18n-config` contains metadata for 10+ locales, **When** a client project needs only English and French, **Then** the project can use `createI18nConfig(['en', 'fr'])` to generate the appropriate configuration
2. **Given** a new locale is added to the shared package metadata, **When** a client project imports the updated package, **Then** the new locale is available for configuration without any code changes in the client project
3. **Given** locale metadata includes display names, locale codes, and routing information, **When** a developer imports `ALL_LOCALE_METADATA`, **Then** they can access comprehensive metadata for all supported locales

---

### Edge Cases

- **What happens when a client project needs a custom block not in the shared package?** Client projects can define project-specific blocks locally while still using the shared package for common blocks.
- **What happens when a client project needs a custom atomic type variation?** Client projects can extend shared atoms locally or define custom atoms for project-specific needs while still using shared atoms for common cases.
- **What happens when breaking changes are made to shared packages (blocks or atoms)?** Standard semantic versioning practices apply - breaking changes require major version bumps and explicit opt-in from client projects through package.json updates.
- **What happens when two client projects need different versions of a shared block or atom?** Each client project pins its dependency version in package.json, allowing gradual migration to newer versions.
- **What happens when template apps and client apps diverge in their dependencies?** This is expected and acceptable - template apps serve as a testing ground for newer patterns while client apps maintain stability with pinned versions.
- **What happens when a developer accidentally modifies a client app thinking it's the template?** Clear naming conventions (`template-*` vs `client-*`) and documentation reduce this risk. Version control (git) allows reverting accidental changes.
- **What happens when an atom is updated and breaks existing blocks?** The dependency relationship (blocks import atoms) means atom changes can affect blocks. Developers must test blocks after atom updates. Semantic versioning prevents unintended breaking changes.

## Requirements *(mandatory)*

### Functional Requirements

#### Phase 1: App Renaming

- **FR-001**: System MUST rename `apps/studio/` directory to `apps/template-studio/`
- **FR-002**: System MUST rename `apps/web/` directory to `apps/template-web/`
- **FR-003**: System MUST update `apps/template-studio/package.json` name field to `"template-studio"` (or appropriate scoped name)
- **FR-004**: System MUST update `apps/template-web/package.json` name field to `"template-web"` (or appropriate scoped name)
- **FR-005**: System MUST update all import paths in both template apps that reference the old directory names
- **FR-006**: System MUST update `turbo.json` to reference the new app names in pipeline configurations
- **FR-007**: System MUST update any workspace references in root `package.json` to reflect new app names
- **FR-008**: System MUST update any documentation files that reference the old app names

#### Phase 1: Sanity Atoms Package Creation

- **FR-009**: System MUST create new `packages/sanity-atoms/` directory
- **FR-010**: System MUST create `packages/sanity-atoms/package.json` with name `"@walter/sanity-atoms"`
- **FR-011**: System MUST migrate atomic content types from `packages/sanity/src/shared/` to `packages/sanity-atoms/src/` as flat files
- **FR-012**: System MUST create `buttons.schema.ts` in `packages/sanity-atoms/src/` for button field definitions
- **FR-013**: System MUST create `image.schema.ts` in `packages/sanity-atoms/src/` for image field definitions
- **FR-014**: System MUST create `richText.schema.ts` in `packages/sanity-atoms/src/` for rich text field definitions
- **FR-015**: System MUST create `packages/sanity-atoms/src/schemas.ts` that re-exports all atomic schemas as named exports
- **FR-016**: Package MUST export schemas via `"./schemas"` export path pointing to `"./src/schemas.ts"`
- **FR-017**: System MUST create appropriate `tsconfig.json` for the atoms package
- **FR-018**: System MUST update `apps/template-studio/package.json` dependencies to reference `@walter/sanity-atoms`
- **FR-019**: System MUST update `apps/template-web/package.json` dependencies to reference `@walter/sanity-atoms` (if needed)

#### Phase 1: Sanity Blocks Package Reorganization

- **FR-020**: System MUST rename `packages/sanity/` directory to `packages/sanity-blocks/`
- **FR-021**: System MUST update `packages/sanity-blocks/package.json` name field to `"@walter/sanity-blocks"`
- **FR-022**: System MUST add `@walter/sanity-atoms` as a dependency in `packages/sanity-blocks/package.json`
- **FR-023**: Package MUST export schemas via `"./schemas"` export path pointing to `"./src/schemas.ts"`
- **FR-024**: Package MUST export fragments via `"./fragments"` export path pointing to `"./src/fragments.ts"`
- **FR-025**: System MUST migrate all blocks to flat file structure in `packages/sanity-blocks/src/` using camelCase naming (e.g., `heroSection.schema.ts`, `heroSection.fragment.ts`)
- **FR-026**: System MUST migrate `faqAccordion` block files to `packages/sanity-blocks/src/` (faqAccordion.schema.ts, faqAccordion.fragment.ts)
- **FR-027**: System MUST migrate `featureCardsIcon` block files to `packages/sanity-blocks/src/` (featureCardsIcon.schema.ts, featureCardsIcon.fragment.ts)
- **FR-028**: System MUST migrate `imageLinkCards` block files to `packages/sanity-blocks/src/` (imageLinkCards.schema.ts, imageLinkCards.fragment.ts)
- **FR-029**: System MUST migrate `subscribeNewsletter` block files to `packages/sanity-blocks/src/` (subscribeNewsletter.schema.ts, subscribeNewsletter.fragment.ts)
- **FR-030**: System MUST migrate existing `heroSection` and `cta` blocks to flat structure if not already done
- **FR-031**: Each block MUST have a `[blockName].schema.ts` file exporting the Sanity schema definition
- **FR-032**: Each block MUST have a `[blockName].fragment.ts` file exporting the GROQ query fragment (if needed)
- **FR-033**: System MUST create `packages/sanity-blocks/src/schemas.ts` that re-exports all block schemas as named exports
- **FR-034**: System MUST create `packages/sanity-blocks/src/fragments.ts` that re-exports all block fragments as named exports
- **FR-035**: File `schemas.ts` MUST export an `allBlockSchemas` array containing all block schema definitions
- **FR-036**: Block schemas MUST import atomic types from `@walter/sanity-atoms/schemas` (not from local files)
- **FR-037**: System MUST update all imports in `apps/template-studio/` from `@workspace/sanity` to `@walter/sanity-blocks/schemas`
- **FR-038**: System MUST update all imports in `apps/template-web/` from `@workspace/sanity` to `@walter/sanity-blocks/fragments`
- **FR-039**: System MUST update `apps/template-studio/package.json` dependencies to reference `@walter/sanity-blocks`
- **FR-040**: System MUST update `apps/template-web/package.json` dependencies to reference `@walter/sanity-blocks`
- **FR-041**: System MUST remove nested directory structure (no `src/hero-section/`, `src/cta/` directories) in favor of flat `src/` directory

#### Build & Type Safety

- **FR-042**: System MUST successfully pass TypeScript type checking after all renaming and reorganization (`pnpm check-types`)
- **FR-043**: System MUST successfully build all apps and packages after migration (`pnpm build`)
- **FR-044**: System MUST successfully start development server for template apps without errors
- **FR-045**: System MUST maintain existing functionality - no breaking changes to template app behavior
- **FR-046**: Dependency graph MUST be correct: `apps` → `@walter/sanity-blocks` → `@walter/sanity-atoms` (no circular dependencies)

### Key Entities *(include if feature involves data)*

- **Template App**: A reference implementation app (studio or web) that serves as the "source of truth" for patterns and best practices. Named with `template-*` prefix. Not used for real client work.
- **Client App**: A real client project app (studio or web) that uses shared packages and may have project-specific customizations. Named with `client-*` prefix. (Not created in Phase 1, but architecture must support future creation)
- **Shared Package**: A workspace package (e.g., `@walter/sanity-blocks`, `@walter/sanity-atoms`) that contains reusable code, schemas, fragments, or configuration shared across multiple apps.
- **Atomic Content Type**: A reusable, foundational Sanity field definition (buttons, image, rich-text) stored in `@walter/sanity-atoms` that is composed into blocks and documents. These are the smallest building blocks.
- **Page Builder Block**: A Sanity CMS content block type consisting of a schema definition (`.schema.ts`) and optional GROQ fragment (`.fragment.ts`) that defines how the block is edited and queried. Blocks compose atomic types.
- **Block Schema**: TypeScript file defining the Sanity schema for a page builder block using `defineType()` from Sanity's schema API. Stored as flat files (e.g., `heroSection.schema.ts`).
- **GROQ Fragment**: Template literal string containing GROQ query syntax for fetching specific fields from a block type, used to compose larger queries. Stored as flat files (e.g., `heroSection.fragment.ts`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developer can navigate to `apps/` directory and immediately distinguish template apps from client apps by directory name (100% clarity)
- **SC-002**: All six page builder blocks exist as flat files in `packages/sanity-blocks/src/` with camelCase naming (e.g., `heroSection.schema.ts`) - zero nested directories
- **SC-003**: All three atomic content types (buttons, image, richText) exist as flat files in `packages/sanity-atoms/src/` - accessible via imports from `@walter/sanity-atoms/schemas`
- **SC-004**: Developer can locate any block schema file in under 5 seconds by scanning the flat `packages/sanity-blocks/src/` directory
- **SC-005**: Template Studio app successfully loads with all page builder blocks available in the CMS interface after importing from `@walter/sanity-blocks/schemas`
- **SC-006**: Template Web app successfully queries all page builder blocks using fragments from `@walter/sanity-blocks/fragments` without errors
- **SC-007**: Full build process (`pnpm build`) completes successfully across all apps and packages with zero TypeScript errors
- **SC-008**: Full type checking (`pnpm check-types`) passes with zero errors across all apps and packages
- **SC-009**: Development servers for both template apps start without errors and display functional page builder interfaces
- **SC-010**: Shared package exports are correctly typed, allowing consumers to get full TypeScript autocomplete and type safety when importing schemas and fragments
- **SC-011**: Package dependency graph is correct: `apps` → `@walter/sanity-blocks` → `@walter/sanity-atoms` (no circular dependencies)
- **SC-012**: Zero code duplication exists across all apps and packages for block schemas, fragments, or atomic content types

## Assumptions *(optional)*

- **A-001**: The current codebase may have `hero-section` and `cta` blocks in the shared package, but they will be migrated to the flat structure regardless
- **A-002**: The existing package structure uses pnpm workspaces (evidenced by `pnpm --filter` commands in CLAUDE.md)
- **A-003**: TypeScript strict mode is enabled across the monorepo
- **A-004**: The project uses Sanity Studio 4.x and Next.js 15.x (per CLAUDE.md technology stack)
- **A-005**: Turbo is configured for build orchestration (evidenced by `turbo.json` references)
- **A-006**: All fragment files use the `/* groq */` comment for syntax highlighting
- **A-007**: Future phases (Phase 2+) will introduce `@walter/sanity-documents` package for document type schemas, but Phase 1 focuses only on blocks and atoms
- **A-008**: Future phases (Phase 4+) will introduce actual client apps, but Phase 1 focuses only on template app foundation
- **A-009**: The workspace scope `@walter` is preferred over `@workspace` for shared packages to better represent the agency brand
- **A-010**: Shared field schemas (buttons, image, rich-text) are already organized in `packages/sanity/src/shared/` and will move to new `packages/sanity-atoms/src/` as flat files
- **A-011**: CamelCase naming (e.g., `heroSection.schema.ts`) is preferred over kebab-case for flat file structure to simplify imports and align with TypeScript/JavaScript conventions
- **A-012**: Blocks may currently have nested directory structures (e.g., `src/hero-section/hero-section.schema.ts`) which will be flattened to `src/heroSection.schema.ts`

## Constraints *(optional)*

- **C-001**: Must maintain backward compatibility with existing Sanity content - schema name changes are not permitted (only file organization changes)
- **C-002**: Must not disrupt current development workflow - all existing npm scripts must continue to function
- **C-003**: Must follow existing monorepo conventions established in features 001-007 (per CLAUDE.md)
- **C-004**: Must use flat file structure with camelCase naming (e.g., `heroSection.schema.ts`) for simplicity and TypeScript/JavaScript alignment
- **C-005**: Cannot modify Sanity Content Lake data or structure - this is purely a code organization refactor
- **C-006**: Must maintain existing i18n functionality during the transition - no disruption to multi-language content
- **C-007**: Must maintain clear separation of concerns: atoms are primitive fields, blocks compose atoms into reusable sections

## Dependencies *(optional)*

- **D-001**: Requires completion of feature 007 (colocate-pagebuilder-modules) which established the block organization pattern
- **D-002**: Depends on existing pnpm workspace configuration in root `package.json`
- **D-003**: Depends on Turbo build system configuration in `turbo.json`
- **D-004**: Assumes Sanity Studio and Next.js apps are functioning correctly in their current state

## Out of Scope *(optional)*

- **OS-001**: Creation of actual client projects (`client-a-studio`, `client-a-web`) - deferred to Phase 4+
- **OS-002**: Creation of `@walter/sanity-documents` package for document type schemas - deferred to Phase 2+
- **OS-003**: Refactoring of `@walter/i18n-config` internal implementation - only package renaming and basic structure setup in Phase 1
- **OS-004**: Creation of CLI scaffolding tools (`templates/` directory) - deferred to Phase 5
- **OS-005**: Migration of document type schemas (page, blog, FAQ, form) to shared packages - deferred to future phases
- **OS-006**: Modification of React components in `apps/template-web/src/blocks/` - these remain web-app specific (renamed path from `apps/web`)
- **OS-007**: Migration of GROQ fragments for atoms - atoms package only handles schemas in Phase 1, not fragments (fragments stay with blocks if needed)
- **OS-008**: Changes to Sanity Content Lake configuration or data structure
- **OS-009**: Performance optimization or bundle size analysis
- **OS-010**: Comprehensive documentation - only inline code comments and basic package README files in Phase 1

## Related Features *(optional)*

- **007-colocate-pagebuilder-modules**: Established the pattern for organizing blocks by co-locating schemas and fragments, which is now being elevated to a shared package architecture
- **001-i18n-localization**: Established the multi-language architecture that will benefit from the shared `@walter/i18n-config` package
- **006-fix-language-switcher**: Worked with translation metadata that will be managed more consistently through shared packages
