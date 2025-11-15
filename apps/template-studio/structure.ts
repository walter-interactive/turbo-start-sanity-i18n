/**
 * Studio Structure Configuration
 *
 * This file defines the custom sidebar navigation structure for Sanity Studio.
 * It controls how content types are organized, filtered, and displayed in the
 * Studio UI, replacing the default alphabetical list with a curated content hierarchy.
 *
 * HOW IT WORKS:
 * - Exports a `structure()` function that Sanity calls to build the sidebar
 * - Referenced in sanity.config.ts via the `structure` option in the `structure` plugin
 * - Uses helper functions (createSingleTon, createList, createIndexListWithOrderableItems)
 *   to generate consistent list items with proper filtering and i18n support
 *
 * KEY PATTERNS:
 * - Language filtering: All translatable content filtered to DEFAULT_LOCALE (French)
 *   to avoid showing duplicate entries for every language variant
 * - Force default language creation: initialValueTemplates restricted to French templates
 *   to prevent orphaned translations (translations without a base document)
 * - Singleton documents: Use createSingleTon for single-instance documents (homepage, settings)
 * - List documents: Use createList for simple multi-instance documents (authors, redirects)
 * - Orderable lists: Use createIndexListWithOrderableItems for content with landing pages
 *   and drag-and-drop ordering (blogs with blogIndex)
 *
 * WHEN TO MODIFY:
 * - Adding new content type: Add appropriate list item using helper functions
 * - Changing sidebar organization: Rearrange items or add new sections
 * - Adding new translatable type: Ensure language filter and template filtering are applied
 * - Adding orderable content: Use createIndexListWithOrderableItems helper
 *
 * @see sanity.config.ts - Where this structure is registered
 * @see schemaTypes.ts - Type definitions for SchemaType and SingletonType
 */

import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import { DEFAULT_LOCALE } from '@workspace/i18n-config'
import {
  BookMarked,
  CogIcon,
  File,
  FileIcon,
  FileText,
  HomeIcon,
  type LucideIcon,
  MessageCircle,
  PanelBottom,
  PanelBottomIcon,
  PlusIcon,
  Settings2,
  TrendingUpDown,
  User
} from 'lucide-react'
import { getTitleCase } from './utils/helper'
import type {
  StructureBuilder,
  StructureResolverContext
} from 'sanity/structure'
import type { SchemaType, SingletonType } from './schemaTypes'

type Base<T = SchemaType> = {
  id?: string
  type: T
  preview?: boolean
  title?: string
  icon?: LucideIcon
}

type CreateSingleTon = {
  S: StructureBuilder
} & Base<SingletonType>

/**
 * Creates a sidebar list item for a singleton document
 *
 * Singleton documents are content types that should only have one instance globally
 * (e.g., homepage, navbar, footer, global settings). This helper creates a list item
 * that opens the singleton document directly without showing a document list.
 *
 * @param S - Sanity structure builder instance (passed from structure() function)
 * @param type - Schema type name for the singleton document (must be in SingletonType union)
 * @param title - Display title for sidebar item (defaults to title-cased schema type name)
 * @param icon - Lucide icon component for sidebar item (defaults to File icon)
 * @returns Sanity list item that opens the singleton document when clicked
 *
 * @example
 * ```typescript
 * // Create homepage singleton with custom title and icon
 * createSingleTon({
 *   S,
 *   type: "homePage",
 *   title: "Homepage",
 *   icon: HomeIcon
 * })
 *
 * // Create singleton with auto-generated title (would display as "Nav Bar")
 * createSingleTon({
 *   S,
 *   type: "navbar",
 *   icon: PanelBottom
 * })
 * ```
 *
 * @remarks
 * WHEN TO USE THIS HELPER:
 * - For content types that should only exist once (homepage, settings, config)
 * - When you want users to click directly into a document without seeing a list
 * - For global configuration documents
 *
 * WHEN NOT TO USE:
 * - For content types that allow multiple instances (use createList instead)
 * - For orderable content with an index page (use createIndexListWithOrderableItems instead)
 * - For translatable singletons that need language filtering (this helper doesn't apply filters)
 *
 * NOTE: The documentId is set to the schema type name, ensuring only one document
 * of this type can exist. Sanity will reuse the same document ID for all edits.
 */
const createSingleTon = ({ S, type, title, icon }: CreateSingleTon) => {
  const newTitle = title ?? getTitleCase(type)
  return S.listItem()
    .title(newTitle)
    .icon(icon ?? File)
    .child(S.document().schemaType(type).documentId(type))
}

type CreateList = {
  S: StructureBuilder
} & Base

