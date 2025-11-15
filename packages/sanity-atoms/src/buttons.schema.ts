import { defineField } from 'sanity'

export const buttonsGroupSchema = defineField({
  name: 'buttons',
  type: 'array',
  of: [{ type: 'button' }],
  description:
    'Add one or more clickable buttons that visitors can use to navigate your website'
})
