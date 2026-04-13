"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { communityApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ArrowLeft, Users } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

interface MembershipItem {
  id: string;
  status: "pending" | "approved";
  createdAt: string;
  group: {
    id: string;
    name: string;
    category: string;
    members: number;
  } | null;
}

export default function MyCommunityPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MembershipItem[]>([]);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/login`);
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user) return;
      const res = await communityApi.getMyMemberships();
      if (!active) return;
      setItems((res.data?.memberships || []) as MembershipItem[]);
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [user]);

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href={`/${locale}/dashboard`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          대시보드로
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">내 커뮤니티 신청</h1>
        <p className="text-gray-600 mb-8">가입 신청한 커뮤니티의 상태를 확인합니다.</p>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">커뮤니티 신청 내역이 없습니다.</p>
            <Link href={`/${locale}/community`} className="inline-flex px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold">
              커뮤니티 둘러보기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      신청일: {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900">{item.group?.name || "삭제된 커뮤니티"}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.group?.category || "-"} · 멤버 {item.group?.members?.toLocaleString("ko-KR") || 0}명
                    </p>
                  </div>
                  <StatusBadge
                    label={item.status}
                    tone={item.status === "approved" ? "green" : "purple"}
                  />
                </div>
                {item.group?.id && (
                  <div className="mt-4">
                    <Link
                      href={`/${locale}/community/${item.group.id}`}
                      className="inline-flex items-center text-sm font-semibold text-primary-600 hover:underline"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      커뮤니티 보기
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
