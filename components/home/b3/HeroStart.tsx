"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { TOUR_OPEN_EVENT } from "./FirstVisitGuide";

/** 히어로 버튼: 로그인했으면 대시보드, 아니면 가입 */
export function HeroStart() {
  const t = useTranslations("homeB");
  const locale = useLocale();
  const { user } = useAuth();
  return (
    <Link href={user ? `/${locale}/my/dashboard` : `/${locale}/signup`} className="b3-btn b3-btn-line">
      {user ? t("heroCta2Mine") : t("heroCta2")}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

export function TourButton() {
  const t = useTranslations("homeB");
  return (
    <button type="button" className="b3-tour-btn" onClick={() => window.dispatchEvent(new Event(TOUR_OPEN_EVENT))}>
      {t("tour")}
    </button>
  );
}
