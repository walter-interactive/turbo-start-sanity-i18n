/**
 * Usage Examples: @workspace/logger
 *
 * Real-world usage patterns and examples for the logger package.
 * These examples demonstrate best practices and common scenarios.
 */

import type { ErrorInfo, Logger } from './logger-api'

// Mock imports (in real usage, import from @workspace/logger)
declare const logger: Logger
declare const extractErrorInfo: (error: unknown) => ErrorInfo

// ============================================================================
// BASIC USAGE
// ============================================================================

/**
 * Example 1: Basic logging
 */
export function basicLoggingExample() {
  // Simple informational log
  logger.info('Application started')

  // Warning without context
  logger.warn('Feature flag not configured, using default')

  // Error without context
  logger.error('Failed to connect to database')

  // Debug log (only in development)
  logger.debug('Environment variables loaded')
}

/**
 * Example 2: Logging with context
 */
export function loggingWithContextExample() {
  // User action tracking
  logger.info('User logged in', {
    userId: 'user_123',
    method: 'oauth',
    provider: 'google',
    timestamp: Date.now()
  })

  // Performance tracking
  logger.info('Page rendered', {
    page: '/dashboard',
    renderTime: '123ms',
    components: 15
  })

  // Feature usage
  logger.info('Feature used', {
    feature: 'dark-mode-toggle',
    enabled: true,
    userId: 'user_456'
  })
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Example 3: Error logging with extractErrorInfo
 */
export async function errorHandlingExample() {
  try {
    await fetchUserData('user_123')
  } catch (err) {
    // Best practice: Use extractErrorInfo for consistent error structure
    logger.error('Failed to fetch user data', {
      userId: 'user_123',
      error: extractErrorInfo(err)
    })
  }
}

/**
 * Example 4: Nested error handling
 */
export async function nestedErrorHandlingExample() {
  try {
    const response = await fetch('/api/users')

    if (!response.ok) {
      logger.warn('API returned non-200 status', {
        status: response.status,
        endpoint: '/api/users'
      })
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    logger.info('Data fetched successfully', {
      endpoint: '/api/users',
      recordCount: data.length
    })

    return data
  } catch (err) {
    logger.error('API request failed', {
      endpoint: '/api/users',
      error: extractErrorInfo(err)
    })
    throw err // Re-throw after logging
  }
}

// ============================================================================
// INTERNATIONALIZATION (I18N) SCENARIOS
// ============================================================================

/**
 * Example 5: Locale switching logging
 * (Based on actual usage in apps/template-web/src/i18n/routing.ts)
 */
export function localeLoggingExample(
  requestedLocale: string,
  fallbackLocale: string
) {
  // Log locale detection fallback
  logger.warn('Requested locale not available, using fallback', {
    requested: requestedLocale,
    fallback: fallbackLocale,
    availableLocales: ['en', 'fr', 'de']
  })

  // Log successful locale change
  logger.info('User changed locale', {
    from: 'en',
    to: 'fr',
    userId: 'user_789'
  })
}

/**
 * Example 6: Translation loading
 */
export async function translationLoadingExample(locale: string) {
  logger.debug('Loading translations', { locale })

  try {
    const translations = await loadTranslations(locale)

    logger.info('Translations loaded', {
      locale,
      keys: Object.keys(translations).length,
      cacheHit: false
    })

    return translations
  } catch (err) {
    logger.error('Failed to load translations', {
      locale,
      error: extractErrorInfo(err)
    })
    throw err
  }
}

// ============================================================================
// API REQUEST LOGGING
// ============================================================================

/**
 * Example 7: API request/response logging
 */
export async function apiRequestLoggingExample() {
  const startTime = Date.now()

  logger.debug('API request started', {
    method: 'GET',
    endpoint: '/api/posts',
    query: { page: 1, limit: 10 }
  })

  try {
    const response = await fetch('/api/posts?page=1&limit=10')
    const duration = Date.now() - startTime

    logger.info('API request completed', {
      method: 'GET',
      endpoint: '/api/posts',
      status: response.status,
      duration: `${duration}ms`
    })

    return response.json()
  } catch (err) {
    const duration = Date.now() - startTime

    logger.error('API request failed', {
      method: 'GET',
      endpoint: '/api/posts',
      duration: `${duration}ms`,
      error: extractErrorInfo(err)
    })

    throw err
  }
}

// ============================================================================
// CACHING SCENARIOS
// ============================================================================

/**
 * Example 8: Cache operations
 */
export function cacheLoggingExample(key: string, value: unknown) {
  // Cache miss
  logger.debug('Cache miss', {
    key,
    operation: 'get'
  })

  // Cache set
  logger.debug('Cache set', {
    key,
    operation: 'set',
    ttl: 3600,
    size: JSON.stringify(value).length
  })

  // Cache hit
  logger.debug('Cache hit', {
    key,
    operation: 'get',
    age: 120 // seconds since set
  })

  // Cache invalidation
  logger.info('Cache invalidated', {
    reason: 'data-updated',
    pattern: 'user:*',
    count: 15
  })
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Example 9: Performance tracking
 */
export function performanceLoggingExample() {
  const start = performance.now()

  // ... expensive operation ...

  const duration = performance.now() - start

  if (duration > 1000) {
    logger.warn('Slow operation detected', {
      operation: 'data-processing',
      duration: `${duration.toFixed(2)}ms`,
      threshold: '1000ms'
    })
  } else {
    logger.debug('Operation completed', {
      operation: 'data-processing',
      duration: `${duration.toFixed(2)}ms`
    })
  }
}

// ============================================================================
// VALIDATION & BUSINESS LOGIC
// ============================================================================

/**
 * Example 10: Validation logging
 */
export function validationLoggingExample(input: unknown) {
  logger.debug('Validating input', {
    type: typeof input,
    schema: 'UserInput'
  })

  const errors: string[] = []

  // Validation logic...
  if (!input || typeof input !== 'object') {
    errors.push('Input must be an object')
  }

  if (errors.length > 0) {
    logger.warn('Validation failed', {
      schema: 'UserInput',
      errors,
      input: JSON.stringify(input)
    })
    return false
  }

  logger.debug('Validation passed', { schema: 'UserInput' })
  return true
}

// ============================================================================
// MIGRATION PATTERN (FROM OLD TO NEW IMPORT)
// ============================================================================

/**
 * Example 11: Before and after migration
 */

// BEFORE (old import path):
// import { logger } from '@/lib/logger'
//
// logger.info('Application started')

// AFTER (new import path):
// import { logger } from '@workspace/logger'
//
// logger.info('Application started')

// NO CODE CHANGES REQUIRED - only import path changes!

// ============================================================================
// ANTI-PATTERNS (WHAT NOT TO DO)
// ============================================================================

/**
 * Example 12: Common mistakes to avoid
 */
export function antiPatternsExample() {
  // ❌ DON'T: Log sensitive data
  // logger.info('User authenticated', {
  //   username: 'john@example.com',
  //   password: 'secret123',  // NEVER LOG PASSWORDS!
  //   apiKey: 'sk_live_...'   // NEVER LOG API KEYS!
  // })

  // ✅ DO: Log only safe metadata
  logger.info('User authenticated', {
    userId: 'user_123',
    method: 'oauth',
    timestamp: Date.now()
  })

  // ❌ DON'T: Log huge objects that bloat logs
  // const hugeObject = { /* 10MB of data */ }
  // logger.info('Data processed', { data: hugeObject })

  // ✅ DO: Log summary information
  logger.info('Data processed', {
    recordCount: 1000,
    duration: '245ms',
    success: true
  })

  // ❌ DON'T: Use logger in loops (performance impact)
  // for (let i = 0; i < 10000; i++) {
  //   logger.debug('Processing item', { index: i })
  // }

  // ✅ DO: Log batch summaries
  logger.debug('Batch processing started', { itemCount: 10_000 })
  // ... process items ...
  logger.info('Batch processing completed', {
    itemCount: 10_000,
    duration: '1.2s',
    errors: 3
  })

  // ❌ DON'T: Log circular references
  // const obj: any = { name: 'test' }
  // obj.self = obj
  // logger.info('Object created', { obj }) // Will throw in production!

  // ✅ DO: Extract only serializable data
  const obj: any = { name: 'test' }
  obj.self = obj
  logger.info('Object created', {
    name: obj.name,
    type: 'circular'
  })
}

// ============================================================================
// HELPER FUNCTIONS (examples from real usage)
// ============================================================================

// Mock implementations for examples
async function fetchUserData(userId: string): Promise<unknown> {
  return fetch(`/api/users/${userId}`).then((r) => r.json())
}

async function loadTranslations(
  locale: string
): Promise<Record<string, string>> {
  return fetch(`/translations/${locale}.json`).then((r) => r.json())
}
