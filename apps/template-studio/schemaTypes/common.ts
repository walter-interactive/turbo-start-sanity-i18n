/**
 * Common Schema Utilities
 *
 * PURPOSE:
 * This file exports reusable field definitions and utility functions that are shared
 * across multiple schema types. Centralizing common patterns here ensures consistency
 * and reduces duplication across document and block schemas.
 *
 * EXPORTED FIELDS:
 * - languageField: Required for all translatable documents (i18n support)
 * - richTextField: Standard rich text editor field
 * - buttonsField: Array field for CTA buttons
 * - pageBuilderField: Array field containing all page builder blocks
 * - iconField: Icon picker field for feature cards, CTAs, etc.
 * - documentSlugField: Factory function for creating slug fields with validation
 *
 * LANGUAGE FIELD:
 * The languageField is critical for i18n support and must be included as the first
 * field in any translatable document schema. It is:
 * - readOnly: true (prevents manual editing, managed by i18n plugin)
 * - hidden: true (not visible in Studio UI)
 * - validated to ensure value is one of the supported languages (fr, en, es)
 *
 * DOCUMENT SLUG FIELD:
 * The documentSlugField factory function creates slug fields with:
 * - Custom validation per document type (reserved paths, uniqueness per language)
 * - PathnameFieldComponent for enhanced UI with async validation
 * - Automatic slug generation from title field
 * - Type-specific configuration (see utils/slug-validation.ts)
 *
 * USAGE:
 * Import needed fields from this file in your schema definitions:
 * ```typescript
 * import { languageField, documentSlugField } from '../common';
 *
 * export const mySchema = defineType({
 *   fields: [
 *     languageField,  // Required for i18n
 *     documentSlugField('mySchema'),  // Generates slug field
 *     // ... other fields
 *   ]
 * });
 * ```
 *
 * RELATED FILES:
 * - utils/slug-validation.ts: Slug validation rules and reserved paths
 * - components/slug-field-component.tsx: Custom slug input component
 * - utils/slug.ts: Slug generation and uniqueness utilities
 */

import { defineField } from "sanity";

import { PathnameFieldComponent } from "../components/slug-field-component";
import { GROUP } from "../utils/constant";
import { isUnique } from "../utils/slug";
import {
  createSlugValidator,
  getDocumentTypeConfig,
} from "../utils/slug-validation";

export const SUPPORTED_LANGUAGES = [
  { id: "fr", title: "Français" },
  { id: "en", title: "English" },
] as const;

export const languageField = defineField({
  name: "language",
  type: "string",
  title: "Language",
  description:
    "Language of this document version. Managed automatically by the translation plugin.",
  readOnly: true,
  hidden: true,
  validation: (Rule) =>
    Rule.required().custom((value: string | undefined) => {
      if (!value) return "Language is required";
      const validLanguages = SUPPORTED_LANGUAGES.map((l) => l.id);
      if (!validLanguages.includes(value as "fr" | "en")) {
        return `Language must be one of: ${validLanguages.join(", ")}`;
      }
      return true;
    }),
});

export const buttonsField = defineField({
  name: "buttons",
  type: "array",
  of: [{ type: "button" }],
  description:
    "Add one or more clickable buttons that visitors can use to navigate your website",
});

export const pageBuilderField = defineField({
  name: "pageBuilder",
  group: GROUP.MAIN_CONTENT,
  type: "pageBuilder",
  description:
    "Build your page by adding different sections like text, images, and other content blocks",
});

export const iconField = defineField({
  name: "icon",
  title: "Icon",
  options: {
    storeSvg: true,
    providers: ["fi"],
  },
  type: "iconPicker",
  description:
    "Choose a small picture symbol to represent this item, like a home icon or shopping cart",
});

export const documentSlugField = (
  documentType: string,
  options: {
    group?: string;
    description?: string;
    title?: string;
  } = {}
) => {
  const {
    group,
    description = `The web address where people can find your ${documentType} (automatically created from title)`,
    title = "URL",
  } = options;

  return defineField({
    name: "slug",
    type: "slug",
    title,
    description,
    group,
    components: {
      field: PathnameFieldComponent,
    },
    options: {
      isUnique,
    },
    validation: (Rule) => [
      Rule.required().error("A URL slug is required"),
      Rule.custom(createSlugValidator(getDocumentTypeConfig(documentType))),
    ],
  });
};