/**
 * Creates a sidebar list item for a document type with multiple instances
 *
 * This helper generates a list item that opens a standard document list view when clicked,
 * showing all documents of the specified type. Use this for content types that allow
 * multiple instances but don't need special filtering, ordering, or language constraints.
 *
 * @param S - Sanity structure builder instance (passed from structure() function)
 * @param type - Schema type name for the document type (must be in SchemaType union)
 * @param title - Display title for sidebar item (defaults to title-cased schema type name)
 * @param icon - Lucide icon component for sidebar item (defaults to File icon)
 * @param id - Optional custom ID for the list item (defaults to schema type name)
 * @returns Sanity document type list item showing all documents of this type
 *
 * @example
 * ```typescript
 * // Create authors list with custom title and icon
 * createList({
 *   S,
 *   type: "author",
 *   title: "Authors",
 *   icon: User
 * })
 *
 * // Create list with auto-generated title (would display as "Redirect")
 * createList({
 *   S,
 *   type: "redirect",
 *   icon: TrendingUpDown
 * })
 *
 * // Create list with custom ID (useful for multiple views of same type)
 * createList({
 *   S,
 *   type: "blog",
 *   title: "Draft Blogs",
 *   id: "blog-drafts",
 *   icon: FileText
 * })
 * ```
 *
 * @remarks
 * WHEN TO USE THIS HELPER:
 * - For simple multi-instance content types (authors, redirects, tags)
 * - When you don't need language filtering or special ordering
 * - For non-translatable content types
 *
 * WHEN NOT TO USE:
 * - For singleton documents (use createSingleTon instead)
 * - For translatable content that needs language filtering (use manual documentTypeList with filter)
 * - For orderable content with an index page (use createIndexListWithOrderableItems instead)
 *
 * IMPORTANT: This helper does NOT apply any filters. If you need to filter by language
 * or other fields, you must manually create a documentTypeList with .filter() and .params()
 * (see PAGES and FAQs sections below for examples).
 */
const createList = ({ S, type, icon, title, id }: CreateList) => {
  const newTitle = title ?? getTitleCase(type)
  return S.documentTypeListItem(type)
    .id(id ?? type)
    .title(newTitle)
    .icon(icon ?? File)
}

type CreateIndexList = {
  S: StructureBuilder
  list: Base
  index: Base<SingletonType>
  context: StructureResolverContext
}

/**
 * Creates a structure list item containing both an index singleton document and an orderable
 * list of documents. This is useful for content types that have an index/landing page alongside
 * a collection of items (e.g., Blog Index + Blog Posts).
 *
 * @param S - The StructureBuilder instance
 * @param index - Configuration for the singleton index document (e.g., blogIndex)
 * @param list - Configuration for the orderable list of documents (e.g., blog posts)
 * @param context - The StructureResolverContext from Sanity
 *
 * @returns A list item containing the index document and orderable document list
 *
 * @example
 * createIndexListWithOrderableItems({
 *   S,
 *   index: { type: "blogIndex", icon: BookMarked },
 *   list: { type: "blog", title: "Blogs", icon: FileText },
 *   context,
 * })
 *
 * @remarks
 * **Querying Ordered Documents:**
 *
 * Documents can be ordered using the `orderRank` field:
 * ```groq
 * *[_type == "blog" && language == $lang] | order(orderRank)
 * ```
 *
 * **With Document Internationalization:**
 *
 * When using the document-internationalization plugin, the `orderRank` field of alternate
 * locale documents won't be updated when reordering. To maintain consistent ordering across
 * all languages, you may need to query using the base document's orderRank.
 *
 * If your setup provides a reference to the base translation document, you can use:
 * ```groq
 * *[_type == "blog" && language == $lang] | order(coalesce(__i18n_base->orderRank, orderRank))
 * ```
 *
 * This ensures documents in all locales share the same order by falling back to the base
 * document's orderRank when available. Verify that the `__i18n_base` field exists in your
 * metadata documents, or adjust the query to match your translation setup.
 */
const createIndexListWithOrderableItems = ({
  S,
  index,
  list,
  context
}: CreateIndexList) => {
  const indexTitle = index.title ?? getTitleCase(index.type)
  const listTitle = list.title ?? getTitleCase(list.type)
  return S.listItem()
    .title(listTitle)
    .icon(index.icon ?? File)
    .child(
      S.list()
        .title(indexTitle)
        .items([
          S.listItem()
            .title(indexTitle)
            .icon(index.icon ?? File)
            .child(
              S.document()
                .views([S.view.form()])
                .schemaType(index.type)
                .documentId(index.type)
            ),
          orderableDocumentListDeskItem({
            type: list.type,
            S,
            context,
            icon: list.icon ?? File,
            title: `${listTitle}`,
            filter: 'language == $lang',
            params: {
              lang: DEFAULT_LOCALE
            },
            menuItems: [
              S.menuItem()
                .title(`Create new ${listTitle.slice(0, -1)}`)
                .icon(PlusIcon)
                .intent({
                  type: 'create',
                  params: {
                    type: list.type,
                    template: `${list.type}-${DEFAULT_LOCALE}`
                  }
                })
                .serialize()
            ]
          })
        ])
    )
}

