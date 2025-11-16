# Implementation Plan: Shared Logger Package

**Branch**: `012-shared-logger-package` | **Date**: 2025-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-shared-logger-package/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Extract the existing logger implementation from `apps/template-web/src/lib/logger.ts` into a shared workspace package `@workspace/logger` that can be reused across all monorepo applications. The logger provides structured logging with environment-aware output (human-readable in development, JSON in production) and supports both Node.js server-side and browser client-side contexts with zero external dependencies.

## Technical Context

**Language/Version**: TypeScript 5.9.2 with strict mode enabled  
**Primary Dependencies**: None (zero external runtime dependencies per SC-006)  
**Storage**: N/A (utility package, no persistence)  
**Testing**: NEEDS CLARIFICATION - No testing framework currently configured in monorepo  
**Target Platform**: Dual-target: Node.js >=20 (server-side) and modern browsers (client-side)  
**Project Type**: Monorepo workspace package (packages/logger)  
**Performance Goals**: Minimal overhead (<1ms per log call), negligible bundle impact (<2KB gzipped)  
**Constraints**: Zero external dependencies, must work in both Node.js and browser environments, maintain backward compatibility with existing logger API  
**Scale/Scope**: Used across all monorepo applications (currently template-web, template-studio; future apps as well)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Monorepo Structure & Boundaries
**Status**: ✅ COMPLIANT  
**Evaluation**: Creating new workspace package `packages/logger/` with explicit dependency declarations in package.json. All imports will go through published workspace package `@workspace/logger`, no direct file references.

### Principle II: TypeScript Strict Mode & Type Safety
**Status**: ✅ COMPLIANT  
**Evaluation**: Existing logger implementation has comprehensive type definitions (LogLevel, LogContext, LogEntry). No `any` types present. Will inherit strict mode from `@workspace/typescript-config`.

### Principle III: Test Coverage (MANDATORY)
**Status**: ⚠️ VIOLATION - REQUIRES JUSTIFICATION  
**Evaluation**: Constitution requires tests before feature completion, but monorepo has no testing framework configured (no vitest/jest). This must be addressed in Complexity Tracking.

### Principle IV: Component Modularity & Reusability
**Status**: ✅ COMPLIANT  
**Evaluation**: Extracting shared logger utility for reuse across all applications. Single responsibility (logging), clear interface, designed for reusability.

### Principle V: API Contracts & Versioning
**Status**: ✅ COMPLIANT  
**Evaluation**: Maintaining existing logger API contract (info, warn, error, debug methods, extractErrorInfo helper). No breaking changes to consuming code beyond import path update.

### Principle VI: Internationalization (i18n) First
**Status**: N/A  
**Evaluation**: Logger is infrastructure utility, not user-facing. No i18n requirements apply.

### Principle VII: Code Quality & Observability
**Status**: ✅ COMPLIANT  
**Evaluation**: Logger itself provides observability infrastructure. Will pass Ultracite linting and TypeScript type-checking. Structured logging with context supports debugging.

### Pre-Merge Requirements
**Status**: ✅ COMPLIANT (except tests - see Principle III)  
**Evaluation**: 
- TypeScript compilation: Will pass with proper tsconfig  
- Linting: Existing logger code follows conventions  
- Tests: ⚠️ VIOLATION - No framework configured  
- Build: Will integrate with TurboRepo build pipeline  
- Code review: Normal PR process applies  
- Documentation: Package README and inline JSDoc present  

### GATE DECISION
**Status**: ⚠️ CONDITIONAL PASS - Requires justification in Complexity Tracking  
**Blocker**: Testing framework not configured. Must document approach in Complexity Tracking table before proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/logger/               # New workspace package
├── src/
│   ├── index.ts              # Main export (logger instance, extractErrorInfo)
│   ├── types.ts              # TypeScript types (LogLevel, LogContext, LogEntry)
│   └── logger.ts             # Core logger implementation
├── package.json              # Package manifest (@workspace/logger)
├── tsconfig.json             # TypeScript config (extends @workspace/typescript-config)
└── README.md                 # Package documentation

apps/template-web/src/
├── i18n/routing.ts           # UPDATE: Change import from '@/lib/logger' to '@workspace/logger'
└── lib/
    └── logger.ts             # DELETE: Remove after extraction

