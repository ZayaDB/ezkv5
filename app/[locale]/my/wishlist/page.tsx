"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { lectureWishlistApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import PlatformCard from "@/components/ui/PlatformCard";

export default function MyWishlistPage() {
  const locale = useLocale();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<{ id: string; lectureId: string; lecture: any }[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user) return;
      const res = await lectureWishlistApi.list();
      if (!active) return;
      setItems(res.data?.wishlist || []);
      setIsLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [user]);

  if (loading || isLoading) return <LoadingState message="찜한 강의를 불러오는 중..." />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">찜한 강의</h1>
        <p className="text-sm text-zinc-600 mt-1">관심 강의를 모아보고 바로 상세로 이동할 수 있어요.</p>
      </div>
      {items.length === 0 ? (
        <EmptyState title="찜한 강의가 없습니다." actionLabel="강의 둘러보기" actionHref={`/${locale}/lectures`} />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <PlatformCard key={item.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-900">{item.lecture?.title || "삭제된 강의"}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {item.lecture?.category || "-"} · {item.lecture?.duration || "-"} · ₩
                    {(item.lecture?.price || 0).toLocaleString("ko-KR")}
                  </p>
                </div>
                <Link
                  href={`/${locale}/lectures/${item.lectureId}`}
                  className="rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700"
                >
                  상세 보기
                </Link>
              </div>
            </PlatformCard>
          ))}
        </div>
      )}
    </div>
  );
}
