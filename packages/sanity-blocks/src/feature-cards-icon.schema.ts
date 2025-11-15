/**
 * Feature Cards with Icon Block Schema
 *
 * PURPOSE:
 * Displays a grid of feature cards, each with an icon, title, and rich text description.
 * Used to showcase product features, service offerings, or key benefits in a visually
 * organized layout.
 */

import { customRichText } from '@workspace/sanity-atoms/schemas/rich-text'
import { LayoutGrid } from 'lucide-react'
import { defineField, defineType } from 'sanity'
import { preview } from 'sanity-plugin-icon-picker'

const featureCardIcon = defineField({
  name: 'featureCardIcon',
  type: 'object',
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon',
      options: {
        storeSvg: true,
        providers: ['fi']
      },
      type: 'iconPicker',
      description:
        'Choose a small picture symbol to represent this item, like a home icon or shopping cart'
    }),
    defineField({
      name: 'title',
      type: 'string',
      description: 'The heading text for this feature card'
    }),
    customRichText(['block'])
  ],
  preview: {
    select: {
      title: 'title',
      icon: 'icon'
    },
    prepare: ({ title, icon }) => ({
      title: `${title ?? 'Untitled'}`,
      media: icon ? preview(icon) : null
    })
  }
})

export const featureCardsIconSchema = defineType({
  name: 'featureCardsIcon',
  type: 'object',
  icon: LayoutGrid,
  description:
    'A grid of feature cards, each with an icon, title and description',
  fields: [
    defineField({
      name: 'eyebrow',
      type: 'string',
      description: 'Optional text that appears above the main title'
    }),
    defineField({
      name: 'title',
      type: 'string',
      description: 'The main heading for this feature section'
    }),
    customRichText(['block']),
    defineField({
      name: 'cards',
      type: 'array',
      description: 'The individual feature cards to display in the grid',
      of: [featureCardIcon]
    })
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare: ({ title }) => ({
      title,
      subtitle: 'Feature Cards with Icon'
    })
  }
})