apps/template-studio/         # FUTURE: Can add @workspace/logger as dependency
```

**Structure Decision**: Monorepo workspace package following existing conventions (packages/i18n-config, packages/ui, etc.). Simple structure with src/ containing implementation, following the pattern of other workspace packages. No tests/ directory initially due to lack of testing framework (see Complexity Tracking).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle III: No tests for logger package | Monorepo has no testing framework configured (no vitest/jest). Setting up testing infrastructure is a separate, larger effort outside the scope of extracting an existing, proven implementation. | Blocking this feature on testing infrastructure setup would delay code reuse benefits. The logger is already battle-tested in template-web production use. Testing infrastructure should be established in a dedicated effort that covers all workspace packages, not as a dependency of this extraction task. |

## Post-Design Constitution Check

*Re-evaluation after Phase 1 design completion*

### Design Artifacts Completed
- ✅ research.md - Comprehensive research on dual-target packages, migration strategies, and optimization
- ✅ data-model.md - Complete data model with entities, relationships, and constraints
- ✅ contracts/logger-api.ts - TypeScript API contract definitions
- ✅ contracts/usage-examples.ts - Real-world usage patterns
- ✅ contracts/migration-guide.md - Step-by-step migration documentation
- ✅ quickstart.md - 5-minute setup guide
- ✅ Agent context updated (CLAUDE.md)

### Constitution Compliance Re-Check

#### Principle I: Monorepo Structure & Boundaries
**Status**: ✅ COMPLIANT - CONFIRMED  
**Post-Design Notes**: Package structure defined in data-model.md follows workspace conventions. Explicit exports in package.json, clear dependency declarations. No circular dependencies.

#### Principle II: TypeScript Strict Mode & Type Safety
**Status**: ✅ COMPLIANT - CONFIRMED  
**Post-Design Notes**: API contracts define comprehensive types (LogLevel, LogContext, LogEntry, ErrorInfo). No `any` types in contract definitions. Inherits strict mode from @workspace/typescript-config.

#### Principle III: Test Coverage (MANDATORY)
**Status**: ⚠️ VIOLATION - JUSTIFIED (unchanged from initial check)  
**Post-Design Notes**: Design does not include tests due to lack of testing framework. Justification remains valid - existing logger is battle-tested, testing infrastructure is separate effort.

#### Principle IV: Component Modularity & Reusability
**Status**: ✅ COMPLIANT - CONFIRMED  
**Post-Design Notes**: Data model shows clear separation of concerns (Logger interface, LogEntry structure, error extraction). Single responsibility, designed for reuse across all applications.

#### Principle V: API Contracts & Versioning
**Status**: ✅ COMPLIANT - CONFIRMED  
**Post-Design Notes**: Contracts documented in contracts/logger-api.ts. Migration guide specifies breaking change (import path only). API methods maintain identical signatures.

#### Principle VI: Internationalization (i18n) First
**Status**: N/A - CONFIRMED  
**Post-Design Notes**: Logger is infrastructure, not user-facing. No i18n requirements apply.

#### Principle VII: Code Quality & Observability
**Status**: ✅ COMPLIANT - CONFIRMED  
**Post-Design Notes**: Research.md documents defensive environment checks, bundle optimization techniques. Quickstart.md includes best practices. Logger provides observability infrastructure.

### Design Quality Gates

| Gate | Status | Evidence |
|------|--------|----------|
| **Technical decisions documented** | ✅ PASS | All research findings in research.md with decision rationale |
| **Data model complete** | ✅ PASS | Entities, relationships, constraints documented in data-model.md |
| **API contracts defined** | ✅ PASS | TypeScript interfaces in contracts/logger-api.ts |
| **Migration path documented** | ✅ PASS | Step-by-step guide in contracts/migration-guide.md |
| **Usage examples provided** | ✅ PASS | Real-world patterns in contracts/usage-examples.ts |
| **Quickstart guide created** | ✅ PASS | 5-minute setup in quickstart.md |
| **Zero external dependencies** | ✅ PASS | Confirmed in research.md and package.json design |
| **Dual-environment support** | ✅ PASS | Defensive checks documented in research.md R1 |
| **Bundle size optimized** | ✅ PASS | Single file, sideEffects: false, ~650 bytes gzipped (R3) |
| **Agent context updated** | ✅ PASS | CLAUDE.md updated with logger package details |

### Final Gate Decision
**Status**: ✅ APPROVED FOR IMPLEMENTATION  
**Rationale**: All design artifacts complete, constitutional compliance confirmed (with justified testing violation), research thoroughly documents technical approach, migration path is safe and reversible.

### Ready for Implementation
Phase 0 (Research) and Phase 1 (Design) are complete. The feature is ready for:
- Phase 2: Task breakdown (separate command: /speckit.tasks)
- Phase 3: Implementation
- Phase 4: Verification and deployment

**Next Command**: `/speckit.tasks` to generate implementation tasks.

---

**Planning Phase Complete** ✅  
**Date**: 2025-01-15  
**Branch**: 012-shared-logger-package  
**Artifacts**: plan.md, research.md, data-model.md, contracts/*, quickstart.md
