# Feature Specification: Remove Roboto Studio Branding

**Feature Branch**: `002-remove-roboto-branding`  
**Created**: Tue Nov 11 2025  
**Status**: Draft  
**Input**: User description: "We previously built this template on top of the fine work of the folks from roboto studio (the original template was robotostudio/turbo-start-sanity). We took their work and updated the template with additional i18n integration in order to fit our use case of a bilingual agency in Quebec Canada. That being said, now that the i18n integration is complete, we need to remove any reference or branding from Roboto Studio and make this repository our own, only providing original work credit and attribution in the README.md file."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Repository Ownership and Branding Clarity (Priority: P1)

As a team member or external contributor viewing this repository, I need to immediately understand that this is our own template (not Roboto Studio's) so that I can identify the proper ownership, contact points, and project direction.

**Why this priority**: This is the most critical change because it establishes clear ownership and prevents confusion about who maintains and controls the repository. It affects all stakeholders immediately upon viewing the project.

**Independent Test**: Can be fully tested by reviewing all documentation files (README, CONTRIBUTING, CODE_OF_CONDUCT, etc.) and verifying they reflect the new ownership without Roboto Studio branding, while still maintaining attribution in the designated section.

**Acceptance Scenarios**:

1. **Given** a developer views the README.md file, **When** they read the title and introduction, **Then** they see our template name and ownership without Roboto Studio branding
2. **Given** a contributor reads the repository documentation, **When** they look for contact information or project ownership, **Then** they find our organization's information, not Roboto Studio's
3. **Given** someone reviews the README.md, **When** they scroll to the attribution/credits section, **Then** they see proper acknowledgment of Roboto Studio's original template with a link to robotostudio/turbo-start-sanity

---

### User Story 2 - Clean Codebase Identity (Priority: P2)

As a developer working in the codebase, I need to see our own branding in code comments, package metadata, and configuration files so that the technical artifacts reflect our ownership and don't create confusion about the source or maintenance responsibility.

**Why this priority**: While less immediately visible than documentation, code-level branding affects daily development work and package identity. Developers shouldn't see references to another organization when working in what is now our template.

**Independent Test**: Can be tested independently by searching the entire codebase for "roboto", "robotostudio", and related terms, then verifying that only the README attribution section contains these references.

**Acceptance Scenarios**:

1. **Given** a developer searches the codebase for "roboto" (case-insensitive), **When** the search completes, **Then** the only results are in the README.md attribution section
2. **Given** a developer views package.json files, **When** they check the name, description, author, or repository fields, **Then** they see our organization's information, not Roboto Studio's
3. **Given** someone reviews code comments throughout the repository, **When** they read explanatory comments or file headers, **Then** they don't encounter Roboto Studio attribution or branding

---

### User Story 3 - Asset and Visual Identity Cleanup (Priority: P3)

As a stakeholder viewing the repository, I need to ensure that any images, logos, screenshots, or other visual assets reflect our branding (or are neutral) so that the visual identity is consistent with our ownership.

**Why this priority**: Visual assets are important for branding but typically less critical than documentation and code. They may not exist in all cases, making this the lowest priority.

**Independent Test**: Can be tested by reviewing all image files, checking for any Roboto Studio logos, watermarks, or branded screenshots, and verifying they are replaced or removed.

**Acceptance Scenarios**:

1. **Given** the repository contains image assets, **When** each image is reviewed, **Then** none contain Roboto Studio logos, watermarks, or branding elements
2. **Given** the repository has example screenshots, **When** these are displayed in documentation, **Then** they show neutral or our own branding
3. **Given** the repository has an OG image (turbo-start-sanity-og.png), **When** the file is examined, **Then** it either reflects our branding or is a neutral template image

---

### Edge Cases

- What happens if Roboto Studio is mentioned in git commit history or tags? (Answer: Git history is immutable and should remain as-is for historical accuracy; only current/future-facing content needs updating)
- How do we handle dependencies or packages that were created by Roboto Studio? (Answer: Package dependencies should remain unchanged; only project metadata and branding need updating)
- What if there are URLs pointing to Roboto Studio's repository? (Answer: External URLs in documentation should be updated to point to our repository, except in the attribution section where the original source link is appropriate)
- What about existing issues or pull requests mentioning Roboto Studio? (Answer: Historical issues/PRs should remain unchanged; only templates for new issues/PRs need updating)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All documentation files (README.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, LICENSE) MUST be reviewed and updated to remove Roboto Studio branding while establishing our ownership
- **FR-002**: README.md MUST include a dedicated attribution section that acknowledges Roboto Studio's original work with a link to the robotostudio/turbo-start-sanity repository
- **FR-003**: All package.json files MUST be updated to reflect our organization's information in the name, description, author, repository, and homepage fields
- **FR-004**: All code comments referencing Roboto Studio or their branding MUST be removed or updated to reflect current ownership
- **FR-005**: All configuration files (including .vscode, .github, .specify, and other dotfiles) MUST be reviewed for Roboto Studio references and updated accordingly
- **FR-006**: Any image assets, logos, or screenshots containing Roboto Studio branding MUST be replaced with neutral or our own branded assets
- **FR-007**: Repository-wide search for "roboto", "robotostudio" (case-insensitive) MUST return results only in the README.md attribution section
- **FR-008**: All functionality MUST remain intact after rebranding changes (no breaking changes to dependencies, imports, or runtime behavior)
- **FR-009**: Git repository remote URLs and configurations MUST be updated if they still point to Roboto Studio's repository
- **FR-010**: Issue and pull request templates MUST be reviewed and updated to remove Roboto Studio references

### Key Entities

This feature primarily involves content and metadata updates rather than data entities. Key artifacts affected include:

- **Documentation Files**: README, CONTRIBUTING, LICENSE, CODE_OF_CONDUCT, SECURITY, and any markdown files in the repository root or docs folders
- **Package Metadata**: package.json files across the monorepo (root, apps/studio, apps/web, packages/*)
- **Configuration Files**: .vscode/settings.json, .github workflows, .specify configuration, and other dotfiles
- **Visual Assets**: Images, logos, screenshots, and OG images that may contain branding
- **Code Comments**: File headers, attribution comments, and explanatory text within source files

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Repository-wide search for "roboto" or "robotostudio" (case-insensitive, excluding git history) returns results only in the README.md attribution section
- **SC-002**: All documentation files reference our organization as the template owner within the first 3 paragraphs
- **SC-003**: README.md contains a clearly labeled "Credits" or "Attribution" section with a link to robotostudio/turbo-start-sanity repository
- **SC-004**: All package.json files across the monorepo contain our organization's information (0% still reference Roboto Studio)
- **SC-005**: Existing test suite (if any) passes with 100% success rate after all branding changes are applied
- **SC-006**: Build process completes successfully for all packages (web, studio, ui) without errors after changes
- **SC-007**: Visual review of all markdown files confirms no Roboto Studio branding appears in headings, titles, or body text (excluding attribution section)
- **SC-008**: All hyperlinks in documentation point to our repository and resources, except for the attribution link to the original Roboto Studio template

## Assumptions

- The current repository already has functional code and the i18n integration work is complete
- We have permission to modify all files in the repository (proper access controls)
- The LICENSE file allows us to fork and rebrand the original work (open source license)
- The team has decided on what our own branding/name should be (or will use a neutral name)
- Git history will remain unchanged as it reflects accurate historical development
- External dependencies and package imports do not need to change (only project metadata)
- The repository is not yet publicly released under the new branding (or if it is, we have a plan for communicating the change)

## Dependencies

- Access to repository with write permissions
- Agreed-upon new name/branding for the template (if not already decided)
- Review of LICENSE file to ensure rebranding is permitted under the original license terms

## Out of Scope

- Changing git commit history or rebasing to remove historical references
- Modifying third-party packages or dependencies created by Roboto Studio
- Updating external websites or documentation not in this repository
- Creating entirely new branding assets if they don't currently exist (we'll use neutral/placeholder assets)
- Notifying Roboto Studio of the fork (unless required by license)
- Changing the fundamental architecture or functionality of the template (only branding/metadata changes)
