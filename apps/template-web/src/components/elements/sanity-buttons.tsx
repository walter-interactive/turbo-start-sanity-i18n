import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { getValidLocale } from '@/i18n/routing'
import { getInternalLinkHref } from '@/lib/sanity/link-helpers'
import type { ComponentProps } from 'react'
import type { SanityButtonProps } from '@/types'

type SanityButtonsProps = {
  buttons: SanityButtonProps[] | null
  className?: string
  buttonClassName?: string
  size?: 'sm' | 'lg' | 'default' | 'icon' | null | undefined
}

function SanityButton({
  text,
  href,
  internalType,
  variant = 'default',
  openInNewTab,
  className,
  ...props
}: SanityButtonProps &
  ComponentProps<typeof Button> & { internalType?: string | null }) {
  const localeString = useLocale()
  const locale = getValidLocale(localeString)

  if (!href) {
    return <Button>Link Broken</Button>
  }

  // If this is an internal link, construct the proper localized path
  const finalHref = internalType
    ? getInternalLinkHref(href, internalType, locale)
    : href || '#'

  return (
    <Button
      variant={variant}
      {...props}
      asChild
      className={cn('rounded-[10px]', className)}
    >
      <Link
        aria-label={`Navigate to ${text}`}
        href={finalHref}
        target={openInNewTab ? '_blank' : '_self'}
        title={`Click to visit ${text}`}
      >
        {text}
      </Link>
    </Button>
  )
}

export function SanityButtons({
  buttons,
  className,
  buttonClassName,
  size = 'default'
}: SanityButtonsProps) {
  if (!buttons?.length) {
    return null
  }

  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row', className)}>
      {buttons.map((button) => (
        <SanityButton
          key={`button-${button._key}`}
          size={size}
          {...button}
          className={buttonClassName}
        />
      ))}
    </div>
  )
}
