"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Bot, Calendar, User } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { openAssistant } from "@/components/chatbot/Chatbot";

export default function AppBottomNav() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.role === "admin") return null;

  const calendarHref = `/${locale}/calendar`;
  const myHref = `/${locale}/my`;
  const calendarActive = pathname === calendarHref || pathname?.startsWith(`${calendarHref}/`);
  const myActive = pathname === myHref || pathname?.startsWith(`${myHref}/`);

  const tabClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
      active ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-slate-400"
    }`;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-700 safe-area-pb">
      <div className="grid grid-cols-3 h-16">
        <button type="button" onClick={() => openAssistant()} className={tabClass(false)}>
          <Bot className="w-5 h-5" />
          <span>{t("navAssistant")}</span>
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
