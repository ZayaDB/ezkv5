"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { enrollmentApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { BookOpen, ArrowLeft } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

interface EnrollmentItem {
  id: string;
  status: "active" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  enrolledAt: string;
  lecture: {
    id: string;
    title: string;
    category: string;
    type: "online" | "offline";
    duration: string;
    price: number;
  } | null;
}

function statusTone(status: EnrollmentItem["status"]) {
  if (status === "completed") return "green" as const;
  if (status === "cancelled") return "red" as const;
  return "blue" as const;
}

export default function MyEnrollmentsPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<EnrollmentItem[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadEnrollments = async () => {
    const res = await enrollmentApi.getMine();
    setItems((res.data?.enrollments || []) as EnrollmentItem[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user) return;
      if (!active) return;
      await loadEnrollments();
    };
    load();
    return () => {
      active = false;
    };
  }, [user]);

  const handleStatus = async (id: string, status: EnrollmentItem["status"]) => {
    setUpdatingId(id);
    const res = await enrollmentApi.updateStatus(id, status);
    setUpdatingId(null);
    if (res.error) {
      alert(res.error);
      return;
    }
    await loadEnrollments();
  };

  if (authLoading || !user || loading) {
    return <LoadingState message="수강 내역을 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href={`/${locale}/dashboard`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          대시보드로
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">내 수강 내역</h1>
        <p className="text-gray-600 mb-8">신청한 강의와 상태를 확인할 수 있습니다.</p>

        {items.length === 0 ? (
          <EmptyState
            title="아직 수강 신청한 강의가 없습니다."
            actionLabel="강의 보러 가기"
            actionHref={`/${locale}/lectures`}
          />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      신청일: {new Date(item.enrolledAt).toLocaleDateString("ko-KR")}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.lecture?.title || "삭제된 강의"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.lecture?.category || "-"} · {item.lecture?.duration || "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge label={item.status} tone={statusTone(item.status)} />
                    <StatusBadge label={item.paymentStatus} tone="gray" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm font-semibold text-primary-700">
                    {typeof item.lecture?.price === "number" ? `₩${item.lecture.price.toLocaleString("ko-KR")}` : "-"}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === "active" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStatus(item.id, "completed")}
                          disabled={updatingId === item.id}
                          className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 font-semibold disabled:opacity-60"
                        >
                          완료
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatus(item.id, "cancelled")}
                          disabled={updatingId === item.id}
                          className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 font-semibold disabled:opacity-60"
                        >
                          취소
                        </button>
                      </>
                    )}
                    {item.lecture?.id && (
                      <Link
                        href={`/${locale}/lectures/${item.lecture.id}`}
                        className="inline-flex items-center text-sm font-semibold text-primary-600 hover:underline"
                      >
                        <BookOpen className="w-4 h-4 mr-1" />
                        강의 보기
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
