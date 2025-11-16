# Data Model: Shared Logger Package

**Feature**: 012-shared-logger-package  
**Date**: 2025-01-15  
**Status**: Complete

This document describes the data entities, types, and relationships for the logger package.

---

## Entity Overview

The logger package contains three primary entities:

1. **Logger Instance**: Singleton object providing logging methods
2. **Log Entry**: Structured data record for a single log message
3. **Error Info**: Structured error serialization result

---

## Entity Definitions

### 1. Logger Instance

**Description**: Singleton object that provides logging methods (info, warn, error, debug). This is the primary interface consumers interact with.

**Type**:
```typescript
interface Logger {
  info: (message: string, context?: LogContext) => void
  warn: (message: string, context?: LogContext) => void
  error: (message: string, context?: LogContext) => void
  debug: (message: string, context?: LogContext) => void
}
```

**Attributes**:
- `info`: Logs informational messages (always output in all environments)
- `warn`: Logs warning messages (always output in all environments)
- `error`: Logs error messages (always output in all environments)
- `debug`: Logs debug messages (only output in development environment)

**Validation Rules**:
- All methods require a non-empty `message` string
- `context` is optional and must be a valid object if provided
- Methods have no return value (void)

**State Transitions**: N/A (stateless singleton)

**Relationships**:
- Creates → Log Entry (internal, not exposed to consumers)
- Uses → Environment Detection (internal)

---

### 2. Log Entry

**Description**: Internal structured data record representing a single log message. Not directly exposed to consumers but used internally for formatting and output.

**Type**:
```typescript
interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  environment: string
}
```

**Attributes**:
- `level`: Log severity level ('info' | 'warn' | 'error' | 'debug')
- `message`: Human-readable log message
- `timestamp`: ISO 8601 formatted timestamp (e.g., "2025-01-15T10:30:00.000Z")
- `context`: Optional key-value pairs with additional metadata
- `environment`: Detected environment ('development', 'preview', 'production', 'unknown')

**Validation Rules**:
- `level`: Must be one of: 'info', 'warn', 'error', 'debug'
- `message`: Non-empty string
- `timestamp`: Valid ISO 8601 format from `new Date().toISOString()`
- `context`: Keys must be strings, values can be any JSON-serializable type
- `environment`: Derived from NODE_ENV and VERCEL_ENV environment variables

**State Transitions**: Immutable - created once, then output

**Relationships**:
- Created by → Logger Instance methods
- Formatted by → Format utilities (development vs production output)

---

### 3. Log Context

**Description**: Optional metadata object that can be attached to log messages for additional structured information.

**Type**:
```typescript
interface LogContext {
  [key: string]: unknown
}
```

**Attributes**:
- Dynamic key-value pairs
- Keys: Any valid string
- Values: Any type (should be JSON-serializable for production output)

**Validation Rules**:
- Must be a valid object
- Non-serializable values (functions, symbols, undefined) are silently dropped in JSON output
- Circular references will cause JSON.stringify to throw (documented limitation)

**Common Usage Patterns**:
```typescript
// User action tracking
logger.info('User action', { action: 'language-switch', from: 'en', to: 'fr' })

// Error context
logger.error('API request failed', { endpoint: '/api/users', status: 500, userId: '123' })

// Performance tracking
logger.debug('Query executed', { query: 'getAllPosts', duration: '45ms', rows: 12 })
```

**Relationships**:
- Attached to → Log Entry
- Serialized to JSON in production environment

---

### 4. Error Info

**Description**: Structured representation of error information extracted from Error objects or unknown error values.

**Type**:
```typescript
interface ErrorInfo {
  message: string
  stack?: string
  type: string
}
```

**Attributes**:
- `message`: Error message string
- `stack`: Optional stack trace (present for Error instances with stack)
- `type`: Error type/name (e.g., 'Error', 'TypeError', 'UnknownError')

**Validation Rules**:
- `message`: Always present, non-empty string
- `stack`: Optional, only present if source error has stack trace
- `type`: Defaults to 'UnknownError' for non-Error values

**State Transitions**: Immutable - created by `extractErrorInfo()` function

**Relationships**:
- Created by → `extractErrorInfo()` helper function
- Used by → Consumer code to structure error logging

**Usage**:
```typescript
try {
  await riskyOperation()
} catch (err) {
  const errorInfo = extractErrorInfo(err)
  logger.error('Operation failed', { error: errorInfo })
}
```

---

## Supporting Types

### LogLevel

**Description**: Union type representing valid log severity levels.

**Type**:
```typescript
type LogLevel = 'info' | 'warn' | 'error' | 'debug'
```

