# Feature Specification: Co-locate Page Builder Block Modules

**Feature Branch**: `007-colocate-pagebuilder-modules`
**Created**: 2025-11-13
**Status**: Draft
**Input**: User description: "This template project is almost 100% perfect, now before we hand this off to our development team so they can use it in future projects, we need to re-organize the repo's structure a little bit to keep things well organized and clean. I want us to model our project's repo after the structure done in ~/walter-interactive/conciliainc.com. Specifically in how the pageBuilderFragment and its blocks are organized into co-located modules, the tsx, schema definition, and query fragment are all grouped by block in the same directory which makes things easier to find and discover. I also want us to reorganize our apps/web/src/lib/sanity directory in a similar fashion to the one found in conciliainc.com as well where the queries are organized per document schema types, this deduplicate the logic and encapsulate each query logic to its own document schema type. It is very important that we do not change any of the existing functionality in the project. This specification is for code reorganization only."

## User Scenarios & Testing

### User Story 1 - Developer Discovers Block Components (Priority: P1)

A developer needs to modify the Hero block to add a new field. They want to find all related files (component, schema, query fragment) in one place.

**Why this priority**: This is the most common developer workflow - modifying existing blocks. Co-location directly improves discoverability and reduces cognitive load.

**Independent Test**: Can be fully tested by verifying the component exists in `apps/web/src/blocks/HeroSection/HeroSection.tsx` and the schema/fragment exist together in the shared package at `packages/sanity-blocks/src/hero-section/` (`hero-section.schema.ts`, `hero-section.fragment.ts`).

**Acceptance Scenarios**:

1. **Given** a developer needs to modify the Hero block, **When** they navigate to `apps/web/src/blocks/HeroSection/`, **Then** they find the React component (`HeroSection.tsx`), and when they navigate to `packages/sanity-blocks/src/hero-section/`, they find the schema definition (`hero-section.schema.ts`) and query fragment (`hero-section.fragment.ts`) co-located in the shared package
2. **Given** a developer wants to understand what fields a block supports, **When** they open the block's directory, **Then** they can cross-reference the schema definition and query fragment without navigating to different directories
3. **Given** a developer needs to add a new field to a block, **When** they modify the schema in `packages/sanity-blocks/src/hero-section/hero-section.schema.ts`, **Then** they can immediately update the co-located fragment in `hero-section.fragment.ts` (same directory), then update the component in `apps/web/src/blocks/HeroSection/HeroSection.tsx`

---

### User Story 2 - Developer Adds New Block Type (Priority: P2)

A developer wants to create a new "Testimonials" block for the page builder.

**Why this priority**: Adding new blocks is less frequent than modifying existing ones, but must be straightforward to encourage feature expansion.

**Independent Test**: Can be tested by creating a new block directory with all three required files, importing them into the central registry, and verifying the block appears in Sanity Studio and renders on the frontend.

**Acceptance Scenarios**:

1. **Given** a developer wants to add a Testimonials block, **When** they create the schema and fragment in `packages/sanity-blocks/src/testimonials/` and the component in `apps/web/src/blocks/Testimonials/`, **Then** they can import and register the block in the 3 central registry files
2. **Given** the developer has created the block files, **When** they add the schema to the studio registry and the fragment to the query aggregator, **Then** the block becomes available in Sanity Studio and renders correctly on the frontend
3. **Given** the block is registered, **When** a content editor adds the Testimonials block to a page, **Then** it renders with all the data specified in the query fragment

---

### User Story 3 - Developer Finds Document-Specific Queries (Priority: P2)

A developer needs to modify the query for Blog posts to include additional metadata.

**Why this priority**: Document-specific queries are frequently modified as features evolve. Organizing them by document type reduces time spent searching.

**Independent Test**: Can be tested by navigating to `apps/web/src/lib/sanity/queries/blog.ts` and verifying it contains all blog-related queries in one file.

**Acceptance Scenarios**:

1. **Given** a developer needs to modify blog queries, **When** they navigate to `apps/web/src/lib/sanity/queries/blog.ts`, **Then** they find all blog-related queries (`queryBlogIndexPageData`, `queryBlogSlugPageData`) in one file
2. **Given** multiple queries need the same fragment (e.g., `blogCardFragment`), **When** the developer examines the queries file, **Then** they can see fragment reuse patterns within the same document type
3. **Given** a developer wants to add a new blog-related query, **When** they add it to `blog.ts`, **Then** future developers know where to find all blog queries

---

### User Story 4 - Developer Understands Query Structure (Priority: P3)

A developer new to the project wants to understand how queries are composed from fragments.

**Why this priority**: Onboarding efficiency improves when query architecture is clear, but this is less critical than day-to-day modification workflows.

**Independent Test**: Can be tested by examining the `fragments/` directory structure and verifying atomic, reusable, and composite fragments are clearly separated.

**Acceptance Scenarios**:

