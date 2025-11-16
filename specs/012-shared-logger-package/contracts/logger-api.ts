/**
 * API Contract: Logger Package
 *
 * This file defines the public API contract for @workspace/logger package.
 * All consuming applications MUST interact with the logger through these interfaces.
 *
 * Version: 1.0.0
 * Breaking Changes: Import path changes from @/lib/logger to @workspace/logger
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Log severity levels
 *
 * - info: Informational messages (always logged)
 * - warn: Warning messages (always logged)
 * - error: Error messages (always logged)
 * - debug: Debug messages (development only)
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

/**
 * Additional context for log messages
 *
 * A flexible key-value object for attaching structured metadata to logs.
 *
 * @example
 * ```typescript
 * const context: LogContext = {
 *   userId: '12345',
 *   action: 'login',
 *   timestamp: Date.now()
 * }
 * ```
 *
 * @note Values should be JSON-serializable for production logging.
 *       Non-serializable values (functions, symbols) are silently dropped.
 */
export interface LogContext {
  [key: string]: unknown
}

/**
 * Internal log entry structure
 *
 * @internal Not exposed to consumers, used internally for formatting
 */
export interface LogEntry {
  /** Log severity level */
  level: LogLevel

  /** Human-readable log message */
  message: string

  /** ISO 8601 timestamp */
  timestamp: string

  /** Optional structured context */
  context?: LogContext

  /** Detected environment (development, preview, production, unknown) */
  environment: string
}

/**
 * Structured error information
 *
 * Result type from extractErrorInfo() helper function.
 * Provides consistent error serialization across the application.
 */
export interface ErrorInfo {
  /** Error message text */
  message: string

  /** Stack trace (if available) */
  stack?: string

  /** Error type/name (e.g., 'Error', 'TypeError', 'UnknownError') */
  type: string
}

// ============================================================================
// LOGGER INTERFACE
// ============================================================================

/**
 * Logger instance interface
 *
 * Provides methods for logging at different severity levels.
 * All methods are synchronous and return void.
 *
 * @example
 * ```typescript
 * import { logger } from '@workspace/logger'
 *
 * logger.info('Application started')
 * logger.warn('Deprecated API used', { api: 'v1/users' })
 * logger.error('Request failed', { status: 500, endpoint: '/api/data' })
 * logger.debug('Cache hit', { key: 'user:123', ttl: 3600 })
 * ```
 */
export interface Logger {
  /**
   * Log informational messages
   *
   * Use for general application events, user actions, and notable state changes.
   * Always logged in all environments.
   *
   * @param message - Human-readable log message
   * @param context - Optional structured metadata
   *
   * @example
   * ```typescript
   * logger.info('User logged in', { userId: '123', method: 'oauth' })
   * ```
   */
  info: (message: string, context?: LogContext) => void

  /**
   * Log warning messages
   *
   * Use for recoverable errors, deprecated API usage, or conditions that may
   * indicate problems but don't prevent operation.
   * Always logged in all environments.
   *
   * @param message - Warning message
   * @param context - Optional structured metadata
   *
   * @example
   * ```typescript
   * logger.warn('API rate limit approaching', { remaining: 10, limit: 100 })
   * ```
   */
  warn: (message: string, context?: LogContext) => void

  /**
   * Log error messages
   *
   * Use for errors, exceptions, and failures that prevent normal operation.
   * Always logged in all environments.
   *
   * @param message - Error message
   * @param context - Optional structured metadata (often includes error details)
   *
   * @example
   * ```typescript
   * try {
   *   await fetchData()
   * } catch (err) {
   *   logger.error('Data fetch failed', {
   *     error: extractErrorInfo(err),
   *     endpoint: '/api/users'
   *   })
   * }
   * ```
   */
  error: (message: string, context?: LogContext) => void

