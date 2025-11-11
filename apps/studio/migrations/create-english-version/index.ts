/**
 * Migration: Create English versions of French documents
 *
 * This migration creates English duplicate documents for all French documents that don't
 * have English translations yet. Content is copied from French (needs manual translation).
 *
 * FEATURES:
 * - Creates English versions with proper ID naming (.en suffix)
 * - Handles singletons (homePage, navbar, footer, etc.) correctly
 * - Automatically creates translation.metadata documents to link FR/EN versions
 * - Skips documents that already have English versions
 *
 * IMPORTANT: This migration creates documents with French content in English language field.
 * Content editors should translate the duplicated content after this migration runs.
 *
 * Usage:
 *   sanity migration list                                    # List all migrations
 *   sanity migration run create-english-version              # Dry run (preview changes)
 *   sanity migration run create-english-version --no-dry-run # Apply changes
 *
 * @see https://www.sanity.io/docs/content-lake/schema-and-content-migrations
 * @see specs/001-i18n-localization/data-model.md
 */

import type { SanityDocument } from "sanity/migrate";
import { create, defineMigration } from "sanity/migrate";

// Target language for new documents
const TARGET_LANGUAGE = "en";
const SOURCE_LANGUAGE = "fr";

// Singleton document types that use dot notation for language IDs
const SINGLETON_TYPES = ["homePage", "blogIndex", "navbar", "footer", "settings"];

// Progress logging interval (milliseconds)
const LOG_INTERVAL_MS = 2000;

// Fields that should NOT be copied (immutable or auto-generated)
const EXCLUDED_FIELDS = [
  "_createdAt", // Auto-generated
  "_updatedAt", // Auto-generated
  "_rev", // Auto-generated
  "language", // Will be set to 'en'
];

// ANSI color codes for console output
const COLOR = {
  RESET: "\x1b[0m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  CYAN: "\x1b[36m",
  RED: "\x1b[31m",
} as const;

// Migration statistics (module-level counters)
const stats = {
  processed: 0,
  created: 0,
  skipped: 0,
  errors: 0,
  lastLog: Date.now(),
};

/**
 * Log migration progress periodically (every 10 documents)
 */
function logProgress() {
  const total = stats.processed;
  if (total % 10 === 0 && total > 0) {
    // biome-ignore lint/suspicious/noConsole: Intentional logging for migration output
    console.log(
      `${COLOR.CYAN}📊 Progress: ${total} documents processed | ${stats.created} created | ${stats.skipped} skipped${COLOR.RESET}`
    );
  }
}

/**
 * Log final migration summary
 */
function logSummary() {
  // biome-ignore lint/suspicious/noConsole: Intentional logging for migration summary
  console.log(
    `\n${COLOR.CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLOR.RESET}`
  );
  // biome-ignore lint/suspicious/noConsole: Intentional logging for migration summary
  console.log(`${COLOR.CYAN}  Migration Summary${COLOR.RESET}`);
  // biome-ignore lint/suspicious/noConsole: Intentional logging for migration summary
  console.log(
    `${COLOR.CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLOR.RESET}\n`
  );

  // biome-ignore lint/suspicious/noConsole: Intentional logging for migration summary
  console.log(
    `${COLOR.CYAN}📋 Documents processed:${COLOR.RESET} ${stats.processed}`
  );
  // biome-ignore lint/suspicious/noConsole: Intentional logging for migration summary
  console.log(
    `${COLOR.GREEN}✓ English versions created:${COLOR.RESET} ${stats.created}`
  );
  // biome-ignore lint/suspicious/noConsole: Intentional logging for migration summary
  console.log(
    `${COLOR.YELLOW}⊘ Already exist (skipped):${COLOR.RESET} ${stats.skipped}`
  );

  if (stats.errors > 0) {
    // biome-ignore lint/suspicious/noConsole: Intentional logging for migration summary
    console.log(
      `${COLOR.RED}✗ Errors encountered:${COLOR.RESET} ${stats.errors}`
    );
  }

  // biome-ignore lint/suspicious/noConsole: Intentional logging for migration summary
  console.log(
    `\n${COLOR.CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLOR.RESET}\n`
  );

  if (stats.created > 0) {
    // biome-ignore lint/suspicious/noConsole: Intentional logging for migration summary
    console.log(
      `${COLOR.GREEN}✅ Migration completed successfully!${COLOR.RESET}`
    );
    // biome-ignore lint/suspicious/noConsole: Intentional logging for migration summary
    console.log(`\n${COLOR.CYAN}Next steps:${COLOR.RESET}`);
    // biome-ignore lint/suspicious/noConsole: Intentional logging for migration summary
    console.log("   1. Refresh Sanity Studio to see English versions");
    // biome-ignore lint/suspicious/noConsole: Intentional logging for migration summary
    console.log(
      "   2. Translation links are automatically created - check language badges"
    );
    // biome-ignore lint/suspicious/noConsole: Intentional logging for migration summary
    console.log(
      "   3. Translate the English content (currently copied from French)\n"
    );
  } else if (stats.skipped === stats.processed) {
    // biome-ignore lint/suspicious/noConsole: Intentional logging for migration summary
    console.log(
      `${COLOR.YELLOW}ℹ️  All documents already have English versions${COLOR.RESET}\n`
    );
  }
}

/**
 * Generate English document ID based on French document ID and type
 */
function generateEnglishId(frenchId: string, docType: string): string {
  // For singletons, use dot notation: homePage → homePage.en or homePage.fr → homePage.en
  if (SINGLETON_TYPES.includes(docType)) {
    // Remove any existing language suffix (.fr, .en, etc.)
    const baseId = frenchId.replace(/\.(fr|en)$/, "");
    return `${baseId}.en`;
  }

  // For regular documents (UUIDs or custom IDs)
  // If it already has a language suffix, replace it
  if (frenchId.includes(".fr")) {
    return frenchId.replace(".fr", ".en");
  }
  if (frenchId.includes("-fr")) {
    return frenchId.replace("-fr", "-en");
  }

  // Otherwise, append .en
  return `${frenchId}.en`;
}

/**
 * Create English duplicate of a document
 */
function createEnglishDocument(frenchDoc: SanityDocument, docType: string): SanityDocument {
  // Copy all fields except excluded ones
  const englishDoc: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(frenchDoc)) {
    if (!EXCLUDED_FIELDS.includes(key)) {
      englishDoc[key] = value;
    }
  }

  // Set required fields for new document
  // _id is always defined in migration context
  const frenchId = frenchDoc._id || "unknown";

  return {
    ...englishDoc,
    _id: generateEnglishId(frenchId, docType),
    _type: frenchDoc._type,
    language: TARGET_LANGUAGE,
  } as SanityDocument;
}

