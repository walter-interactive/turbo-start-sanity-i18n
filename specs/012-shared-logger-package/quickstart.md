# Quickstart: @workspace/logger

**5-Minute Setup Guide**

This guide gets you using the shared logger package in under 5 minutes.

---

## Installation

### For Existing Applications (template-web, template-studio)

```bash
# 1. Navigate to your application directory
cd apps/template-web  # or apps/template-studio

# 2. Add logger dependency to package.json
# Add this line to the "dependencies" section:
"@workspace/logger": "workspace:*"

# 3. Install dependencies
pnpm install
```

### For New Applications

New applications automatically have access to workspace packages once added to the monorepo. Just add the dependency as shown above.

---

## Basic Usage

### Import the Logger

```typescript
import { logger } from '@workspace/logger'
```

### Log Messages

```typescript
// Informational messages
logger.info('Application started')

// Warnings
logger.warn('Feature flag missing, using default')

// Errors
logger.error('Database connection failed')

// Debug (development only)
logger.debug('Cache miss for key: user:123')
```

---

## Logging with Context

Add structured metadata to your logs:

```typescript
logger.info('User logged in', {
  userId: 'user_123',
  method: 'oauth',
  provider: 'google'
})

logger.error('API request failed', {
  endpoint: '/api/users',
  status: 500,
  duration: '1.2s'
})
```

**Output in Development**:
```
[2025-01-15T10:30:00.000Z] [INFO] User logged in {"userId":"user_123","method":"oauth","provider":"google"}
```

**Output in Production**:
```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "context": {
    "userId": "user_123",
    "method": "oauth",
    "provider": "google"
  },
  "environment": "production"
}
```

---

## Error Logging

Use the `extractErrorInfo` helper for consistent error formatting:

```typescript
import { logger, extractErrorInfo } from '@workspace/logger'

try {
  await fetchUserData()
} catch (err) {
  logger.error('Failed to fetch user data', {
    error: extractErrorInfo(err),
    userId: 'user_123'
  })
}
```

**What `extractErrorInfo` does**:
- Safely extracts `message`, `stack`, and `type` from Error objects
- Handles non-Error values gracefully
- Provides consistent error structure across the application

---

## Environment-Aware Logging

The logger automatically detects the environment:

| Environment | Detected When | Output Format |
|-------------|---------------|---------------|
| **Development** | `NODE_ENV === 'development'` | Human-readable with colors |
| **Preview** | `VERCEL_ENV === 'preview'` | JSON (for log aggregation) |
| **Production** | `VERCEL_ENV === 'production'` | JSON (for log aggregation) |
| **Unknown** | None of the above | JSON (safe default) |

**Debug logs** (`logger.debug()`) are **only output in development**. They're silently skipped in all other environments.

---

## Common Patterns

### API Request Logging

```typescript
export async function fetchData(endpoint: string) {
  logger.debug('API request started', { endpoint })
  
  try {
    const response = await fetch(endpoint)
    
    logger.info('API request completed', {
      endpoint,
      status: response.status
    })
    
    return response.json()
  } catch (err) {
    logger.error('API request failed', {
      endpoint,
      error: extractErrorInfo(err)
    })
    throw err
  }
}
```

### Locale Switching (i18n)

```typescript
export function changeLocale(from: string, to: string) {
  logger.info('User changed locale', { from, to })
  
  // ... locale switching logic ...
}

export function fallbackLocale(requested: string, fallback: string) {
  logger.warn('Requested locale not available', { requested, fallback })
  
  // ... fallback logic ...
}
```

### Cache Operations

```typescript
function cacheGet(key: string) {
  const value = cache.get(key)
  
  if (value) {
    logger.debug('Cache hit', { key })
  } else {
    logger.debug('Cache miss', { key })
  }
  
  return value
}
```

---

## TypeScript Types

Import types for better IDE support:

```typescript
import type { LogLevel, LogContext, ErrorInfo } from '@workspace/logger'

function customLogWrapper(level: LogLevel, message: string, context?: LogContext) {
  // ... custom logic ...
}

function handleError(err: unknown): ErrorInfo {
  return extractErrorInfo(err)
}
```

---

## Migration from `@/lib/logger`

If you're migrating from the old logger location:

**Before**:
```typescript
import { logger } from '@/lib/logger'
```

**After**:
```typescript
import { logger } from '@workspace/logger'
```

**That's it!** No code changes required beyond the import path.

---

## Best Practices

### ✅ DO

- Use `logger.info()` for user actions and notable events
- Use `logger.warn()` for recoverable errors and deprecation notices
- Use `logger.error()` for failures that prevent normal operation
- Use `logger.debug()` for detailed diagnostic information (development only)
- Use `extractErrorInfo()` for consistent error logging
- Add context objects for structured metadata

### ❌ DON'T

- Log sensitive data (passwords, API keys, tokens)
- Log huge objects (use summaries instead: record count, duration, etc.)
- Use logger in tight loops (log batch summaries instead)
- Log circular references (extract serializable data only)

---

## Troubleshooting

### "Cannot find module '@workspace/logger'"

**Solution**: Ensure the package is added to your `package.json` dependencies and run `pnpm install`.

### Logger output not appearing

**Check**:
- **Debug logs**: Only appear when `NODE_ENV === 'development'`
- **Environment detection**: Verify `NODE_ENV` or `VERCEL_ENV` are set correctly

### "ReferenceError: process is not defined"

**Cause**: You might be using an old version of the logger without browser safety checks.

**Solution**: Ensure `packages/logger/src/index.ts` has defensive `typeof process` checks.

---

## Next Steps

- **Full API Reference**: See `specs/012-shared-logger-package/contracts/logger-api.ts`
- **Usage Examples**: See `specs/012-shared-logger-package/contracts/usage-examples.ts`
- **Migration Guide**: See `specs/012-shared-logger-package/contracts/migration-guide.md`
- **Data Model**: See `specs/012-shared-logger-package/data-model.md`

---

**Ready to log!** 🎉

For questions or issues, refer to the full documentation in `specs/012-shared-logger-package/`.
