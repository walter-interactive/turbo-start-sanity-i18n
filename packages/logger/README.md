# @workspace/logger

Shared logging utility with environment-aware output (human-readable in dev, JSON in prod).

## Installation

```json
{
  "dependencies": {
    "@workspace/logger": "workspace:*"
  }
}
```

## Basic Usage

```typescript
import { logger, extractErrorInfo } from '@workspace/logger'

// Log messages with optional context
logger.info('User logged in', { userId: '123' })
logger.warn('API rate limit approaching', { remaining: 10 })
logger.error('Operation failed', { endpoint: '/api/users' })
logger.debug('Cache hit', { key: 'user:123' }) // Dev only

// Error handling
try {
  await fetchData()
} catch (err) {
  logger.error('Failed to fetch data', {
    error: extractErrorInfo(err),
    userId: '123'
  })
}
```

## Advanced Usage

```typescript
import { createLogger, detectEnvironment } from '@workspace/logger'
import type { LogLevel, LogContext } from '@workspace/logger'

// Custom logger for testing
const testLogger = createLogger('production')

// Manual environment detection
const logger = createLogger(detectEnvironment())

// Type-safe wrapper
function log(level: LogLevel, message: string, context?: LogContext) {
  logger[level](message, context)
}
```
