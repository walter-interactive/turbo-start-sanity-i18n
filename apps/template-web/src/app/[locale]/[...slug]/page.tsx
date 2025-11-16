import { logger } from '@workspace/logger'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { PageBuilder } from '@/components/pagebuilder'
import { client } from '@/lib/sanity/client'
import { sanityFetch } from '@/lib/sanity/live'
import { querySlugPageData, querySlugPagePaths } from '@/lib/sanity/query'
import { getSEOMetadata } from '@/lib/seo'
import type { Locale } from '@/i18n/routing'

async function fetchSlugPageData(slug: string, locale: Locale, stega = true) {
  return await sanityFetch({
    query: querySlugPageData,
    params: { slug: `/${slug}`, locale },
    stega
  })
}

async function fetchSlugPagePaths(locale: Locale) {
  try {
    const slugs = await client.fetch(querySlugPagePaths, { locale })

    // If no slugs found, return empty array to prevent build errors
    if (!Array.isArray(slugs) || slugs.length === 0) {
      return []
    }

    const paths: { slug: string[] }[] = []
    for (const slug of slugs) {
      if (!slug?.slug) {
        continue
      }
      const parts = slug.slug.split('/').filter(Boolean)
      paths.push({ slug: parts })
    }
    return paths
  } catch (error) {
    logger.error('Error fetching slug paths for locale', {
      locale,
      error: error instanceof Error ? error.message : String(error)
    })
    // Return empty array to allow build to continue
    return []
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale; slug: string[] }>
}) {
  const { locale, slug } = await params
  const slugString = slug.join('/')
  const { data: pageData } = await fetchSlugPageData(slugString, locale, false)
  return getSEOMetadata(
    pageData
      ? {
          title: pageData?.seoTitle ?? pageData?.title ?? '',
          description: pageData?.seoDescription ?? pageData?.description ?? '',
          slug: pageData?.slug,
          contentId: pageData?._id,
          contentType: pageData?._type,
          locale
        }
      : { locale }
  )
}

export async function generateStaticParams({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const paths = await fetchSlugPagePaths(locale)
  return paths
}

// Allow dynamic params for paths not generated at build time
export const dynamicParams = true

export default async function SlugPage({
  params
}: {
  params: Promise<{ locale: Locale; slug: string[] }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const slugString = slug.join('/')
  const { data: pageData } = await fetchSlugPageData(slugString, locale)

  if (!pageData) {
    return notFound()
  }

  const { title, pageBuilder, _id, _type } = pageData ?? {}

  return !Array.isArray(pageBuilder) || pageBuilder?.length === 0 ? (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 font-semibold text-2xl capitalize">{title}</h1>
      <p className="mb-6 text-muted-foreground">
        This page has no content blocks yet.
      </p>
    </div>
  ) : (
    <PageBuilder id={_id} pageBuilder={pageBuilder} type={_type} />
  )
}
