"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Sparkles, Calendar, User } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { openAssistant } from "@/components/chatbot/Chatbot";

export default function AppBottomNav() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.role === "admin") return null;

  // 일정은 내 공간(/my) 안에 있으므로 일정 탭이 활성일 때는 "내 공간" 탭을 끔
  const calendarHref = `/${locale}/my/schedule`;
  const myHref = `/${locale}/my/dashboard`;
  const myBase = `/${locale}/my`;
  const calendarActive = pathname === calendarHref || pathname?.startsWith(`${calendarHref}/`);
  const myActive =
    !calendarActive && (pathname === myBase || pathname?.startsWith(`${myBase}/`));

  const tabClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
      active ? "text-brand dark:text-teal-dark" : "text-brand-soft dark:text-snow-muted"
    }`;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-night/95 backdrop-blur-md border-t border-brand-line dark:border-hairline-dark safe-area-pb">
      <div className="grid grid-cols-3 h-16">
        <button type="button" onClick={() => openAssistant()} className={tabClass(false)}>
          <Sparkles className="w-5 h-5 text-brand-sun-deep" aria-hidden="true" />
          <span>{t("navAssistantAi")}</span>
        </button>
        <Link href={calendarHref} className={tabClass(Boolean(calendarActive))}>
          <Calendar className="w-5 h-5" />
          <span>{t("navCalendar")}</span>
        </Link>
        <Link href={myHref} className={tabClass(Boolean(myActive))}>
          <User className="w-5 h-5" />
          <span>{t("navMy")}</span>
        </Link>
      </div>
    </nav>
  );
}
