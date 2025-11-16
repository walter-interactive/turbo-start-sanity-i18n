/**
 * Core logging functionality
 *
 * Pure logging logic without environment detection.
 * Follows Single Responsibility Principle.
 */

import type { LogLevel, LogContext, LogEntry, Environment } from './types'

/**
 * Format log entry for human-readable output (development)
 */
function formatLogEntry(entry: LogEntry): string {
  const { level, message, timestamp, context } = entry
  const contextStr = context ? ` ${JSON.stringify(context)}` : ''
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
}

/**
 * Core logging function
 */
function log(
  level: LogLevel,
  message: string,
  context: LogContext | undefined,
  environment: Environment
): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    environment
  }

  // In development, use console methods with colors (human-readable)
  if (environment === 'development') {
    const formattedMessage = formatLogEntry(entry)
    switch (level) {
      case 'error':
        console.error(formattedMessage)
        break
      case 'warn':
        console.warn(formattedMessage)
        break
      case 'info':
        console.info(formattedMessage)
        break
      case 'debug':
        console.debug(formattedMessage)
        break
    }
    return
  }

  // In production/preview/unknown, use structured JSON logging
  // Log errors, warnings, and info in production (debug is development-only)
  if (level === 'error' || level === 'warn' || level === 'info') {
    console.error(JSON.stringify(entry))
  }
}

/**
 * Create a logger instance with the specified environment
 *
 * @param environment - The environment the logger is running in
 * @returns Logger instance with info, warn, error, and debug methods
 *
 * @example
 * ```typescript
 * import { createLogger } from '@workspace/logger'
 *
 * const logger = createLogger('production')
 * logger.info('Application started')
 * ```
 */
export function createLogger(environment: Environment) {
  return {
    /**
     * Log informational messages
     * @param message - Log message
     * @param context - Additional context
     */
    info: (message: string, context?: LogContext) => {
      log('info', message, context, environment)
    },

    /**
     * Log warning messages
     * @param message - Warning message
     * @param context - Additional context
     */
    warn: (message: string, context?: LogContext) => {
      log('warn', message, context, environment)
    },

    /**
     * Log error messages
     * @param message - Error message
     * @param context - Additional context including error details
     */
    error: (message: string, context?: LogContext) => {
      log('error', message, context, environment)
    },

    /**
     * Log debug messages (only in development)
     * @param message - Debug message
     * @param context - Additional context
     */
    debug: (message: string, context?: LogContext) => {
      if (environment === 'development') {
        log('debug', message, context, environment)
      }
    }
  }
}

/**
 * Helper to extract error information for logging
 *
 * @param error - Error object or unknown error
 * @returns Structured error information
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation()
 * } catch (err) {
 *   logger.error('Operation failed', { error: extractErrorInfo(err) })
 * }
 * ```
 */
export function extractErrorInfo(error: unknown): {
  message: string
  stack?: string
  type: string
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      type: error.name
    }
  }

  return {
    message: String(error),
    type: 'UnknownError'
  }
}
