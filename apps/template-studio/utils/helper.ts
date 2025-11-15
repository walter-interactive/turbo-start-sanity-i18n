import { isPortableTextTextBlock, type StringOptions } from 'sanity'

/**
 * Checks if a URL is a relative path (starts with /, #, or ?)
 *
 * @param url - URL string to check
 * @returns True if URL is relative, false otherwise
 *
 * @example
 * ```typescript
 * isRelativeUrl("/about") // => true
 * isRelativeUrl("#section") // => true
 * isRelativeUrl("?query=123") // => true
 * isRelativeUrl("https://example.com") // => false
 * ```
 */
export const isRelativeUrl = (url: string) =>
  url.startsWith('/') || url.startsWith('#') || url.startsWith('?')

/**
 * Validates if a string is a valid URL or relative path
 *
 * Attempts to parse as absolute URL first, then falls back to checking
 * if it's a valid relative path. Used in custom-url.ts for link validation.
 *
 * @param url - URL string to validate
 * @returns True if URL is valid (absolute or relative), false otherwise
 *
 * @example
 * ```typescript
 * isValidUrl("https://example.com") // => true
 * isValidUrl("/about") // => true
 * isValidUrl("not a url") // => false
 * ```
 */
export const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch (_e) {
    return isRelativeUrl(url)
  }
}

/**
 * Capitalizes the first letter of a string
 *
 * @param str - String to capitalize
 * @returns String with first letter uppercase
 *
 * @example
 * ```typescript
 * capitalize("hello") // => "Hello"
 * capitalize("HELLO") // => "HELLO" (only first char affected)
 * ```
 */
export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1)

/**
 * Converts camelCase or PascalCase to Title Case with spaces
 *
 * Inserts spaces before capital letters and capitalizes the first letter.
 * Used for converting schema type names to human-readable titles.
 *
 * @param name - camelCase or PascalCase string
 * @returns Title Case string with spaces
 *
 * @example
 * ```typescript
 * getTitleCase("blogPost") // => "Blog Post"
 * getTitleCase("faqAccordion") // => "Faq Accordion"
 * getTitleCase("homePage") // => "Home Page"
 * ```
 */
export const getTitleCase = (name: string) => {
  const titleTemp = name.replace(/([A-Z])/g, ' $1')
  return titleTemp.charAt(0).toUpperCase() + titleTemp.slice(1)
}

/**
 * Creates a radio list layout configuration for Sanity string fields
 *
 * Converts an array of strings or title/value objects into Sanity's radio
 * list format with automatic title case conversion. Used for variant selectors
 * like button styles, layout options, etc.
 *
 * @param items - Array of option strings or {title, value} objects
 * @param options - Additional Sanity StringOptions to merge (e.g., direction)
 * @returns Sanity StringOptions configured as radio list
 *
 * @example
 * ```typescript
 * // Simple string array
 * createRadioListLayout(["default", "secondary", "outline"])
 * // => { layout: "radio", list: [{title: "Default", value: "default"}, ...] }
 *
 * // With custom direction
 * createRadioListLayout(["small", "large"], { direction: "horizontal" })
 * ```
 */
export const createRadioListLayout = (
  items: Array<string | { title: string; value: string }>,
  options?: StringOptions
): StringOptions => {
  const list = items.map((item) => {
    if (typeof item === 'string') {
      return {
        title: getTitleCase(item),
        value: item
      }
    }
    return item
  })
  return {
    layout: 'radio',
    list,
    ...options
  }
}

/**
 * Converts Portable Text (rich text) to plain string
 *
 * Extracts plain text from Sanity's Portable Text structure, optionally
 * truncating to a maximum word count. Used for previews and summaries.
 *
 * @param value - Portable Text array from Sanity
 * @param maxWords - Optional maximum number of words to include (adds "..." if truncated)
 * @returns Plain text string or "No Content" if invalid input
 *
 * @example
 * ```typescript
 * const richText = [{_type: "block", children: [{text: "Hello world"}]}];
 * parseRichTextToString(richText) // => "Hello world"
 * parseRichTextToString(richText, 1) // => "Hello..."
 * parseRichTextToString(null) // => "No Content"
 * ```
 */
export const parseRichTextToString = (
  value: unknown,
  maxWords: number | undefined
) => {
  if (!Array.isArray(value)) {
    return 'No Content'
  }

  const text = value.map((val) => {
    const test = isPortableTextTextBlock(val)
    if (!test) {
      return ''
    }
    return val.children
      .map((child) => child.text)
      .filter(Boolean)
      .join(' ')
  })
  if (maxWords) {
    return `${text.join(' ').split(' ').slice(0, maxWords).join(' ')}...`
  }
  return text.join(' ')
}

