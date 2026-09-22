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
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <section className="relative -mt-20 overflow-hidden bg-[url('/repul_dppaMAIN_bkimg.png')] bg-cover bg-top bg-no-repeat pt-32 pb-20 lg:pt-36 lg:pb-24">
        <div className="absolute inset-0 dark:bg-slate-950/55" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#7375a0] dark:text-white/80 mb-4">
              {t("heroBadge")}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#7375a0] dark:text-white mb-4 leading-tight">
              {t("title")}
            </h1>
            <p className="text-base sm:text-lg text-[#7375a0] dark:text-white/90 mb-8 max-w-xl leading-relaxed">
              {t("subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/${locale}/mentors`}
                className="inline-flex items-center justify-center bg-white text-primary-800 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all shadow-lg"
              >
                {t("cta")}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                href={`/${locale}/lectures`}
                className="inline-flex items-center justify-center bg-primary-900/25 backdrop-blur-sm text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-900/40 transition-all border border-white/35"
              >
                {t("heroCtaSecondary")}
              </Link>
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
