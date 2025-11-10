"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES, type Locale, getLocaleName } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Languages } from "lucide-react";

/**
 * Language switcher component
 *
 * Allows users to switch between available locales while maintaining
 * the current page path. Uses next-intl navigation APIs for locale-aware
 * routing with proper cookie/preference management.
 *
 * @example
 * import { LanguageSwitcher } from '@/components/language-switcher'
 *
 * export function Header() {
 *   return (
 *     <header>
 *       <nav>
 *         <LanguageSwitcher />
 *       </nav>
 *     </header>
 *   )
 * }
 */
export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  /**
   * Handle locale change
   *
   * Uses router.replace() instead of router.push() to avoid polluting
   * browser history with language switches. The transition wrapper
   * provides loading state during navigation.
   *
   * @param newLocale - Target locale to switch to
   */
  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={isPending}
          aria-label="Switch language"
        >
          <Languages className="size-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((locale) => {
          const isActive = locale === currentLocale;

          return (
            <DropdownMenuItem
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              disabled={isActive || isPending}
              className="cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span
                  className="text-xs uppercase text-muted-foreground"
                  lang={locale}
                >
                  {locale}
                </span>
                <span lang={locale}>
                  {getLocaleName({ locale, native: true })}
                </span>
                {isActive && (
                  <span className="ms-auto text-xs text-muted-foreground">
                    ✓
                  </span>
                )}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
