/**
 * Hero Block Schema
 *
 * PURPOSE:
 * Creates a prominent hero section at the top of a page with a large image,
 * headline, description, and call-to-action buttons. Designed to capture attention
 * and communicate the primary message immediately upon page load.
 */

import { buttonsGroupSchema } from '@walter/sanity-atoms/schemas/buttons'
import { customRichText } from '@walter/sanity-atoms/schemas/rich-text'
import { Star } from 'lucide-react'
import { defineField, defineType } from 'sanity'

export const heroSectionSchema = defineType({
  name: 'hero',
  title: 'Hero',
  icon: Star,
  type: 'object',
  fields: [
    defineField({
      name: 'badge',
      type: 'string',
      title: 'Badge',
      description:
        'Optional badge text displayed above the title, useful for highlighting new features or promotions'
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description:
        'The main heading text for the hero section that captures attention'
    }),
    customRichText(['block']),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image',
      description:
        'The main hero image - should be high quality and visually impactful',
      options: {
        hotspot: true
      }
    }),
    buttonsGroupSchema
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare: ({ title }) => ({
      title,
      subtitle: 'Hero Block'
    })
  }
})
