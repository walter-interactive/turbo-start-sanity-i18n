/**
 * Analytics utility for tracking user events
 *
 * Provides a unified interface for tracking analytics events
 * Supports multiple analytics providers (Google Analytics, Plausible, etc.)
 *
 * @example
 * import { analytics } from '@/lib/analytics'
 *
 * analytics.track('language_switch', { from: 'en', to: 'fr' })
 * analytics.track('page_view', { path: '/about', locale: 'fr' })
 */

import { logger } from '@workspace/logger'

interface AnalyticsEvent {
  name: string
  properties?: Record<string, string | number | boolean | undefined>
  timestamp: string
}

/**
 * Check if analytics should be enabled
 */
function isAnalyticsEnabled(): boolean {
  // Enable analytics in production and preview environments
  return (
    process.env.VERCEL_ENV === 'production'
    || process.env.VERCEL_ENV === 'preview'
  )
}

/**
 * Send event to Google Analytics (if available)
 */
function sendToGoogleAnalytics(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return

  // Check if gtag is available (Google Analytics)
  if ('gtag' in window && typeof window.gtag === 'function') {
    window.gtag('event', event.name, event.properties)
  }
}

/**
 * Send event to Plausible Analytics (if available)
 */
function sendToPlausible(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return

  // Check if plausible is available
  if ('plausible' in window && typeof window.plausible === 'function') {
    window.plausible(event.name, { props: event.properties })
  }
}

/**
 * Send event to console in development
 */
function logToConsole(event: AnalyticsEvent): void {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Analytics event tracked', {
      eventName: event.name,
      ...event.properties,
      timestamp: event.timestamp
    })
  }
}

/**
 * Core tracking function
 */
function trackEvent(
  name: string,
  properties?: Record<string, string | number | boolean | undefined>
): void {
  const event: AnalyticsEvent = {
    name,
    properties,
    timestamp: new Date().toISOString()
  }

  // Always log in development for debugging
  logToConsole(event)

  // Send to analytics providers if enabled
  if (isAnalyticsEnabled()) {
    sendToGoogleAnalytics(event)
    sendToPlausible(event)
  }
}

/**
 * Analytics tracking interface
 */
export const analytics = {
  /**
   * Track a generic event
   * @param name - Event name
   * @param properties - Event properties
   */
  track: (
    name: string,
    properties?: Record<string, string | number | boolean | undefined>
  ) => {
    trackEvent(name, properties)
  },

  /**
   * Track language switch event
   * @param params - Language switch parameters
   */
  trackLanguageSwitch: (params: {
    from: string
    to: string
    pathname: string
  }) => {
    trackEvent('language_switch', {
      from_locale: params.from,
      to_locale: params.to,
      page_path: params.pathname
    })
  },

  /**
   * Track page view event
   * @param params - Page view parameters
   */
  trackPageView: (params: { path: string; locale: string; title?: string }) => {
    trackEvent('page_view', {
      page_path: params.path,
      locale: params.locale,
      page_title: params.title
    })
  },

  /**
   * Track error event
   * @param params - Error event parameters
   */
  trackError: (params: { message: string; type: string; context?: string }) => {
    trackEvent('error', {
      error_message: params.message,
      error_type: params.type,
      error_context: params.context
    })
  }
}

/**
 * Type definitions for analytics providers
 */
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      eventParams?: Record<string, unknown>
    ) => void
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, unknown> }
    ) => void
  }
}
