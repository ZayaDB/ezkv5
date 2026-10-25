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
    <div className="min-h-screen bg-surface dark:bg-night">
      <section className="relative pt-14 pb-16 lg:pt-20 lg:pb-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
            {/* Copy column */}
            <div className="flex flex-col">
              <span className="inline-flex items-center self-start rounded-full bg-teal/10 dark:bg-teal-dark/15 px-3 py-1.5 text-xs font-medium text-teal dark:text-teal-dark mb-5">
                한국 유학생과 외국인을 위해
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-ink dark:text-snow leading-[1.3] mb-5 max-w-xl">
                비자·일정은 로드맵으로,
                <br />
                사람은 멘토로, 공부는 강의로.
              </h1>
              <p className="text-base text-ink-muted dark:text-snow-muted mb-7 max-w-lg leading-relaxed">
                한국 유학생을 위한 생활 비서. 만료일을 입력하면 로드맵이 만들어지고, 막히는 순간
                멘토와 강의로 연결됩니다.
              </p>

              <div className="flex flex-wrap gap-3 mb-7">
                <Link
                  href={`/${locale}/lectures`}
                  className="inline-flex items-center justify-center gap-1.5 bg-teal dark:bg-teal-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  코스 둘러보기
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/${locale}/study-in-korea`}
                  className="inline-flex items-center justify-center text-ink dark:text-snow px-5 py-2.5 rounded-lg text-sm font-semibold border border-hairline dark:border-hairline-dark hover:border-teal dark:hover:border-teal-dark transition-colors"
                >
                  한국 생활 가이드
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline dark:border-hairline-dark px-3 py-1.5 text-ink-muted dark:text-snow-muted">
                  <span className="font-semibold text-ink dark:text-snow">대상</span>
                  한국 유학생 · 재학생 · 외국인 거주자
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline dark:border-hairline-dark px-3 py-1.5 text-ink-muted dark:text-snow-muted">
                  <span className="font-semibold text-ink dark:text-snow">제공 기능</span>
                  로드맵 · AI 비서 · 멘토/커뮤니티(예정)
                </span>
              </div>
            </div>

            {/* Photo column */}
            <div className="flex flex-col">
              <div className="relative rounded-2xl overflow-hidden min-h-[320px] lg:min-h-[420px]">
                <img
                  src="/hero/campus-walk.jpg"
                  alt="캠퍼스와 일상"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-ink-muted dark:text-snow-muted">
                <span>한국에서의 새로운 시작, 더 명확하게.</span>
                <span>SEOUL, KR</span>
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
