import type { Metadata } from "next";

import type { Locale } from "@/i18n/routing";
import { LOCALES, DEFAULT_LOCALE } from "@/i18n/routing";
import type { Maybe } from "@/types";
import { capitalize, getBaseUrl } from "@/utils";

// Site-wide configuration interface
type SiteConfig = {
  title: string;
  description: string;
  twitterHandle: string;
  keywords: string[];
};

// Page-specific SEO data interface
interface PageSeoData extends Metadata {
  title?: string;
  description?: string;
  slug?: string;
  contentId?: string;
  contentType?: string;
  keywords?: string[];
  seoNoIndex?: boolean;
  pageType?: Extract<Metadata["openGraph"], { type: string }>["type"];
  locale?: Locale;
}

// OpenGraph image generation parameters
type OgImageParams = {
  type?: string;
  id?: string;
};

// Default site configuration
const siteConfig: SiteConfig = {
  title: "Roboto Studio Demo",
  description: "Roboto Studio Demo",
  twitterHandle: "@studioroboto",
  keywords: ["roboto", "studio", "demo", "sanity", "next", "react", "template"],
};

function generateOgImageUrl(params: OgImageParams = {}): string {
  const { type, id } = params;
  const searchParams = new URLSearchParams();

  if (id) {
    searchParams.set("id", id);
  }
  if (type) {
    searchParams.set("type", type);
  }

  const baseUrl = getBaseUrl();
  return `${baseUrl}/api/og?${searchParams.toString()}`;
}

function buildPageUrl({
  baseUrl,
  slug,
}: {
  baseUrl: string;
  slug: string;
}): string {
  const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`;
  return `${baseUrl}${normalizedSlug}`;
}

function extractTitle({
  pageTitle,
  slug,
  siteTitle,
}: {
  pageTitle?: Maybe<string>;
  slug: string;
  siteTitle: string;
}): string {
  if (pageTitle) {
    return pageTitle;
  }
  if (slug && slug !== "/") {
    return capitalize(slug.replace(/^\//, ""));
  }
  return siteTitle;
}

/**
 * Generate hreflang alternate links for multilingual pages
 *
 * Creates alternate language links for SEO, helping search engines understand
 * which language versions of a page are available.
 *
 * @param slug - Page slug (without locale prefix)
 * @param currentLocale - Current page locale
 * @returns Object with language alternates for Next.js metadata
 *
 * @example
 * const alternates = generateHreflangAlternates('/about', 'en')
 * // Returns:
 * // {
 * //   languages: { 'fr': '/fr/about', 'en': '/en/about', 'x-default': '/fr/about' }
 * // }
 */
export function generateHreflangAlternates(
  slug: string,
  currentLocale: Locale
): Metadata["alternates"] {
  const baseUrl = getBaseUrl();
  const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`;

  // Build language alternates for all supported locales
  const languages: Record<string, string> = {};

  for (const locale of LOCALES) {
    languages[locale] = `${baseUrl}/${locale}${normalizedSlug}`;
  }

  // Add x-default pointing to default locale (French for Quebec compliance)
  languages["x-default"] = `${baseUrl}/${DEFAULT_LOCALE}${normalizedSlug}`;

  return {
    canonical: `${baseUrl}/${currentLocale}${normalizedSlug}`,
    languages,
  };
}

/**
 * Map locale codes to Open Graph locale format
 *
 * Converts ISO 639-1 locale codes (e.g., 'en', 'fr') to Open Graph
 * locale format (e.g., 'en_US', 'fr_CA') for proper social media metadata.
 *
 * @param locale - ISO locale code
 * @returns Open Graph formatted locale string
 *
 * @example
 * getOgLocale('fr') // 'fr_CA'
 * getOgLocale('en') // 'en_US'
 */
export function getOgLocale(locale: Locale): string {
  const ogLocaleMap: Record<Locale, string> = {
    fr: "fr_CA", // Quebec French
    en: "en_US", // US English
  };

  return ogLocaleMap[locale];
}

/**
 * Generate Open Graph locale alternates
 *
 * Creates alternate locale tags for Open Graph metadata, indicating
 * which other language versions are available for social media platforms.
 *
 * @param currentLocale - Current page locale
 * @returns Array of alternate locale strings in Open Graph format
 *
 * @example
 * getOgLocaleAlternates('fr') // ['en_US']
 * getOgLocaleAlternates('en') // ['fr_CA']
 */
export function getOgLocaleAlternates(currentLocale: Locale): string[] {
  return LOCALES.filter((locale) => locale !== currentLocale).map((locale) =>
    getOgLocale(locale)
  );
}

export function getSEOMetadata(page: PageSeoData = {}): Metadata {
  const {
    title: pageTitle,
    description: pageDescription,
    slug = "/",
    contentId,
    contentType,
    keywords: pageKeywords = [],
    seoNoIndex = false,
    pageType = "website",
    locale,
    ...pageOverrides
  } = page;

  const baseUrl = getBaseUrl();
  const pageUrl = buildPageUrl({ baseUrl, slug });

  // Build default metadata values
  const defaultTitle = extractTitle({
    pageTitle,
    slug,
    siteTitle: siteConfig.title,
  });
  const defaultDescription = pageDescription || siteConfig.description;
  const allKeywords = [...siteConfig.keywords, ...pageKeywords];

  const ogImage = generateOgImageUrl({
    type: contentType,
    id: contentId,
  });

  const fullTitle =
    defaultTitle === siteConfig.title
      ? defaultTitle
      : `${defaultTitle} | ${siteConfig.title}`;

  // Generate hreflang alternates if locale is provided
  const alternates = locale
    ? generateHreflangAlternates(slug, locale)
    : { canonical: pageUrl };

  // Get Open Graph locale information if locale is provided
  const ogLocale = locale ? getOgLocale(locale) : undefined;
  const ogLocaleAlternates = locale ? getOgLocaleAlternates(locale) : undefined;

  // Build default metadata object
  const defaultMetadata: Metadata = {
    title: fullTitle,
    description: defaultDescription,
    metadataBase: new URL(baseUrl),
    creator: siteConfig.title,
    authors: [{ name: siteConfig.title }],
    icons: {
      icon: `${baseUrl}/favicon.ico`,
    },
    keywords: allKeywords,
    robots: seoNoIndex ? "noindex, nofollow" : "index, follow",
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
      creator: siteConfig.twitterHandle,
      title: defaultTitle,
      description: defaultDescription,
    },
    alternates,
    openGraph: {
      type: pageType ?? "website",
      countryName: "CA", // Quebec, Canada
      description: defaultDescription,
      title: defaultTitle,
      locale: ogLocale,
      alternateLocale: ogLocaleAlternates,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: defaultTitle,
          secureUrl: ogImage,
        },
      ],
      url: pageUrl,
    },
  };

  // Override any defaults with page-specific metadata
  return {
    ...defaultMetadata,
    ...pageOverrides,
  };
}
