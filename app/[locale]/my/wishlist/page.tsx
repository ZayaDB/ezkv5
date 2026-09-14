"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { lectureWishlistApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import PlatformCard from "@/components/ui/PlatformCard";

const LOAD_TIMEOUT_MS = 5000;

export default function MyWishlistPage() {
  const locale = useLocale();
  const t = useTranslations("myPages.wishlist");
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<{ id: string; lectureId: string; lecture: any }[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user) return;
      try {
        const res = await Promise.race([
          lectureWishlistApi.list(),
          new Promise<{ data?: undefined }>((resolve) =>
            setTimeout(() => resolve({}), LOAD_TIMEOUT_MS)
          ),
        ]);
        if (!active) return;
        setItems(res.data?.wishlist || []);
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [user]);

  if ((loading && !user) || isLoading) return <LoadingState message={t("loading")} />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{t("title")}</h1>
        <p className="text-sm text-zinc-600 mt-1">{t("subtitle")}</p>
      </div>
      {items.length === 0 ? (
        <EmptyState title={t("empty")} actionLabel={t("browse")} actionHref={`/${locale}/lectures`} />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <PlatformCard key={item.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-900">{item.lecture?.title || t("deleted")}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {item.lecture?.category || "-"} · {item.lecture?.duration || "-"} · ₩
                    {(item.lecture?.price || 0).toLocaleString("ko-KR")}
                  </p>
                </div>
                <Link
                  href={`/${locale}/lectures/${item.lectureId}`}
                  className="rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700"
                >
                  {t("viewDetail")}
                </Link>
              </div>
            </PlatformCard>
          ))}
        </div>
      )}
    </div>
  );
}
