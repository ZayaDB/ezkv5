"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { LayoutDashboard, ShieldCheck, Users, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import SideLnbShell, { type SideLnbItem } from "@/components/layout/SideLnbShell";
import { useRouteGuard } from "@/lib/hooks/useRouteGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  useRouteGuard({ loading, userRole: user?.role, locale, requireAuth: true, requireRole: "admin" });

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-zinc-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const base = `/${locale}/admin`;
  const navItems: SideLnbItem[] = [
    {
      href: `${base}/dashboard`,
      label: "운영 대시보드",
      icon: LayoutDashboard,
      active: (p) => p.includes("/admin/dashboard"),
    },
    {
      href: `${base}/users`,
      label: "사용자 관리",
      icon: Users,
      active: (p) => p.includes("/admin/users"),
    },
    {
      href: `${base}/moderation`,
      label: "운영 검수",
      icon: ShieldCheck,
      active: (p) => p.includes("/admin/moderation"),
    },
    {
      href: `${base}/inquiries`,
      label: "문의 관리",
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

