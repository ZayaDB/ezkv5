import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Lecture, Mentor } from "@/types";
import { queryLecturesSupabase, queryMentorsSupabase } from "@/lib/supabase/public-queries";
import HomeMonthlySpotlights from "@/components/home/HomeMonthlySpotlights";

export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");

  let topLectures: Lecture[] = [];
  let topMentors: Mentor[] = [];
  try {
    const [lecR, menR] = await Promise.all([
      queryLecturesSupabase({ limit: 3 }),
      queryMentorsSupabase({ limit: 3 }),
    ]);
    topLectures = lecR.lectures;
    topMentors = menR.mentors;
  } catch {
    topLectures = [];
    topMentors = [];
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-night">
      <section className="relative -mt-20 pt-28 pb-20 lg:pt-32 lg:pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-stretch">
            {/* Copy column — framed like a filled-out entry card */}
            <div className="border border-hairline dark:border-hairline-dark rounded-sm bg-paper-card dark:bg-night-card px-6 py-8 sm:px-10 sm:py-10 flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-stamp dark:border-stamp-dark text-stamp dark:text-stamp-dark text-[10px] font-mono font-semibold">
                  L
                </span>
                <span className="font-mono text-[11px] tracking-wide text-ink-muted dark:text-parchment-muted">
                  {t("heroBadge")}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-ink dark:text-parchment leading-[1.25] mb-5 max-w-xl">
                {t("title")}
              </h1>
              <p className="text-base sm:text-lg text-ink-muted dark:text-parchment-muted mb-8 max-w-lg leading-relaxed">
                {t("subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link
                  href={`/${locale}/mentors`}
                  className="inline-flex items-center justify-center bg-stamp dark:bg-stamp-dark text-white px-6 py-3 rounded-sm text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  {t("cta")}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link
                  href={`/${locale}/lectures`}
                  className="inline-flex items-center justify-center text-ink dark:text-parchment px-6 py-3 rounded-sm text-sm font-semibold border border-hairline dark:border-hairline-dark hover:border-stamp dark:hover:border-stamp-dark transition-colors"
                >
                  {t("heroCtaSecondary")}
                </Link>
              </div>

              {/* form-field style meta rows, instead of generic pill chips */}
              <div className="mt-auto pt-6 border-t border-hairline dark:border-hairline-dark grid sm:grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <div className="text-ink-muted dark:text-parchment-muted mb-1">대상</div>
                  <div className="text-ink dark:text-parchment">한국 유학생 · 재학생 · 외국인 거주자</div>
                </div>
                <div>
                  <div className="text-ink-muted dark:text-parchment-muted mb-1">제공 기능</div>
                  <div className="text-ink dark:text-parchment">로드맵 · AI 비서 · 멘토/강의</div>
                </div>
              </div>
            </div>

            {/* Photo column — framed, corner stamp instead of a floating badge.
                The source photo is toned into the paper/stamp palette (duotone
                overlay) rather than left as a mismatched cool-toned graphic. */}
            <div className="relative border border-hairline dark:border-hairline-dark rounded-sm overflow-hidden bg-paper-card dark:bg-night-card min-h-[320px] lg:min-h-0">
              <img
                src="/repul_dppaMAIN_bkimg.png"
                alt={t("heroBadge")}
                className="absolute inset-0 w-full h-full object-cover grayscale sepia-[.45] contrast-[1.05] saturate-[1.1]"
              />
              <div className="absolute inset-0 bg-stamp/25 dark:bg-stamp-dark/35 mix-blend-multiply" />
              <div className="absolute inset-0 bg-paper/10 dark:bg-night/40" />
              <div className="absolute top-0 left-0 w-16 h-16 border-b border-r border-hairline dark:border-hairline-dark bg-paper dark:bg-night flex items-center justify-center">
                <span className="rotate-[-18deg] rounded-full border-2 border-stamp dark:border-stamp-dark text-stamp dark:text-stamp-dark font-mono text-[9px] font-bold tracking-wide h-11 w-11 flex items-center justify-center text-center leading-tight">
                  LNK
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeMonthlySpotlights
        locale={locale}
        topLectures={topLectures}
        topMentors={topMentors}
      />
    </div>
  );
}
