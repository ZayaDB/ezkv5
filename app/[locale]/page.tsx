import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  BookOpen,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Sparkles,
  Globe,
  Trophy,
} from "lucide-react";
import { queryLectures, queryMentors } from "@/lib/data/queries";
import type { Lecture, Mentor } from "@/types";
import HomeMonthlySpotlights from "@/components/home/HomeMonthlySpotlights";
import HomeNoticesAndTips from "@/components/home/HomeNoticesAndTips";
import HomeInquiryCta from "@/components/home/HomeInquiryCta";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

/** 인기 강의·멘토 블록 주기 갱신 (월간 API 연동 전까지 평점 기준 상위 3건) */
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
    const [lr, mr] = await Promise.all([
      queryLectures({ page: 1, limit: 3 }),
      queryMentors({ page: 1, limit: 3 }),
    ]);
    topLectures = lr.lectures;
    topMentors = mr.mentors;
  } catch {
    topLectures = [];
    topMentors = [];
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative -mt-20 min-h-screen overflow-hidden bg-[url('/repul_dppaMAIN_bkimg.png')] bg-cover bg-top bg-no-repeat pt-28 pb-14 lg:pt-32 lg:pb-20 flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0  dark:bg-slate-950/55" />
          <div className="absolute inset-0 " />
        </div>

        <div className="relative max-w-[1440px] left-40 top-[-40px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-[#7375a0] dark:text-white text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>{t("heroBadge")}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#7375a0] dark:text-white mb-6 leading-tight">
                {t("title")}
              </h1>
              <p className="text-lg sm:text-xl text-[#7375a0] dark:text-white mb-10 max-w-2xl leading-relaxed">
                {t("subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  href={`/${locale}/mentors`}
                  className="group inline-flex items-center justify-center bg-white text-primary-700 dark:bg-slate-100 dark:text-[#7375a0] text-primary-800 px-7 py-3.5 rounded-xl text-base font-bold hover:bg-slate-100 transition-all shadow-xl"
                >
                  {t("cta")}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href={`/${locale}/lectures`}
                  className="inline-flex items-center justify-center bg-primary-900/25 dark:bg-slate-800/55 backdrop-blur-sm text-white px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-primary-900/40 dark:hover:bg-slate-800/75 transition-all border border-white/35 dark:border-slate-500/50"
                >
                  {t("heroCtaSecondary")}
                </Link>
              </div>

              <div className="flex flex-wrap gap-3 text-[#7375a0] dark:text-white/95">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 dark:bg-white/15 px-3 py-1.5 text-sm">
                  <Trophy className="w-4 h-4" />
                  <span>{t("heroChipTop3")}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 dark:bg-white/15 px-3 py-1.5 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{t("trustedBy")}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 dark:bg-white/15 px-3 py-1.5 text-sm">
                  <Globe className="w-4 h-4" />
                  <span>{t("activeIn")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RevealOnScroll delayMs={40} minScrollY={220}>
        <HomeMonthlySpotlights
          locale={locale}
          topLectures={topLectures}
          topMentors={topMentors}
        />
      </RevealOnScroll>

      {/* Features Grid - Modern Card Design */}
      <RevealOnScroll delayMs={80}>
        <section className="py-16 sm:py-24 bg-white dark:bg-slate-950">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-slate-100 mb-4">
                모든 것이 한 곳에
              </h2>
              <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
                한국 유학에 필요한 모든 서비스를 제공합니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                href={`/${locale}/mentors`}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-700 hover:border-primary-200 hover:-translate-y-2 shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">
                    멘토 찾기
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 leading-relaxed mb-4">
                    경험 많은 멘토들과 연결하여 비자, 주거, 학업 등 모든 것을
                    도와드립니다.
                  </p>
                  <div className="flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
                    자세히 보기
                    <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              <Link
                href={`/${locale}/lectures`}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-700 hover:border-primary-200 hover:-translate-y-2 shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">
                    강의
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 leading-relaxed mb-4">
                    온라인 및 오프라인 강의를 통해 한국어와 전문 지식을
                    배우세요.
                  </p>
                  <div className="flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
                    자세히 보기
                    <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              <Link
                href={`/${locale}/community`}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-700 hover:border-primary-200 hover:-translate-y-2 shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">
                    커뮤니티
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 leading-relaxed mb-4">
                    다른 유학생들과 경험을 공유하고 네트워크를 구축하세요.
                  </p>
                  <div className="flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
                    자세히 보기
                    <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <Link
                href={`/${locale}/freelancers`}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-700 hover:border-primary-200 hover:-translate-y-2 shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">
                    프리랜서
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 leading-relaxed mb-4">
                    프리랜서 일자리와 기회를 찾아 수입을 올리세요.
                  </p>
                  <div className="flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
                    자세히 보기
                    <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              <Link
                href={`/${locale}/study-in-korea`}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-700 hover:border-primary-200 hover:-translate-y-2 shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">
                    한국 유학 정보
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 leading-relaxed mb-4">
                    비자, 주거, 병원, 생활 팁 등 한국 유학에 필요한 모든 정보.
                  </p>
                  <div className="flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
                    자세히 보기
                    <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delayMs={120}>
        <HomeNoticesAndTips />
      </RevealOnScroll>
      <RevealOnScroll delayMs={160}>
        <HomeInquiryCta locale={locale} />
      </RevealOnScroll>
    </div>
  );
}
