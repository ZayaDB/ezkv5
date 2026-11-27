"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/lib/contexts/AuthContext";
import { visaSlug, type VisaCode } from "@/lib/visa/types";

/**
 * 비자 칩: 코드 + 짧은 이름(예: D-2 · 유학).
 * 로그인 전 → 가입(비자 미리 채움), 로그인 후 → 그 비자 안내 화면.
 */
export default function VisaChip({ code, className }: { code: VisaCode; className: string }) {
  const locale = useLocale();
  const t = useTranslations("visaShort");
  const { user } = useAuth();
  const href = user
    ? `/${locale}/my/visa/${visaSlug(code)}`
    : `/${locale}/signup?visa=${encodeURIComponent(code)}`;
  return (
    <Link href={href} className={className}>
      <span className="b3-chip-code">{code}</span>
      <span className="b3-chip-name">{t(code)}</span>
    </Link>
  );
}
