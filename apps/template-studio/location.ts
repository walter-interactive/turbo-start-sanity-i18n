/**
 * Presentation Tool Location Resolvers
 *
 * Defines how Studio documents map to frontend preview URLs. When editing a document
 * in the Studio, these resolvers tell the Presentation tool which URL(s) to load in
 * the preview iframe.
 *
 * Each document type can resolve to multiple locations (e.g., a blog post appears
 * on both its detail page and the blog index page).
 *
 * @remarks
 * These location resolvers work with the presentationTool plugin configured in
 * sanity.config.ts. The preview URLs must match the routing structure in apps/web.
 *
 * @example
 * ```typescript
 * // When editing a blog post with slug "/blog/my-post":
 * // - Primary location: /blog/my-post (detail page)
 * // - Secondary location: /blog (index page showing this post)
 * ```
 */

import { defineLocations } from "sanity/presentation";

/**
 * Location resolver configuration for all document types
 *
 * Each key matches a document type name (_type field), and the value defines
 * how to generate preview URLs for documents of that type.
 */
export const locations = {
  /**
   * Blog post location resolver
   *
   * Returns two preview locations:
   * 1. The blog post detail page (using its slug)
   * 2. The blog index page (where the post appears in the list)
   */
  blog: defineLocations({
    select: {
      title: "title",
      slug: "slug.current",
    },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || "Untitled",
          href: `${doc?.slug}`,
        },
        {
          title: "Blog",
          href: "/blog",
        },
      ],
    }),
  }),
  /**
   * Homepage location resolver
   *
   * Always resolves to "/" regardless of the document's slug field.
   */
  home: defineLocations({
    select: {
      title: "title",
      slug: "slug.current",
    },
    resolve: () => ({
      locations: [
        {
          title: "Home",
          href: "/",
        },
      ],
    }),
  }),

  /**
   * Generic page location resolver
   *
   * Returns a single location using the page's slug.
   * Used for all standard pages (About, Contact, etc.)
   */
  page: defineLocations({
    select: {
      title: "title",
      slug: "slug.current",
    },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || "Untitled",
          href: `${doc?.slug}`,
        },
      ],
    }),
  }),
};
