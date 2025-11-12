# Feature Specification: De-duplicate i18n Records in Sanity Studio

**Feature Branch**: `003-dedup-studio-records`  
**Created**: 2025-11-11  
**Status**: Draft  
**Input**: User description: "Previously we added support for i18n to this next.js sanity turbo template. However, the existing Sanity studio UI/UX experience isn't the best yet for i18n documentation and there's a couple of improvements that I would like to make to the Sanity Studio editing UI. For example, since we've added support for multiple different locales, the document-internationalization plugin is creating a separate document per language, making it looks like there are duplicate records to the user. I think an improvement we can make here is simply de-duplicate the records being shown and only show the default language record. So for example in the list of pagesByPaths, instead of displaying 2 "Innovative Explicit Core" page, one for each language (EN / FR), we should only display the page for the default language page (FR in this case), the user will be able to switch to another language once they have the record opened anyway. For example this is ideally what the UI should look like, even when we have more than one language per record: [Image #1] . Currently, our UI is looking like this for records that has more than 1 language: [Image #2] (notice the 2 records "Innovative Explicit Core", one for each language). An example of the desired UI/UX setup could also be seen in the Site Configuration for the Navigation and Footer singleton records. When I click on the record, I'm taken directly to the main record which has the default language of the application. And if I want to view the English translation I can use the Translations badge at the top of the page. [Image #3]"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View De-duplicated Document Lists (Priority: P1)

As a content editor working with multi-language content, I need to see only one entry per content piece in document lists, so that I can quickly find and manage content without confusion from duplicate entries.

**Why this priority**: This is the core user need and directly addresses the primary pain point. Without this, editors are confused by seeing multiple versions of the same content, which degrades the content management experience and slows down their workflow.

**Independent Test**: Can be fully tested by navigating to any document list view (e.g., pagesByPaths) with multi-language documents and verifying that only default language versions appear, with no duplicates. Delivers immediate value by cleaning up the UI.

**Acceptance Scenarios**:

1. **Given** I have documents translated into multiple languages (EN and FR), **When** I view the document list in Studio, **Then** I see only one entry per content piece (the default language version)
2. **Given** I have a page titled "Innovative Explicit Core" in both EN and FR, **When** I navigate to the pages list, **Then** I see only one "Innovative Explicit Core" entry (the FR default language version)
3. **Given** I am viewing a document list with mixed single-language and multi-language documents, **When** I browse the list, **Then** all multi-language documents show only their default language version
4. **Given** multiple document types support i18n (pages, blogs, FAQs), **When** I view each type's list, **Then** each list shows only default language versions

---

### User Story 2 - Access All Language Versions from Document View (Priority: P1)

As a content editor, I need to easily switch between language versions when viewing a document, so that I can manage translations without navigating back to document lists.

**Why this priority**: This is essential for maintaining the translation workflow. P1 priority because without this capability, the de-duplication feature would block access to non-default language versions, breaking the translation workflow.

**Independent Test**: Can be fully tested by opening any document with translations and verifying the Translations badge/UI is visible and functional, allowing navigation between all language versions. Delivers value by maintaining the existing translation management capabilities.

**Acceptance Scenarios**:

1. **Given** I open a document that has multiple language versions, **When** the document loads, **Then** I see a Translations badge or UI element indicating available languages
2. **Given** I am viewing a document in the default language (FR), **When** I click the Translations badge, **Then** I can see and select other available languages (e.g., EN)
3. **Given** I switch to a non-default language version, **When** I view the document, **Then** I can switch back to the default language or to other translations
4. **Given** I am viewing a document with only one language version, **When** I look for translation controls, **Then** the UI clearly indicates no translations exist yet

---

### User Story 3 - Understand Translation Status at a Glance (Priority: P2)

As a content editor, I need to see which documents have translations and which languages are available, so that I can identify content that needs translation work.

**Why this priority**: While helpful for workflow management, this is secondary to the core de-duplication and translation access features. Editors can still work effectively without explicit translation indicators, though it improves efficiency.

**Independent Test**: Can be fully tested by viewing document lists and individual documents to verify translation status indicators are present and accurate. Delivers value by helping editors prioritize translation work.

**Acceptance Scenarios**:

