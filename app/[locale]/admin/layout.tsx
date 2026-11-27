"use client";

import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LayoutDashboard, ShieldCheck, Users, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import SideLnbShell, { type SideLnbItem } from "@/components/layout/SideLnbShell";
import { useRouteGuard } from "@/lib/hooks/useRouteGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const t = useTranslations("admin");
  const pathname = usePathname();
  const { user, loading } = useAuth();
  useRouteGuard({ loading, userRole: user?.role, locale, requireAuth: true, requireRole: "admin" });

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-brand-mist dark:bg-night-card">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const base = `/${locale}/admin`;
  const navItems: SideLnbItem[] = [
    {
      href: `${base}/dashboard`,
      label: t("navDashboard"),
      icon: LayoutDashboard,
      active: (p) => p.includes("/admin/dashboard"),
    },
    {
      href: `${base}/users`,
      label: t("navUsers"),
      icon: Users,
      active: (p) => p.includes("/admin/users"),
    },
    {
      href: `${base}/moderation`,
      label: t("navModeration"),
      icon: ShieldCheck,
      active: (p) => p.includes("/admin/moderation"),
    },
    {
      href: `${base}/inquiries`,
      label: t("navInquiries"),
      icon: MessageSquare,
      active: (p) => p.includes("/admin/inquiries"),
    },
  ];

  return (
    <SideLnbShell title="Admin Console" pathname={pathname} mainNav={navItems}>
      {children}
    </SideLnbShell>
  );
}

