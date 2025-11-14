/**
 * Presentation URL Plugin
 *
 * Adds a custom field action button to document forms that opens the document
 * in the Presentation tool for live preview. This provides quick navigation from
 * the document editor to the preview pane.
 *
 * Features:
 * - Globe icon button in document header
 * - Validates slug exists before opening preview
 * - Shows error toast if document lacks a valid slug
 * - Hidden for documents without preview capability
 *
 * @remarks
 * This plugin is registered in sanity.config.ts via the plugins array.
 * It complements the presentationTool plugin by providing a shortcut to open
 * the preview for the current document being edited.
 *
 * @example
 * ```typescript
 * // In sanity.config.ts
 * export default defineConfig({
 *   plugins: [
 *     presentationUrl(), // Adds "Open in Presentation" button
 *     presentationTool({ ... }),
 *   ]
 * })
 * ```
 */

import { EarthGlobeIcon } from "@sanity/icons";
import { useToast } from "@sanity/ui";
import { useCallback } from "react";
import {
  type DocumentActionComponent,
  definePlugin,
  useGetFormValue,
} from "sanity";
import { useRouter } from "sanity/router";

/**
 * Type definition for the presentation action hook
 */
type PresentationUrlAction = {
  documentId: string;
};

/**
 * Presentation URL plugin definition
 *
 * Registers a custom field action that appears in the document editor toolbar.
 * The action button extracts the document's slug and navigates to the Presentation
 * tool with that slug as the preview URL.
 */
export const presentationUrl = definePlugin(() => ({
  name: "presentationUrl",
  document: {
    /**
     * Custom field actions configuration
     *
     * Injects a new action button into the document toolbar alongside built-in
     * actions like Publish, Unpublish, etc.
     */
    unstable_fieldActions: (props: DocumentActionComponent[]) => [
      {
        name: "open-in-presentation",
        /**
         * Action hook that handles presentation preview navigation
         *
         * @param documentId - The ID of the current document being edited
         * @returns Action configuration with icon, handler, and visibility rules
         */
        useAction: ({ documentId }: PresentationUrlAction) => {
          const getFormValue = useGetFormValue();
          const router = useRouter();
          const toast = useToast();

          /**
           * Handler function for the "Open in Presentation" button
           *
           * Extracts the document's slug and navigates to the Presentation tool.
           * Shows an error toast if the slug is missing or invalid.
           */
          const handlePresentationOpen = useCallback(() => {
            const slug = getFormValue(["slug", "current"]);

            if (typeof slug !== "string") {
              toast.push({
                title: "No slug found",
                status: "error",
                description: "Please ensure the document has a valid slug",
              });
              return;
            }

            router.navigateUrl({
              path: `/presentation?preview=${encodeURIComponent(slug)}`,
            });
          }, [getFormValue, toast, router]);

          return {
            type: "action" as const,
            icon: EarthGlobeIcon,
            hidden: documentId === "root", // Hide for root/system documents
            renderAsButton: true, // Show as button (not dropdown menu item)
            onAction: handlePresentationOpen,
            title: "Open in Presentation",
          };
        },
      },
      ...props, // Preserve existing field actions
    ],
  },
}));
