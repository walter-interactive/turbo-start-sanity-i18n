# Feature Specification: Remove Orphaned Translation Badge

**Feature Branch**: `004-remove-orphaned-badge`  
**Created**: 2025-11-12  
**Status**: Draft  
**Input**: User description: "The logic behind the orphaned translation badge is currently too simplistic and provide misleading information. We need to remove it and any logic associated with it. There's also more context in specs/issues/003-T058-orphaned-badge-investigation.md as well."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Content Editor Views Document Lists Without False Warnings (Priority: P1)

As a content editor managing multilingual content in Sanity Studio, I need to view document lists (pages, blogs, FAQs) without seeing misleading "orphaned translation" warnings so that I can trust the information displayed and make informed content decisions.

**Why this priority**: This is the core issue causing confusion. Content editors currently see false warnings on 60-80% of non-default language documents, leading to distrust of the system and wasted time investigating non-issues.

**Independent Test**: Can be fully tested by viewing any document list containing non-default language documents (EN) and verifying that no orphaned translation badges appear, delivering immediate value by eliminating false warnings.

**Acceptance Scenarios**:

1. **Given** I am viewing the Pages list in Sanity Studio, **When** I see a document in English that has both French and English versions, **Then** I see no "orphaned translation" warning badge in the document preview
2. **Given** I am viewing the Blogs list in Sanity Studio, **When** I see any non-default language document, **Then** the document preview shows only accurate status indicators (visibility and page builder status)
3. **Given** I am viewing the FAQs list in Sanity Studio, **When** I see any document preview subtitle, **Then** it displays only the status emoji, builder emoji, and slug without any orphaned translation text

---

### User Story 2 - Cleaner Document Preview Interface (Priority: P2)

As a content editor, I need document preview subtitles to be concise and free from technical jargon so that I can quickly scan document lists and focus on relevant information.

**Why this priority**: Removing the orphaned badge logic simplifies the interface and reduces visual clutter, but is secondary to eliminating false warnings.

**Independent Test**: Can be tested by comparing document preview subtitle lengths and readability before and after removal, ensuring subtitles contain only essential information.

**Acceptance Scenarios**:

1. **Given** I am viewing any translatable document type in Sanity Studio, **When** I look at the document preview subtitle, **Then** I see a clean format showing visibility status, page builder status, and slug without orphaned translation text
2. **Given** I am comparing preview subtitles across different language versions, **When** I view both default and non-default language documents, **Then** the subtitle format is consistent without special warnings for non-default languages

---

### User Story 3 - System Operates Without Unused Badge Component (Priority: P3)

As a system maintaining code quality, I need unused components and logic removed from the codebase so that the application remains maintainable and free from dead code.

**Why this priority**: Code cleanup is important for maintainability but does not directly impact user experience, making it lower priority than user-facing improvements.

**Independent Test**: Can be tested by verifying that the orphaned translation badge component file is removed and no references to it remain in the codebase.

**Acceptance Scenarios**:

1. **Given** the orphaned badge feature has been removed, **When** a code audit is performed, **Then** the `orphaned-translation-badge.tsx` component file no longer exists in the repository
2. **Given** the orphaned badge logic has been removed, **When** document schema preview functions are reviewed, **Then** no references to `isOrphaned` variables or orphaned translation logic exist in page.ts, blog.ts, or faq.ts

---

### Edge Cases

- What happens when a document truly has no default language version? (Users will need to manually check via the Translations badge)
- How does the system handle documents created before the removal? (Preview displays will update automatically on next view)
- What if editors need to identify orphaned translations in the future? (They must use the Translations badge or implement a separate validation tool outside the preview system)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST remove the "orphaned translation" badge and warning text from all document list preview subtitles (pages, blogs, FAQs)
- **FR-002**: System MUST remove the `isOrphaned` variable and associated logic from preview.prepare() functions in page.ts, blog.ts, and faq.ts schema files
- **FR-003**: System MUST remove the `language` field from preview.select objects in document schemas where it is only used for orphaned detection
- **FR-004**: System MUST delete the unused `orphaned-translation-badge.tsx` component file from the codebase
- **FR-005**: System MUST maintain existing document preview functionality for visibility status (private/public indicator), page builder status, and slug display
- **FR-006**: System MUST continue to support the Translations badge feature for viewing and managing document language versions

### Key Entities *(include if feature involves data)*

- **Document Schemas (page, blog, faq)**: Sanity schema definitions that control how documents are displayed in Studio lists, containing preview configuration with select and prepare functions
- **Preview Configuration**: Schema-level configuration defining which fields to display in document list views, including title, subtitle, and media

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Content editors no longer see false "orphaned translation" warnings on document list views (100% elimination of false positives)
- **SC-002**: Document preview subtitles are shorter and more readable without orphaned translation text (average subtitle length reduced by 15-20 characters for non-default language documents)
- **SC-003**: All document list views (pages, blogs, FAQs) display consistent preview formats regardless of document language
- **SC-004**: Codebase contains no orphaned translation detection logic or unused badge components (verified by code search returning zero results for "isOrphaned" and "orphaned-translation-badge")

## Assumptions *(mandatory)*

1. **No Alternative Implementation**: We assume that accurate orphaned detection cannot be implemented within Sanity's preview.prepare() system due to architectural constraints (synchronous-only, no async queries)
2. **Manual Verification Acceptable**: We assume content editors can manually verify translation status using the existing Translations badge feature when needed
3. **No Breaking Changes**: We assume removing this feature will not break existing workflows since it was producing misleading information
4. **Future Enhancement Path**: We assume that if accurate orphaned detection becomes critical, it will be implemented as a separate feature (custom plugin, validation tool, or admin script) outside the preview system

## Out of Scope

- Implementing alternative orphaned translation detection mechanisms (custom plugins, validation tools, or admin scripts)
- Modifying the Translations badge feature or translation metadata system
- Changes to translation workflow or editor training materials
- Performance optimization of document list views beyond removal of orphaned logic
- Adding new status indicators or badges to document previews

## Dependencies

- **Sanity Studio**: Changes affect Sanity Studio schema files and component structure
- **Document Schemas**: Modifications to page.ts, blog.ts, and faq.ts schema definitions
- **Original Spec (003)**: This removal addresses issues identified in spec 003-dedup-studio-records which originally introduced the orphaned badge feature

## Related Documentation

- Investigation: specs/issues/003-T058-orphaned-badge-investigation.md (detailed root cause analysis)
- Original Specification: specs/003-dedup-studio-records/spec.md (FR-010 requirement being removed)
- Affected Files Documentation:
  - apps/studio/schemaTypes/documents/page.ts:68-92 (preview configuration)
  - apps/studio/schemaTypes/documents/blog.ts (similar pattern)
  - apps/studio/schemaTypes/documents/faq.ts (similar pattern)
  - apps/studio/components/orphaned-translation-badge.tsx (unused component)