1. **Given** I am viewing a document list, **When** I look at each entry, **Then** I can see an indicator showing whether translations exist (e.g., language flags, badge, or icon)
2. **Given** I open a document, **When** I view the translation UI, **Then** I can see which languages have complete translations and which are missing
3. **Given** a document has partial translations, **When** I view the document, **Then** I can identify which language versions exist
4. **Given** an orphaned translation exists (document only in non-default language), **When** I view the document list, **Then** I see the orphaned document with a prominent warning badge indicating the missing default language version

---

### Edge Cases

- ~~What happens when a document exists only in a non-default language (orphaned translation)?~~ **[REMOVED 2025-11-12]** - Orphaned translation detection removed, see spec 004
- What happens when the default language configuration is changed system-wide?
- How are documents without a language field handled in the filtering?
- What happens when a user creates a new document - which language does it default to?
- How does the system handle documents where the default language version has been deleted but translations remain?
- What happens in document search results - do they also show only default language versions?
- How are document references handled when they point to non-default language versions?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Studio MUST display only default language versions of i18n-enabled documents in all list views
- **FR-002**: Studio MUST show a Translations badge or UI element when an i18n-enabled document is opened
- **FR-003**: Users MUST be able to view and switch between all available language versions from within an opened document
- **FR-004**: Studio MUST maintain the ability to create new translations for existing documents
- **FR-005**: Studio MUST indicate which languages have translations available for a given document
- **FR-006**: Studio MUST filter document lists based on a document's language field matching the configured default language
- **FR-007**: Studio MUST display the list de-duplication behavior consistently across all document types that support i18n (pages, blogs, FAQs, etc.)
- **FR-008**: Users MUST be able to open a document from the list view and land on the default language version
- **FR-009**: Studio MUST preserve existing translation workflow functionality (creating, editing, deleting translations)
- **FR-010**: ~~Studio MUST display orphaned translations (documents that exist only in non-default languages) in document lists with a visible warning badge or indicator to alert editors of the missing default language version~~ **[REMOVED 2025-11-12]** - This requirement has been removed due to 60-80% false positive rate. See [spec 004-remove-orphaned-badge](../004-remove-orphaned-badge/spec.md) for details on the removal and investigation findings.

### Key Entities

- **Translatable Document**: Any document type that includes a language field and supports i18n (pages, blogs, FAQs, navigation, footer, etc.). Has a language code, title/name, and translation relationships
- **Language Version**: A specific language variant of a translatable document, identified by its language code (e.g., "en", "fr")
- **Default Language**: The primary language configured for the application (currently FR), used as the canonical version shown in lists
- **Translation Set**: A group of related documents representing the same content in different languages, linked through the document-internationalization plugin

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Content editors see exactly one entry per content piece in all document lists, regardless of the number of language versions
- **SC-002**: Content editors can access all language versions of a document within 2 clicks from any list view (click to open, click translation badge)
- **SC-003**: Zero duplicate entries appear in document lists for multi-language content
- **SC-004**: Translation workflow remains fully functional - editors can create, edit, view, and delete translations with the same or better efficiency as before
- **SC-005**: Content editors report reduced confusion and faster document location when surveyed about the UI improvement
- **SC-006**: Time to locate and open a specific document decreases by at least 30% when multiple languages are present

## Assumptions

- The default language for the application is configured and consistent (currently FR based on the user description)
- The document-internationalization plugin is already properly configured and functioning
- All i18n-enabled documents have a language field that correctly identifies their language
- The Translations badge/UI component already exists for singleton documents (Navigation, Footer) and can be applied to other document types
- Users understand that clicking on a document from the list will open the default language version
- The filtering logic will not impact Studio performance significantly

## Dependencies

- Existing document-internationalization plugin configuration
- Current implementation of the Translations badge UI for singleton records
- Studio's document list rendering system must support filtering logic
- Language field must be present and populated on all i18n-enabled documents

## Out of Scope

- Changing the default language for the application
- Modifying the underlying document-internationalization plugin behavior
- Creating new translation management features beyond what already exists
- Adding bulk translation operations
- Implementing translation progress tracking or workflow management
- Changing how translations are created or stored at the data level
- Modifying the web frontend's i18n behavior (this is Studio-only)
