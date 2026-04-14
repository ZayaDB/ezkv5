"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { freelancerApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ArrowLeft, Briefcase } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingState from "@/components/ui/LoadingState";
import PlatformCard from "@/components/ui/PlatformCard";

interface ApplicationItem {
  id: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  group: {
    id: string;
    name: string;
    category: string;
    members: number;
    jobsPosted: number;
  } | null;
}

function appLabel(t: (key: string) => string, status: ApplicationItem["status"]) {
  if (status === "pending") return t("freelancerApplication.pending");
  if (status === "accepted") return t("freelancerApplication.accepted");
  return t("freelancerApplication.rejected");
}

function appTone(status: ApplicationItem["status"]) {
  if (status === "accepted") return "green" as const;
  if (status === "rejected") return "red" as const;
  return "purple" as const;
}

export default function MyFreelancersPage() {
  const locale = useLocale();
  const fmt = useFormatter();
  const router = useRouter();
  const t = useTranslations("myPages.freelancers");
  const tMy = useTranslations("myPages");
  const tStatus = useTranslations("status");
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ApplicationItem[]>([]);

  const load = useCallback(async () => {
    const res = await freelancerApi.getMyApplications();
    setItems((res.data?.applications || []) as ApplicationItem[]);
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
      <div className="w-full space-y-6">
        <Link
          href={`/${locale}/my/dashboard`}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {tMy("backDashboard")}
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{t("subtitle")}</p>
        </div>

        {items.length === 0 ? (
          <PlatformCard className="text-center py-10">
            <p className="text-slate-600 mb-4">{t("emptyTitle")}</p>
            <Link
              href={`/${locale}/freelancers`}
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
                  <StatusBadge label={appLabel(tStatus, item.status)} tone={appTone(item.status)} />
                </div>
                {item.group?.id && (
                  <div className="mt-4">
                    <Link
                      href={`/${locale}/freelancers/${item.group.id}`}
                      className="inline-flex items-center text-sm font-semibold text-primary-600 hover:underline"
                    >
                      <Briefcase className="w-4 h-4 mr-1" />
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
