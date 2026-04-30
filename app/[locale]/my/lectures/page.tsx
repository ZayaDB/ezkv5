"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { lecturesApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import PlatformCard from "@/components/ui/PlatformCard";
import LoadingState from "@/components/ui/LoadingState";
import { PenLine } from "lucide-react";

export default function MyLecturesHubPage() {
  const t = useTranslations("myPages.lecturesHub");
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teaching, setTeaching] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const lec = await lecturesApi.getMine();
    if (!lec.error && lec.data?.lectures) {
      setTeaching(lec.data.lectures);
    } else {
      setTeaching([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/login`);
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  if (authLoading || !user) {
    return <LoadingState />;
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">{t("title")}</h1>
          <p className="text-sm text-zinc-600 mt-1">{t("subtitle")}</p>
        </div>
        <Link
          href={`/${locale}/mentor/lectures/new`}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 shadow-sm"
        >
          <PenLine className="w-4 h-4" />
          {t("newLecture")}
        </Link>
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <div className="grid gap-8">
          <PlatformCard padding="lg">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">{t("teaching")}</h2>
            {teaching.length === 0 ? (
              <p className="text-sm text-zinc-500">{t("emptyTeaching")}</p>
            ) : (
              <ul className="space-y-3">
                {teaching.map((lec: { id: string; title?: string }) => (
                  <li
                    key={lec.id}
                    className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-3 py-3 text-sm"
                  >
                    <p className="font-medium text-zinc-900">{lec.title || "—"}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <Link
                        href={`/${locale}/lectures/${lec.id}`}
                        className="inline-block text-xs font-semibold text-primary-600 hover:underline"
                      >
                        {t("view")}
                      </Link>
                      <Link
                        href={`/${locale}/mentor/lectures/${lec.id}/edit`}
                        className="inline-block text-xs font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-2"
                      >
                        수정
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </PlatformCard>
        </div>
      )}
    </div>
  );
}
