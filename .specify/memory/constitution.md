<!--
Sync Impact Report:
Version: 1.0.0 (initial version)
Modified Principles: N/A (initial creation)
Added Sections:
  - 7 core principles established
  - Development Workflow section
  - Quality Gates section
  - Governance rules
Templates Status:
  ✅ plan-template.md - Constitution Check section compatible
  ✅ spec-template.md - User scenarios and requirements align with principles
  ✅ tasks-template.md - Task structure supports principle-driven organization
Follow-up TODOs: None
-->

# Turbo-Start-Sanity-I18n Monorepo Constitution

## Core Principles

### I. Monorepo Structure & Boundaries

All applications and packages MUST maintain clear boundaries within the TurboRepo monorepo structure. Each workspace (apps/web, apps/studio, packages/*) MUST be independently buildable and testable. Shared code MUST be extracted to workspace packages with explicit dependencies declared in package.json. Cross-workspace imports MUST go through published workspace packages, never direct file references.

**Rationale**: Clear boundaries prevent circular dependencies, enable parallel development, and allow independent deployment of applications. This structure scales as the monorepo grows and maintains build performance through TurboRepo's caching.

### II. TypeScript Strict Mode & Type Safety

TypeScript MUST be configured with strict mode enabled across all workspaces. The `any` type is PROHIBITED except in explicitly justified cases documented with inline comments explaining the necessity. All public APIs, component props, function signatures, and data models MUST have comprehensive type definitions. Type assertions (`as`) MUST include comments justifying their safety.

**Rationale**: Type safety prevents runtime errors, improves IDE support, enables confident refactoring, and serves as inline documentation. Strict typing catches errors at compile time rather than in production.

### III. Test Coverage (MANDATORY)

All features MUST have corresponding tests before the feature is considered complete. Tests MUST cover:
- Unit tests for business logic and utility functions
- Integration tests for component interactions and API endpoints
- Contract tests for API boundaries between frontend and backend
- End-to-end tests for critical user journeys (where applicable)

Test coverage thresholds MUST be maintained at minimum 80% for critical business logic. Tests MAY be written during or alongside implementation, but features are NOT considered complete without tests.

**Rationale**: Comprehensive test coverage ensures reliability, enables safe refactoring, documents expected behavior, and prevents regression. Tests provide confidence when deploying changes and onboarding new developers.

### IV. Component Modularity & Reusability

UI components MUST follow the single responsibility principle and be designed for reusability. Components MUST accept configuration via props rather than hard-coding values. Presentation components MUST be separated from business logic (container pattern or hooks). Shared UI components MUST reside in the packages/ui workspace with clear interfaces and documentation.

**Rationale**: Modular components reduce duplication, speed up development, maintain consistency across applications, and simplify testing. Reusable components create a coherent design system.

### V. API Contracts & Versioning

APIs between frontend and backend MUST be explicitly defined with TypeScript interfaces or schemas. Breaking changes to APIs MUST follow semantic versioning (MAJOR.MINOR.PATCH). API contracts MUST be validated with contract tests. Changes to public APIs MUST include migration guides and deprecation warnings where applicable.

**Rationale**: Clear contracts prevent integration bugs, enable parallel frontend/backend development, and allow confident evolution of services. Versioning prevents breaking changes from disrupting production systems.

### VI. Internationalization (i18n) First

All user-facing text MUST be externalized for internationalization from the start. Hard-coded strings in components are PROHIBITED. Translation keys MUST follow a hierarchical namespace convention (e.g., `common.buttons.save`, `blog.post.title`). Default language is English (en), with structure supporting multiple locales. Content in Sanity CMS MUST support localized fields for multi-language content.

**Rationale**: Building i18n support from the beginning prevents costly refactoring later. Proper structure enables seamless addition of new languages and maintains consistency across translations.

### VII. Code Quality & Observability

Code MUST pass all linting and formatting checks via Ultracite before merge. Build and type-check MUST succeed across all workspaces. Errors MUST be logged with structured context (user action, timestamp, error details). Performance-critical paths MUST include metrics and monitoring. Development environment MUST support hot reload and clear error reporting.

**Rationale**: Consistent code quality reduces maintenance burden and onboarding time. Observability enables rapid debugging and production issue resolution. Clear development feedback loops accelerate development.

## Development Workflow

### Code Review Process

All changes MUST be submitted via pull requests (PRs) targeting the main branch. PRs MUST NOT be merged without at least one approval from a team member. PR descriptions MUST include:
- Summary of changes (bullet points)
- Testing approach and results
- Related issue/ticket number if applicable

Self-merging is PROHIBITED except for urgent hotfixes with post-merge review.

**Rationale**: Code review catches bugs, shares knowledge, maintains code quality standards, and provides documentation of why changes were made.

### Documentation Requirements

Code changes affecting public APIs, component interfaces, or user workflows MUST include corresponding documentation updates. New features MUST include:
- README updates if affecting setup or usage
- Inline code comments for complex logic
- Type definitions serving as API documentation
- Example usage in Storybook or component stories (where applicable)

**Rationale**: Documentation reduces onboarding time, prevents knowledge silos, and serves as a contract for API consumers.

### Dependency Management

New dependencies MUST be justified before addition. Dependencies MUST be added at the appropriate workspace level (not always root). Security vulnerabilities in dependencies MUST be addressed within 2 weeks of disclosure. Dependency updates MUST include testing to verify compatibility.

**Rationale**: Careful dependency management reduces bundle size, minimizes security exposure, and prevents version conflicts in the monorepo.

## Quality Gates

### Pre-Merge Requirements

All PRs MUST pass the following gates before merge:
1. All TypeScript compilation succeeds (`pnpm check-types`)
2. All linting passes (`pnpm lint`)
3. All tests pass (unit, integration, contract as applicable)
4. Build succeeds for affected workspaces (`pnpm build`)
5. Code review approval received
6. Documentation updated where relevant

CI/CD pipeline MUST enforce these gates automatically.

**Rationale**: Automated gates prevent broken code from entering main branch, maintain build health, and ensure consistent quality standards.

### Performance Budgets

Web application bundle size MUST NOT exceed:
- Initial page load: 300KB (gzipped)
- Individual route chunks: 150KB (gzipped)

Build times MUST remain under:
- Development rebuild: 5 seconds
- Production build (all workspaces): 5 minutes

Performance violations MUST be justified and approved before merge.

**Rationale**: Performance budgets prevent degradation over time, maintain user experience, and ensure fast development iteration.

## Governance

### Amendment Procedure

Changes to this constitution MUST follow this procedure:
1. Propose amendment via discussion (team meeting or RFC document)
2. Document rationale and impact on existing workflows
3. Achieve consensus from team (majority approval)
4. Update constitution with version bump (semantic versioning)
5. Update all dependent templates and documentation
6. Communicate changes to all team members

### Versioning Policy

Constitution versions follow semantic versioning:
- **MAJOR**: Backward-incompatible governance changes, principle removals, or fundamental redefinitions
- **MINOR**: New principles added, existing principles materially expanded
- **PATCH**: Clarifications, wording improvements, typo fixes, non-semantic refinements

### Compliance Review

All feature specifications and implementation plans MUST verify compliance with constitutional principles during planning phase. Template checklist sections MUST reference relevant principles. Non-compliance MUST be explicitly justified with rationale documented in `plan.md` Complexity Tracking table.

### Enforcement

Team members are expected to uphold these principles in all development work. PR reviewers MUST verify constitutional compliance. Repeated violations MUST be addressed through team discussion and process improvement.

**Version**: 1.0.0 | **Ratified**: 2025-11-06 | **Last Amended**: 2025-11-06
