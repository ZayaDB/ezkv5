"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchPublicProfiles } from "@/lib/supabase/publicProfiles";
import { mentorsApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import LoadingState from "@/components/ui/LoadingState";

type PublicUser = {
  name: string;
  avatarUrl?: string;
  bio?: string;
  university?: string;
  nationality?: string;
  role?: string;
};

export default function PublicUserPage() {
  const params = useParams();
  const id = String(params.id || "");
  const locale = useLocale();
  const t = useTranslations("publicProfile");
  const tRoles = useTranslations("profile.roles");
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [mentor, setMentor] = useState<{ id: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const supabase = createClient();
      const [map, mentorRes] = await Promise.all([
        fetchPublicProfiles(supabase, [id]),
        mentorsApi.getApprovedByUserId(id),
      ]);
      if (cancelled) return;
      setProfile(map.get(id) || null);
      setMentor(mentorRes.data?.mentor ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <LoadingState message={t("loading")} />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="font-bold text-zinc-900 dark:text-white">{t("notFound")}</p>
          <Link
            href={`/${locale}/community`}
            className="text-primary-600 text-sm font-semibold mt-3 inline-block"
          >
            {t("back")}
          </Link>
        </div>
      </div>
    );
  }

  const roleKey = profile.role === "mentor" || profile.role === "admin" ? profile.role : "user";
  const isOwn = user?.id === id;
  const initial = (profile.name || "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 border-b border-zinc-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link
            href={`/${locale}/community`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("back")}
          </Link>

          <div className="mt-6 flex items-start gap-4">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt=""
                className="w-20 h-20 rounded-full object-cover object-top ring-2 ring-zinc-100 dark:ring-slate-800 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 text-white flex items-center justify-center text-3xl font-bold shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white truncate">
                  {profile.name}
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-slate-300">
                  {tRoles(roleKey)}
                </span>
              </div>
              {(profile.university || profile.nationality) && (
                <p className="mt-1 text-sm text-zinc-500">
                  {[profile.university, profile.nationality].filter(Boolean).join(" · ")}
                </p>
              )}
              {isOwn ? (
                <Link
                  href={`/${locale}/my/profile`}
                  className="inline-block mt-3 text-sm font-semibold text-primary-600"
                >
                  {t("editMine")}
                </Link>
              ) : null}
            </div>
          </div>

          <p className="mt-5 text-sm text-zinc-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {profile.bio?.trim() ? profile.bio : t("emptyBio")}
          </p>

          {mentor ? (
            <Link
              href={`/${locale}/mentors/${mentor.id}`}
              className="mt-5 flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-slate-700 bg-zinc-50 dark:bg-slate-800 px-4 py-3 hover:border-primary-300 dark:hover:border-primary-600"
            >
              <GraduationCap className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                  {mentor.title || t("viewMentor")}
                </p>
                <p className="text-xs text-zinc-500 dark:text-slate-400">{t("viewMentor")}</p>
              </div>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
