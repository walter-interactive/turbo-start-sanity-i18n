import '@workspace/ui/globals.css'

import { DEFAULT_LOCALE } from '@workspace/i18n-config'
import { Geist, Geist_Mono } from 'next/font/google'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { VisualEditing } from 'next-sanity'
import { Suspense } from 'react'
import { preconnect } from 'react-dom'
import { FooterServer, FooterSkeleton } from '@/components/footer'
import { CombinedJsonLd } from '@/components/json-ld'
import { Navbar } from '@/components/navbar'
import { PreviewBar } from '@/components/preview-bar'
import { Providers } from '@/components/providers'
import { SlugTranslationProvider } from '@/contexts/slug-translation-context'
import { getStaticLocaleParams, isValidLocale } from '@/i18n/routing'
import { getNavigationData } from '@/lib/navigation'
import { SanityLive, sanityFetch } from '@/lib/sanity/live'
import { createLocaleMapping } from '@/lib/sanity/locale-mapper'
import { queryAllLocalizedPages } from '@/lib/sanity/queries'
import { getSEOMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import type { Locale } from '@/i18n/routing'
import type { SanityLocalizedDocument } from '@/lib/sanity/locale-mapper'

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans'
})

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
})

/**
 * Fetch all localized documents for slug translation mapping
 *
 * Queries Sanity for all internationalized documents (page, blog, homePage, blogIndex)
 * in the default locale. The results include translation metadata for all languages.
 *
 * @returns Array of localized documents with translation metadata
 *
 * @remarks
 * This function is called once per request in the root layout to build the
 * locale mapping for language switching. Results are cached by Next.js.
 */
async function fetchAllLocalizedPages(): Promise<SanityLocalizedDocument[]> {
  const result = await sanityFetch({
    query: queryAllLocalizedPages,
    params: { locale: DEFAULT_LOCALE }
  })

  return result.data
}

/**
 * Generate metadata for the root layout
 *
 * Includes hreflang alternates for SEO and language-specific Open Graph tags
 * to help search engines understand multilingual content structure.
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  // Validate locale before using it
  if (!isValidLocale(locale)) {
    return {}
  }

  // Generate base metadata with hreflang alternates for homepage
  return getSEOMetadata({
    slug: '/',
    locale: locale as Locale
  })
}

export function generateStaticParams() {
  return getStaticLocaleParams()
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  // Validate locale
  if (!isValidLocale(locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Get translations for client components
  const messages = await getMessages()

  // Fetch all localized pages and create slug translation mapping
  const localizedPages = await fetchAllLocalizedPages()
  const localeMapping = createLocaleMapping(localizedPages)

  preconnect('https://cdn.sanity.io')
  const nav = await getNavigationData(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <SlugTranslationProvider localeMapping={localeMapping}>
            <Providers>
              <Navbar
                navbarData={nav.navbarData}
                settingsData={nav.settingsData}
              />
              {children}
              <Suspense fallback={<FooterSkeleton />}>
                <FooterServer locale={locale} />
              </Suspense>
              <SanityLive />
              <CombinedJsonLd
                includeOrganization
                includeWebsite
                locale={locale}
              />
              {(await draftMode()).isEnabled && (
                <>
                  <PreviewBar />
                  <VisualEditing />
                </>
              )}
            </Providers>
          </SlugTranslationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
