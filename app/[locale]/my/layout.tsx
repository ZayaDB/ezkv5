"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Bell,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Receipt,
  Sparkles,
  UserRound,
  BookMarked,
  Heart,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { notificationsApi } from "@/lib/api/client";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: (path: string) => boolean;
  badge?: number;
};

export default function MySpaceLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("myPages.shell");
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [dashboardMode, setDashboardMode] = useState<"mentee" | "mentor">("mentee");

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/${locale}/login`);
    }
  }, [loading, user, router, locale]);

  const refreshUnread = useCallback(async () => {
    if (!user) return;
    const res = await notificationsApi.list();
    setUnreadNotif(res.data?.unreadCount ?? 0);
  }, [user]);

  useEffect(() => {
    void refreshUnread();
  }, [refreshUnread, pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("dashboard_mode");
    if (raw === "mentor" || raw === "mentee") {
      setDashboardMode(raw);
    }
  }, [pathname]);

  useEffect(() => {
    if (!user) return;
    if (
      dashboardMode === "mentee" &&
      pathname.includes("/my/lectures") &&
      (user.role === "mentor" || user.role === "admin")
    ) {
      router.replace(`/${locale}/my/dashboard`);
    }
  }, [dashboardMode, pathname, router, locale, user]);

  const base = `/${locale}/my`;
  const mainNav: NavItem[] = [
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
      href: `${base}/schedule`,
      label: t("navSchedule"),
      icon: CalendarDays,
      active: (p) => p.includes("/my/schedule"),
    },
    {
      href: `${base}/courses`,
      label: t("navCourses"),
      icon: BookMarked,
      active: (p) => p.includes("/my/courses"),
    },
    {
      href: `${base}/wishlist`,
      label: "찜한 강의",
      icon: Heart,
      active: (p) => p.includes("/my/wishlist"),
    },
    ...((user?.role === "mentor" || user?.role === "admin") && dashboardMode === "mentor"
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
      href: `${base}/notifications`,
      label: t("navNotifications"),
      icon: Bell,
      active: (p) => p.includes("/my/notifications"),
      badge: unreadNotif,
    },
  ];

  const supportNav: NavItem[] = [
    {
      href: `${base}/inquiries`,
      label: t("navInquiries"),
      icon: LifeBuoy,
      active: (p) => p.includes("/my/inquiries"),
    },
  ];

  if (loading || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-zinc-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderLink = (item: NavItem) => {
    const Icon = item.icon;
    const on = item.active(pathname);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          on
            ? "bg-primary-50 dark:bg-primary-500/15 text-primary-700 dark:text-primary-300 ring-1 ring-primary-100 dark:ring-primary-500/30"
            : "text-zinc-600 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-slate-800 hover:text-zinc-900 dark:hover:text-slate-100"
        }`}
      >
        <Icon className="w-4 h-4 shrink-0 opacity-80" />
        <span className="flex-1 min-w-0 truncate">{item.label}</span>
        {item.badge != null && item.badge > 0 ? (
          <span className="shrink-0 min-w-[1.125rem] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-950 flex flex-col md:flex-row">
      <aside className="md:w-60 shrink-0 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 md:min-h-screen">
        <div className="p-4 md:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400 mb-3">
            {t("title")}
          </p>
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0 md:space-y-0.5">
            {mainNav.map(renderLink)}
            <div className="hidden md:block my-3 border-t border-zinc-200 dark:border-slate-700" />
            <div className="flex md:flex-col gap-1 md:pt-1">
              <p className="hidden md:block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-slate-500 px-1 mb-1">
                {t("navSupport")}
              </p>
              {supportNav.map(renderLink)}
            </div>
          </nav>
        </div>
      </aside>
      <main className="flex-1 min-w-0 px-3 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}
