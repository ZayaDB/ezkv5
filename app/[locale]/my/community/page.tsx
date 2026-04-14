"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { communityApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ArrowLeft, Users } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingState from "@/components/ui/LoadingState";
import PlatformCard from "@/components/ui/PlatformCard";

interface MembershipItem {
  id: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  group: {
    id: string;
    name: string;
    category: string;
    members: number;
  } | null;
}

function membershipLabel(t: (key: string) => string, s: MembershipItem["status"]) {
  if (s === "pending") return t("communityMembership.pending");
  if (s === "approved") return t("communityMembership.approved");
  return t("communityMembership.rejected");
}

function membershipTone(s: MembershipItem["status"]) {
  if (s === "approved") return "green" as const;
  if (s === "rejected") return "red" as const;
  return "purple" as const;
}

export default function MyCommunityPage() {
  const locale = useLocale();
  const fmt = useFormatter();
  const router = useRouter();
  const t = useTranslations("myPages.community");
  const tMy = useTranslations("myPages");
  const tStatus = useTranslations("status");
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MembershipItem[]>([]);

  const load = useCallback(async () => {
    const res = await communityApi.getMyMemberships();
    setItems((res.data?.memberships || []) as MembershipItem[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/login`);
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!user) return;
      await load();
      if (!active) return;
    };
    run();
    return () => {
      active = false;
    };
  }, [user, load]);

  if (authLoading || !user || loading) {
    return <LoadingState message={t("loading")} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {tMy("backDashboard")}
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{t("subtitle")}</p>
        </div>

        {items.length === 0 ? (
          <PlatformCard className="text-center py-10">
            <p className="text-slate-600 mb-4">{t("emptyTitle")}</p>
            <Link
              href={`/${locale}/community`}
              className="inline-flex rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              {t("emptyCta")}
            </Link>
          </PlatformCard>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <PlatformCard key={item.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      {tMy("appliedAt")}:{" "}
                      {fmt.dateTime(new Date(item.createdAt), {
                        dateStyle: "medium",
                      })}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {item.group?.name || tMy("deleted")}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {item.group?.category || "—"} · {tMy("members", { count: item.group?.members ?? 0 })}
                    </p>
                  </div>
                  <StatusBadge
                    label={membershipLabel(tStatus, item.status)}
                    tone={membershipTone(item.status)}
                  />
                </div>
                {item.group?.id && (
                  <div className="mt-4">
                    <Link
                      href={`/${locale}/community/${item.group.id}`}
                      className="inline-flex items-center text-sm font-semibold text-primary-600 hover:underline"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      {t("viewGroup")}
                    </Link>
                  </div>
                )}
              </PlatformCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
