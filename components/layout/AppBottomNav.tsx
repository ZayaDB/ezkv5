"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Home, Map, Bot, Calendar, User } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";

const tabs = [
  { href: "/home", icon: Home, labelKey: "navHome" as const },
  { href: "/assistant", icon: Bot, labelKey: "navAssistant" as const },
  { href: "/calendar", icon: Calendar, labelKey: "navCalendar" as const },
  { href: "/roadmap", icon: Map, labelKey: "navRoadmap" as const },
  { href: "/my", icon: User, labelKey: "navMy" as const },
];

export default function AppBottomNav() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.role === "admin") return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-700 safe-area-pb">
      <div className="grid grid-cols-5 h-16">
        {tabs.map(({ href, icon: Icon, labelKey }) => {
          const full = `/${locale}${href}`;
          const active = pathname === full || pathname?.startsWith(`${full}/`);
          return (
            <Link
              key={href}
              href={full}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                active
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-500 dark:text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
