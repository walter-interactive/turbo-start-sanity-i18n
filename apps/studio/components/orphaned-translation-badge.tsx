import { WarningOutlineIcon } from "@sanity/icons";
import { Badge, Flex, Text } from "@sanity/ui";
import { DEFAULT_LOCALE, type Locale } from "@workspace/i18n-config";

/**
 * Props for the OrphanedBadge component
 * Used in schema preview.prepare() to render warning badges for orphaned translations
 */
export interface OrphanedBadgeProps {
  /** Document language code */
  language: Locale;
  /** Whether to show the badge (default: true) */
  showBadge?: boolean;
}

/**
 * Badge component to indicate orphaned translations
 * An orphaned translation is a document that exists in a non-default language
 * without a corresponding default language version
 *
 * @param props - Component props
 * @returns Badge component or null if badge should not be shown
 *
 * @example
 * ```tsx
 * preview: {
 *   select: {
 *     title: 'title',
 *     language: 'language',
 *   },
 *   prepare({ title, language }) {
 *     return {
 *       title,
 *       media: <OrphanedBadge language={language} />
 *     };
 *   }
 * }
 * ```
 */
export function OrphanedBadge({
  language,
  showBadge = true,
}: OrphanedBadgeProps) {
  // Don't show badge if explicitly disabled or if document is in default language
  if (!showBadge || language === DEFAULT_LOCALE) {
    return null;
  }

  return (
    <Badge
      aria-label="Orphaned translation - missing default language version"
      radius={2}
      role="alert"
      tone="caution"
    >
      <Flex align="center" gap={1}>
        <WarningOutlineIcon aria-label="Warning" />
        <Text size={1} weight="medium">
          Orphaned
        </Text>
      </Flex>
    </Badge>
  );
}
