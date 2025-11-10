import { setRequestLocale } from "next-intl/server";
import { PageBuilder } from "@/components/pagebuilder";
import { sanityFetch } from "@/lib/sanity/live";
import { queryHomePageData } from "@/lib/sanity/query";
import { getSEOMetadata } from "@/lib/seo";
import { Locale } from "@/i18n/routing";

async function fetchHomePageData(locale: Locale) {
  return await sanityFetch({
    query: queryHomePageData,
    params: { locale },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const { data: homePageData } = await fetchHomePageData(locale);
  return getSEOMetadata(
    homePageData
      ? {
          title: homePageData?.seoTitle ?? homePageData?.title ?? "",
          description:
            homePageData?.seoDescription ?? homePageData?.description ?? "",
          slug: homePageData?.slug,
          contentId: homePageData?._id,
          contentType: homePageData?._type,
          locale,
        }
      : { locale }
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { data: homePageData } = await fetchHomePageData(locale);

  if (!homePageData) {
    return <div>No home page data</div>;
  }

  const { _id, _type, pageBuilder } = homePageData ?? {};

  return <PageBuilder id={_id} pageBuilder={pageBuilder ?? []} type={_type} />;
}
