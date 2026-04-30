"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

export default function Footer() {
  const t = useTranslations("common");
  const locale = useLocale();

  const getLocalizedPath = (path: string) => {
    return `/${locale}${path}`;
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white mt-auto border-t border-gray-800 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-24 h-24 overflow-hidden">
                <Image
                  src="/logo/logo.png"
                  alt="logo"
                  width={100}
                  height={100}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {t("footerTagline")}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t("footerPlatform")}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href={getLocalizedPath("/mentors")}
                  className="hover:text-white transition-colors"
                >
                  {t("mentors")}
                </Link>
              </li>
              <li>
                <Link
                  href={getLocalizedPath("/lectures")}
                  className="hover:text-white transition-colors"
                >
                  {t("lectures")}
                </Link>
              </li>
              <li>
                <Link
                  href={getLocalizedPath("/community")}
                  className="hover:text-white transition-colors"
                >
                  {t("community")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t("footerResources")}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href={getLocalizedPath("/study-in-korea")}
                  className="hover:text-white transition-colors"
                >
                  {t("studyInKorea")}
                </Link>
              </li>
              <li>
                <Link
                  href={getLocalizedPath("/freelancers")}
                  className="hover:text-white transition-colors"
                >
                  {t("freelancers")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t("footerSupport")}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href={getLocalizedPath("/study-in-korea")}
                  className="hover:text-white transition-colors"
                >
                  {t("helpCenter")}
                </Link>
              </li>
              <li>
                <Link
                  href={getLocalizedPath("/my/inquiries")}
                  className="hover:text-white transition-colors"
                >
                  {t("contactUs")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-2 text-center">
          <p className="text-xs sm:text-sm text-primary-200/80 dark:text-primary-300/70 tracking-wide">
            {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
