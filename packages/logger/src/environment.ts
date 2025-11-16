/**
 * Environment detection utility
 *
 * Separated from logging logic to follow Single Responsibility Principle.
 * Handles safe access to process.env with defensive checks for browser environments.
 */

import type { Environment } from './types'

/**
 * Determine if we're in development mode
 *
 * Uses defensive typeof check to safely work in browser environments
 * where process is not defined.
 */
export function isDevelopment(): boolean {
  return (
    typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'
  )
}

/**
 * Get current environment
 *
 * Priority order:
 * 1. VERCEL_ENV=production → 'production'
 * 2. VERCEL_ENV=preview → 'preview'
 * 3. NODE_ENV=development → 'development'
 * 4. Otherwise → 'unknown'
 *
 * Uses defensive typeof check to safely work in browser environments.
 */
export function detectEnvironment(): Environment {
  // Browser safety: process may not be defined
  if (typeof process === 'undefined') {
    return 'unknown'
  }

  // Check Vercel-specific environments first
  if (process.env?.VERCEL_ENV === 'production') {
    return 'production'
  }

  if (process.env?.VERCEL_ENV === 'preview') {
    return 'preview'
  }

  // Check Node.js development mode
  if (isDevelopment()) {
    return 'development'
  }

  return 'unknown'
}
