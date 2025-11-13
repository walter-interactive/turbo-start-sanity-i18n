# Documentation Implementation Checklist

**Feature**: Studio Documentation & Code Organization
**Date**: 2025-11-13
**Status**: Task List

## Overview

This checklist tracks documentation additions to all files in `apps/studio`. Files are prioritized based on criticality for team handoff (from data-model.md).

---

## Priority 1: Critical (Handoff Blockers)

These files are essential for understanding the Studio architecture and must be documented first.

### Configuration Files

- [ ] **apps/studio/sanity.config.ts**
  - [ ] Add header comment explaining file purpose and structure
  - [ ] Document each of 9 plugins with purpose, config, dependencies (see jsdoc-templates.md #2)
  - [ ] Explain `newDocumentOptions` template filtering logic (lines 68-74)
  - [ ] Document `productionUrl` vs `previewUrl` distinction
  - [ ] Add comments for `projectId`, `dataset`, `basePath` configuration
  - [ ] Cross-reference structure.ts and plugin interactions
  - **Estimated time**: 60-90 minutes
  - **Comment density target**: 40-50%

- [ ] **apps/studio/structure.ts**
  - [ ] Verify existing JSDoc comments are complete (already well-documented)
  - [ ] Add header comment explaining structure builder pattern
  - [ ] Document `createSingleTon` helper function with JSDoc
  - [ ] Document `createList` helper function with JSDoc
  - [ ] Verify `createIndexListWithOrderableItems` JSDoc is thorough (already exists)
  - [ ] Add section comments for sidebar organization logic
  - [ ] Explain DEFAULT_LOCALE filtering pattern and why it's needed
  - **Estimated time**: 30-45 minutes
  - **Comment density target**: 30-40% (maintain current standard)

### Primary Documentation

- [ ] **apps/studio/README.md**
  - [ ] Create/expand Quick Start section (installation, dev server, build)
  - [ ] Add Architecture Overview section (directory structure, design principles)
  - [ ] Document Plugin Ecosystem (9 plugins table with purposes and interactions)
  - [ ] Add Content Type System section (documents vs blocks vs definitions)
  - [ ] Document Studio Structure (structure.ts helpers and patterns)
  - [ ] Create 5 Common Workflows guides (step-by-step):
    - [ ] Workflow 1: Adding translatable document type
    - [ ] Workflow 2: Adding singleton document
    - [ ] Workflow 3: Modifying sidebar structure
    - [ ] Workflow 4: Creating custom field components
    - [ ] Workflow 5: Running data migrations
  - [ ] Add Troubleshooting section (common issues and solutions)
  - [ ] Create Reference section (environment variables, scripts, conventions)
  - **Estimated time**: 3-4 hours
  - **Target length**: 3000-4000 words, 200-250 lines

---

## Priority 2: Important (Frequently Modified)

These files are modified regularly and need clear documentation for ongoing maintenance.

### Document Schemas

- [ ] **apps/studio/schemaTypes/documents/page.ts**
  - [ ] Add schema header comment (see jsdoc-templates.md #3)
  - [ ] Document purpose: Flexible page builder for site content
  - [ ] Note i18n support: Yes (translatable)
  - [ ] Document slug validation integration
  - [ ] Note nested page template support
  - **Estimated time**: 15-20 minutes

- [ ] **apps/studio/schemaTypes/documents/blog.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Blog posts with author attribution
  - [ ] Note i18n support: Yes (translatable)
  - [ ] Note ordering support: Yes (orderableDocumentList)
  - [ ] Document orderRank quirk with translations (critical!)
  - [ ] Document slug validation integration
  - **Estimated time**: 20-25 minutes

- [ ] **apps/studio/schemaTypes/documents/blog-index.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Landing page for blog section
  - [ ] Note singleton: Yes (one per language)
  - [ ] Note i18n support: Yes (translatable)
  - **Estimated time**: 10-15 minutes

- [ ] **apps/studio/schemaTypes/documents/home-page.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Site homepage with custom layout
  - [ ] Note singleton: Yes (one per language)
  - [ ] Note i18n support: Yes (translatable)
  - **Estimated time**: 10-15 minutes

- [ ] **apps/studio/schemaTypes/documents/faq.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Frequently asked questions
  - [ ] Note i18n support: Yes (translatable)
  - **Estimated time**: 10-15 minutes

- [ ] **apps/studio/schemaTypes/documents/author.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Blog post authors
  - [ ] Note i18n support: No (authors are global)
  - **Estimated time**: 10-15 minutes

- [ ] **apps/studio/schemaTypes/documents/navbar.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Site navigation configuration
  - [ ] Note singleton: Yes (one per language)
  - [ ] Note i18n support: Yes (translatable)
  - **Estimated time**: 10-15 minutes

- [ ] **apps/studio/schemaTypes/documents/footer.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Site footer configuration
  - [ ] Note singleton: Yes (one per language)
  - [ ] Note i18n support: Yes (translatable)
  - **Estimated time**: 10-15 minutes

- [ ] **apps/studio/schemaTypes/documents/settings.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Global site settings
  - [ ] Note singleton: Yes (one per language)
  - [ ] Note i18n support: Yes (translatable)
  - **Estimated time**: 10-15 minutes

- [ ] **apps/studio/schemaTypes/documents/redirect.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: URL redirects (301/302)
  - [ ] Note i18n support: No (redirects are global)
  - **Estimated time**: 10-15 minutes

### Utility Files

- [ ] **apps/studio/utils/helper.ts**
  - [ ] Add file header comment explaining utility collection purpose
  - [ ] Add JSDoc to all exported functions (see jsdoc-templates.md #1)
  - [ ] Include @example tags with real usage from codebase
  - [ ] Document any shared constants or types
  - **Estimated time**: 30-45 minutes
  - **Comment density target**: 15-25%

- [ ] **apps/studio/utils/slug-validation.ts**
  - [ ] Add file header comment explaining validation purpose
  - [ ] Document slug uniqueness check logic (per language)
  - [ ] Document reserved path checking
  - [ ] Add JSDoc with @param and @returns
  - [ ] Add @example showing validation patterns
  - **Estimated time**: 20-30 minutes
  - **Comment density target**: 20-30%

- [ ] **apps/studio/utils/getPresentationUrl.ts**
  - [ ] Add file header comment
  - [ ] Document how preview URLs are constructed
  - [ ] Document relationship to presentationTool plugin
  - [ ] Add JSDoc with @param and @returns
  - **Estimated time**: 15-20 minutes

- [ ] **apps/studio/utils/location.ts**
  - [ ] Add file header comment
  - [ ] Document location resolver pattern
  - [ ] Explain mapping between Studio documents and frontend routes
  - [ ] Add JSDoc to resolver functions
  - **Estimated time**: 20-25 minutes

---

## Priority 3: Nice to Have (Occasionally Modified)

These files are more stable and less frequently modified, but documentation improves maintainability.

### Block Schemas

- [ ] **apps/studio/schemaTypes/blocks/hero.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Hero section for page builder
  - [ ] Note usage: Page builder component
  - **Estimated time**: 10-15 minutes

- [ ] **apps/studio/schemaTypes/blocks/cta.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Call-to-action section
  - [ ] Note usage: Page builder component
  - **Estimated time**: 10-15 minutes

- [ ] **apps/studio/schemaTypes/blocks/faq-accordion.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Expandable FAQ section
  - [ ] Note usage: Page builder component
  - [ ] Document FAQ document reference pattern
  - **Estimated time**: 10-15 minutes

- [ ] **apps/studio/schemaTypes/blocks/feature-cards-icon.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Grid of feature cards with icons
  - [ ] Note usage: Page builder component
  - [ ] Document iconPicker integration
  - **Estimated time**: 10-15 minutes

- [ ] **apps/studio/schemaTypes/blocks/image-link-cards.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Cards with images and links
  - [ ] Note usage: Page builder component
  - **Estimated time**: 10-15 minutes

- [ ] **apps/studio/schemaTypes/blocks/subscribe-newsletter.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Newsletter subscription form
  - [ ] Note usage: Page builder component
  - **Estimated time**: 10-15 minutes

### Definition Schemas

- [ ] **apps/studio/schemaTypes/definitions/pagebuilder.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Array field containing block types
  - [ ] List all allowed block types
  - [ ] Document usage in page and homePage documents
  - **Estimated time**: 15-20 minutes

- [ ] **apps/studio/schemaTypes/definitions/rich-text.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Portable Text configuration
  - [ ] Document custom marks (link, highlight)
  - [ ] Document custom blocks and styles
  - [ ] Note usage locations (blog body, FAQ answers)
  - **Estimated time**: 20-25 minutes

- [ ] **apps/studio/schemaTypes/definitions/button.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Reusable button field group
  - [ ] Document style options (primary/secondary/outline)
  - [ ] Note usage in CTAs and hero sections
  - **Estimated time**: 10-15 minutes

- [ ] **apps/studio/schemaTypes/definitions/custom-url.ts**
  - [ ] Add schema header comment
  - [ ] Document purpose: Link field supporting internal/external
  - [ ] Document linkType switching pattern
  - [ ] Note usage in buttons and navigation
  - **Estimated time**: 15-20 minutes

### Shared Schema Utilities

- [ ] **apps/studio/schemaTypes/common.ts**
  - [ ] Add file header comment explaining shared utilities
  - [ ] Document `languageField` export and usage pattern
  - [ ] Document any other shared field definitions
  - **Estimated time**: 10-15 minutes

- [ ] **apps/studio/schemaTypes/index.ts**
  - [ ] Add file header comment explaining schema aggregation
  - [ ] Add inline comments grouping schemas by category
  - [ ] Document export pattern
  - **Estimated time**: 10-15 minutes

### Custom Components

- [ ] **apps/studio/components/slug-field-component.tsx**
  - [ ] Add file header comment
  - [ ] Document component purpose: Real-time slug validation UI
  - [ ] Add JSDoc to component props interface
  - [ ] Document integration with slug-validation.ts utility
  - **Estimated time**: 15-20 minutes

- [ ] **apps/studio/components/language-filter.ts** (if exists)
  - [ ] Add file header comment
  - [ ] Document filtering logic and usage
  - [ ] Add JSDoc to exported functions
  - **Estimated time**: 15-20 minutes

### Other Utility Files

- [ ] **apps/studio/utils/getDefaultLocale.ts** (if exists)
  - [ ] Add file header comment
  - [ ] Document DEFAULT_LOCALE constant and usage
  - [ ] Add JSDoc to any exported functions
  - **Estimated time**: 10-15 minutes

---

## Verification Checklist

After completing documentation for each priority level:

### Priority 1 Complete
- [ ] Run type check: `pnpm --filter studio check-types`
- [ ] Build succeeds: `pnpm --filter studio build`
- [ ] Dev server starts: `pnpm --filter studio dev` (check for errors)
- [ ] README.md renders correctly on GitHub
- [ ] All cross-references in README point to valid line numbers
- [ ] Onboarding trial: Have unfamiliar developer follow documentation

### Priority 2 Complete
- [ ] All document schemas have header comments
- [ ] All utility functions have JSDoc with @param, @returns, @example
- [ ] IntelliSense shows comments when hovering over functions in VSCode
- [ ] Comment density meets targets (15-30% depending on file)

### Priority 3 Complete
- [ ] All block schemas documented
- [ ] All definition schemas documented
- [ ] All custom components documented
- [ ] Zero files in apps/studio without at least file header comment

---

## Time Estimates

| Priority Level | Estimated Time | Files Count |
|----------------|----------------|-------------|
| Priority 1 | 5-7 hours | 3 files |
| Priority 2 | 4-6 hours | 15 files |
| Priority 3 | 3-5 hours | 14 files |
| **Total** | **12-18 hours** | **32 files** |

---

## Success Criteria (from spec.md)

Documentation is complete when:

- [ ] **SC-001**: New developer can locate any file's purpose within 5 minutes
- [ ] **SC-002**: Can add a translatable document type in 45 minutes following README
- [ ] **SC-003**: 100% of critical configuration sections have explanatory comments
- [ ] **SC-004**: 90% of team can explain 4/5 major plugins after reading docs
- [ ] **SC-005**: Onboarding time for new developer < 1 hour
- [ ] **SC-006**: Zero "what does this do?" questions about structure.ts helpers
- [ ] **SC-007**: All 5 common workflows documented with step-by-step instructions

---

## Notes

- Use jsdoc-templates.md as copy-paste reference for consistent formatting
- Focus on WHY code exists, not WHAT it does (code is self-documenting)
- Include real examples from codebase, not hypothetical scenarios
- Cross-reference related files (e.g., "See structure.ts:106-132 for details")
- Test IntelliSense in VSCode after adding JSDoc comments
- Keep README.md sections scannable with clear headings and bullet points
