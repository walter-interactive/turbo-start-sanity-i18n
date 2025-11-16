/**
 * Type definitions for the logger package
 */

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
 */
export type LogContext = {
  [key: string]: unknown
}

/**
 * Internal log entry structure
 */
export type LogEntry = {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  environment: string
}

/**
 * Structured error information
 */
export type ErrorInfo = {
  message: string
  stack?: string
  type: string
}

/**
 * Environment types
 */
export type Environment = 'development' | 'production' | 'preview' | 'unknown'
