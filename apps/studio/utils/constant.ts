/**
 * Studio Field Group Constants
 *
 * Defines reusable field group identifiers and configurations for organizing
 * document fields into tabs in the Sanity Studio editing interface.
 *
 * Field groups allow complex documents (like pages and blog posts) to separate
 * their fields into logical sections (Content, SEO, Open Graph, etc.) instead
 * of showing all fields in a single long form.
 *
 * @example
 * ```typescript
 * // In a schema definition
 * defineField({
 *   name: "seoTitle",
 *   type: "string",
 *   group: GROUP.SEO, // This field appears in the "SEO" tab
 * })
 * ```
 */

import {
  BlockElementIcon,
  ComposeIcon,
  InlineElementIcon,
  InsertAboveIcon,
  SearchIcon,
} from "@sanity/icons";
import type { FieldGroupDefinition } from "sanity";

/**
 * Field group identifier constants
 *
 * Use these constants instead of string literals to ensure consistency
 * across all schema definitions and avoid typos.
 */
export const GROUP = {
  SEO: "seo",
  MAIN_CONTENT: "main-content",
  CARD: "card",
  RELATED: "related",
  OG: "og",
};

/**
 * Field group definitions for Studio UI
 *
 * These configurations control how field groups appear in the Studio editor:
 * - name: Identifier referenced by `group` property in field definitions
 * - icon: Visual icon displayed on the tab
 * - title: Human-readable tab label
 * - default: Whether this tab is shown by default when opening a document
 *
 * The order of this array determines the tab order in the Studio UI.
 *
 * @remarks
 * The "Content" group is set as default because primary content fields
 * (title, description, body) are the most frequently edited.
 */
export const GROUPS: FieldGroupDefinition[] = [
  // { name: CONST.MAIN_CONTENT, default: true },
  {
    name: GROUP.MAIN_CONTENT,
    icon: ComposeIcon,
    title: "Content",
    default: true,
  },
  { name: GROUP.SEO, icon: SearchIcon, title: "SEO" },
  {
    name: GROUP.OG,
    icon: InsertAboveIcon,
    title: "Open Graph",
  },
  {
    name: GROUP.CARD,
    icon: BlockElementIcon,
    title: "Card",
  },
  {
    name: GROUP.RELATED,
    icon: InlineElementIcon,
    title: "Related",
  },
];
