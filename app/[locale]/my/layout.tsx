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
import { notificationsApi } from "@/lib/api";
import SideLnbShell, { type SideLnbItem } from "@/components/layout/SideLnbShell";
import { useRouteGuard } from "@/lib/hooks/useRouteGuard";

export default function MySpaceLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("myPages.shell");
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [dashboardMode, setDashboardMode] = useState<"mentee" | "mentor">("mentee");

  useRouteGuard({ loading, userRole: user?.role, locale, requireAuth: true });

  const refreshUnread = useCallback(async () => {
    if (!user) return;
    const res = await notificationsApi.list();
    setUnreadNotif(res.data?.unreadCount ?? 0);
  }, [user]);

  useEffect(() => {
    if (!pathname.includes("/my/notifications")) {
      void refreshUnread();
    }
    const timer = window.setInterval(() => {
      if (!document.hidden && !pathname.includes("/my/notifications")) {
        void refreshUnread();
      }
    }, 60000);
    return () => window.clearInterval(timer);
  }, [refreshUnread, pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncDashboardMode = () => {
      const raw = localStorage.getItem("dashboard_mode");
      if (raw === "mentor" || raw === "mentee") {
        setDashboardMode(raw);
      }
    };

    syncDashboardMode();
    window.addEventListener("focus", syncDashboardMode);
    window.addEventListener("dashboard-mode-changed", syncDashboardMode as EventListener);
    return () => {
      window.removeEventListener("focus", syncDashboardMode);
      window.removeEventListener("dashboard-mode-changed", syncDashboardMode as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    if (
      pathname.includes("/my/lectures") &&
      (user.role === "mentor" || user.role === "admin") &&
      dashboardMode !== "mentor"
    ) {
      setDashboardMode("mentor");
      if (typeof window !== "undefined") {
        localStorage.setItem("dashboard_mode", "mentor");
      }
      return;
    }
    if (
      dashboardMode === "mentee" &&
      pathname.includes("/my/lectures") &&
      (user.role === "mentor" || user.role === "admin")
    ) {
      router.replace(`/${locale}/my/dashboard`);
    }
    if (
      dashboardMode === "mentor" &&
      (pathname.includes("/my/courses") || pathname.includes("/my/wishlist")) &&
      (user.role === "mentor" || user.role === "admin")
    ) {
      router.replace(`/${locale}/my/lectures`);
    }
  }, [dashboardMode, pathname, router, locale, user]);

  const base = `/${locale}/my`;
  const isMentorMode =
    dashboardMode === "mentor" && (user?.role === "mentor" || user?.role === "admin");

  const mainNav: SideLnbItem[] = [
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
    ...(!isMentorMode
      ? [
          {
            href: `${base}/courses`,
            label: t("navCourses"),
            icon: BookMarked,
            active: (p: string) => p.includes("/my/courses"),
          },
          {
            href: `${base}/wishlist`,
            label: "찜한 강의",
            icon: Heart,
            active: (p: string) => p.includes("/my/wishlist"),
          },
        ]
      : []),
    ...(isMentorMode
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

  const supportNav: SideLnbItem[] = [
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

  return (
    <SideLnbShell
      title={t("title")}
      pathname={pathname}
      mainNav={mainNav}
      supportTitle={t("navSupport")}
      supportNav={supportNav}
    >
      {children}
    </SideLnbShell>
  );
}
