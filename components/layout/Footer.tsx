"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function Footer() {
  const t = useTranslations("common");
  const locale = useLocale();

  const getLocalizedPath = (path: string) => `/${locale}${path}`;

  return (
    <footer className="bg-gray-900 dark:bg-slate-950 text-white mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/lnk-logo-dark.svg"
              alt="LNK — Learn · Network · Keep"
              width={94}
              height={40}
              className="h-10 w-auto"
            />
            <p className="text-sm text-gray-400">{t("footerTagline")}</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400">
            <Link href={getLocalizedPath("/mentors")} className="hover:text-white">
              {t("mentors")}
            </Link>
            <Link href={getLocalizedPath("/lectures")} className="hover:text-white">
              {t("lectures")}
            </Link>
            <Link href={getLocalizedPath("/community")} className="hover:text-white">
              {t("community")}
            </Link>
            <Link href={getLocalizedPath("/study-in-korea")} className="hover:text-white">
              {t("koreaLife")}
            </Link>
            <Link href={getLocalizedPath("/my/inquiries")} className="hover:text-white">
              {t("contactUs")}
            </Link>
          </nav>
        </div>
        <p className="mt-6 text-xs text-gray-500">{t("copyright")}</p>
      </div>
    </footer>
  );
}