/**
 * Main structure resolver function for Sanity Studio sidebar
 *
 * This function is called by Sanity to build the custom sidebar navigation structure.
 * It defines the hierarchy of content types, their filtering rules, and how they appear
 * in the Studio UI.
 *
 * @param S - Sanity StructureBuilder instance for creating list items and documents
 * @param context - StructureResolverContext containing Studio state and configuration
 * @returns Complete sidebar structure with all content sections
 *
 * @remarks
 * This function is referenced in sanity.config.ts:
 * ```typescript
 * structure(S, context) {
 *   return structure(S, context);
 * }
 * ```
 */
export const structure = (
  S: StructureBuilder,
  context: StructureResolverContext
) =>
  S.list()
    .title('Content')
    .items([
      // ========================================================================
      // HOMEPAGE - Singleton document for main landing page
      // ========================================================================
      // Uses createSingleTon since only one homepage exists globally
      createSingleTon({ S, type: 'homePage', icon: HomeIcon }),

      S.divider(),

      // ========================================================================
      // PAGES - Translatable multi-instance pages (About, Contact, etc.)
      // ========================================================================
      // LANGUAGE FILTERING PATTERN:
      // - Filter to DEFAULT_LOCALE (French) to avoid showing 3x entries (fr/en/es)
      // - Users create translations via "Translate" action in document menu
      // - This keeps sidebar clean and prevents confusion about which entry to edit
      //
      // FORCE DEFAULT LANGUAGE CREATION:
      // - initialValueTemplates filtered to only `page-fr` template
      // - Prevents users from creating English/Spanish pages first
      // - Avoids orphaned translations (translations without a base French document)
      // - Base French document must exist before translations can be created
      S.listItem()
        .title('Pages')
        .icon(FileIcon)
        .child(
          S.documentTypeList('page')
            .title('Pages')
            // Show only French pages (filter: language == "fr")
            .filter('_type == $type && language == $lang')
            .params({ type: 'page', lang: DEFAULT_LOCALE })
            // Only allow creating French pages via "+ Create" button
            .initialValueTemplates([
              S.initialValueTemplateItem(`page-${DEFAULT_LOCALE}`)
            ])
        ),

      // ========================================================================
      // BLOGS - Orderable blog posts with blogIndex landing page
      // ========================================================================
      // Uses createIndexListWithOrderableItems for two-level structure:
      // 1. Blog Index (singleton landing page for /blog route)
      // 2. Blog Posts (orderable list with drag-and-drop reordering)
      //
      // ORDERING QUIRK: orderRank field only updates on dragged document, not translations
      // See createIndexListWithOrderableItems JSDoc for frontend query workaround
      createIndexListWithOrderableItems({
        S,
        index: { type: 'blogIndex', icon: BookMarked },
        list: { type: 'blog', title: 'Blogs', icon: FileText },
        context
      }),

      // ========================================================================
      // FAQs - Translatable frequently asked questions
      // ========================================================================
      // Same pattern as PAGES: language filtering + force default language creation
      S.listItem()
        .title('FAQs')
        .icon(MessageCircle)
        .child(
          S.documentTypeList('faq')
            .title('FAQs')
            // Show only French FAQs (filter: language == "fr")
            .filter('_type == $type && language == $lang')
            .params({ type: 'faq', lang: DEFAULT_LOCALE })
            // Only allow creating French FAQs via "+ Create" button
            .initialValueTemplates([
              S.initialValueTemplateItem(`faq-${DEFAULT_LOCALE}`)
            ])
        ),

      // ========================================================================
      // AUTHORS - Non-translatable author profiles
      // ========================================================================
      // Uses createList since authors don't need language filtering or ordering
      // Authors are shared across all language versions of content
      createList({ S, type: 'author', title: 'Authors', icon: User }),

      // ========================================================================
      // REDIRECTS - URL redirects for SEO/migration
      // ========================================================================
      // Uses createList since redirects are simple multi-instance documents
      // No language filtering needed (redirects work across all languages)
      createList({
        S,
        type: 'redirect',
        title: 'Redirects',
        icon: TrendingUpDown
      }),

      S.divider(),

      // ========================================================================
      // SITE CONFIG - Global settings grouped in nested list
      // ========================================================================
      // Creates a collapsible section with three singleton configuration documents:
      // - Navigation: Top navbar links and menu structure
      // - Footer: Footer links, copyright, social media
      // - Global Settings: Site-wide metadata (site name, SEO defaults, analytics)
      //
      // All three use createSingleTon since only one instance of each exists globally
      S.listItem()
        .title('Site Configuration')
        .icon(Settings2)
        .child(
          S.list()
            .title('Site Configuration')
            .items([
              createSingleTon({
                S,
                type: 'navbar',
                title: 'Navigation',
                icon: PanelBottom
              }),
              createSingleTon({
                S,
                type: 'footer',
                title: 'Footer',
                icon: PanelBottomIcon
              }),
              createSingleTon({
                S,
                type: 'settings',
                title: 'Global Settings',
                icon: CogIcon
              })
            ])
        )
    ])
