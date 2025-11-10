import { NextResponse } from "next/server";
import { getValidLocale } from "@/i18n/routing";
import { getNavigationData } from "@/lib/navigation";

export const revalidate = 360; // every 5 minutes

export async function GET(request: Request) {
  // Extract locale from Accept-Language header or use default
  const acceptLanguage = request.headers.get("accept-language");
  const browserLocale = acceptLanguage?.split(",")[0]?.split("-")[0];
  const locale = getValidLocale(browserLocale);

  const data = await getNavigationData(locale);
  return NextResponse.json(data);
}
