// ============================================================================
// Shared Atoms (from @walter/sanity-atoms)
// ============================================================================
import { buttonSchema } from '@walter/sanity-atoms/schemas/button'
import { buttonsGroupSchema } from '@walter/sanity-atoms/schemas/buttons'
import { customUrlSchema } from '@walter/sanity-atoms/schemas/custom-url'
import { richText } from '@walter/sanity-atoms/schemas/rich-text'
// ============================================================================
// Shared Blocks (from @walter/sanity-blocks)
// ============================================================================
import { ctaSchema } from '@walter/sanity-blocks/schemas/cta'
import { faqAccordionSchema } from '@walter/sanity-blocks/schemas/faq-accordion'
import { featureCardsIconSchema } from '@walter/sanity-blocks/schemas/feature-cards-icon'
import { heroSectionSchema } from '@walter/sanity-blocks/schemas/hero-section'
import { imageLinkCardsSchema } from '@walter/sanity-blocks/schemas/image-link-cards'
import { subscribeNewsletterSchema } from '@walter/sanity-blocks/schemas/subscribe-newsletter'
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
import { pageBuilder } from './definitions/pagebuilder'
// ============================================================================
// Singletons (single-instance documents)
// ============================================================================
import { blogIndex } from './singletons/blog-index'
import { footer } from './singletons/footer'
import { homePage } from './singletons/home-page'
import { navbar } from './singletons/navbar'
import { settings } from './singletons/settings'

// ============================================================================
// Schema Registration
// ============================================================================

export const collections = [blog, page, faq, author, redirect]
export const singletons = [homePage, blogIndex, settings, footer, navbar]

const documents = [...collections, ...singletons]
const atoms = [
  customUrlSchema,
  richText,
  buttonSchema,
  pageBuilder,
  buttonsGroupSchema
]

const pageBuilderBlocks = [
  heroSectionSchema,
  ctaSchema,
  featureCardsIconSchema,
  faqAccordionSchema,
  imageLinkCardsSchema,
  subscribeNewsletterSchema
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
