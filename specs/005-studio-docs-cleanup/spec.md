# Feature Specification: Studio Documentation & Code Organization

**Feature Branch**: `005-studio-docs-cleanup`  
**Created**: 2025-11-12  
**Status**: Draft  
**Input**: User description: "I want to cleanup the apps/studio side of the code base to prepare it for hand-off to my dev team. My team isn't very familiar with Sanity Studio or Next.js, so I would like to find an intuitive way to organize the code + provide more detailed documentation in both markdown files and code comments explaining very clearly what the code is doing and why because Sanity Studio setup isn't the most intuitive, especially their config in sanity.config.ts and structure.ts with usage of multiple different, critical plugins working in tandem like the documentInternationalization or orderableDocumentList, ...etc. I think we should also update the README.md in apps/studio as well to provide better documentation of the codebase structure once we've reorganized it."

## User Scenarios & Testing

### User Story 1 - Onboarding New Developer (Priority: P1)

A new developer joins the team with limited Sanity Studio experience. They need to quickly understand the codebase structure, how critical plugins work together, and where to make common changes without extensive hand-holding.

**Why this priority**: This is the primary driver for the entire feature - enabling team handoff. Without clear documentation and organization, the team cannot effectively maintain the studio.

**Independent Test**: New developer can read the updated README, understand the codebase structure, locate key configuration files, and explain the purpose of each major plugin within 30 minutes of reading the documentation.

**Acceptance Scenarios**:

1. **Given** a new developer reads the updated README, **When** they need to understand what each plugin does, **Then** they can find clear explanations of documentInternationalization, orderableDocumentList, and other critical plugins with examples of their usage
2. **Given** a developer needs to modify studio configuration, **When** they open sanity.config.ts, **Then** they find inline comments explaining why each plugin is configured the way it is
3. **Given** a developer wants to understand content structure organization, **When** they open structure.ts, **Then** they find clear comments explaining the logic behind each section and helper function

---

### User Story 2 - Adding New Translatable Document Type (Priority: P2)

A developer needs to add a new document type that supports internationalization (e.g., "Service Pages"). They should be able to follow clear, step-by-step documentation without consulting external resources or the original developer.

**Why this priority**: Adding new content types is a common task that will happen frequently as the project grows. This should be self-service for the team.

**Independent Test**: Developer can add a new translatable document type by following documentation alone, including schema creation, plugin registration, structure configuration, and type generation, without errors or missing steps.

**Acceptance Scenarios**:

1. **Given** a developer wants to add a new document type, **When** they consult the documentation, **Then** they find a complete checklist covering schema creation, language field addition, plugin registration, structure.ts updates, and type regeneration
2. **Given** a developer has added the schema and plugin config, **When** they check their work, **Then** the documentation includes validation steps to verify the setup is correct
3. **Given** a developer encounters issues, **When** they refer to the troubleshooting guide, **Then** they find solutions for common problems like missing translation actions or orderRank field issues

---

### User Story 3 - Understanding Code Organization (Priority: P1)

A developer needs to locate where specific functionality lives (e.g., custom components, hooks, utilities, migrations) without searching through the entire codebase or asking questions.

**Why this priority**: Clear organization directly impacts developer productivity and reduces cognitive load. This is foundational for all other tasks.

**Independent Test**: Developer can answer "where should I put [X]?" questions by consulting the README's architecture section, with 90% accuracy for common scenarios (components, utilities, schemas, migrations, etc.).

**Acceptance Scenarios**:

1. **Given** a developer needs to create a custom field component, **When** they consult the README, **Then** they find clear guidance on where to place it (components/ directory) with examples of existing components
2. **Given** a developer wants to add a reusable utility function, **When** they check the documentation, **Then** they understand the difference between utils/ helpers and when to use each
3. **Given** a developer needs to create a data migration, **When** they refer to the migration guide, **Then** they find step-by-step instructions with actual examples from the codebase

