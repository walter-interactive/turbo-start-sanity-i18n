# Implementation Plan: De-duplicate i18n Records in Sanity Studio

**Branch**: `003-dedup-studio-records` | **Date**: 2025-11-11 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-dedup-studio-records/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Content editors currently see duplicate entries in Sanity Studio document lists when documents are translated into multiple languages. The document-internationalization plugin creates separate documents per language (EN, FR), resulting in confusing duplicate records like two "Innovative Explicit Core" entries. This feature will filter document lists to show only the default language (FR) versions while maintaining full translation access through the existing Translations badge UI when documents are opened. The implementation will leverage Sanity Studio's structure builder API to apply language-based filtering consistently across all i18n-enabled document types (pages, blogs, FAQs) without modifying the underlying document-internationalization plugin or data model.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 18+  
**Primary Dependencies**: 
- Sanity Studio v4.4.1
- @sanity/document-internationalization v4.1.0
- @sanity/orderable-document-list v1.4.0
- React 19.1
- Lucide React v0.539.0 (icons)

**Storage**: Sanity Content Lake (cloud-hosted, already configured)  
**Testing**: No formal test suite currently configured (per AGENTS.md)  
**Target Platform**: Web browser (Sanity Studio is a web application)  
**Project Type**: Web application - TurboRepo monorepo with apps/studio workspace  
**Performance Goals**: 
- Document list rendering under 1 second for up to 500 documents
- No perceptible delay when applying language filters
- Maintain existing Studio performance characteristics

**Constraints**: 
- MUST NOT modify document-internationalization plugin behavior
- MUST NOT change data storage or document structure
- MUST work with existing singleton pattern (navbar, footer already working)
- MUST apply consistently across all i18n-enabled document types
- Studio-only changes (web frontend unaffected)

**Scale/Scope**: 
- 7 document types support i18n (page, blog, blogIndex, navbar, footer, settings, homePage, faq)
- 2 languages currently (FR default, EN)
- Estimated 50-200 documents initially, scalable to 1000+

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Monorepo Structure & Boundaries ✅ PASS
**Evaluation**: Changes isolated to apps/studio workspace. No new workspace dependencies created. Modifications stay within Studio's structure.ts and components/ directory. Clear boundary maintained.

### II. TypeScript Strict Mode & Type Safety ✅ PASS
**Evaluation**: Studio already uses strict TypeScript (tsconfig.json). All new filtering logic will use proper types from sanity/structure and Sanity client types. No `any` types permitted. Type definitions already exist for FolderNode, DocumentData, StructureBuilder.

### III. Test Coverage (MANDATORY) ⚠️ CONDITIONAL PASS
**Evaluation**: Per AGENTS.md "Single test: No test suite configured". This feature is Studio UI-only. **Manual testing required**: Verify document lists show only default language, translations badge works, orphaned documents show warning. Testing approach will be documented in quickstart.md with step-by-step verification scenarios.

**Justification**: Studio workspace has no existing test infrastructure. Adding tests only for this feature would violate consistency principle. Manual testing with clear acceptance criteria is the current standard.

### IV. Component Modularity & Reusability ✅ PASS
**Evaluation**: Will extract language filtering logic into reusable utilities (e.g., `filterDocumentsByLanguage`). Existing patterns follow this (deduplicateDocuments in nested-pages-structure.ts). New components for orphaned document badges will be modular and follow existing Studio component patterns.

### V. API Contracts & Versioning ✅ PASS
**Evaluation**: No external API changes. Internal contracts are Sanity Studio APIs (StructureBuilder, SanityClient) which are stable v4 APIs. GROQ query modifications are backward compatible (adding language filtering). No breaking changes to existing structure.

### VI. Internationalization (i18n) First ✅ PASS
**Evaluation**: This feature explicitly enhances i18n support. Uses existing i18n configuration (DEFAULT_LOCALE = "fr" from routing.ts). Sanity's documentInternationalization plugin already configured. No hard-coded strings in UI components (uses Sanity's title system).

### VII. Code Quality & Observability ✅ PASS
**Evaluation**: Code will pass Ultracite linting (`pnpm lint`) and type checking (`pnpm check-types`). Studio has hot reload configured. Error handling follows existing patterns (try-catch in fetchDocuments). Console logging for debugging during development, removed before merge.

**Overall Gate Status**: ✅ PASS with manual testing requirement documented

## Project Structure

### Documentation (this feature)

