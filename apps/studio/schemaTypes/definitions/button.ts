/**
 * Button Definition Schema
 *
 * PURPOSE:
 * Reusable button field configuration for CTAs, navigation, and actions throughout
 * the site. Provides consistent button styling options and flexible link configuration.
 *
 * KEY FEATURES:
 * - Variant selection: default, secondary, outline, link styles
 * - Button text: Customizable label for the button
 * - URL configuration: Uses customUrl for internal/external links
 * - Preview metadata: Shows variant and URL with new tab indicator
 *
 * I18N SUPPORT: No - This is a reusable definition, not a standalone document
 * ORDERING: No - Used as a field within other schemas
 * SINGLETON: No - Multiple instances allowed per parent document
 *
 * SPECIAL BEHAVIORS:
 * - Radio list layout: Variants displayed horizontally for easy selection
 * - Default value: "default" variant pre-selected for new buttons
 * - Preview format: Shows "Variant • URL ↗" for quick identification
 *
 * USAGE LOCATIONS:
 * - buttonsField in common.ts: Used in CTA, hero, navbar, and other blocks
 * - Any schema needing button configuration with style variants
 */

import { Command } from "lucide-react";
import { defineField, defineType } from "sanity";

import { capitalize, createRadioListLayout } from "../../utils/helper";

const buttonVariants = ["default", "secondary", "outline", "link"];

export const button = defineType({
  name: "button",
  title: "Button",
  type: "object",
  icon: Command,
  fields: [
    defineField({
      name: "variant",
      type: "string",
      description:
        "Choose the button's visual style - default is solid, secondary is less prominent, outline has a border, and link looks like regular text",
      initialValue: () => "default",
      options: createRadioListLayout(buttonVariants, {
        direction: "horizontal",
      }),
    }),
    defineField({
      name: "text",
      title: "Button Text",
      type: "string",
      description:
        "The text that appears on the button, like 'Learn More' or 'Get Started'",
    }),
    defineField({
      name: "url",
      title: "Url",
      type: "customUrl",
      description:
        "Where the button links to - can be an internal page or external website",
    }),
  ],
  preview: {
    select: {
      title: "text",
      variant: "variant",
      externalUrl: "url.external",
      urlType: "url.type",
      internalUrl: "url.internal.slug.current",
      openInNewTab: "url.openInNewTab",
    },
    prepare: ({
      title,
      variant,
      externalUrl,
      urlType,
      internalUrl,
      openInNewTab,
    }) => {
      const url = urlType === "external" ? externalUrl : internalUrl;
      const newTabIndicator = openInNewTab ? " ↗" : "";

      return {
        title: title || "Untitled Button",
        subtitle: `${capitalize(variant ?? "default")} • ${url}${newTabIndicator}`,
      };
    },
  },
});