---

### User Story 4 - Modifying Studio Structure (Priority: P2)

A developer needs to reorganize the Studio sidebar (e.g., group related content types, change ordering, add new sections) by modifying structure.ts with confidence.

**Why this priority**: Studio structure customization is required whenever content strategy changes. Developers must understand how the structure builder pattern works.

**Independent Test**: Developer can add a new grouped section to the sidebar by following structure.ts comments and README examples, resulting in correctly organized and filtered content.

**Acceptance Scenarios**:

1. **Given** a developer wants to add a new content group, **When** they study structure.ts, **Then** they find documented examples of createSingleTon, createList, and createIndexListWithOrderableItems with clear explanations
2. **Given** a developer needs to apply language filtering, **When** they add a new list item, **Then** the inline comments explain why and how to use the DEFAULT_LOCALE filter pattern
3. **Given** a developer modifies the structure, **When** they test in Studio, **Then** the documentation includes testing checklist items to verify correct behavior

---

### User Story 5 - Plugin Configuration Understanding (Priority: P3)

A developer needs to understand how multiple plugins (documentInternationalization, orderableDocumentList, presentationTool, etc.) work together and why each is necessary.

**Why this priority**: While less frequent than other tasks, understanding the plugin ecosystem prevents accidental breaking changes and enables informed decision-making when adding new plugins.

**Independent Test**: Developer can explain the purpose of each plugin in sanity.config.ts and describe how they interact (e.g., how documentInternationalization affects structure.ts filtering).

**Acceptance Scenarios**:

1. **Given** a developer reviews sanity.config.ts, **When** they read the plugin configuration section, **Then** each plugin has a comment block explaining its purpose, key configuration options, and dependencies
2. **Given** a developer wants to understand plugin interactions, **When** they consult the README, **Then** they find a "Plugin Ecosystem" section explaining how documentInternationalization requires language field + structure.ts filtering
3. **Given** a developer considers adding a new plugin, **When** they check the documentation, **Then** they find guidelines for evaluating plugin compatibility and configuration patterns

---

### Edge Cases

- What happens when a developer skips a step in the "add new document type" checklist? (Documentation should include validation steps that catch common omissions)
- How does the team handle documentation drift as code evolves? (Include guidance on when/how to update documentation)
- What if a developer needs to understand legacy code that predates the new organization? (Include migration notes explaining what changed and why)
- How do developers find answers when documentation doesn't cover their specific case? (Include "Getting Help" section with escalation paths)

## Requirements

### Functional Requirements

- **FR-001**: Documentation MUST provide a clear visual or textual representation of the apps/studio directory structure with explanations for each major directory and file
- **FR-002**: sanity.config.ts MUST include inline comments explaining the purpose of each plugin, critical configuration options, and why specific values were chosen
- **FR-003**: structure.ts MUST include inline comments explaining the structure builder pattern, helper functions (createSingleTon, createList, createIndexListWithOrderableItems), and language filtering logic
- **FR-004**: README.md MUST include an "Architecture Overview" section explaining the overall organization of schemas, components, hooks, utilities, and configuration files
- **FR-005**: README.md MUST include a "Plugin Ecosystem" section documenting each plugin's purpose, configuration, and how plugins interact with each other
- **FR-006**: Documentation MUST provide step-by-step guides for common tasks including: adding a new translatable document type, adding a singleton document, creating custom field components, and modifying structure.ts
- **FR-007**: Code organization MUST follow a logical, intuitive structure where related files are grouped together and naming conventions are consistent
- **FR-008**: Each schema file (documents/, blocks/, definitions/) MUST include header comments explaining the schema's purpose and usage examples
- **FR-009**: Critical utility functions (slug-validation.ts, helper.ts, types.ts) MUST include JSDoc comments explaining parameters, return values, and usage examples
- **FR-010**: README.md MUST include a troubleshooting section covering common issues specific to the studio's multi-plugin setup
- **FR-011**: Documentation MUST explain the relationship between studio configuration and frontend implementation (how language filtering affects queries, how orderRank affects ordering, etc.)
- **FR-012**: Each plugin configuration in sanity.config.ts MUST link to official documentation and explain project-specific customizations

