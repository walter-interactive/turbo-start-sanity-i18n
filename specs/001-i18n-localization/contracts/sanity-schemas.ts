/**
 * CONTRACT FILE - NOT FOR DIRECT EXECUTION
 *
 * Contract: Sanity Schema Configuration for Document Internationalization
 *
 * This file demonstrates the required schema modifications for document-level
 * translations using @sanity/document-internationalization plugin.
 *
 * Key Requirements:
 * 1. Add 'language' field to all translatable document types
 * 2. Configure plugin in sanity.config.ts
 * 3. Maintain consistent field naming across all types
 *
 * NOTE: This is a reference/template file. Copy patterns to actual source files.
 * TypeScript errors in this file are expected (dependencies not installed here).
 */

/* eslint-disable */
// @ts-nocheck

import { documentInternationalization } from "@sanity/document-internationalization";
import { defineConfig, defineField, defineType } from "sanity";

// ============================================================================
// Language Configuration
// ============================================================================

/**
 * Supported languages for the application
 * Must match next-intl configuration in web app
 */
export const SUPPORTED_LANGUAGES = [
  { id: "fr", title: "Français" }, // Default for Quebec compliance
  { id: "en", title: "English" },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["id"];

// ============================================================================
// Plugin Configuration
// ============================================================================

/**
 * Document internationalization plugin configuration
 * Add to sanity.config.ts plugins array
 */
export const i18nPluginConfig = {
  // Required: List of supported languages
  supportedLanguages: SUPPORTED_LANGUAGES,

  // Required: Document types that support translations
  schemaTypes: [
    "page",
    "blog",
    "blog-index",
    "navbar",
    "footer",
    "settings",
    "home-page",
    "faq",
  ],

  // Optional: Customize the language field name (default: 'language')
  languageField: "language",

  // Optional: Use weak references for metadata documents
  weakReferences: false,

  // Optional: Enable bulk publishing (requires Scheduling API access)
  bulkPublish: false,

  // Optional: API version for queries
  apiVersion: "2025-02-19",

  // Optional: Allow creating metadata document without translations
  // Useful for linking pre-existing documents
  allowCreateMetaDoc: true,
};

// ============================================================================
// Schema Field Definition
// ============================================================================

/**
 * Language field to be added to all translatable document types
 *
 * @important This field is managed by the plugin. Set to readOnly and hidden
 * to prevent manual editing by content creators.
 */
export const languageField = defineField({
  name: "language",
  type: "string",
  title: "Language",
  description:
    "Language of this document version. Managed automatically by the translation plugin.",

  // Plugin manages this field, don't allow manual editing
  readOnly: true,

  // Hide from Studio UI (plugin shows language in document badge)
  hidden: true,

  // Validation (backup - plugin handles this)
  validation: (Rule) =>
    Rule.required().custom((value) => {
      if (!value) {
        return "Language is required";
      }
      const validLanguages = SUPPORTED_LANGUAGES.map((l) => l.id);
      if (!validLanguages.includes(value)) {
        return `Language must be one of: ${validLanguages.join(", ")}`;
      }
      return true;
    }),
});

// ============================================================================
// Example Document Type Schemas
// ============================================================================

/**
 * Page document type with internationalization support
 *
 * All fields in this schema will be duplicated when creating translations.
 * To exclude specific fields from duplication, add:
 * options: { documentInternationalization: { exclude: true } }
 */
export const pageType = defineType({
  name: "page",
  type: "document",
  title: "Page",

  fields: [
    // Language field (managed by plugin)
    languageField,

    // Title - translatable
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      validation: (Rule) => Rule.required(),
    }),

    // Slug - translatable, can differ per language
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      description: "URL-friendly identifier (can be different per language)",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    // SEO metadata - translatable
    defineField({
      name: "seo",
      type: "object",
      title: "SEO",
      fields: [
        defineField({
          name: "title",
          type: "string",
          title: "Meta Title",
          validation: (Rule) => Rule.max(60),
        }),
        defineField({
          name: "description",
          type: "text",
          title: "Meta Description",
          validation: (Rule) => Rule.max(160),
        }),
      ],
    }),

    // Content - translatable (Portable Text)
    defineField({
      name: "content",
      type: "array",
      title: "Content",
      of: [{ type: "block" }],
    }),

    // Optional: Exclude specific fields from translation duplication
    // Example: Hero image that's the same across all languages
    defineField({
      name: "heroImage",
      type: "image",
      title: "Hero Image",
      options: {
        documentInternationalization: {
          exclude: true, // Don't copy this field when creating translations
        },
      },
    }),
  ],

  preview: {
    select: {
      title: "title",
      language: "language",
      slug: "slug.current",
    },
    prepare({ title, language, slug }) {
      return {
        title: title || "Untitled",
        subtitle: `/${language}/${slug || ""}`,
      };
    },
  },
});

