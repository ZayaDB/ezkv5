"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { sessionApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ArrowLeft, CalendarCheck2 } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

interface SessionItem {
  id: string;
  date: string;
  duration: number;
  type: "online" | "offline";
  status: "upcoming" | "completed" | "cancelled";
  mentorId: string | null;
  mentorName: string;
}

function sessionTone(status: SessionItem["status"]) {
  if (status === "completed") return "green" as const;
  if (status === "cancelled") return "red" as const;
  return "blue" as const;
}

export default function MySessionsPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SessionItem[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user) return;
      const res = await sessionApi.getMine();
      if (!active) return;
      setItems((res.data?.sessions || []) as SessionItem[]);
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [user]);

  if (authLoading || !user || loading) {
    return <LoadingState message="세션 일정을 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href={`/${locale}/dashboard`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          대시보드로
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">내 세션 일정</h1>
        <p className="text-gray-600 mb-8">예약한 멘토 세션의 일정과 상태를 확인합니다.</p>

        {items.length === 0 ? (
          <EmptyState
            title="아직 예약된 세션이 없습니다."
            actionLabel="멘토 찾기"
            actionHref={`/${locale}/mentors`}
          />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.mentorId ? (
                        <Link href={`/${locale}/mentors/${item.mentorId}`} className="hover:underline">
                          {item.mentorName}
                        </Link>
                      ) : (
                        item.mentorName
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(item.date).toLocaleString("ko-KR")} · {item.duration}분 · {item.type}
                    </p>
                  </div>
                  <StatusBadge label={item.status} tone={sessionTone(item.status)} />
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => router.push(`/${locale}/dashboard`)}
                    className="inline-flex items-center text-sm font-semibold text-primary-600 hover:underline"
                  >
                    <CalendarCheck2 className="w-4 h-4 mr-1" />
                    대시보드에서 상태 변경
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