/**
 * Create translation metadata document to link FR and EN versions
 */
function createTranslationMetadata(frenchId: string, englishId: string): SanityDocument {
  return {
    _id: `${frenchId}.__i18n`,
    _type: "translation.metadata",
    translations: [
      {
        _key: "fr",
        language: "fr",
        value: {
          _type: "reference",
          _ref: frenchId,
        },
      },
      {
        _key: "en",
        language: "en",
        value: {
          _type: "reference",
          _ref: englishId,
        },
      },
    ],
  } as SanityDocument;
}

export default defineMigration({
  title: "Create English versions of French documents",

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

  // Only target French documents
  filter: `language == "${SOURCE_LANGUAGE}"`,

  migrate: {
    document(frenchDoc, context) {
      // _id is always defined in migration context
      const frenchId = frenchDoc._id || "unknown";
      const docType = frenchDoc._type;

      // Check if English version already exists
      const englishId = generateEnglishId(frenchId, docType);

      // GROQ query to check for existing English version
      const queryEnglish = "*[_id == $englishId][0]{_id}";
      const queryMetadata = "*[_id == $metadataId][0]{_id}";
      const metadataId = `${frenchId}.__i18n`;

      // Increment processed counter
      stats.processed++;

      // Return promise that checks and creates if needed
      return context.client
        .fetch<{ _id: string } | null>(queryEnglish, {
          englishId,
        })
        .then((existingEnglish) => {
          // Skip if English version already exists
          if (existingEnglish) {
            stats.skipped++;
            // biome-ignore lint/suspicious/noConsole: Intentional logging for migration progress
            console.log(
              `${COLOR.YELLOW}⊘ Skipped${COLOR.RESET} ${docType}: ${frenchId} (English version exists)`
            );

            // Log progress periodically
            logProgress();

            // Log summary periodically
            const now = Date.now();
            if (now - stats.lastLog > LOG_INTERVAL_MS) {
              stats.lastLog = now;
              logSummary();
            }

            // Return empty array of mutations (no-op)
            return [];
          }

          // Create English duplicate with copied content
          const englishDoc = createEnglishDocument(frenchDoc, docType);

          // Check if translation metadata already exists
          return context.client
            .fetch<{ _id: string } | null>(queryMetadata, {
              metadataId,
            })
            .then((existingMetadata) => {
              stats.created++;
              // biome-ignore lint/suspicious/noConsole: Intentional logging for migration progress
              console.log(
                `${COLOR.GREEN}✓ Creating${COLOR.RESET} ${docType}: ${frenchId} → ${englishId}`
              );

              // Log progress periodically
              logProgress();

              // Log summary periodically
              const now = Date.now();
              if (now - stats.lastLog > LOG_INTERVAL_MS) {
                stats.lastLog = now;
                logSummary();
              }

              // Create mutations array
              const mutations = [create(englishDoc)];

              // Only create metadata if it doesn't exist
              if (!existingMetadata) {
                const metadataDoc = createTranslationMetadata(frenchId, englishId);
                mutations.push(create(metadataDoc));
                // biome-ignore lint/suspicious/noConsole: Intentional logging for migration progress
                console.log(
                  `${COLOR.CYAN}  ↳ Creating translation.metadata${COLOR.RESET} for ${frenchId}`
                );
              }

              // Return all mutations - migration system will execute them
              return mutations;
            });
        })
        .catch((error: unknown) => {
          // Handle any errors
          stats.errors++;
          // biome-ignore lint/suspicious/noConsole: Intentional logging for migration errors
          console.error(
            `${COLOR.RED}✗ Error${COLOR.RESET} processing ${docType}: ${frenchId}`
          );
          // biome-ignore lint/suspicious/noConsole: Intentional logging for migration errors
          console.error(
            `   ${error instanceof Error ? error.message : String(error)}`
          );

          // Return empty array to continue processing other documents
          return [];
        });
    },
  },
});

// Log final summary when module unloads (best effort)
process.on("beforeExit", () => {
  if (stats.processed > 0) {
    logSummary();
  }
});
