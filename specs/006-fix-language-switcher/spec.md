# Feature Specification: Fix Language Switcher Translation Navigation

**Feature Branch**: `006-fix-language-switcher`
**Created**: 2025-11-13
**Status**: Draft
**Input**: User description: "Implementation Plan: Fix Language Switcher Translation Navigation

Fix the language switcher to navigate to the correct translated slug (e.g., /fr/blog/abc → /en/blog/xyz) instead of keeping the same slug. Following the conciliainc.com pattern with adaptations for next-intl."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate to Translated Version of Current Page (Priority: P1)

A website visitor is reading a blog post in French at `/fr/blog/guide-complet` and wants to switch to English. They click the language switcher and expect to be taken to the English version at `/en/blog/complete-guide`, not to a 404 page at `/en/blog/guide-complet`.

**Why this priority**: This is the core value proposition of the feature. Without this, users cannot successfully navigate between language versions of content, resulting in a broken user experience and high bounce rates.

**Independent Test**: Can be fully tested by creating a document with translations in multiple languages, navigating to one language version, and clicking the language switcher. Success means arriving at the correct translated slug with content in the target language.

**Acceptance Scenarios**:

1. **Given** a user is on `/fr/blog/guide-complet`, **When** they switch to English via the language switcher, **Then** they are navigated to `/en/blog/complete-guide` with English content displayed
2. **Given** a user is on `/en/about-us`, **When** they switch to French via the language switcher, **Then** they are navigated to `/fr/a-propos` with French content displayed
3. **Given** a user switches languages multiple times (FR → EN → FR), **When** they complete the round-trip, **Then** they return to the original French slug without data loss
4. **Given** a user is on the homepage in one language, **When** they switch languages, **Then** they are taken to the homepage in the target language

---

### User Story 2 - Handle Missing Translations Gracefully (Priority: P2)

A website visitor is viewing a newly published blog post that only exists in French. When they try to switch to English (where no translation exists yet), the system should provide clear feedback rather than navigating to a broken page.

**Why this priority**: While less common than successful translations (P1), this scenario will occur during content creation workflows. Proper error handling prevents user confusion and maintains trust in the language switcher.

**Independent Test**: Can be tested by creating a document in only one language, attempting to switch to a language without a translation, and verifying appropriate error handling occurs (e.g., disabled switcher option, 404 page, or fallback message).

**Acceptance Scenarios**:

1. **Given** a blog post exists only in French, **When** a user attempts to switch to English, **Then** the system shows a 404 page with a message indicating the content is not available in English
2. **Given** a user is on a page with missing translations, **When** they view the language switcher dropdown, **Then** language options without translations are still selectable but lead to 404 pages (per user requirement)
3. **Given** a user encounters a 404 for missing translation, **When** they view the error page, **Then** they see options to return to the previous language or navigate to the homepage

---

### User Story 3 - Performance: Fast Language Switching (Priority: P3)

A website visitor frequently switches between languages to compare content. The language switcher should respond instantly without network delays or loading states that interrupt their workflow.

**Why this priority**: This is a performance enhancement that improves user satisfaction but doesn't block core functionality. The feature works correctly even if slower, but fast switching creates a premium experience.

**Independent Test**: Can be tested by measuring the time from clicking the language switcher to seeing content in the target language. Success means sub-200ms navigation using pre-loaded translation mappings.

**Acceptance Scenarios**:

1. **Given** all translation mappings are loaded at app startup, **When** a user switches languages, **Then** navigation begins within 200ms without additional network requests
2. **Given** a user navigates between multiple pages, **When** they switch languages on any page, **Then** the lookup time remains constant (no degradation as mapping grows)
3. **Given** translation data is fetched at app startup, **When** the app initializes, **Then** the initial page load time increases by less than 100ms

---

### Edge Cases

