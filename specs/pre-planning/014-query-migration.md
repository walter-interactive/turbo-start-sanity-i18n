  The Winners: High-Value Migrations

  1. ✅ i18n.ts → Migrate to @workspace/sanity-atoms

  Reusability: 5/5 | Effort: 5 minutes | Refactoring: None

  - Why: The translationsFragment is 100% generic - works with ANY schema using @sanity/document-internationalization plugin
  - Value: Every tenant needs translation metadata queries
  - No brainer: Already well-documented, zero dependencies, perfect candidate

  2. ✅ link-helpers.ts → Migrate to new @workspace/sanity-utils

  Reusability: 4.5/5 | Effort: 15 minutes | Refactoring: Locale type dependency

  - Why: Contains sophisticated URL construction logic (145 lines) that every tenant needs
  - What it does: Builds localized paths from Sanity internal links (e.g., blog post reference → /fr/blog/mon-article)
  - Minor fix needed: Import Locale type from @workspace/i18n-config instead of app-specific routing
  - High impact: Prevents duplicating complex pathname logic across tenants

  3. ✅ locale-mapper.ts → Migrate to new @workspace/sanity-utils

  "Extract Pattern" Explained

  Extract Pattern means: Create a factory function in a shared package that wraps the boilerplate, but the client app still provides the
  project-specific values.

  Think of it like this:
  - ❌ NOT moving the entire file (because it contains client-specific config values)
  - ✅ YES extracting the configuration logic/pattern into a reusable function
  - Each client calls the factory with their own values

  ---
  Example 1: client.ts Migration

  Current State (Client-Specific)

  File: apps/template-web/src/lib/sanity/client.ts

  import createImageUrlBuilder from '@sanity/image-url'
  import { createClient } from 'next-sanity'
  import { apiVersion, dataset, projectId, studioUrl } from '../../config'

  // ❌ Lots of boilerplate configuration logic
  export const client = createClient({
    projectId,           // Client-specific value
    dataset,             // Client-specific value
    apiVersion,          // Client-specific value
    useCdn: process.env.NODE_ENV === 'production',  // Generic pattern
    perspective: 'published',                       // Generic pattern
    stega: {                                        // Generic pattern
      studioUrl,         // Client-specific value
      enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'  // Generic pattern
    }
  })

  // ❌ More boilerplate for image URL builder
  const imageBuilder = createImageUrlBuilder({
    projectId,  // Client-specific value
    dataset     // Client-specific value
  })

  // ❌ Image optimization chain (same for all clients)
  export const urlFor = (source: SanityImageSource) =>
    imageBuilder
      .image(source)
      .auto('format')
      .fit('max')
      .format('webp')

  Problems:
  - Every new client app copies these 25 lines
  - If we want to change CDN strategy or image optimization, we update N files
  - The pattern (useCdn, stega, image optimization) is duplicated

  ---
  After "Extract Pattern" Migration

  Shared Package: packages/sanity-config/src/client-factory.ts

  import createImageUrlBuilder from '@sanity/image-url'
  import { createClient as createNextSanityClient } from 'next-sanity'
  import type { SanityImageSource } from '@sanity/asset-utils'

  export interface SanityClientConfig {
    projectId: string
    dataset: string
    apiVersion: string
    studioUrl: string
    enablePreview?: boolean  // Optional override
  }

  /**
   * Create a configured Sanity client with standard settings.
   * 
   * Features:
   * - CDN enabled in production for performance
   * - Stega (draft mode) enabled for Vercel preview deployments
   * - Image optimization with WebP, auto-format, and max-fit
   * 
   * @param config - Sanity project configuration
   * @returns Object with { client, urlFor }
   * 
   * @example
   * ```typescript
   * import { createSanityClient } from '@workspace/sanity-config'
   * 
   * export const { client, urlFor } = createSanityClient({
   *   projectId: 'abc123',
   *   dataset: 'production',
   *   apiVersion: '2024-01-01',
   *   studioUrl: 'https://studio.example.com'
   * })
   * ```
   */
  export function createSanityClient(config: SanityClientConfig) {
    // ✅ Generic configuration logic lives here
    const client = createNextSanityClient({
      projectId: config.projectId,
      dataset: config.dataset,
      apiVersion: config.apiVersion,
      useCdn: process.env.NODE_ENV === 'production',
      perspective: 'published',
      stega: {
        studioUrl: config.studioUrl,
        enabled: config.enablePreview ?? process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
      }
    })

    // ✅ Generic image builder setup
    const imageBuilder = createImageUrlBuilder({
      projectId: config.projectId,
      dataset: config.dataset
    })

    // ✅ Standardized image optimization pipeline
    const urlFor = (source: SanityImageSource) =>
      imageBuilder
        .image(source)
        .auto('format')
        .fit('max')
        .format('webp')

    return { client, urlFor }
  }

  Client App: apps/template-web/src/lib/sanity/client.ts (AFTER migration)

  import { createSanityClient } from '@workspace/sanity-config'
  import { apiVersion, dataset, projectId, studioUrl } from '../../config'

  // ✅ Just 5 lines! Pass client-specific values to factory
  export const { client, urlFor } = createSanityClient({
    projectId,
    dataset,
    apiVersion,
    studioUrl
  })

  Client App: apps/template-web/src/config.ts (unchanged)

  import { assertValue } from '@workspace/utils'

  // ❌ Still client-specific - each project has different env vars
  export const projectId = assertValue(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID'
  )
  export const dataset = assertValue(
    process.env.NEXT_PUBLIC_SANITY_DATASET,
    'Missing NEXT_PUBLIC_SANITY_DATASET'
  )
  export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
  export const studioUrl = assertValue(
    process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
    'Missing NEXT_PUBLIC_SANITY_STUDIO_URL'
  )

  ---
  What This Achieves

  Before (25 lines per client):
  // Client A
  export const client = createClient({ /* 15 lines of config */ })
  const imageBuilder = createImageUrlBuilder({ /* ... */ })
  export const urlFor = (source) => imageBuilder.image(source).auto('format').fit('max').format('webp')

  // Client B  
  export const client = createClient({ /* 15 lines of config - DUPLICATE */ })
  const imageBuilder = createImageUrlBuilder({ /* ... */ })
  export const urlFor = (source) => imageBuilder.image(source).auto('format').fit('max').format('webp')

  // Client C
  export const client = createClient({ /* 15 lines of config - DUPLICATE */ })
  // ... same duplication

  After (5 lines per client):
  // Client A
  export const { client, urlFor } = createSanityClient({ projectId, dataset, apiVersion, studioUrl })

  // Client B
  export const { client, urlFor } = createSanityClient({ projectId, dataset, apiVersion, studioUrl })

  // Client C
  export const { client, urlFor } = createSanityClient({ projectId, dataset, apiVersion, studioUrl })

  Shared logic (single source of truth):
  // packages/sanity-config/src/client-factory.ts
  // All the configuration logic lives here (40 lines)
  // Change once, all clients benefit

  ---
  Example 2: live.ts Migration

  Current State (Client-Specific)

  File: apps/template-web/src/lib/sanity/live.ts

  import { defineLive } from 'next-sanity'
  import { client } from './client'      // ❌ Client-specific import
  import { token } from './token'        // ❌ Client-specific import

  // ❌ Simple config but duplicated across all clients
  export const { sanityFetch, SanityLive } = defineLive({
    client,
    serverToken: token,
    browserToken: token
  })

  ---
  After "Extract Pattern" Migration

  Shared Package: packages/sanity-config/src/live-preview.ts

  import { defineLive as defineNextSanityLive } from 'next-sanity'
  import type { SanityClient } from 'next-sanity'

  /**
   * Create live preview utilities for Sanity Studio integration.
   * 
   * Enables:
   * - Automatic revalidation when content changes
   * - Draft content preview in development
   * - Live updates in Sanity Studio presentation mode
   * 
   * @param client - Configured Sanity client
   * @param token - Sanity API token with read permissions
   * @returns Object with { sanityFetch, SanityLive }
   * 
   * @example
   * ```typescript
   * import { createLivePreview } from '@workspace/sanity-config'
   * import { client } from './client'
   * import { token } from './token'
   * 
   * export const { sanityFetch, SanityLive } = createLivePreview(client, token)
   * ```
   */
  export function createLivePreview(client: SanityClient, token: string) {
    return defineNextSanityLive({
      client,
      serverToken: token,
      browserToken: token
    })
  }

  Client App: apps/template-web/src/lib/sanity/live.ts (AFTER migration)

  import { createLivePreview } from '@workspace/sanity-config'
  import { client } from './client'
  import { token } from './token'

  // ✅ Just 1 line! Factory handles the boilerplate
  export const { sanityFetch, SanityLive } = createLivePreview(client, token)

  ---
  Key Differences: Extract Pattern vs Full Migration

  | Aspect                  | Extract Pattern                        | Full Migration                   |
  |-------------------------|----------------------------------------|----------------------------------|
  | Shared Package Contains | Configuration logic + factory function | Complete working code            |
  | Client App Contains     | Project-specific values + factory call | Just imports from shared package |
  | Example                 | createSanityClient(config)             | import { translationsFragment }  |
  | When to Use             | Code needs client-specific values      | Code is 100% generic             |
  | Examples                | client.ts, live.ts                     | i18n.ts, link-helpers.ts         |

  ---
  Visual Comparison

  Full Migration (e.g., i18n.ts)

  ┌─────────────────────────────────┐
  │ @workspace/sanity-atoms         │
  │                                 │
  │ export const translationsFragment = groq`...` │ ← Complete code
  └─────────────────────────────────┘
             ↑
             │ import
             │
  ┌─────────────────────────────────┐
  │ apps/template-web               │
  │                                 │
  │ import { translationsFragment } │ ← Just use it
  │   from '@workspace/sanity-atoms'│
  └─────────────────────────────────┘

  Extract Pattern (e.g., client.ts)

  ┌─────────────────────────────────┐
  │ @workspace/sanity-config        │
  │                                 │
  │ export function createSanityClient(config) { │ ← Factory
  │   return createClient({         │
  │     ...config,                  │
  │     useCdn: process.env...,     │ ← Generic logic
  │     stega: { ... }              │
  │   })                            │
  │ }                               │
  └─────────────────────────────────┘
             ↑
             │ import factory
             │ pass config values
             │
  ┌─────────────────────────────────┐
  │ apps/template-web               │
  │                                 │
  │ const { client } = createSanityClient({ │
  │   projectId: 'abc123',          │ ← Client-specific
  │   dataset: 'production'         │    values
  │ })                              │
  └─────────────────────────────────┘

  ---
  Real-World Benefits

  Scenario: Changing Image Optimization

  Without Extract Pattern (current):
  # Need to update 5 client apps
  apps/client-a/src/lib/sanity/client.ts    # Change .format('webp') to .format('avif')
  apps/client-b/src/lib/sanity/client.ts    # Change .format('webp') to .format('avif')
  apps/client-c/src/lib/sanity/client.ts    # Change .format('webp') to .format('avif')
  apps/client-d/src/lib/sanity/client.ts    # Change .format('webp') to .format('avif')
  apps/client-e/src/lib/sanity/client.ts    # Change .format('webp') to .format('avif')

  With Extract Pattern:
  // packages/sanity-config/src/client-factory.ts
  export function createSanityClient(config: SanityClientConfig) {
    // ...
    const urlFor = (source: SanityImageSource) =>
      imageBuilder
        .image(source)
        .auto('format')
        .fit('max')
        .format('avif')  // ← Change once, all clients updated

    return { client, urlFor }
  }

  All 5 client apps automatically get the new format. Zero changes needed in client code.

  ---
  Summary

  "Extract Pattern" means:
  1. ✅ Move the configuration logic to a shared factory function
  2. ✅ Client apps pass project-specific values to the factory
  3. ✅ Benefit: Standardization + flexibility

  When to use "Extract Pattern":
  - Code has generic logic + client-specific values
  - You want consistent configuration across clients
  - You want to update behavior globally without touching client apps

  When to use "Full Migration":
  - Code is 100% generic (like translationsFragment)
  - No client-specific values needed
  - Can be used as-is across all projects