### Key Entities

- **Documentation Files**: README.md (main), inline code comments, schema documentation
- **Configuration Files**: sanity.config.ts, structure.ts, sanity-typegen.json
- **Directory Structure**: schemaTypes/, components/, hooks/, utils/, migrations/, plugins/
- **Plugins**: documentInternationalization, orderableDocumentList, structureTool, presentationTool, media, iconPicker, assist, visionTool, unsplashImageAsset
- **Helper Functions**: createSingleTon, createList, createIndexListWithOrderableItems, getTitleCase
- **Schema Categories**: documents (content types), blocks (page builder blocks), definitions (reusable field groups)

## Success Criteria

### Measurable Outcomes

- **SC-001**: New developer can locate and understand the purpose of any file in apps/studio by consulting the README directory structure documentation within 5 minutes
- **SC-002**: New developer can successfully add a new translatable document type following documentation alone, with zero errors or missing steps, within 45 minutes
- **SC-003**: Code review of sanity.config.ts and structure.ts shows that 100% of critical configuration sections have explanatory comments
- **SC-004**: Developer survey shows 90% can explain the purpose of at least 4 out of 5 major plugins (documentInternationalization, orderableDocumentList, structureTool, presentationTool, media) after reading documentation
- **SC-005**: Time to onboard new developer to basic studio maintenance tasks reduces from estimated 2-4 hours to under 1 hour
- **SC-006**: Support questions about studio setup from team members decrease by at least 80% after documentation implementation
- **SC-007**: README.md includes at least 3 step-by-step guides for common tasks, each taking less than 10 minutes to read and understand

## Assumptions

- The current directory structure (schemaTypes/, components/, hooks/, utils/, migrations/) is generally sound and doesn't require major reorganization, only documentation
- The team has basic understanding of TypeScript and general CMS concepts
- Developers have access to Sanity's official documentation for deep-dive learning beyond the project-specific documentation
- The README.md will be the primary entry point for documentation, with inline comments serving as contextual references
- The current plugin stack is stable and won't require major changes during the handoff period
- Documentation will be written in English
- The team uses VSCode or similar editors that support JSDoc comment highlighting and IntelliSense

## Out of Scope

- Restructuring the directory organization beyond renaming or minor file moves for clarity
- Creating video tutorials or interactive documentation
- Generating automated documentation from code (e.g., TypeDoc)
- Translating documentation into multiple languages
- Creating documentation for the apps/web frontend (separate feature)
- Rewriting existing code for clarity (only adding comments and documentation)
- Setting up automated documentation validation or linting
- Creating a separate documentation website or wiki
- Training sessions or live onboarding workshops

## Dependencies

- No external dependencies - this is purely documentation and code comment work
- Requires understanding of existing codebase functionality (already in place)
- May reference official Sanity documentation for plugin details

## Risks & Mitigations

**Risk**: Documentation becomes outdated as code evolves  
**Mitigation**: Include "last updated" dates and clear ownership. Add documentation update reminder to code review checklist.

**Risk**: Too much documentation makes it overwhelming to read  
**Mitigation**: Use progressive disclosure - README provides overview and navigation, inline comments provide deep detail. Use clear section headers and table of contents.

**Risk**: Developers skip documentation and ask questions anyway  
**Mitigation**: Make documentation easily discoverable. Include quick-reference checklists for common tasks. Ensure documentation is searchable (Cmd+F friendly).

**Risk**: Documentation doesn't match actual usage patterns  
**Mitigation**: Review with at least one developer unfamiliar with Sanity to validate clarity and completeness before handoff.
