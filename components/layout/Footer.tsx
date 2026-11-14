"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

/* Figma 푸터: 짙은 배경 · 브랜드 약속 · 링크 묶음 · 하단 고지 */
export default function Footer() {
  const t = useTranslations("common");
  const tf = useTranslations("footer");
  const locale = useLocale();
  const href = (path: string) => `/${locale}${path}`;
  const link = "hover:text-white transition-colors";

  return (
    <footer className="mt-auto bg-[#0b1513] text-white dark:border-t dark:border-hairline-dark">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-4 py-10 sm:px-8 lg:px-20">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="flex max-w-[470px] flex-col gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/lnk-logo-tagline-dark.svg" alt="LNK — Learn · Network · Keep" width={150} height={83} className="h-[72px] w-auto self-start" />
            <p className="text-sm leading-[1.55] text-snow">{tf("promise")}</p>
            <p className="text-[13px] leading-[1.55] text-snow-muted">{tf("promiseSub")}</p>
          </div>
          <nav className="flex flex-col gap-3.5 text-sm text-snow-muted md:items-end" aria-label="Footer">
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-white">
              <Link href={href("/lectures")} className={link}>{t("lectures")}</Link>
              <span aria-hidden="true">·</span>
              <Link href={href("/study-in-korea")} className={link}>{t("koreaLife")}</Link>
              <span aria-hidden="true">·</span>
              <Link href={href("/mentors")} className={link}>{t("mentors")}</Link>
              <span aria-hidden="true">·</span>
              <Link href={href("/community")} className={link}>{t("community")}</Link>
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
              <Link href={href("/my/dashboard")} className={link}>{tf("myWorkspace")}</Link>
              <span aria-hidden="true">·</span>
              <Link href={href("/my/inquiries")} className={link}>{t("contactUs")}</Link>
            </p>
          </nav>
        </div>
        <div className="h-px w-full bg-white/15" />
        <p className="text-xs leading-[1.55] text-snow-muted">{t("copyright")} · {tf("note")}</p>
      </div>
    </footer>
  );
}
