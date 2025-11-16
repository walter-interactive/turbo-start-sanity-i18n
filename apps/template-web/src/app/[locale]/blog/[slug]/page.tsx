import { logger } from '@workspace/logger'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { RichText } from '@/components/elements/rich-text'
import { SanityImage } from '@/components/elements/sanity-image'
import { TableOfContent } from '@/components/elements/table-of-content'
import { ArticleJsonLd } from '@/components/json-ld'
import { client } from '@/lib/sanity/client'
import { sanityFetch } from '@/lib/sanity/live'
import { queryBlogPaths, queryBlogSlugPageData } from '@/lib/sanity/query'
import { getSEOMetadata } from '@/lib/seo'
import type { Locale } from '@/i18n/routing'

async function fetchBlogSlugPageData(
  slug: string,
  locale: Locale,
  stega = true
) {
  return await sanityFetch({
    query: queryBlogSlugPageData,
    params: { slug: `/${slug}`, locale },
    stega
  })
}

async function fetchBlogPaths(locale: Locale) {
  try {
    const slugs = await client.fetch(queryBlogPaths, { locale })

    // If no slugs found, return empty array to prevent build errors
    if (!Array.isArray(slugs) || slugs.length === 0) {
      return []
    }

    const paths: { slug: string }[] = []
    for (const slug of slugs) {
      if (!slug?.slug) {
        continue
      }
      const [, , path] = slug.slug.split('/')
      if (path) {
        paths.push({ slug: path })
      }
    }
    return paths
  } catch (error) {
    logger.error('Error fetching blog paths for locale', {
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
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const { data } = await fetchBlogSlugPageData(slug, locale, false)
  return getSEOMetadata(
    data
      ? {
          title: data?.seoTitle ?? data?.title ?? '',
          description: data?.seoDescription ?? data?.description ?? '',
          slug: data?.slug,
          contentId: data?._id,
          contentType: data?._type,
          pageType: 'article',
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
  const paths = await fetchBlogPaths(locale)
  return paths
}

// Allow dynamic params for paths not generated at build time
export const dynamicParams = true

export default async function BlogSlugPage({
  params
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const { data } = await fetchBlogSlugPageData(slug, locale)
  if (!data) {
    return notFound()
  }
  const { title, description, image, richText } = data ?? {}

  return (
    <div className="container mx-auto my-16 px-4 md:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <main>
          <ArticleJsonLd article={data} locale={locale} />
          <header className="mb-8">
            <h1 className="mt-2 font-bold text-4xl">{title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          </header>
          {image && (
            <div className="mb-12">
              <SanityImage
                alt={title}
                className="h-auto w-full rounded-lg"
                height={900}
                image={image}
                loading="eager"
                width={1600}
              />
            </div>
          )}
          <RichText richText={richText} />
        </main>

        <div className="hidden lg:block">
          <div className="sticky top-4 rounded-lg">
            <TableOfContent richText={richText ?? []} />
          </div>
        </div>
      </div>
    </div>
  )
}