/**
 * Splits an array into N roughly equal chunks (round-robin distribution)
 *
 * Distributes array elements across chunks in round-robin fashion, ensuring
 * balanced distribution even for uneven array lengths. Useful for creating
 * multi-column layouts.
 *
 * @param array - Array to split
 * @param numChunks - Number of chunks to create
 * @returns Array of chunk arrays
 *
 * @example
 * ```typescript
 * splitArray([1, 2, 3, 4, 5], 2) // => [[1, 3, 5], [2, 4]]
 * splitArray(["a", "b", "c"], 3) // => [["a"], ["b"], ["c"]]
 * ```
 */
export function splitArray<T>(array: T[], numChunks: number): T[][] {
  const result: T[][] = Array.from({ length: numChunks }, () => [])
  for (let i = 0; i < array.length; i++) {
    const item = array[i] as T
    const chunk = result[i % numChunks] as T[]
    chunk.push(item)
  }
  return result
}

export type RetryOptions = {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  onRetry?: (error: Error, attempt: number) => void
}

/**
 * Retries a failed promise with exponential backoff
 *
 * Attempts to resolve a promise multiple times with increasing delay between
 * attempts. Uses exponential backoff strategy (2^attempt * initialDelay) with
 * a configurable maximum delay cap.
 *
 * @param promiseFn - Promise to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves with the successful result
 * @throws Last error if all retry attempts fail
 *
 * @example
 * ```typescript
 * // Retry API call up to 5 times
 * const data = await retryPromise(
 *   fetch("https://api.example.com/data").then(r => r.json()),
 *   {
 *     maxRetries: 5,
 *     initialDelay: 1000,
 *     onRetry: (error, attempt) => console.log(`Retry ${attempt}: ${error.message}`)
 *   }
 * );
 * ```
 *
 * @remarks
 * Backoff delay calculation: min(initialDelay * 2^(attempt-1), maxDelay)
 * - Attempt 1: 1000ms
 * - Attempt 2: 2000ms
 * - Attempt 3: 4000ms (capped at maxDelay if exceeded)
 */
export async function retryPromise<T>(
  promiseFn: Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30_000,
    onRetry
  } = options

  let attempt = 0
  let lastError: Error | null = null

  while (attempt < maxRetries) {
    try {
      // Attempt the async operation
      return await promiseFn
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Unknown error')
      lastError = error
      attempt++

      if (onRetry) {
        onRetry(error, attempt)
      }

      if (attempt >= maxRetries) {
        throw error
      }

      const backoff = Math.min(initialDelay * 2 ** (attempt - 1), maxDelay)
      await new Promise((r) => setTimeout(r, backoff))
    }
  }

  throw lastError ?? new Error('Promise retry failed')
}

/**
 * Converts a URL pathname to a human-readable title
 */
export function pathnameToTitle(pathname: string): string {
  if (pathname === '/') {
    return 'Home'
  }
  const lastSegment = pathname.split('/').filter(Boolean).pop() || ''
  return lastSegment
    .charAt(0)
    .toUpperCase()
    .concat(lastSegment.slice(1).replace(/-/g, ' '))
}

export const getTemplateName = (template: string) => `${template}-with-slug`

/**
 * Creates Sanity document templates with slug pre-population
 *
 * Generates template configurations for page and blog document types that
 * accept a slug parameter. Used in Sanity config to enable "Create with slug"
 * functionality from nested folder structures.
 *
 * @returns Array of template configurations for Sanity
 *
 * @example
 * ```typescript
 * // In sanity.config.ts
 * const templates = createPageTemplate();
 * // Enables: S.intent.create({ type: "page", template: "page-with-slug" }, { slug: "/about" })
 * ```
 *
 * @remarks
 * Template parameters:
 * - schemaType: "page" or "blog"
 * - id: Generated by getTemplateName() helper
 * - value: Function that accepts slug parameter and returns initial document state
 */
export function createPageTemplate() {
  const pages = [
    {
      title: 'Page',
      type: 'page'
    },
    {
      title: 'Blog',
      type: 'blog'
    }
  ]
  return pages.map((page) => ({
    schemaType: page.type,
    id: getTemplateName(page.type),
    title: `${page.title} with slug`,
    value: (props: { slug?: string }) => ({
      ...(props.slug ? { slug: { current: props.slug, _type: 'slug' } } : {})
    }),
    parameters: [
      {
        name: 'slug',
        type: 'string'
      }
    ]
  }))
}

/**
 * Determines the presentation URL based on the current environment.
 * Uses localhost:3000 for development.
 * In production, requires SANITY_STUDIO_PRESENTATION_URL to be set.
 * @throws {Error} If SANITY_STUDIO_PRESENTATION_URL is not set in production
 */
export const getPresentationUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }

  const presentationUrl = process.env.SANITY_STUDIO_PRESENTATION_URL
  if (!presentationUrl) {
    throw new Error(
      'SANITY_STUDIO_PRESENTATION_URL must be set in production environment'
    )
  }

  return presentationUrl
}
