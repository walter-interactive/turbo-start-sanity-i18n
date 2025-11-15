import { createClient } from '@sanity/client'
import { documentEventHandler } from '@sanity/functions'

/**
 * Auto-redirect document event handler that creates redirect records when document slugs change.
 *
 * Automatically generates a redirect from the old slug to the new slug to prevent broken links
 * and maintain SEO value. Includes validation to prevent duplicate redirects and redirect loops.
 *
 * @param context - Sanity function context containing client options
 * @param event - Document event containing the before and after slug values
 * @returns Promise that resolves when redirect is created or validation fails
 *
 * @example
 * // When a document's slug changes from '/blog/old-post' to '/blog/new-post'
 * // A redirect document is automatically created with:
 * // - source: '/blog/old-post'
 * // - destination: '/blog/new-post'
 * // - status: 'active'
 * // - permanent: 'true' (301 redirect)
 */
export const handler = documentEventHandler(async ({ context, event }) => {
  const client = createClient({
    ...context.clientOptions,
    useCdn: false,
    apiVersion: '2025-05-08'
  })

  const { beforeSlug, slug } = event.data

  // Ensure both slugs exist
  if (!(slug && beforeSlug)) {
    console.log('No slug or beforeSlug')
    return
  }
  // Ensure slug actually changed
  if (slug === beforeSlug) {
    console.log('Slug did not change')
    return
  }
  // Check if redirect already exists for the old slug
  const existingRedirect = await client.fetch(
    `*[_type == "redirect" && source.current == $beforeSlug][0]`,
    { beforeSlug }
  )
  if (existingRedirect) {
    console.log(`Redirect already exists for source ${beforeSlug}`)
    return
  }
  // Check for redirect loops (opposite redirect exists)
  const loopRedirect = await client.fetch(
    `*[_type == "redirect" && source.current == $slug && destination.current == $beforeSlug][0]`,
    { slug, beforeSlug }
  )
  if (loopRedirect) {
    console.log('Redirect loop detected')
    return
  }
  const redirect = {
    _type: 'redirect',
    status: 'active',
    source: {
      current: beforeSlug
    },
    destination: {
      current: slug
    },
    permanent: 'true'
  }

  try {
    const res = await client.create(redirect)
    console.log(
      `🔗 Redirect from ${beforeSlug} to ${slug} was created ${JSON.stringify(res)}`
    )
  } catch (error) {
    console.log(error)
  }
})
