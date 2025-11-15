'use client'

import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu'
import { Languages } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useSlugTranslation } from '@/contexts/slug-translation-context'
import { Link } from '@/i18n/navigation'
import { getLocaleName, LOCALES, type Locale } from '@/i18n/routing'
import { analytics } from '@/lib/analytics'

/**
 * Language switcher component
 *
 * Simple dropdown with links to each locale. If translation exists, navigates to
 * the translated slug. If not, uses current locale's slug (will show 404).
 */
export function LanguageSwitcher() {
  const pathname = usePathname()
  const currentLocale = useLocale() as Locale
  const { getTranslations } = useSlugTranslation()

  const translations = getTranslations(pathname)

  /**
   * Build href for a locale
   * Uses translation for target locale if exists, otherwise falls back to current locale's slug
   */
  const getHrefForLocale = (locale: Locale) => {
    // Try target locale first, fallback to current locale
    const translation = translations?.[locale] ?? translations?.[currentLocale]

    if (!translation) {
      return '/' // No translations at all, go to homepage
    }

    const slug = translation.slug.replace(/^\//, '')

    if (translation._type === 'homePage') return '/'
    if (translation._type === 'blogIndex') return '/blog'
    if (translation._type === 'blog') {
      return { pathname: '/blog/[slug]' as const, params: { slug } }
    }
    return { pathname: '/[slug]' as const, params: { slug } }
  }

  const handleLanguageClick = (targetLocale: Locale) => {
    if (targetLocale === currentLocale) return
    analytics.trackLanguageSwitch({
      from: currentLocale,
      to: targetLocale,
      pathname
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Switch language" size="icon" variant="outline">
          <Languages className="size-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((locale) => {
          const isActive = locale === currentLocale
          const hasTranslation = !!translations?.[locale]

          return (
            <Link
              href={getHrefForLocale(locale)}
              key={locale}
              locale={locale}
              onClick={() => handleLanguageClick(locale)}
            >
              <DropdownMenuItem
                asChild
                className="cursor-pointer"
                disabled={isActive}
              >
                <span>
                  <span className="flex items-center gap-2">
                    <span
                      className={
                        hasTranslation
                          ? 'text-xs uppercase'
                          : 'text-muted-foreground text-xs uppercase'
                      }
                      lang={locale}
                    >
                      {locale}
                    </span>
                    <span
                      className={hasTranslation ? '' : 'text-muted-foreground'}
                      lang={locale}
                    >
                      {getLocaleName({ locale, native: true })}
                    </span>
                    {isActive && (
                      <span className="ms-auto text-muted-foreground text-xs">
                        ✓
                      </span>
                    )}
                  </span>
                </span>
              </DropdownMenuItem>
            </Link>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