- What happens when a document type doesn't have translations (e.g., settings pages, navbar configurations)?
- How does the system handle URL parameters or hash fragments during language switching?
- What happens if the translation metadata is corrupted or missing in Sanity?
- How does the system behave when switching languages on dynamically generated pages (e.g., search results)?
- What happens when a user switches languages while on a 404 page?
- How does the system handle documents with circular translation references or orphaned translations?
- What happens if multiple documents in different languages claim to be translations of each other (data consistency issue)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST fetch all localized documents (pages, blogs, homePage, blogIndex) with their translation metadata at application startup in the root layout
- **FR-002**: System MUST create a lookup map that indexes documents by their current pathname (including locale prefix and document type prefix)
- **FR-003**: System MUST provide a context provider that makes the locale mapping accessible to all client components throughout the application
- **FR-004**: Language switcher component MUST look up the current page's translations using the pathname from the locale mapping
- **FR-005**: Language switcher component MUST navigate to the translated document's slug (not the current slug) when a new language is selected
- **FR-006**: System MUST handle URL prefixes correctly for different document types (e.g., `/blog/` prefix for blog posts, no prefix for pages)
- **FR-007**: System MUST preserve the target locale in the URL after navigation using next-intl's locale-aware routing
- **FR-008**: System MUST show a 404 page when a user attempts to switch to a language that has no translation for the current document
- **FR-009**: System MUST maintain round-trip consistency (switching FR → EN → FR returns to original French slug)
- **FR-010**: System MUST use next-intl's `<Link>` component for navigation to ensure proper locale handling
- **FR-011**: System MUST track language switch events in analytics with source locale, target locale, and pathname
- **FR-012**: System MUST handle the homepage translation separately as it has no slug parameter

### Key Entities *(include if feature involves data)*

- **LocaleMapping**: A lookup table that maps pathnames (with locale prefix) to translation objects containing slugs and metadata for all available language versions of a document
- **Translation Object**: Contains document ID, document type, language code, slug, and title for a specific language version of a document
- **Localized Document**: Any Sanity document type that supports internationalization (page, blog, homePage, blogIndex) with a language field and translation metadata

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully navigate from any language version to its translated equivalent in under 1 second (measured from click to page render)
- **SC-002**: Round-trip language switching (e.g., FR → EN → FR) returns users to the exact same URL they started with 100% of the time
- **SC-003**: Language switching has a 0% error rate for documents with existing translations (no unexpected 404s)
- **SC-004**: Initial application load time increases by less than 150ms due to translation mapping generation
- **SC-005**: 95% of users who switch languages complete the action successfully without encountering errors (tracked via analytics)
- **SC-006**: The system correctly handles 100% of document types with internationalization (pages, blogs, homePage, blogIndex) without manual configuration per type
- **SC-007**: Language switch analytics events are tracked with 100% accuracy, providing complete visibility into user language preferences and behavior

## Assumptions

- The conciliainc.com implementation pattern of fetching all translations at startup is appropriate for this application's content volume (assumed to be under 1000 localized documents)
- All localizable document types in Sanity follow the same translation metadata structure provided by @sanity/document-internationalization plugin
- The next-intl library's `<Link>` component properly handles locale-aware navigation and cookie management
- The existing `translationsFragment` GROQ query correctly resolves all translation metadata without modification
- Document type URL prefixes are consistent and predictable (e.g., blogs always use `/blog/`, pages have no prefix)
- Analytics tracking is already configured and the `analytics.trackLanguageSwitch()` function exists or will be created
- Users prefer receiving a 404 error over being redirected to a fallback language when translations don't exist (per user requirement)
- The application uses server-side rendering (SSR) or static site generation (SSG), allowing translation data to be fetched in the root layout
- Network latency for fetching translation mappings at startup is acceptable for the user's hosting environment

## Out of Scope

- Automatic translation of content (this feature only handles navigation between existing translations)
- Creating or managing translations in Sanity Studio (assumes translations are created separately)
- Language detection based on user's browser preferences or geolocation
- Showing translation completion status or indicating which languages have translations available before clicking the switcher
- Implementing a fallback language strategy (e.g., showing English content if French doesn't exist)
- Optimizing the translation mapping for very large sites (>10,000 localized documents) with lazy loading or pagination
- Handling translations for non-page document types (e.g., authors, FAQs, settings)
- Persisting user's language preference across sessions beyond next-intl's built-in cookie management
- Adding visual indicators in the language switcher to show which languages have translations for the current page
