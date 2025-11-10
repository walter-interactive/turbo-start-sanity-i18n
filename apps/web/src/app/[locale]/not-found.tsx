"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("errors");

  return (
    <div className="flex min-h-[calc(100vh-400px)] flex-col items-center justify-center gap-4 p-4">
      <h1 className="animate-bounce font-bold text-6xl text-foreground">404</h1>
      <p className="animate-fade-in text-lg text-muted-foreground">
        {t("pageDoesNotExist")}
      </p>
      <Link
        aria-label={t("returnHome")}
        className="animate-fade-in-up rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-all duration-200 ease-in-out hover:scale-105 hover:bg-primary/90"
        href="/"
      >
        {t("returnHome")}
      </Link>
    </div>
  );
}
