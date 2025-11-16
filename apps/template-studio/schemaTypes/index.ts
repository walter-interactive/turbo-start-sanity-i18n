// ============================================================================
// Shared Atoms (from @workspace/sanity-atoms)
// ============================================================================
import { buttonSchema } from '@workspace/sanity-atoms/schemas'
import { buttonsGroupSchema } from '@workspace/sanity-atoms/schemas'
import { customUrlSchema } from '@workspace/sanity-atoms/schemas'
import { richTextSchema } from '@workspace/sanity-atoms/schemas'
// ============================================================================
// Shared Blocks (from @workspace/sanity-blocks)
// ============================================================================
import { ctaSchema } from '@workspace/sanity-blocks/schemas'
import { faqAccordionSchema } from '@workspace/sanity-blocks/schemas'
import { featureCardsIconSchema } from '@workspace/sanity-blocks/schemas'
import { heroSectionSchema } from '@workspace/sanity-blocks/schemas'
import { imageLinkCardsSchema } from '@workspace/sanity-blocks/schemas'
import { subscribeNewsletterSchema } from '@workspace/sanity-blocks/schemas'
import { defineArrayMember, defineType } from 'sanity'
// ============================================================================
// Collections (multi-instance documents)
// ============================================================================
import { author } from './collections/author'
import { blog } from './collections/blog'
import { faq } from './collections/faq'
import { page } from './collections/page'
import { redirect } from './collections/redirect'
// ============================================================================
// Local Definitions (studio-specific)
// ============================================================================
// import { custom-block } from './blocks'
// import { custom-definitions } from './definitions'
// ============================================================================
// Singletons (single-instance documents)
// ============================================================================
import { blogIndex } from './singletons/blog-index'
import { footer } from './singletons/footer'
import { homePage } from './singletons/home-page'
import { navbar } from './singletons/navbar'
import { settings } from './singletons/settings'

// ============================================================================
// Page Builder + Blocks
// ============================================================================

const pageBuilderBlocks = [
  heroSectionSchema,
  ctaSchema,
  featureCardsIconSchema,
  faqAccordionSchema,
  imageLinkCardsSchema,
  subscribeNewsletterSchema
]

export const pagebuilderBlockTypes = pageBuilderBlocks.map(({ name }) => ({
  type: name
}))

export const pageBuilder = defineType({
  name: 'pageBuilder',
  type: 'array',
  of: pagebuilderBlockTypes.map((block) => defineArrayMember(block))
})

// ============================================================================
// Schema Registration
// ============================================================================

export const collections = [blog, page, faq, author, redirect]
export const singletons = [homePage, blogIndex, settings, footer, navbar]

const documents = [...collections, ...singletons]
const atoms = [
  customUrlSchema,
  richTextSchema,
  buttonSchema,
  pageBuilder,
  buttonsGroupSchema
]

export const schemaTypes = [...documents, ...atoms, ...pageBuilderBlocks]

// ============================================================================
// Type Utilities
// ============================================================================

export const schemaNames = [...documents].map((doc) => doc.name)
export type SchemaType = (typeof schemaNames)[number]

export const singletonType = singletons.map(({ name }) => name)
export type SingletonType = (typeof singletonType)[number]

export default schemaTypes
