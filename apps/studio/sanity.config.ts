import { assist } from "@sanity/assist";
import { documentInternationalization } from "@sanity/document-internationalization";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import { iconPicker } from "sanity-plugin-icon-picker";
import { media } from "sanity-plugin-media";
import { SANITY_LANGUAGES } from "@workspace/i18n-config";

import { Logo } from "./components/logo";
import { locations } from "./location";
import { presentationUrl } from "./plugins/presentation-url";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";
import { getPresentationUrl } from "./utils/helper";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";
const dataset = process.env.SANITY_STUDIO_DATASET;
const title = process.env.SANITY_STUDIO_TITLE;

export default defineConfig({
  name: "default",
  title,
  icon: Logo,
  projectId,
  dataset: dataset ?? "production",
  releases: {
    enabled: true,
  },
  plugins: [
    // ============================================================================
    // PRESENTATION TOOL - Live Preview Integration
    // ============================================================================
    //
    // Enables side-by-side editing with live preview of frontend (apps/web).
    // Studio editors can see real-time changes as they edit content.
    //
    // Key configuration:
    // - locations: Resolver function that maps Studio documents to frontend URLs
    //   (defined in location.ts, handles routing for all translatable document types)
    // - previewUrl.origin: Base URL of frontend app (from getPresentationUrl utility)
    // - previewUrl.previewMode.enable: API route that enables Next.js draft mode
    //   (/api/presentation-draft in apps/web)
    //
    // Dependencies:
    // - Requires apps/web frontend running locally or deployed
    // - Uses location.ts resolver to map document._id to frontend route
    // - Relies on Next.js draft mode API route for authenticated preview
    //
    // @see https://www.sanity.io/docs/presentation-tool - Official documentation
    //
    presentationTool({
      resolve: {
        locations,
      },
      previewUrl: {
        origin: getPresentationUrl(),
        previewMode: {
          enable: "/api/presentation-draft",
        },
      },
    }),

    // ============================================================================
    // STRUCTURE TOOL - Sidebar Navigation
    // ============================================================================
    //
    // Defines the Studio sidebar navigation and content organization.
    // This is the core tool that controls how documents are grouped and displayed.
    //
    // Key configuration:
    // - structure: Function from structure.ts that builds the sidebar tree
    //   (uses helper functions: createSingleTon, createList, createIndexListWithOrderableItems)
    //
    // Dependencies:
    // - Central to Studio - all other tools build on this foundation
    // - structure.ts uses DEFAULT_LOCALE filtering to show only French (default) documents
    // - Interacts with documentInternationalization: filters translations from sidebar
    //
    // @see https://www.sanity.io/docs/structure-builder - Official documentation
    //
    structureTool({
      structure,
    }),

    // ============================================================================
    // PRESENTATION URL (Custom Plugin) - Preview URL Resolver
    // ============================================================================
    //
    // Custom plugin that provides URL resolution utilities for presentation mode.
    // Extends presentationTool with project-specific routing logic.
    //
    // Key configuration:
    // - No configuration options (default behavior)
    //
    // Dependencies:
    // - Used by presentationTool above
    // - Defined in plugins/presentation-url.ts
    //
    presentationUrl(),

    // ============================================================================
    // VISION TOOL - GROQ Query Playground
    // ============================================================================
    //
    // Interactive GROQ query editor for testing and debugging queries.
    // Useful for developers building new features or troubleshooting data fetching.
    //
    // Key configuration:
    // - No configuration options (default behavior)
    // - Available in Studio under "Vision" tab
    //
    // Dependencies:
    // - Standalone development tool, no interactions with other plugins
    //
    // @see https://www.sanity.io/docs/the-vision-plugin - Official documentation
    //
    visionTool(),

    // ============================================================================
    // UNSPLASH IMAGE ASSET - Stock Photo Integration
    // ============================================================================
    //
    // Adds Unsplash as an image source in the media picker.
    // Allows editors to search and import stock photos directly into Sanity.
    //
    // Key configuration:
    // - No configuration options (default behavior)
    // - Appears as "Unsplash" option in image field picker
    //
    // Dependencies:
    // - Works alongside media plugin below
    // - No API key required (uses Sanity's Unsplash integration)
    //
    // @see https://www.sanity.io/plugins/sanity-plugin-asset-source-unsplash - Official documentation
    //
    unsplashImageAsset(),

    // ============================================================================
    // MEDIA - Enhanced Media Library
    // ============================================================================
    //
    // Replaces default Sanity image picker with enhanced media library UI.
    // Provides better organization, search, and bulk upload capabilities.
    //
    // Key configuration:
    // - No configuration options (default behavior)
    // - Automatically replaces default image/file picker UI
    //
    // Dependencies:
    // - Replaces default media picker for all image/file fields
    // - Works with unsplashImageAsset integration above
    //
    // @see https://www.sanity.io/plugins/sanity-plugin-media - Official documentation
    //
    media(),

    // ============================================================================
    // ICON PICKER - Icon Selection UI
    // ============================================================================
    //
    // Provides searchable icon picker component for selecting icons in content.
    // Used in CTA buttons, feature cards, and other icon-based UI elements.
    //
    // Key configuration:
    // - No configuration options (default behavior)
    // - Used via custom field type in schemas (e.g., buttons, feature cards)
    //
    // Dependencies:
    // - Referenced in schema field definitions that need icon selection
    // - Provides both icon name and provider (e.g., "FiHome" from react-icons/fi)
    //
    // @see https://www.sanity.io/plugins/sanity-plugin-icon-picker - Official documentation
    //
    iconPicker(),

    // ============================================================================
    // ASSIST - Sanity AI Assistant
    // ============================================================================
    //
    // Enables AI-powered content generation and editing assistance.
    // Provides "AI Assist" button in text fields for content suggestions.
    //
    // Key configuration:
    // - No configuration options (default behavior)
    // - Requires Sanity AI credits (managed in Sanity project settings)
    //
    // Dependencies:
    // - Standalone feature, no interactions with other plugins
    // - Usage may incur additional costs based on Sanity plan
    //
    // @see https://www.sanity.io/docs/ai-assist - Official documentation
    //
    assist(),

    // ============================================================================
    // DOCUMENT INTERNATIONALIZATION - Translation Workflow
    // ============================================================================
    //
    // Enables multi-language content workflow for translatable document types.
    // Adds "Translate" action to Studio UI for creating language variants.
    //
    // Key configuration:
    // - supportedLanguages: Array of language codes from @workspace/i18n-config
    //   (currently: fr, en, es - French, English, Spanish)
    // - schemaTypes: Document types that should support translation
    //   (must have 'language' field in their schema definition)
    //
    // Plugin behavior:
    // - Creates translation.metadata documents to link related translations
    // - Adds __i18n_base and __i18n_lang reference fields automatically
    // - Filters new document templates to only show language-specific options
    //   (prevents creating documents without language context)
    //
    // Dependencies:
    // - Requires 'language' field in all schemas listed in schemaTypes array
    // - Interacts with structure.ts: DEFAULT_LOCALE filter shows only French docs in sidebar
    // - Affects newDocumentOptions below: templates filtered by language (line 68-74)
    // - orderRank field quirk: When using with orderableDocumentList, orderRank only
    //   updates on dragged document, NOT translations (see structure.ts:106-132 for workaround)
    //
    // When to modify:
    // - Adding new translatable document type: Add to schemaTypes array
    // - Adding new language: Update SANITY_LANGUAGES in @workspace/i18n-config
    // - Changing translation deletion behavior: Configure weakReferences option
    //
    // @see https://www.sanity.io/plugins/document-internationalization - Official documentation
    //
    documentInternationalization({
      supportedLanguages: SANITY_LANGUAGES,
      schemaTypes: [
        "page",
        "blog",
        "blogIndex",
        "navbar",
        "footer",
        "settings",
        "homePage",
        "faq",
      ],
    }),
  ],
  document: {
    // ============================================================================
    // NEW DOCUMENT OPTIONS - Template Filtering
    // ============================================================================
    //
    // Controls which document templates appear in the global "+" (Create) menu.
    // This function filters templates based on creation context to prevent users
    // from creating documents without proper language context.
    //
    // Why template filtering is needed:
    // - documentInternationalization plugin requires all translatable documents to
    //   have a language field set at creation time
    // - Showing generic templates (e.g., "page" without language) would allow
    //   creating documents that break the translation workflow
    // - We only expose language-specific templates (e.g., "page-fr") to force
    //   users to choose a language upfront
    //
    // Template ID pattern:
    // - Language-specific templates follow pattern: [schemaType]-[languageCode]
    //   Examples: 'page-fr', 'blog-fr', 'faq-fr' (French default language)
    // - Non-translatable types use schema type as template ID
    //   Examples: 'author', 'redirect' (no language variants)
    //
    // Filtering logic:
    // - creationContext.type === "global": User clicked global "+" button in Studio
    // - Only show French (default locale) templates + non-translatable types
    // - Other language variants are created via "Translate" action, not global menu
    //
    // Allowed templates in global menu:
    // - 'author': Non-translatable (single author across all languages)
    // - 'page-fr': French page (default language, create translations via "Translate")
    // - 'blog-fr': French blog post
    // - 'faq-fr': French FAQ
    // - 'redirect': Non-translatable (URL redirects are language-agnostic)
    //
    newDocumentOptions: (prev, { creationContext }) => {
      const { type } = creationContext;
      if (type === "global") {
        return prev.filter(doc => ['author', 'page-fr', 'blog-fr', 'faq-fr', 'redirect'].includes(doc.templateId))
      }
      return prev;
    },
  },
  schema: {
    types: schemaTypes,
    templates: (prev) => {
      // ============================================================================
      // SCHEMA TEMPLATES - Document Creation Templates
      // ============================================================================
      //
      // Configures which templates are available for creating new documents.
      // This function filters out default templates for i18n types and adds
      // custom templates with pre-filled values.
      //

      // List of schema types that use document internationalization plugin
      // These types MUST NOT have generic templates (would bypass language selection)
      const i18nTypes = [
        "page",
        "blog",
        "blogIndex",
        "navbar",
        "footer",
        "settings",
        "homePage",
        "faq",
      ];

      // ============================================================================
      // Why i18n types are filtered from default templates:
      // ============================================================================
      //
      // Problem: Sanity generates default templates for all schema types automatically.
      // These default templates create documents WITHOUT language field set, which breaks
      // the documentInternationalization workflow.
      //
      // Example without filtering:
      // - User sees "Page" template in global menu
      // - Creates page without language → orphaned document, no translation support
      // - Cannot use "Translate" action → broken i18n workflow
      //
      // Solution: Filter out default templates for i18n types, only expose language-specific
      // templates (e.g., "page-fr") that properly initialize language field.
      //
      // This filtering complements newDocumentOptions filtering above (line 264-270).
      // - newDocumentOptions: Filters what appears in global "+" menu
      // - templates filtering: Prevents generic templates from existing at all
      //
      const filtered = prev.filter(
        (template) => !i18nTypes.includes(template.id)
      );

      // ============================================================================
      // Custom templates with pre-filled values
      // ============================================================================

      return [
        ...filtered,

        // ========================================================================
        // NESTED PAGE TEMPLATE - Page with Pre-filled Slug/Title
        // ========================================================================
        //
        // Special template for creating child pages with pre-filled slug and title.
        // Used when creating nested pages via "Create child page" action in parent page.
        //
        // Parameters:
        // - slug (optional): Pre-filled slug value (e.g., "parent/child")
        //   Passed as string, converted to Sanity slug object { current: string, _type: "slug" }
        // - title (optional): Pre-filled title value (e.g., "Child Page")
        //
        // Usage pattern:
        // - User clicks "Create child page" in parent page document actions
        // - Structure helper passes parent slug + new child slug as parameter
        // - Template initializes new page with nested slug structure
        //
        // Note: This template still requires language selection (it's a "page" type,
        // which is in i18nTypes array). Language-specific variants are automatically
        // generated by documentInternationalization plugin (e.g., nested-page-template-fr).
        //
        {
          id: "nested-page-template",
          title: "Nested Page",
          schemaType: "page",
          value: (props: { slug?: string; title?: string }) => ({
            ...(props.slug
              ? { slug: { current: props.slug, _type: "slug" } }
              : {}),
            ...(props.title ? { title: props.title } : {}),
          }),
          parameters: [
            {
              name: "slug",
              type: "string",
            },
          ],
        },
      ];
    },
  },
});