/**
 * Blog post document type with internationalization
 */
export const blogType = defineType({
  name: "blog",
  type: "document",
  title: "Blog Post",

  fields: [
    // Language field
    languageField,

    defineField({
      name: "title",
      type: "string",
      title: "Title",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "excerpt",
      type: "text",
      title: "Excerpt",
      description: "Short summary of the post",
      validation: (Rule) => Rule.max(200),
    }),

    defineField({
      name: "content",
      type: "array",
      title: "Content",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
    }),

    // Author is NOT language-specific, so exclude from duplication
    defineField({
      name: "author",
      type: "reference",
      title: "Author",
      to: [{ type: "author" }],
      options: {
        documentInternationalization: {
          exclude: true,
        },
      },
    }),

    // Publish date is NOT language-specific
    defineField({
      name: "publishedAt",
      type: "datetime",
      title: "Published at",
      options: {
        documentInternationalization: {
          exclude: true,
        },
      },
    }),
  ],

  preview: {
    select: {
      title: "title",
      language: "language",
      author: "author.name",
    },
    prepare({ title, language, author }) {
      return {
        title: title || "Untitled",
        subtitle: `${language.toUpperCase()} - by ${author || "Unknown"}`,
      };
    },
  },
});

/**
 * Navbar document type (singleton with translations)
 * Each language has its own navbar document
 */
export const navbarType = defineType({
  name: "navbar",
  type: "document",
  title: "Navigation Bar",

  fields: [
    languageField,

    defineField({
      name: "menuItems",
      type: "array",
      title: "Menu Items",
      of: [
        defineField({
          name: "menuItem",
          type: "object",
          fields: [
            defineField({
              name: "title",
              type: "string",
              title: "Title",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "link",
              type: "reference",
              title: "Link to Page",
              to: [{ type: "page" }],
              // NOTE: References should point to pages in same language
              // This is handled in custom validation or Studio UI
            }),
          ],
        }),
      ],
    }),
  ],

  preview: {
    select: {
      language: "language",
    },
    prepare({ language }) {
      return {
        title: `Navigation - ${language.toUpperCase()}`,
      };
    },
  },
});

// ============================================================================
// Sanity Config Integration
// ============================================================================

/**
 * Example sanity.config.ts integration
 */
export const exampleSanityConfig = defineConfig({
  // ... other config

  plugins: [
    // ... other plugins

    // Add document internationalization plugin
    documentInternationalization(i18nPluginConfig),
  ],

  schema: {
    types: [
      // ... other types
      pageType,
      blogType,
      navbarType,
    ],
  },
});

// ============================================================================
// Custom Validation for Language-Specific References
// ============================================================================

/**
 * Helper to validate that references point to documents in the same language
 *
 * @example
 * defineField({
 *   name: 'relatedPages',
 *   type: 'array',
 *   of: [{
 *     type: 'reference',
 *     to: [{type: 'page'}],
 *     validation: (Rule) => Rule.custom(validateSameLanguageReference)
 *   }]
 * })
 */
export async function validateSameLanguageReference(value: any, context: any) {
  if (!value?._ref) {
    return true;
  }

  const { document, getClient } = context;
  const client = getClient({ apiVersion: "2025-02-19" });

  const parentLanguage = document.language;
  if (!parentLanguage) {
    return true; // No language set yet
  }

  const referencedDoc = await client.fetch("*[_id == $id][0]{language}", {
    id: value._ref,
  });

  if (!referencedDoc) {
    return true; // Document not found (other validation handles)
  }

  if (referencedDoc.language !== parentLanguage) {
    return `Referenced document is in ${referencedDoc.language}, but this document is in ${parentLanguage}. References should point to documents in the same language.`;
  }

  return true;
}

// ============================================================================
// Notes for Implementation
// ============================================================================

/**
 * IMPLEMENTATION CHECKLIST:
 *
 * 1. [ ] Install plugin: pnpm add @sanity/document-internationalization
 * 2. [ ] Add languageField to all translatable document types
 * 3. [ ] Configure plugin in sanity.config.ts with correct schemaTypes array
 * 4. [ ] Run pnpm --filter studio type to regenerate TypeScript types
 * 5. [ ] Test creating translation in Studio UI
 * 6. [ ] Verify translation.metadata document is created
 * 7. [ ] Add custom validation for language-specific references (optional)
 * 8. [ ] Configure Structure Builder for language filtering (optional)
 *
 * IMPORTANT CONSTRAINTS:
 * - Language field must be named 'language' (or match languageField config)
 * - Language field should be readOnly and hidden (plugin manages it)
 * - SchemaTypes array must include ALL translatable document types
 * - Plugin automatically handles metadata document creation/updates
 * - One metadata document per translated content set
 */
