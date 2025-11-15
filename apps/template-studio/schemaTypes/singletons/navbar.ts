/**
 * Navbar (Site Navigation) Document Schema
 *
 * PURPOSE:
 * Configures the main site navigation menu structure with support for multi-level
 * navigation, column layouts, and action buttons. One navbar document exists per language.
 *
 * KEY FEATURES:
 * - Flexible structure: Mix of navigation columns and individual links
 * - Column groups: Organize links into labeled sections with icons and descriptions
 * - Individual links: Standalone navigation items for simple menus
 * - Action buttons: CTA buttons in navigation bar (e.g., "Sign Up", "Contact")
 * - Label field: Internal CMS identifier (typically "Navbar")
 *
 * I18N SUPPORT: Yes - Fully translatable (French, English, Spanish)
 * ORDERING: No - Singleton per language
 * SINGLETON: Yes - One instance per language
 *
 * SPECIAL BEHAVIORS:
 * - Mixed structure: Accepts both navbarColumn and navbarLink in columns array
 * - Nested objects: Column and link types defined inline, not as separate schemas
 * - URL preview: Shows truncated URLs (30 chars) with new tab indicator (↗)
 * - Icon support: Column links can include icons from icon picker plugin
 *
 * NESTED TYPES:
 * - navbarColumn: Group of links with optional title and descriptions
 * - navbarColumnLink: Link with icon, name, description, and URL
 * - navbarLink: Simple link with name and URL
 *
 * RELATED TYPES:
 * - customUrl: Used for internal/external link configuration
 * - iconField: Icon picker for visual navigation elements
 * - buttonsField: Action buttons array
 *
 * USAGE LOCATIONS:
 * - Studio sidebar: apps/studio/structure.ts (Navbar section)
 * - Frontend: Header/navigation component queries navbar by language
 */

import { buttonsGroupSchema } from '@walter/sanity-atoms/schemas/buttons'
import { LayoutPanelLeft, Link, PanelTop } from 'lucide-react'
import { defineField, defineType } from 'sanity'
import { iconField, languageField } from '../common'

const navbarLink = defineField({
  name: 'navbarLink',
  type: 'object',
  icon: Link,
  title: 'Navigation Link',
  description: 'Individual navigation link with name and URL',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Link Text',
      description: 'The text that will be displayed for this navigation link'
    }),
    defineField({
      name: 'url',
      type: 'customUrl',
      title: 'Link URL',
      description: 'The URL that this link will navigate to when clicked'
    })
  ],
  preview: {
    select: {
      title: 'name',
      externalUrl: 'url.external',
      urlType: 'url.type',
      internalUrl: 'url.internal.slug.current',
      openInNewTab: 'url.openInNewTab'
    },
    prepare({ title, externalUrl, urlType, internalUrl, openInNewTab }) {
      const url = urlType === 'external' ? externalUrl : internalUrl
      const newTabIndicator = openInNewTab ? ' ↗' : ''
      const truncatedUrl = url?.length > 30 ? `${url.substring(0, 30)}...` : url

      return {
        title: title || 'Untitled Link',
        subtitle: `${urlType === 'external' ? 'External' : 'Internal'} • ${truncatedUrl}${newTabIndicator}`,
        media: Link
      }
    }
  }
})

const navbarColumnLink = defineField({
  name: 'navbarColumnLink',
  type: 'object',
  icon: LayoutPanelLeft,
  title: 'Navigation Column Link',
  description: 'A link within a navigation column',
  fields: [
    iconField,
    defineField({
      name: 'name',
      type: 'string',
      title: 'Link Text',
      description: 'The text that will be displayed for this navigation link'
    }),
    defineField({
      name: 'description',
      type: 'string',
      title: 'Description',
      description: 'The description for this navigation link'
    }),
    defineField({
      name: 'url',
      type: 'customUrl',
      title: 'Link URL',
      description: 'The URL that this link will navigate to when clicked'
    })
  ],
  preview: {
    select: {
      title: 'name',
      externalUrl: 'url.external',
      urlType: 'url.type',
      internalUrl: 'url.internal.slug.current',
      openInNewTab: 'url.openInNewTab'
    },
    prepare({ title, externalUrl, urlType, internalUrl, openInNewTab }) {
      const url = urlType === 'external' ? externalUrl : internalUrl
      const newTabIndicator = openInNewTab ? ' ↗' : ''
      const truncatedUrl = url?.length > 30 ? `${url.substring(0, 30)}...` : url

      return {
        title: title || 'Untitled Link',
        subtitle: `${urlType === 'external' ? 'External' : 'Internal'} • ${truncatedUrl}${newTabIndicator}`,
        media: Link
      }
    }
  }
})

const navbarColumn = defineField({
  name: 'navbarColumn',
  type: 'object',
  icon: LayoutPanelLeft,
  title: 'Navigation Column',
  description: 'A column of navigation links with an optional title',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Column Title',
      description:
        'The heading text displayed above this group of navigation links'
    }),
    defineField({
      name: 'links',
      type: 'array',
      title: 'Column Links',
      validation: (rule) => [rule.required(), rule.unique()],
      description: 'The list of navigation links to display in this column',
      of: [navbarColumnLink]
    })
  ],
  preview: {
    select: {
      title: 'title',
      links: 'links'
    },
    prepare({ title, links = [] }) {
      return {
        title: title || 'Untitled Column',
        subtitle: `${links.length} link${links.length === 1 ? '' : 's'}`
      }
    }
  }
})

export const navbar = defineType({
  name: 'navbar',
  title: 'Site Navigation',
  type: 'document',
  icon: PanelTop,
  description: 'Configure the main navigation structure for your site',
  fields: [
    languageField,
    defineField({
      name: 'label',
      type: 'string',
      initialValue: 'Navbar',
      title: 'Navigation Label',
      description:
        'Internal label to identify this navigation configuration in the CMS',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'columns',
      type: 'array',
      title: 'Navigation Structure',
      description:
        'Build your navigation menu using columns and links. Add either a column of links or individual links.',
      of: [navbarColumn, navbarLink]
    }),
    buttonsGroupSchema
  ],
  preview: {
    select: {
      title: 'label'
    },
    prepare: ({ title }) => ({
      title: title || 'Untitled Navigation'
    })
  }
})
