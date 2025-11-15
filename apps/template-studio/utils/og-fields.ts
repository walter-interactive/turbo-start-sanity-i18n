/**
 * Open Graph Field Definitions
 *
 * Provides reusable Open Graph (OG) metadata fields for social sharing.
 * These fields control how content appears when shared on social platforms
 * like Facebook, LinkedIn, and Twitter/X.
 *
 * All fields are optional overrides - if left blank, they inherit from
 * either SEO fields or the document's primary fields.
 *
 * @example
 * ```typescript
 * // In a blog post schema
 * defineType({
 *   name: "blog",
 *   type: "document",
 *   groups: GROUPS,
 *   fields: [
 *     ...ogFields, // Adds OG fields with proper grouping
 *     // other fields...
 *   ]
 * })
 * ```
 *
 * @remarks
 * These fields are grouped under GROUP.OG, which displays them in a
 * separate "Open Graph" tab in the Studio editor. This keeps social
 * media metadata separate from general SEO settings for clarity.
 */

import { defineField } from 'sanity'
import { GROUP } from './constant'

/**
 * Array of Open Graph field definitions
 *
 * Fields included:
 * - ogTitle: Open Graph title override (for social cards)
 * - ogDescription: Open Graph description override (max 160 chars)
 *
 * Note: OG image is typically handled by seoImage field to avoid duplication.
 */
export const ogFields = [
  defineField({
    name: 'ogTitle',
    title: 'Open graph title override',
    description:
      'This will override the open graph title. If left blank it will inherit the page title.',
    type: 'string',
    validation: (Rule) => Rule.warning('A page title is required'),
    group: GROUP.OG
  }),
  defineField({
    name: 'ogDescription',
    title: 'Open graph description override',
    description:
      'This will override the meta description. If left blank it will inherit the description from the page description.',
    type: 'text',
    rows: 2,
    validation: (Rule) => [
      Rule.warning('A description is required'),
      Rule.max(160).warning('No more than 160 characters')
    ],
    group: GROUP.OG
  })
]
