/**
 * Settings Document Schema
 *
 * PURPOSE:
 * Global website configuration including site identity, branding, contact information,
 * and social media links. One settings document exists per language for localized content.
 *
 * KEY FEATURES:
 * - Site identity: Title, description, and logo
 * - Contact information: Primary email address
 * - Social media: Links to LinkedIn, Facebook, Twitter, Instagram, YouTube
 * - Label field: Internal CMS identifier (typically "Settings")
 * - Validation: Required fields for title, description, and label
 *
 * I18N SUPPORT: Yes - Fully translatable (French, English, Spanish)
 * ORDERING: No - Singleton per language
 * SINGLETON: Yes - One instance per language
 *
 * SPECIAL BEHAVIORS:
 * - Description validation: Must be 50-160 characters for SEO compliance
 * - Email validation: Uses Sanity's built-in email validation rule
 * - Logo hotspot: Image field supports focal point selection for cropping
 * - Social links: Nested object with optional fields for flexibility
 *
 * RELATED TYPES:
 * - languageField: Language selection for i18n support
 * - socialLinks: Nested object definition for social media URLs
 *
 * USAGE LOCATIONS:
 * - Studio sidebar: apps/studio/structure.ts (Settings section)
 * - Frontend: Likely used in header/footer components for site branding
 * - SEO: Site title and description used for default metadata
 */

import { CogIcon } from 'lucide-react'
import { defineField, defineType } from 'sanity'
import { languageField } from '../common'

const socialLinks = defineField({
  name: 'socialLinks',
  title: 'Social Media Links',
  description: 'Add links to your social media profiles',
  type: 'object',
  fields: [
    defineField({
      name: 'linkedin',
      title: 'LinkedIn URL',
      description: 'Full URL to your LinkedIn profile/company page',
      type: 'string'
    }),
    defineField({
      name: 'facebook',
      title: 'Facebook URL',
      description: 'Full URL to your Facebook profile/page',
      type: 'string'
    }),
    defineField({
      name: 'twitter',
      title: 'Twitter/X URL',
      description: 'Full URL to your Twitter/X profile',
      type: 'string'
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram URL',
      description: 'Full URL to your Instagram profile',
      type: 'string'
    }),
    defineField({
      name: 'youtube',
      title: 'YouTube URL',
      description: 'Full URL to your YouTube channel',
      type: 'string'
    })
  ]
})

export const settings = defineType({
  name: 'settings',
  type: 'document',
  title: 'Settings',
  description: 'Global settings and configuration for your website',
  icon: CogIcon,
  fields: [
    languageField,
    defineField({
      name: 'label',
      type: 'string',
      initialValue: 'Settings',
      title: 'Label',
      description: 'Label used to identify settings in the CMS',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'siteTitle',
      type: 'string',
      title: 'Site Title',
      description:
        'The main title of your website, used in browser tabs and SEO',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'siteDescription',
      type: 'text',
      title: 'Site Description',
      description: 'A brief description of your website for SEO purposes',
      validation: (rule) => rule.required().min(50).max(160)
    }),
    defineField({
      name: 'logo',
      type: 'image',
      title: 'Site Logo',
      description: 'Upload your website logo',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'contactEmail',
      type: 'string',
      title: 'Contact Email',
      description: 'Primary contact email address for your website',
      validation: (rule) => rule.email()
    }),
    socialLinks
  ],
  preview: {
    select: {
      title: 'label'
    },
    prepare: ({ title }) => ({
      title: title || 'Untitled Settings',
      media: CogIcon
    })
  }
})