1. **Given** a new developer examines `apps/web/src/lib/sanity/fragments/`, **When** they see directories like `atomic/`, `reusable/`, and `pageBuilder/`, **Then** they understand the hierarchy of fragment composition
2. **Given** the developer needs to understand how the page builder fragment is constructed, **When** they open `fragments/pageBuilder/index.ts`, **Then** they see it imports block-specific fragments from the co-located block directories
3. **Given** the developer wants to create a new reusable fragment, **When** they add it to `fragments/reusable/`, **Then** they follow the established pattern for fragment organization

---

### Edge Cases

- What happens when a block has multiple component variations (e.g., `HeroSection.tsx` and `ContainedHeroSection.tsx`)? Both component files should reside in the same block directory in `apps/web/src/blocks/HeroSection/`
- How does the system handle shared fragments used across multiple blocks? Shared fragments remain in `apps/web/src/lib/sanity/fragments/reusable/`
- What if a developer forgets to import a new block schema into the studio registry? Type checking and build validation should catch missing imports
- How does the system handle query fragments that span multiple document types? Create a dedicated file in `queries/` that imports fragments from multiple sources

## Requirements

### Functional Requirements

- **FR-001**: System MUST reorganize page builder blocks into co-located directories where each block directory contains its React component (`.tsx`), schema definition (`.schema.ts`), and query fragment (`.fragment.ts`)
- **FR-002**: System MUST maintain a central registry in the studio for block schemas and a central aggregator in the web app for query fragments
- **FR-003**: System MUST reorganize `apps/web/src/lib/sanity/` directory to separate queries by document type (e.g., `queries/page.ts`, `queries/blog.ts`, `queries/home.ts`)
- **FR-004**: System MUST organize query fragments into a hierarchy: atomic fragments (smallest units), reusable fragments (composed from atomic), block-specific fragments (in block directories), and document-level queries
- **FR-005**: System MUST preserve all existing functionality - no behavior changes, only code reorganization
- **FR-006**: System MUST maintain type safety through the reorganization, ensuring generated types still work correctly
- **FR-007**: System MUST update all import statements to reflect the new file locations
- **FR-008**: System MUST preserve internationalization (i18n) query patterns in the reorganized structure
- **FR-009**: System MUST ensure the page builder component mapping (`BLOCK_COMPONENTS`) continues to work with the new block locations
- **FR-010**: System MUST keep shared/reusable elements (buttons, rich text, images) in a central location accessible to all blocks

### Key Entities

**Note**: This is a refactoring specification with no new data entities. The reorganization affects code structure only.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Developers can locate all files related to a specific block (component, schema, fragment) within a single directory, reducing file discovery time by 70% (baseline: ~15 seconds searching across 3 directories → target: <5 seconds in 1 directory)
- **SC-002**: All existing functionality continues to work without modification - all pages render identically, all queries return the same data structure
- **SC-003**: Type checking passes without errors after reorganization (`pnpm check-types` succeeds in both `studio` and `web` workspaces)
- **SC-004**: Build process completes successfully for both studio and web applications
- **SC-005**: Development server starts without import errors or missing module warnings
- **SC-006**: Developers can identify which queries belong to which document type within 5 seconds by examining the `queries/` directory structure
- **SC-007**: Adding a new block requires modifying exactly 3 central registry files (studio block registry at `apps/studio/schemaTypes/blocks/index.ts`, web fragment aggregator at `packages/sanity-blocks/src/index.ts`, and component mapping at `apps/web/src/components/pagebuilder.tsx`) after creating the co-located block directories

## Assumptions

- The reference project (`conciliainc.com`) represents the desired organization pattern with 32 co-located blocks
- The current project has 6 page builder blocks that need reorganization: hero, cta, faq-accordion, feature-cards-icon, image-link-cards, subscribe-newsletter
- The reorganization follows TypeScript/ES6 module best practices (default exports for components, named exports for schemas/fragments)
- Schemas and fragments stored in shared @workspace/sanity-blocks package per constitution Principle I
- No changes to Sanity Studio UI configuration or content structure are required
- Generated TypeScript types (`sanity.types.ts`) will automatically update after schema reorganization
- All developers have access to the `conciliainc.com` reference project for pattern comparison during implementation

## Dependencies

- Successful reorganization depends on maintaining import path consistency across both `studio` and `web` workspaces in the monorepo
- Type generation script must be re-run after schema file moves to update `sanity.types.ts`
- Build and type-checking tools must pass before considering reorganization complete

## Out of Scope

- Modifying block functionality or adding new fields to existing blocks
- Changing the visual appearance or behavior of any component
- Altering query logic or data fetching patterns
- Refactoring component implementations or adding new components
- Modifying Sanity Studio UI configuration beyond schema file imports
- Creating new documentation or README files (unless implementation requires it)
- Performance optimizations or bundle size improvements
- Updating dependencies or package versions
