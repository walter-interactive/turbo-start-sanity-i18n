/**
 * Hero Block Schema
 *
 * PURPOSE:
 * Creates a prominent hero section at the top of a page with a large image,
 * headline, description, and call-to-action buttons. Designed to capture attention
 * and communicate the primary message immediately upon page load.
 *
 * KEY FEATURES:
 * - Badge: Optional promotional or highlight text above the title
 * - Title: Large primary heading for impact
 * - Rich text content: Flexible description with formatting support
 * - Hero image: High-quality image with hotspot support for focal point control
 * - Multiple buttons: Action buttons for navigation or conversions
 *
 * I18N SUPPORT: No - This is a page builder block, not a standalone document
 * ORDERING: No - Positioned within pageBuilder array
 * SINGLETON: No - Multiple instances allowed per page (though typically one per page)
 *
 * SPECIAL BEHAVIORS:
 * - Hotspot support: Image field includes hotspot for responsive cropping focal point
 * - Badge field: Useful for "New", "Limited Time", or promotional messaging
 *
 * USAGE LOCATIONS:
 * - Available in pageBuilder array for any page/document type
 * - Typically placed first in pageBuilder array for landing pages and home pages
 */

import { Star } from "lucide-react";
import { defineField, defineType } from "sanity";

import {
  buttonsFieldSchema,
  customRichText,
} from "@walter/sanity-atoms/schemas";

export const heroSectionSchema = defineType({
  name: "hero",
  title: "Hero",
  icon: Star,
  type: "object",
  fields: [
    defineField({
      name: "badge",
      type: "string",
      title: "Badge",
      description:
        "Optional badge text displayed above the title, useful for highlighting new features or promotions",
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description:
        "The main heading text for the hero section that captures attention",
    }),
    customRichText(["block"]),
    defineField({
      name: "image",
      type: "image",
      title: "Image",
      description:
        "The main hero image - should be high quality and visually impactful",
      options: {
        hotspot: true,
      },
    }),
    buttonsFieldSchema,
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title,
      subtitle: "Hero Block",
    }),
  },
});
