/**
 * Shared logging utility for server-side and client-side logging
 *
 * Provides structured logging with environment-aware output.
 * In development, logs are human-readable. In production, logs are JSON.
 *
 * @example
 * ```typescript
 * import { logger } from '@workspace/logger'
 *
 * logger.info('User action', { action: 'language-switch', from: 'en', to: 'fr' })
 * logger.warn('Locale detection fallback', { requested: 'de', fallback: 'fr' })
 * logger.error('Failed to fetch data', { userId: '123', error: err })
 * ```
 *
 * @example Testing with custom environment
 * ```typescript
 * import { createLogger } from '@workspace/logger'
 *
 * const testLogger = createLogger('production')
 * testLogger.debug('This will be skipped') // Debug disabled in production
 * ```
 */

import { detectEnvironment } from './environment'
import { createLogger, extractErrorInfo } from './logger'

/**
 * Pre-configured logger singleton with auto-detected environment
 *
 * This is the default export for 99% of use cases.
 * The environment is detected once when the module is first imported.
 */
export const logger = createLogger(detectEnvironment())

/**
 * Export factory function for advanced use cases (testing, custom configs)
 */
export { createLogger, extractErrorInfo }

/**
 * Export environment utilities for advanced use cases
 */
export { detectEnvironment, isDevelopment } from './environment'

/**
 * Export types for consumer convenience
 */
export type { LogLevel, LogContext, ErrorInfo, Environment } from './types'
