/**
 * Migration: Add language field to existing translatable documents
 *
 * This migration adds the 'language' field to all translatable documents that don't have one.
 * Default language is 'fr' (French) to comply with Quebec language requirements.
 *
 * Usage:
 *   sanity migration list                                 # List all migrations
 *   sanity migration run add-language-field               # Dry run (preview changes)
 *   sanity migration run add-language-field --no-dry-run  # Apply changes
 *
 * @see https://www.sanity.io/docs/content-lake/schema-and-content-migrations
 * @see specs/001-i18n-localization/data-model.md (Migration Path section)
 */

import { at, defineMigration, set } from "sanity/migrate";

// Default language for Quebec compliance
const DEFAULT_LANGUAGE = "fr";

export default defineMigration({
  title: "Add language field to existing translatable documents",

  // Target all translatable document types
  // Must match schemaTypes in sanity.config.ts documentInternationalization plugin
  documentTypes: [
    "page",
    "blog",
    "blogIndex",
    "navbar",
    "footer",
    "settings",
    "homePage",
    "faq",
  ],

  // Only target documents that don't already have a language field
  filter: "!defined(language)",

  migrate: {
    document(_doc, _context) {
      // Set language field to default French for all existing documents
      return at("language", set(DEFAULT_LANGUAGE));
    },
  },
});