**Usage**: Internal type for log method routing and severity filtering.

---

## Data Flow

### Development Environment Flow

```
┌─────────────┐
│ Consumer    │
│ Code        │
└──────┬──────┘
       │ logger.info('msg', { key: 'value' })
       ▼
┌──────────────────┐
│ Logger Instance  │
│ - info() method  │
└──────┬───────────┘
       │ Creates LogEntry
       ▼
┌──────────────────┐
│ Log Entry        │
│ {                │
│   level: 'info', │
│   message: 'msg',│
│   timestamp: ... │
│   context: {...},│
│   environment:   │
│     'development'│
│ }                │
└──────┬───────────┘
       │ formatLogEntry()
       ▼
┌──────────────────┐
│ Formatted String │
│ "[2025-01-15T...] │
│  [INFO] msg      │
│  {"key":"value"}"│
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ console.info()   │
│ (with colors)    │
└──────────────────┘
```

### Production Environment Flow

```
┌─────────────┐
│ Consumer    │
│ Code        │
└──────┬──────┘
       │ logger.error('Failed', { userId: '123' })
       ▼
┌──────────────────┐
│ Logger Instance  │
│ - error() method │
└──────┬───────────┘
       │ Creates LogEntry
       ▼
┌──────────────────┐
│ Log Entry        │
│ {                │
│   level: 'error',│
│   message:       │
│     'Failed',    │
│   timestamp: ...,│
│   context: {     │
│     userId: '123'│
│   },             │
│   environment:   │
│     'production' │
│ }                │
└──────┬───────────┘
       │ JSON.stringify()
       ▼
┌──────────────────┐
│ JSON String      │
│ {"level":"error",│
│  "message":      │
│    "Failed",     │
│  "timestamp":...,│
│  "context":{...},│
│  "environment":  │
│    "production"} │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ console.error()  │
│ (structured JSON)│
└──────────────────┘
```

---

## Environment Detection Logic

```
┌─────────────────────┐
│ logger.info() called│
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ isDevelopment()?    │
│ typeof process !==  │
│   'undefined' &&    │
│ process.env.NODE_ENV│
│   === 'development' │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    │           │
   YES         NO
    │           │
    ▼           ▼
┌────────┐  ┌────────┐
│ Format │  │  JSON  │
│ human  │  │ output │
│readable│  │ (prod) │
└────────┘  └────────┘
```

### Environment Priority

1. **Production**: `process.env.VERCEL_ENV === 'production'`
2. **Preview**: `process.env.VERCEL_ENV === 'preview'`
3. **Development**: `process.env.NODE_ENV === 'development'`
4. **Unknown**: None of the above

---

## Constraints & Invariants

### Functional Constraints
- Debug logs MUST NOT appear in production environments
- All logs MUST include timestamp and level
- Log Entry is immutable once created
- Logger instance is singleton (no constructor exposed)

### Performance Constraints
- Per-call overhead MUST be < 1ms
- Bundle size MUST be < 2KB gzipped
- No blocking I/O operations
- No async operations (all logging is synchronous)

### Type Safety Constraints
- All public APIs MUST have explicit types
- No use of `any` type
- Context values typed as `unknown` (not `any`)
- Error parameter typed as `unknown` for maximum flexibility

### Environment Constraints
- MUST work in Node.js >=20
- MUST work in modern browsers (ES2022+ support)
- MUST handle missing `process` object gracefully (browser)
- MUST handle missing environment variables gracefully

---

## Migration Impact

### Existing Data
- No data migration required (utility package, no persistence)
- Current logger usage in `apps/template-web/src/i18n/routing.ts` continues to work identically

### Backward Compatibility
- **Breaking Change**: Import path changes from `@/lib/logger` to `@workspace/logger`
- **Non-Breaking**: All logger methods maintain identical signatures
- **Non-Breaking**: All return values remain the same (void)
- **Non-Breaking**: All behavior remains identical

### Consumer Updates Required
- Update import statement: `import { logger } from '@workspace/logger'`
- Add `@workspace/logger` to package.json dependencies
- No code changes required beyond import path

---

## Future Extensions (Out of Scope)

These are explicitly documented as NOT part of this extraction:

- [ ] External service integrations (Sentry, LogRocket, Datadog)
- [ ] Runtime log level configuration
- [ ] Custom log formatters or output destinations
- [ ] Log buffering or batching
- [ ] Performance metrics collection
- [ ] Structured log querying or filtering
- [ ] Log level per-namespace configuration
- [ ] Circular reference handling in context objects

These may be added in future iterations as separate features.

---

**Data Model Complete** ✅
