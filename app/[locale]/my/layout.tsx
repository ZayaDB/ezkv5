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
  Bell,
  Receipt,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import MyWorkspaceShell, { type WorkspaceGroup, type WorkspaceItem } from "@/components/layout/MyWorkspaceShell";
import DashboardModeToggle from "@/components/dashboard/DashboardModeToggle";
import { useUnreadNotifications } from "@/lib/hooks/useUnreadNotifications";
import { useUnreadMessages } from "@/lib/hooks/useUnreadMessages";
import { useRouteGuard } from "@/lib/hooks/useRouteGuard";

export default function MySpaceLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("myPages.shell");
  const [dashboardMode, setDashboardMode] = useState<"mentee" | "mentor">("mentee");

  useRouteGuard({ loading, userRole: user?.role, locale, requireAuth: true });
  const { unread } = useUnreadNotifications(Boolean(user));
  const { unread: unreadMessages } = useUnreadMessages(Boolean(user));

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

  const workspace: WorkspaceItem[] = [
    { href: `${base}/dashboard`, label: t("navHome"), icon: LayoutDashboard, active: (p) => p.includes("/my/dashboard") },
    isMentorMode
      ? { href: `${base}/lectures`, label: t("navLectures"), icon: GraduationCap, active: (p) => p.includes("/my/lectures") }
      : {
          href: `${base}/courses`,
          label: t("navLearning"),
          icon: BookMarked,
          active: (p) => p.includes("/my/courses") || p.includes("/my/wishlist"),
        },
    { href: `${base}/schedule`, label: t("navSchedule"), icon: CalendarDays, active: (p) => p.includes("/my/schedule") },
    {
      href: `${base}/messages`,
      label: t("navMessages"),
      icon: MessageCircle,
      active: (p) => p.includes("/my/messages"),
      badge: unreadMessages,
    },
    {
      href: `${base}/notifications`,
      label: t("navNotifications"),
      icon: Bell,
      active: (p) => p.includes("/my/notifications"),
      badge: unread,
    },
  ];
  const groups: WorkspaceGroup[] = [
    { label: t("groupWorkspace"), items: workspace },
    {
      label: t("groupCommunity"),
      items: [{ href: `${base}/activity`, label: t("navActivity"), icon: PenLine, active: (p) => p.includes("/my/activity") }],
    },
    {
      label: t("groupAccount"),
      items: [
        { href: `${base}/profile?tab=info`, label: t("navProfile"), icon: UserRound, active: (p) => p.includes("/my/profile") },
        { href: `${base}/payments`, label: t("navPayments"), icon: Receipt, active: (p) => p.includes("/my/payments") },
        { href: `${base}/inquiries`, label: t("navInquiries"), icon: LifeBuoy, active: (p) => p.includes("/my/inquiries") },
      ],
    },
  ];

  const canMentor = user?.role === "mentor" || user?.role === "admin";
  const initial = (user?.name || "?").trim().charAt(0).toUpperCase();
  const header = user ? (
    <div className="flex flex-col gap-4 rounded-2xl border border-hairline bg-white p-4 dark:border-hairline-dark dark:bg-night-card">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-white dark:bg-teal-dark dark:text-night">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink dark:text-snow">{user.name}</p>
          <p className="truncate text-xs text-ink-muted dark:text-snow-muted">
            {isMentorMode ? t("roleMentorMode") : t(`role_${user.role === "admin" ? "admin" : user.role === "mentor" ? "mentor" : "user"}`)}
          </p>
        </div>
      </div>
      {canMentor ? <DashboardModeToggle canUseMentorMode /> : null}
    </div>
  ) : null;

  const footer =
    user && user.role === "user"
      ? { title: t("mentorCtaTitle"), body: t("mentorCtaBody"), href: `${base}/profile/apply`, cta: t("mentorCtaCta") }
      : null;

  if (loading && !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-surface dark:bg-night">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MyWorkspaceShell pathname={pathname} groups={groups} header={header} footer={footer}>
      {children}
    </MyWorkspaceShell>
  );
}
