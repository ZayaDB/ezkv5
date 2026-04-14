"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: (path: string) => boolean;
};

export default function MySpaceLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("myPages.shell");

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/${locale}/login`);
    }
  }, [loading, user, router, locale]);

  const base = `/${locale}/my`;
  const navItems: NavItem[] = [
    {
      href: `${base}/dashboard`,
      label: t("navDashboard"),
      icon: LayoutDashboard,
      active: (p) => p.includes("/my/dashboard"),
    },
    {
      href: `${base}/profile?tab=info`,
      label: t("navProfile"),
      icon: UserRound,
      active: (p) => p.includes("/my/profile"),
    },
    {
      href: `${base}/inquiries`,
      label: t("navInquiries"),
      icon: MessageSquare,
      active: (p) => p.includes("/my/inquiries"),
    },
    {
      href: `${base}/schedule`,
      label: t("navSchedule"),
      icon: CalendarDays,
      active: (p) => p.includes("/my/schedule"),
    },
    ...(user?.role === "mentor" || user?.role === "admin"
      ? [
          {
            href: `${base}/lectures`,
            label: t("navLectures"),
            icon: GraduationCap,
            active: (p: string) => p.includes("/my/lectures"),
          },
        ]
      : []),
    {
      href: `${base}/receipts`,
      label: t("navReceipts"),
      icon: Receipt,
      active: (p) => p.includes("/my/receipts"),
    },
    {
      href: `${base}/activity`,
      label: t("navActivity"),
      icon: Sparkles,
      active: (p) => p.includes("/my/activity"),
    },
    {
      href: `${base}/enrollments`,
      label: t("navEnrollments"),
      icon: Users,
      active: (p) => p.includes("/my/enrollments"),
    },
  ];

  if (loading || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-zinc-50">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      <aside className="md:w-60 shrink-0 border-b md:border-b-0 md:border-r border-zinc-200 bg-white md:min-h-screen">
        <div className="p-4 md:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
            {t("title")}
          </p>
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0 md:space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const on = item.active(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    on
                      ? "bg-primary-50 text-primary-700 ring-1 ring-primary-100"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 opacity-80" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <main className="flex-1 min-w-0 px-3 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}