```text
specs/003-dedup-studio-records/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (already created)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── structure-api.ts         # Structure builder filtering contracts
│   └── language-filter-types.ts # Type definitions for language filtering
├── checklists/
│   └── requirements.md  # Spec quality checklist (already created)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
apps/studio/
├── components/
│   ├── nested-pages-structure.ts          # MODIFY: Add language filtering
│   ├── language-filter.ts                 # NEW: Language filtering utilities
│   └── orphaned-translation-badge.tsx     # NEW: Warning badge component
├── utils/
│   └── constant.ts                        # MODIFY: Add default language constant
├── structure.ts                           # MODIFY: Apply filters to all i18n types
├── sanity.config.ts                       # READ-ONLY: Reference existing config
└── schemaTypes/
    └── documents/                         # READ-ONLY: Reference language field
        ├── page.ts
        ├── blog.ts
        └── faq.ts
```

**Structure Decision**: Single project structure within apps/studio workspace of the TurboRepo monorepo. All modifications isolated to Studio workspace. No new packages or workspaces needed. Follows existing patterns established in nested-pages-structure.ts and structure.ts.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| No formal automated tests | No test infrastructure exists in Studio workspace | Adding tests only for this feature would create inconsistency; manual testing with documented scenarios matches current practices |

## Phase 0: Research Tasks (Outline)

The following research tasks will be executed to resolve technical unknowns and establish implementation patterns:

### Research Task 1: Sanity Studio Structure Builder Filtering Patterns
**Question**: What are the best practices for filtering document lists in Sanity Studio v4 structure builder based on custom fields?

**Investigation areas**:
- Structure builder API documentation for list filtering
- SanityClient GROQ query filtering in structure context
- Performance implications of filtering at structure vs query level
- Existing filtering patterns in nested-pages-structure.ts

**Expected outcome**: Documented approach for applying language field filters to document lists with code examples

### Research Task 2: Document-Internationalization Plugin Integration Points
**Question**: How does the document-internationalization plugin expose translation relationships and UI components that we can leverage?

**Investigation areas**:
- Plugin's Translations badge component location and usage
- How plugin identifies related language versions (document relationships)
- Whether plugin provides utilities for default language identification
- Singleton documents (navbar, footer) working example analysis

**Expected outcome**: Clear understanding of how to maintain plugin's translation workflow while adding list filtering

### Research Task 3: Custom Badge/Indicator UI Components in Sanity Studio
**Question**: What's the recommended approach for adding custom visual indicators (orphaned document warnings) to Studio document list items?

**Investigation areas**:
- Sanity UI component library (@sanity/ui) for badges/indicators
- ListItemBuilder API for custom decorators or badges
- Existing badge implementations in Studio (if any)
- Accessibility considerations for warning indicators

**Expected outcome**: Component pattern and API usage for orphaned translation warning badges

### Research Task 4: Default Language Configuration Management
**Question**: Where should default language configuration be accessed and whether it should be centralized?

**Investigation areas**:
- Current hardcoded language config in sanity.config.ts (documentInternationalization)
- Web app's DEFAULT_LOCALE from i18n/routing.ts
- Whether to create shared constant or read from plugin config
- TypeScript type safety for language codes

**Expected outcome**: Decision on configuration source and constant definition location

**Research output location**: `specs/003-dedup-studio-records/research.md`

## Phase 1: Design Artifacts (Preview)

Phase 1 will produce the following artifacts after Phase 0 research is complete:

### data-model.md
Document entity structure focusing on:
- Language field on i18n-enabled documents
- Translation relationship model (how documents link across languages)
- Default language designation rules
- Orphaned translation detection criteria

### contracts/structure-api.ts
Type-safe contracts for:
- `filterDocumentsByLanguage()` utility function signature
- `LanguageFilterOptions` interface
- `DocumentWithLanguage` type
- `OrphanedDocumentStatus` type

### contracts/language-filter-types.ts
TypeScript types for:
- Supported language codes (matching Sanity config)
- Document metadata with language field
- Filter predicates for GROQ queries
- Badge component props

### quickstart.md
Developer guide including:
- How to add language filtering to a new document type
- Testing checklist for verifying list de-duplication
- Manual testing scenarios matching spec acceptance criteria
- Troubleshooting common issues (missing language field, etc.)

## Next Steps

After `/speckit.plan` completes:
1. ✅ Review Phase 0 research findings in `research.md`
2. ✅ Review Phase 1 design artifacts (data-model.md, contracts/, quickstart.md)
3. ⏭️  Run `/speckit.tasks` to generate implementation task breakdown
4. ⏭️  Begin implementation following task sequence
5. ⏭️  Manual testing per quickstart.md acceptance scenarios
6. ⏭️  Code review and merge to main branch
