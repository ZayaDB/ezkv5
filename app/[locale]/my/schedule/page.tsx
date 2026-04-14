"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { sessionApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import PlatformCard from "@/components/ui/PlatformCard";
import LoadingState from "@/components/ui/LoadingState";

type SessionRow = {
  id: string;
  date?: string;
  status?: string;
  mentorName?: string;
  menteeName?: string;
};

export default function MySchedulePage() {
  const t = useTranslations("myPages.schedule");
  const tDash = useTranslations("dashboardV2");
  const locale = useLocale();
  const fmt = useFormatter();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await sessionApi.getMine();
    setSessions((res.data?.sessions as SessionRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/login`);
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const byDay = useMemo(() => {
    const map = new Map<string, SessionRow[]>();
    for (const s of sessions) {
      if (!s.date) continue;
      const d = new Date(s.date);
      if (Number.isNaN(d.getTime())) continue;
      const key = d.toISOString().slice(0, 10);
      const arr = map.get(key) || [];
      arr.push(s);
      map.set(key, arr);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [sessions]);

  if (authLoading || !user) {
    return <LoadingState />;
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">{t("title")}</h1>
        <p className="text-sm text-zinc-600 mt-1">{t("subtitle")}</p>
      </div>

      {loading ? (
        <LoadingState />
      ) : byDay.length === 0 ? (
        <PlatformCard>
          <p className="text-sm text-zinc-600">{t("empty")}</p>
          <Link
            href={`/${locale}/mentors`}
            className="inline-block mt-4 text-sm font-semibold text-primary-600 hover:underline"
          >
            {tDash("mentee.quick2Title")}
          </Link>
        </PlatformCard>
      ) : (
        <div className="space-y-6">
          {byDay.map(([day, rows]) => (
            <PlatformCard key={day} padding="lg">
              <h2 className="text-sm font-semibold text-zinc-500 mb-3">
                {fmt.dateTime(new Date(day + "T12:00:00"), { dateStyle: "full" })}
              </h2>
              <ul className="space-y-3">
                {rows.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {s.date
                          ? fmt.dateTime(new Date(s.date), {
                              timeStyle: "short",
                            })
                          : "—"}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {t("sessionWith", {
                          name: s.mentorName || s.menteeName || "—",
                        })}
                      </p>
                    </div>
                    <span className="text-xs font-medium uppercase text-zinc-500">
                      {s.status || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </PlatformCard>
          ))}
        </div>
      )}
    </div>
  );
}
