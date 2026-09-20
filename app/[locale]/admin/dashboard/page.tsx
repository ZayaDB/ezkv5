"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/contexts/AuthContext";
import { adminApi } from "@/lib/api";
import { fetchModerationSummary } from "@/lib/supabase/admin-dashboard";
import ModerationSummaryCards from "@/components/admin/dashboard/ModerationSummaryCards";
import AdminStatsPanels from "@/components/admin/dashboard/AdminStatsPanels";
import type { AdminStats, StatsPeriod } from "@/components/admin/dashboard/types";

export default function AdminDashboardPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<StatsPeriod>("all");
  const [moderationSummary, setModerationSummary] = useState({
    mentorPending: 0,
    communityPending: 0,
    freelancerPending: 0,
  });

  const loadStats = useCallback(async () => {
    setLoading(true);
    const response = await adminApi.getStats(period);
    if (response.data) setStats(response.data as AdminStats);
    setLoading(false);
  }, [period]);

  const loadModerationSummary = useCallback(async () => {
    const [supa, qRes] = await Promise.all([
      fetchModerationSummary().catch(() => ({ mentorPending: 0, lecturePending: 0 })),
      adminApi.getModerationQueue(),
    ]);
    setModerationSummary({
      mentorPending: supa.mentorPending,
      communityPending: qRes.data?.communityPending?.length || 0,
      freelancerPending: qRes.data?.freelancerPending?.length || 0,
    });
  }, []);

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== "admin")) {
      router.push(`/${locale}/login`);
      return;
    }
    if (currentUser?.role === "admin") {
      void loadStats();
      void loadModerationSummary();
    }
  }, [period, currentUser, authLoading, locale, router, loadStats, loadModerationSummary]);

  if (authLoading || loading || !stats || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-100">
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 py-10 rounded-t-2xl">
        <div className="px-6 sm:px-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">관리자 대시보드</h1>
          <p className="text-xl text-white/90">{currentUser.name}님, 환영합니다</p>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-10">
        <ModerationSummaryCards {...moderationSummary} />
        <AdminStatsPanels
          locale={locale}
          stats={stats}
          period={period}
          onPeriodChange={setPeriod}
        />
      </div>
    </div>
  );
}