  /**
   * Log debug messages
   *
   * Use for detailed diagnostic information useful during development.
   * ONLY logged in development environment (NODE_ENV === 'development').
   * Silently skipped in preview and production.
   *
   * @param message - Debug message
   * @param context - Optional structured metadata
   *
   * @example
   * ```typescript
   * logger.debug('Cache operation', {
   *   operation: 'get',
   *   key: 'user:123',
   *   hit: true,
   *   ttl: 3600
   * })
   * ```
   */
  debug: (message: string, context?: LogContext) => void
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract structured error information from Error objects or unknown values
 *
 * Safely converts any error value into a structured ErrorInfo object.
 * Handles Error instances, error-like objects, and primitive values.
 *
 * @param error - Error object or unknown error value
 * @returns Structured error information
 *
 * @example
 * ```typescript
 * // With Error instance
 * try {
 *   throw new TypeError('Invalid input')
 * } catch (err) {
 *   const errorInfo = extractErrorInfo(err)
 *   // { message: 'Invalid input', stack: '...', type: 'TypeError' }
 * }
 *
 * // With unknown value
 * const errorInfo = extractErrorInfo('Something went wrong')
 * // { message: 'Something went wrong', type: 'UnknownError' }
 *
 * // Usage in logging
 * try {
 *   await riskyOperation()
 * } catch (err) {
 *   logger.error('Operation failed', { error: extractErrorInfo(err) })
 * }
 * ```
 */
export type ExtractErrorInfo = (error: unknown) => ErrorInfo

// ============================================================================
// PACKAGE EXPORTS
// ============================================================================

/**
 * Public API exports for @workspace/logger
 *
 * Consumers should import from the package like this:
 *
 * ```typescript
 * import { logger, extractErrorInfo } from '@workspace/logger'
 * import type { LogLevel, LogContext, ErrorInfo } from '@workspace/logger'
 * ```
 */
export interface LoggerPackageExports {
  /** Singleton logger instance */
  logger: Logger

  /** Error extraction helper */
  extractErrorInfo: ExtractErrorInfo

  // Types (compile-time only, re-exported for consumer convenience)
  LogLevel: LogLevel
  LogContext: LogContext
  ErrorInfo: ErrorInfo
}

// ============================================================================
// PACKAGE METADATA
// ============================================================================

/**
 * Package configuration for @workspace/logger
 *
 * Defines the expected package.json structure and dependencies.
 */
export interface LoggerPackageConfig {
  name: '@workspace/logger'
  version: '0.0.1'
  type: 'module'
  private: true

  /** Main entry point (TypeScript source) */
  main: './src/index.ts'

  /** Type definitions entry point */
  types: './src/index.ts'

  /** Package exports configuration */
  exports: {
    '.': './src/index.ts'
  }

  /** Enable aggressive tree-shaking */
  sideEffects: false

  /** Development dependencies */
  devDependencies: {
    '@workspace/typescript-config': 'workspace:*'
    typescript: '^5.9.2'
  }
}

// ============================================================================
// USAGE CONSTRAINTS
// ============================================================================

/**
 * Documented constraints and limitations
 *
 * Consumers MUST be aware of these limitations:
 *
 * 1. **Debug Logs**: Only appear in development (NODE_ENV === 'development')
 *
 * 2. **Synchronous Only**: All logging is synchronous. No async operations.
 *
 * 3. **JSON Serialization**: In production, context is serialized to JSON.
 *    - Functions, symbols, undefined are silently dropped
 *    - Circular references will throw (not handled)
 *
 * 4. **No Configuration**: Logger is zero-config. Cannot change output format,
 *    log levels, or destinations at runtime.
 *
 * 5. **Environment Detection**: Based on NODE_ENV and VERCEL_ENV only.
 *    Custom environment detection is not supported.
 *
 * 6. **Browser Safety**: Uses defensive typeof checks for Node.js globals.
 *    Safe to use in both server and client code.
 */
export type LoggerConstraints = {
  maxMessageLength: undefined // No limit
  maxContextSize: undefined // No limit (but be mindful of JSON.stringify performance)
  asyncSupport: false
  configurableLogLevels: false
  configurableOutputFormat: false
  circularReferenceHandling: false
  externalServiceIntegration: false
}
