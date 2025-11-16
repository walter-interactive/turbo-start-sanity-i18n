  Proposed Package Structure: @workspace/utils

  packages/utils/
  ├── package.json
  ├── tsconfig.json
  ├── README.md
  └── src/
      ├── string/
      │   ├── capitalize.ts
      │   ├── get-title-case.ts
      │   ├── convert-to-slug.ts
      │   └── index.ts
      ├── url/
      │   ├── is-relative-url.ts
      │   ├── is-valid-url.ts
      │   └── index.ts
      ├── error/
      │   ├── assert-value.ts
      │   ├── handle-errors.ts
      │   └── index.ts
      ├── types/
      │   ├── maybe.ts
      │   └── index.ts
      └── index.ts (main barrel export)

  ---
  File Contents

  1. package.json

  {
    "name": "@workspace/utils",
    "version": "0.0.1",
    "type": "module",
    "private": true,
    "main": "./src/index.ts",
    "types": "./src/index.ts",
    "exports": {
      ".": "./src/index.ts",
      "./string": "./src/string/index.ts",
      "./url": "./src/url/index.ts",
      "./error": "./src/error/index.ts",
      "./types": "./src/types/index.ts"
    },
    "sideEffects": false,
    "scripts": {
      "lint": "npx ultracite lint",
      "format": "npx ultracite fix",
      "check-types": "tsc --noEmit"
    },
    "dependencies": {
      "slugify": "^1.6.6"
    },
    "devDependencies": {
      "@types/node": "^20.0.0",
      "@workspace/typescript-config": "workspace:*",
      "typescript": "^5.9.2"
    }
  }

  Key Points:
  - Single dependency: slugify (inherited from template-web)
  - Multiple export paths for granular imports
  - Follows same pattern as @workspace/logger
  - sideEffects: false enables better tree-shaking

  ---
  2. tsconfig.json

  {
    "extends": "@workspace/typescript-config/base.json",
    "compilerOptions": {
      "outDir": "dist",
      "rootDir": "src"
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
  }

  ---
  3. String Utilities

  src/string/capitalize.ts

  /**
   * Capitalizes the first letter of a string.
   * 
   * @param str - The string to capitalize
   * @returns The string with the first letter capitalized
   * 
   * @example
   * ```ts
   * capitalize('hello') // 'Hello'
   * capitalize('world') // 'World'
   * ```
   */
  export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  src/string/get-title-case.ts

  /**
   * Converts a camelCase or PascalCase string to Title Case.
   * 
   * @param name - The string to convert
   * @returns The string in Title Case format
   * 
   * @example
   * ```ts
   * getTitleCase('myVariableName') // 'My Variable Name'
   * getTitleCase('userProfile') // 'User Profile'
   * ```
   */
  export function getTitleCase(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
  }

  src/string/convert-to-slug.ts

  import slugify from 'slugify'

  export interface ConvertToSlugOptions {
    /**
     * Fallback value if text is empty or undefined
     * @default 'top-level'
     */
    fallback?: string
  }

  /**
   * Converts text to a URL-safe slug.
   * 
   * @param text - The text to convert to a slug
   * @param options - Configuration options
   * @returns A URL-safe slug string
   * 
   * @example
   * ```ts
   * convertToSlug('Hello World!') // 'hello-world'
   * convertToSlug('My Blog Post') // 'my-blog-post'
   * convertToSlug(undefined, { fallback: 'home' }) // 'home'
   * ```
   */
  export function convertToSlug(
    text?: string,
    options?: ConvertToSlugOptions,
  ): string {
    const { fallback = 'top-level' } = options || {}
    if (!text) return fallback

    return slugify(text, {
      lower: true,
      strict: true,
    })
  }

  src/string/index.ts

  export { capitalize } from './capitalize'
  export { getTitleCase } from './get-title-case'
  export { convertToSlug, type ConvertToSlugOptions } from './convert-to-slug'

  ---
  4. URL Utilities

  src/url/is-relative-url.ts

  /**
   * Checks if a URL is relative (not absolute).
   * 
   * @param url - The URL to check
   * @returns true if the URL is relative, false otherwise
   * 
   * @example
   * ```ts
   * isRelativeUrl('/about') // true
   * isRelativeUrl('#section') // true
   * isRelativeUrl('?query=1') // true
   * isRelativeUrl('https://example.com') // false
   * ```
   */
  export function isRelativeUrl(url: string): boolean {
    return url.startsWith('/') || url.startsWith('#') || url.startsWith('?')
  }

  src/url/is-valid-url.ts

  import { isRelativeUrl } from './is-relative-url'

  /**
   * Validates if a string is a valid URL (absolute or relative).
   * 
   * @param url - The URL string to validate
   * @returns true if the URL is valid, false otherwise
   * 
   * @example
   * ```ts
   * isValidUrl('https://example.com') // true
   * isValidUrl('/about') // true
   * isValidUrl('not a url') // false
   * ```
   */
  export function isValidUrl(url: string): boolean {
    if (isRelativeUrl(url)) return true

    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  src/url/index.ts

  export { isRelativeUrl } from './is-relative-url'
  export { isValidUrl } from './is-valid-url'

  ---
  5. Error Handling Utilities

  src/error/assert-value.ts

  /**
   * Asserts that a value is not undefined, throwing an error if it is.
   * Provides type narrowing from T | undefined to T.
   * 
   * @param v - The value to assert
   * @param errorMessage - The error message to throw if value is undefined
   * @returns The value with type narrowing applied
   * @throws {Error} If the value is undefined
   * 
   * @example
   * ```ts
   * const apiKey = assertValue(process.env.API_KEY, 'API_KEY is required')
   * // Type of apiKey is now string (not string | undefined)
   * 
   * const config = assertValue(loadConfig(), 'Failed to load config')
   * ```
   */
  export function assertValue<T>(
    v: T | undefined,
    errorMessage: string,
  ): T {
    if (v === undefined) {
      throw new Error(errorMessage)
    }
    return v
  }

  src/error/handle-errors.ts

  /**
   * Response tuple type for error handling.
   * Returns either [data, undefined] on success or [undefined, error] on failure.
   */
  export type ErrorResponse<T> = [T, undefined] | [undefined, Error]

  /**
   * Wraps a promise in try-catch and returns a tuple instead of throwing.
   * Follows Go-style error handling pattern.
   * 
   * @param promise - The promise to handle
   * @returns A tuple of [data, undefined] on success or [undefined, error] on failure
   * 
   * @example
   * ```ts
   * const [data, error] = await handleErrors(fetchUser())
   * if (error) {
   *   console.error('Failed to fetch user:', error)
   *   return
   * }
   * // data is guaranteed to be defined here
   * console.log(data.name)
   * ```
   */
  export async function handleErrors<T>(
    promise: Promise<T>,
  ): Promise<ErrorResponse<T>> {
    try {
      const data = await promise
      return [data, undefined]
    } catch (error) {
      return [undefined, error as Error]
    }
  }

  src/error/index.ts

  export { assertValue } from './assert-value'
  export { handleErrors, type ErrorResponse } from './handle-errors'

  ---
  6. Type Utilities

  src/types/maybe.ts

  /**
   * Represents a value that can be T, null, or undefined.
   * Useful for optional values that may come from external sources.
   * 
   * @example
   * ```ts
   * type User = {
   *   name: string
   *   email: Maybe<string>  // string | null | undefined
   *   avatar: Maybe<string>
   * }
   * 
   * const user: User = {
   *   name: 'John',
   *   email: null,
   *   avatar: undefined
   * }
   * ```
   */
  export type Maybe<T> = T | null | undefined

  src/types/index.ts

  export type { Maybe } from './maybe'

  ---
  7. Main Barrel Export

  src/index.ts

  // String utilities
  export {
    capitalize,
    getTitleCase,
    convertToSlug,
    type ConvertToSlugOptions,
  } from './string'

  // URL utilities
  export {
    isRelativeUrl,
    isValidUrl,
  } from './url'

  // Error handling utilities
  export {
    assertValue,
    handleErrors,
    type ErrorResponse,
  } from './error'

  // Type utilities
  export type { Maybe } from './types'

  ---
  8. README.md

  # @workspace/utils

  Shared utility functions for the monorepo. Zero-dependency (except `slugify`) pure functions for common operations.

  ## Installation

  This is a workspace package. Add to your `package.json`:

  ```json
  {
    "dependencies": {
      "@workspace/utils": "workspace:*"
    }
  }

  Usage

  String Utilities

  import { capitalize, getTitleCase, convertToSlug } from '@workspace/utils'

  capitalize('hello') // 'Hello'
  getTitleCase('myVariableName') // 'My Variable Name'
  convertToSlug('Hello World!') // 'hello-world'

  URL Utilities

  import { isRelativeUrl, isValidUrl } from '@workspace/utils'

  isRelativeUrl('/about') // true
  isValidUrl('https://example.com') // true

  Error Handling

  import { assertValue, handleErrors } from '@workspace/utils'

  // Type-safe assertions
  const apiKey = assertValue(process.env.API_KEY, 'API_KEY is required')

  // Go-style error handling
  const [data, error] = await handleErrors(fetchUser())
  if (error) {
    console.error('Failed:', error)
    return
  }
  console.log(data) // Type-safe access

  Type Utilities

  import type { Maybe } from '@workspace/utils'

  type User = {
    name: string
    email: Maybe<string> // string | null | undefined
  }

  Granular Imports

  You can also import from specific categories:

  import { capitalize } from '@workspace/utils/string'
  import { isValidUrl } from '@workspace/utils/url'
  import { handleErrors } from '@workspace/utils/error'
  import type { Maybe } from '@workspace/utils/types'

  API Reference

  See TypeScript definitions for detailed documentation.

  ---

  ## Import Usage Examples

  ### Option 1: Main Export (Recommended for most cases)
  ```typescript
  import { capitalize, isValidUrl, assertValue } from '@workspace/utils'

  Option 2: Granular Category Imports (Better tree-shaking)

  import { capitalize, getTitleCase } from '@workspace/utils/string'
  import { isRelativeUrl, isValidUrl } from '@workspace/utils/url'
  import { assertValue } from '@workspace/utils/error'
  import type { Maybe } from '@workspace/utils/types'

  Option 3: Mixed (Use what feels natural)

  import { capitalize } from '@workspace/utils'
  import type { Maybe } from '@workspace/utils/types'

  ---
  Migration Impact

  Files to Update in apps/template-web

  1. Remove from apps/template-web/src/utils.ts:
    - Lines 4-10 (assertValue)
    - Lines 23-24 (isRelativeUrl)
    - Lines 26-33 (isValidUrl)
    - Lines 35-36 (capitalize)
    - Lines 38-41 (getTitleCase)
    - Lines 43-54 (handleErrors + Response type)
    - Lines 56-67 (convertToSlug)
  2. Remove from apps/template-web/src/types.ts:
    - Line 30 (Maybe<T> type)
  3. Update imports in consuming files (~13 files):
    - apps/template-web/src/config.ts (uses assertValue)
    - apps/template-web/src/app/api/og/og-data.ts (uses handleErrors)
    - Multiple files using getTitleCase, convertToSlug, etc.
  4. Update apps/template-web/package.json:
  {
    "dependencies": {
      "@workspace/utils": "workspace:*",
      // ... remove slugify (now in @workspace/utils)
    }
  }

  ---
  Package Statistics

  - Total Files: 17 (including config files)
  - Source Files: 12 TypeScript files
  - Lines of Code: ~250 (with docs and types)
  - External Dependencies: 1 (slugify)
  - Dev Dependencies: 2 (typescript, @workspace/typescript-config)
  - Bundle Size (estimated): ~4-5KB minified+gzipped

  ---
  Comparison with Existing Packages

  | Package           | Files | Dependencies | Purpose           |
  |-------------------|-------|--------------|-------------------|
  | @workspace/logger | 4     | 0            | Logging utility   |
  | @workspace/utils  | 12    | 1 (slugify)  | General utilities |
  | @workspace/ui     | 20+   | 10+          | UI components     |

  Consistency: Follows same structure as @workspace/logger for consistency.
