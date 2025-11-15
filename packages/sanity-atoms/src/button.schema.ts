/**
 * Button Definition Schema
 *
 * PURPOSE:
 * Reusable button field configuration for CTAs, navigation, and actions throughout
 * the site. Provides consistent button styling options and flexible link configuration.
 */

import { Command } from "lucide-react";
import { defineField, defineType } from "sanity";

const buttonVariants = ["default", "secondary", "outline", "link"];

export const buttonSchema = defineType({
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
      options: {
        layout: "radio",
        direction: "horizontal",
        list: buttonVariants.map((v) => ({
          title: v.charAt(0).toUpperCase() + v.slice(1),
          value: v,
        })),
      },
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
      // Inline capitalize helper
      const capitalizedVariant = variant
        ? variant.charAt(0).toUpperCase() + variant.slice(1)
        : "Default";

      return {
        title: title || "Untitled Button",
        subtitle: `${capitalizedVariant} • ${url}${newTabIndicator}`,
      };
    },
  },
});
