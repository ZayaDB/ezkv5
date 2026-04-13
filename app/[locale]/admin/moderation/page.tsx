"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { adminApi } from "@/lib/api/client";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingState from "@/components/ui/LoadingState";

interface QueueItem {
  id: string;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
  group: { id: string; name: string; category: string } | null;
}

export default function AdminModerationPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [communityPending, setCommunityPending] = useState<QueueItem[]>([]);
  const [freelancerPending, setFreelancerPending] = useState<QueueItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const load = async () => {
    setLoading(true);
    const res = await adminApi.getModerationQueue();
    setCommunityPending(res.data?.communityPending || []);
    setFreelancerPending(res.data?.freelancerPending || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push(`/${locale}/login`);
      return;
    }
    if (user?.role === "admin") load();
  }, [authLoading, user, router, locale]);

  const updateStatus = async (
    type: "community" | "freelancer",
    id: string,
    status: string
  ) => {
    const res = await adminApi.updateModerationStatus({ type, id, status });
    if (res.error) {
      alert(res.error);
      return;
    }
    await load();
  };

  const filteredCommunity = communityPending.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.user?.name?.toLowerCase().includes(q) ||
      item.user?.email?.toLowerCase().includes(q) ||
      item.group?.name?.toLowerCase().includes(q)
    );
  });
  const filteredFreelancer = freelancerPending.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.user?.name?.toLowerCase().includes(q) ||
      item.user?.email?.toLowerCase().includes(q) ||
      item.group?.name?.toLowerCase().includes(q)
    );
  });
  const totalRows = Math.max(filteredCommunity.length, filteredFreelancer.length);
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const start = (page - 1) * pageSize;
  const pagedCommunity = filteredCommunity.slice(start, start + pageSize);
  const pagedFreelancer = filteredFreelancer.slice(start, start + pageSize);

  if (authLoading || !user || loading) {
    return <LoadingState message="운영 검수 큐를 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">운영 검수 큐</h1>
            <p className="text-gray-600 mt-1">커뮤니티/프리랜서 신청 승인 상태를 관리합니다.</p>
          </div>
          <Link href={`/${locale}/admin/dashboard`} className="px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold">
            관리자 대시보드
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 mb-6 flex gap-3 items-center">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="이름/이메일/그룹명 검색"
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <span className="text-sm text-gray-500">총 {totalRows}건</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">커뮤니티 가입 신청</h2>
            {pagedCommunity.length === 0 ? (
              <p className="text-sm text-gray-500">대기 중 신청이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {pagedCommunity.map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="font-semibold text-gray-900">{item.user?.name} → {item.group?.name}</p>
                    <p className="text-xs text-gray-500">{item.user?.email} · {new Date(item.createdAt).toLocaleString("ko-KR")}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge label="pending" tone="purple" />
                      <button
                        type="button"
                        onClick={() => updateStatus("community", item.id, "approved")}
                        className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 font-semibold"
                      >
                        승인
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">프리랜서 지원 신청</h2>
            {pagedFreelancer.length === 0 ? (
              <p className="text-sm text-gray-500">대기 중 신청이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {pagedFreelancer.map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="font-semibold text-gray-900">{item.user?.name} → {item.group?.name}</p>
                    <p className="text-xs text-gray-500">{item.user?.email} · {new Date(item.createdAt).toLocaleString("ko-KR")}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge label="pending" tone="purple" />
                      <button
                        type="button"
                        onClick={() => updateStatus("freelancer", item.id, "accepted")}
                        className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 font-semibold"
                      >
                        승인
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus("freelancer", item.id, "rejected")}
                        className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 font-semibold"
                      >
                        거절
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            이전
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
