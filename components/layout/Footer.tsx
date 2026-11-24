"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { business, businessOrder } from "@/lib/legal/business";

/* Figma 푸터: 짙은 배경 · 브랜드 약속 · 링크 묶음 · 하단 고지 */
export default function Footer() {
  const t = useTranslations("common");
  const tf = useTranslations("footer");
  const tl = useTranslations("legal");
  const bizLabel = {
    name: tl("bizName"),
    owner: tl("bizOwner"),
    regNo: tl("bizRegNo"),
    ecommerceNo: tl("bizEcommerceNo"),
    address: tl("bizAddress"),
    email: tl("bizEmail"),
    phone: tl("bizPhone"),
  } as const;
  const bizItems = businessOrder.filter((k) => k !== "privacyOfficer" && business[k]);
  const locale = useLocale();
  const href = (path: string) => `/${locale}${path}`;
  const link = "transition-colors hover:text-brand-sun";

  return (
    <footer className="relative mt-auto overflow-hidden bg-brand-ink text-white dark:border-t dark:border-hairline-dark">
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-[0.24em] right-[-0.04em] select-none text-[clamp(140px,24vw,360px)] font-black leading-none tracking-[-0.05em] text-white/[0.04]">LNK</span>
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-4 py-12 sm:px-8 lg:px-20">
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
        <div className="flex flex-col gap-3 text-xs leading-[1.55] text-snow-muted">
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href={href("/legal/terms")} className={link}>{tl("terms")}</Link>
            <span aria-hidden="true">·</span>
            <Link href={href("/legal/privacy")} className={`${link} font-semibold text-white`}>{tl("privacy")}</Link>
            <span aria-hidden="true">·</span>
            <Link href={href("/legal/refund")} className={link}>{tl("refund")}</Link>
          </p>
          {bizItems.length > 0 && (
            <p className="flex flex-wrap gap-x-3 gap-y-1">
              {bizItems.map((k) => (
                <span key={k}>
                  {bizLabel[k as keyof typeof bizLabel]} {business[k]}
                </span>
              ))}
            </p>
          )}
          <p>{t("copyright")} · {tf("note")}</p>
        </div>
      </div>
    </footer>
  );
}
