import "@workspace/ui/globals.css";

import { Geist, Geist_Mono } from "next/font/google";
import { draftMode } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { VisualEditing } from "next-sanity";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { preconnect } from "react-dom";
import { FooterServer, FooterSkeleton } from "@/components/footer";
import { CombinedJsonLd } from "@/components/json-ld";
import { Navbar } from "@/components/navbar";
import { PreviewBar } from "@/components/preview-bar";
import { Providers } from "@/components/providers";
import { getStaticLocaleParams, isValidLocale } from "@/i18n/routing";
import { getNavigationData } from "@/lib/navigation";
import { SanityLive } from "@/lib/sanity/live";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export function generateStaticParams() {
  return getStaticLocaleParams();
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Validate locale
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get translations for client components
  const messages = await getMessages();

  preconnect("https://cdn.sanity.io");
  const nav = await getNavigationData(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Navbar
              navbarData={nav.navbarData}
              settingsData={nav.settingsData}
            />
            {children}
            <Suspense fallback={<FooterSkeleton />}>
              <FooterServer />
            </Suspense>
            <SanityLive />
            <CombinedJsonLd includeOrganization includeWebsite />
            {(await draftMode()).isEnabled && (
              <>
                <PreviewBar />
                <VisualEditing />
              </>
            )}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
