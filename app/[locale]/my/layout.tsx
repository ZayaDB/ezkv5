"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  UserRound,
  BookMarked,
  PenLine,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import SideLnbShell, { type SideLnbItem } from "@/components/layout/SideLnbShell";
import { useRouteGuard } from "@/lib/hooks/useRouteGuard";

export default function MySpaceLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("myPages.shell");
  const [dashboardMode, setDashboardMode] = useState<"mentee" | "mentor">("mentee");

  useRouteGuard({ loading, userRole: user?.role, locale, requireAuth: true });

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
            active: (p: string) => p.includes("/my/courses") || p.includes("/my/wishlist"),
          },
        ]
      : []),
    {
      href: `${base}/activity`,
      label: t("navActivity"),
      icon: PenLine,
      active: (p) => p.includes("/my/activity"),
    },
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
  ];

  const supportNav: SideLnbItem[] = [
    {
      href: `${base}/inquiries`,
      label: t("navInquiries"),
      icon: LifeBuoy,
      active: (p) => p.includes("/my/inquiries"),
    },
  ];

  if (loading && !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-zinc-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
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
