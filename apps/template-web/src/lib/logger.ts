/**
 * Logging utility for server-side and client-side logging
 *
 * Provides structured logging with environment-aware output
 * In production, logs can be sent to external services
 *
 * @example
 * import { logger } from '@/lib/logger'
 *
 * logger.error('Failed to fetch data', { userId: '123', error: err })
 * logger.warn('Locale detection fallback', { requested: 'de', fallback: 'fr' })
 * logger.info('User action', { action: 'language-switch', from: 'en', to: 'fr' })
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  environment: string;
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  const { level, message, timestamp, context } = entry;
  const contextStr = context ? ` ${JSON.stringify(context)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

/**
 * Determine if we're in development mode
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Get current environment
 */
function getEnvironment(): string {
  if (process.env.VERCEL_ENV === "production") return "production";
  if (process.env.VERCEL_ENV === "preview") return "preview";
  if (isDevelopment()) return "development";
  return "unknown";
}

/**
 * Core logging function
 */
function log(level: LogLevel, message: string, context?: LogContext): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    environment: getEnvironment(),
  };

  // In development, use console methods with colors
  if (isDevelopment()) {
    const formattedMessage = formatLogEntry(entry);
    switch (level) {
      case "error":
        console.error(formattedMessage);
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "info":
        console.info(formattedMessage);
        break;
      case "debug":
        console.debug(formattedMessage);
        break;
    }
    return;
  }

  // In production, use structured logging
  // This can be extended to send to external services (e.g., Sentry, LogRocket, Datadog)
  // Log errors, warnings, and info in production (debug is development-only)
  if (level === "error" || level === "warn" || level === "info") {
    console.error(JSON.stringify(entry));
  }
}

/**
 * Logger instance with typed methods
 */
export const logger = {
  /**
   * Log informational messages
   * @param message - Log message
   * @param context - Additional context
   */
  info: (message: string, context?: LogContext) => {
    log("info", message, context);
  },

  /**
   * Log warning messages
   * @param message - Warning message
   * @param context - Additional context
   */
  warn: (message: string, context?: LogContext) => {
    log("warn", message, context);
  },

  /**
   * Log error messages
   * @param message - Error message
   * @param context - Additional context including error details
   */
  error: (message: string, context?: LogContext) => {
    log("error", message, context);
  },

  /**
   * Log debug messages (only in development)
   * @param message - Debug message
   * @param context - Additional context
   */
  debug: (message: string, context?: LogContext) => {
    if (isDevelopment()) {
      log("debug", message, context);
    }
  },
};

/**
 * Helper to extract error information for logging
 * @param error - Error object or unknown error
 * @returns Structured error information
 */
export function extractErrorInfo(error: unknown): {
  message: string;
  stack?: string;
  type: string;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      type: error.name,
    };
  }

  return {
    message: String(error),
    type: "UnknownError",
  };
}
