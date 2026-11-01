import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Home,
  Plane,
  TrainFront,
} from "lucide-react";
import type { Lecture, Mentor } from "@/types";
import { queryLecturesSupabase, queryMentorsSupabase } from "@/lib/supabase/public-queries";
import HomeMonthlySpotlights from "@/components/home/HomeMonthlySpotlights";
import {
  CampusCover,
  HeroIllustration,
  KoreanCover,
  PathDivider,
  SettleCover,
} from "@/components/home/illustrations";
import { FaqList, Parallax, Reveal, ScrollProgress, StepsTimeline } from "@/components/home/motion";

export const revalidate = 3600;

/* Copy and structure follow the "LNK • Homepage" frame in Figma. */

const eyebrow = "text-[13px] font-bold text-teal dark:text-teal-dark";
const h2 = "break-keep text-3xl font-semibold leading-[1.15] text-ink dark:text-snow sm:text-4xl lg:text-[40px]";
const lead = "break-keep text-base leading-[1.55] text-ink-muted dark:text-snow-muted";
const card =
  "rounded-2xl border border-hairline bg-surface-card dark:border-hairline-dark dark:bg-night-card";
const pill =
  "inline-flex items-center rounded-full bg-primary-100 px-2.5 py-1.5 text-xs font-semibold text-primary-700 dark:bg-night-pill dark:text-snow-muted";
const container = "mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-20";

const audience = [
  "입국을 준비 중인 유학생",
  "이미 한국에 있고 실질적인 도움이 필요한 유학생",
  "체계적인 학습과 안내가 필요한 재한 외국인",
];
const value = [
  "학습과 적응을 위한 체계적인 코스 미리보기",
  "입국·캠퍼스·주거·생활 전반에 대한 실용 가이드",
  "향후 지원될 멘토·커뮤니티 연결",
];

const courses = [
  {
    cover: <CampusCover className="h-full w-full" />,
    topic: "학업 · 캠퍼스",
    title: "한국에서의 첫 학기",
    body: "캠퍼스 생활 루틴을 이해하고, 도움을 요청하는 법을 익히고, 첫 주를 준비합니다.",
    meta: "4개 레슨 · 자기 주도 학습(기획안)",
  },
  {
    cover: <KoreanCover className="h-full w-full" />,
    topic: "언어 · 문화",
    title: "일상에서 쓰는 한국어",
    body: "카페, 대중교통, 일상 대화에서 바로 쓸 수 있는 표현을 연습합니다.",
    meta: "6개 레슨 · 자기 주도 학습(기획안)",
  },
  {
    cover: <SettleCover className="h-full w-full" />,
    topic: "생활 필수 정보",
    title: "서울 생활 정착하기",
    body: "새로운 도시, 새로운 집에서 마주치는 현실적인 질문들을 다룹니다.",
    meta: "5개 레슨 · 자기 주도 학습(기획안)",
  },
];

const guides = [
  { Icon: Plane, title: "입국 준비", body: "서류, 짐 싸기, 첫걸음" },
  { Icon: GraduationCap, title: "학업", body: "캠퍼스 생활과 학사 일정" },
  { Icon: Home, title: "주거", body: "집 구하기와 확인할 것들" },
  { Icon: HeartPulse, title: "의료", body: "진료 옵션과 공식 자료" },
  { Icon: TrainFront, title: "생활 필수", body: "교통 · 은행 · 통신" },
  { Icon: Briefcase, title: "취업 · 진로", body: "진로 계획과 규정 확인" },
];

const steps = [
  { marker: "01", title: "둘러보기", body: "코스 미리보기나 실용 가이드를 살펴보세요." },
  { marker: "02", title: "세부 사항 확인", body: "오픈 여부, 자격 조건, 공식 출처를 확인하세요." },
  { marker: "03", title: "다음 단계로", body: "코스가 열리면 등록하거나, 가이드를 참고해 계획을 세우세요." },
];

const planned = [
  {
    name: "멘토 연결",
    purpose: "같은 길을 걸어본 선배에게 직접 묻기",
    body: "비자, 학업, 생활 고민을 경험자에게 물을 수 있도록 준비하고 있습니다.",
    href: "/mentors",
  },
  {
    name: "커뮤니티",
    purpose: "같은 상황의 유학생끼리 정보 나누기",
    body: "학교와 지역별로 질문하고 경험을 나누는 공간을 준비하고 있습니다.",
    href: "/community",
  },
];

const faqs = [
  {
    q: "지금 바로 수강 신청할 수 있나요?",
    a: "아직은 아니에요. 지금 보이는 코스는 샘플이며, 등록은 열려 있지 않습니다. 오픈 일정은 준비되는 대로 안내합니다.",
  },
  {
    q: "멘토와 커뮤니티는 언제 열리나요?",
    a: "학습 콘텐츠가 먼저이고, 멘토·커뮤니티는 그다음 단계로 준비 중입니다. 열리면 이 페이지에서 가장 먼저 알려드립니다.",
  },
  {
    q: "가이드 내용을 그대로 따라도 되나요?",
    a: "가이드는 이해를 돕기 위한 샘플입니다. 비자, 법률, 건강과 관련된 결정은 반드시 관련 공식 기관에서 확인하세요.",
  },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const href = (path: string) => `/${locale}${path}`;

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
    <div className="bg-surface dark:bg-night">
      <ScrollProgress />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-primary-500/10 blur-3xl dark:bg-primary-400/10"
          aria-hidden="true"
        />
        <div className={`${container} relative grid items-center gap-10 py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:py-20`}>
          <div className="flex flex-col">
            <span className={`${pill} lnk-hero-in self-start`} style={{ animationDelay: "0s" }}>
              한국 유학생과 외국인을 위해
            </span>
            <h1
              className="lnk-hero-in mb-5 mt-5 break-keep text-[2rem] font-bold leading-[1.22] text-ink dark:text-snow sm:text-[2.6rem] lg:text-[2.7rem] xl:text-[3.1rem]"
              style={{ animationDelay: "0.08s" }}
            >
              비자·일정은 로드맵으로,
              <br />
              사람은 멘토로,
              <br />
              공부는 강의로.
            </h1>
            <p
              className={`${lead} lnk-hero-in mb-8 max-w-[34rem] text-[17px]`}
              style={{ animationDelay: "0.16s" }}
            >
              한국 유학생을 위한 생활 비서. 만료일을 입력하면 로드맵이 만들어지고, 막히는 순간
              멘토와 강의로 연결됩니다.
            </p>

            <div className="lnk-hero-in mb-8 flex flex-wrap gap-3" style={{ animationDelay: "0.24s" }}>
              <Link
                href={href("/lectures")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700 dark:bg-primary-500 dark:text-night dark:hover:bg-primary-400"
              >
                코스 둘러보기
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href={href("/study-in-korea")}
                className="inline-flex h-12 items-center justify-center rounded-lg border border-hairline px-5 text-sm font-semibold text-ink transition hover:border-primary-500 dark:border-hairline-dark dark:bg-night-card dark:text-snow dark:hover:border-primary-400"
              >
                한국 생활 가이드
              </Link>
            </div>

            <div className="lnk-hero-in flex flex-col items-start gap-2 text-xs" style={{ animationDelay: "0.32s" }}>
              {[
                ["대상", "한국 유학생 · 재학생 · 외국인 거주자"],
                ["제공 기능", "로드맵 · AI 비서 · 멘토/커뮤니티(예정)"],
              ].map(([k, v]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-2 text-ink-muted dark:border-hairline-dark dark:text-snow-muted"
                >
                  <span className="font-bold text-ink dark:text-snow">{k}</span>
                  {v}
                </span>
              ))}
            </div>
          </div>

          <div className="lnk-hero-in" style={{ animationDelay: "0.2s" }}>
            <Parallax>
              <HeroIllustration className="h-auto w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.35)]" />
            </Parallax>
            <div className="mt-3 flex items-center justify-between text-xs text-ink-muted dark:text-snow-muted">
              <span>한국에서의 새로운 시작, 더 명확하게.</span>
              <span>SEOUL, KR</span>
            </div>
          </div>
        </div>
      </section>

      {/* Audience and value */}
      <section className="pb-14 lg:pb-20">
        <div className={`${container} grid gap-6 lg:grid-cols-2`}>
          {[
            {
              eyebrow: "이런 분께",
              title: "세 가지 대상, 하나의 실용적인 플랫폼.",
              body: "입국을 준비 중이든, 이미 한국에서 공부 중이든, 생활 기반을 다지는 중이든 — 다음에 뭘 해야 할지 바로 알 수 있도록 설계했습니다.",
              items: audience,
            },
            {
              eyebrow: "제공하는 것",
              title: "세 가지 축, 하나의 방향.",
              body: "LNK는 단순한 강의 사이트가 아닙니다. 학습하고, 일상을 탐색하고, 필요할 때 사람과 연결되도록 설계됐습니다.",
              items: value,
            },
          ].map((c, i) => (
            <Reveal key={c.eyebrow} delay={i * 120}>
              <div className={`${card} h-full p-6 sm:p-7`}>
                <p className="mb-3 text-xs font-bold text-teal dark:text-teal-dark">{c.eyebrow}</p>
                <h2 className="mb-3 text-2xl font-bold text-ink dark:text-snow">{c.title}</h2>
                <p className={`${lead} mb-5 text-sm`}>{c.body}</p>
                <ul className="space-y-3">
                  {c.items.map((it) => (
                    <li key={it} className="flex items-center gap-3 text-[15px] text-ink dark:text-snow">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500 dark:bg-primary-400" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Course discovery */}
      <section className="py-14 lg:py-16">
        <div className={container}>
          <Reveal>
            <p className={`${eyebrow} mb-3`}>LNK와 함께 배우기</p>
            <h2 className={`${h2} mb-3`}>다음 단계를 위한 코스 미리보기.</h2>
            <p className={`${lead} mb-8 max-w-3xl`}>
              지금 보이는 코스는 학습 방향을 보여주는 샘플입니다. 아직 실제 운영 중인 강의가 아니며
              등록은 열려 있지 않습니다.
            </p>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {courses.map((c, i) => (
              <Reveal key={c.title} delay={i * 110}>
                <Link
                  href={href("/lectures")}
                  className={`${card} group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-primary-500 dark:hover:border-primary-400`}
                >
                  <div className="h-[184px] overflow-hidden">
                    <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">{c.cover}</div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <span className={`${pill} self-start`}>샘플 코스 · 오픈 전</span>
                    <p className="text-xs font-semibold text-teal dark:text-teal-dark">{c.topic}</p>
                    <h3 className="text-[22px] font-semibold leading-snug text-ink dark:text-snow">{c.title}</h3>
                    <p className="text-sm leading-[1.55] text-ink-muted dark:text-snow-muted">{c.body}</p>
                    <div className="mt-auto border-t border-hairline pt-3 dark:border-hairline-dark">
                      <p className="mb-3 text-xs text-ink-muted dark:text-snow-muted">{c.meta}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal dark:text-teal-dark">
                        코스 미리보기
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8">
            <Link
              href={href("/lectures")}
              className="inline-flex h-12 items-center rounded-lg border border-hairline px-5 text-sm font-semibold text-ink transition hover:border-primary-500 dark:border-hairline-dark dark:bg-night-card dark:text-snow dark:hover:border-primary-400"
            >
              코스 미리보기 전체 보기
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Live data, only when there is something to show */}
      <HomeMonthlySpotlights locale={locale} topLectures={topLectures} topMentors={topMentors} />

      {/* Life guide categories */}
      <section className="bg-surface-card py-14 dark:bg-night-card lg:py-16">
        <div className={container}>
          <Reveal>
            <p className={`${eyebrow} mb-3`}>한국 생활</p>
            <h2 className={`${h2} mb-3`}>일상 질문에 대한 실용 가이드.</h2>
            <p className={`${lead} mb-8 max-w-3xl`}>
              이 가이드는 샘플 콘텐츠입니다. 최종 자료가 아니며, 중요한 결정은 항상 공식 출처로
              확인하세요.
            </p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map(({ Icon, title, body }, i) => (
              <Reveal key={title} delay={(i % 3) * 90}>
                <Link
                  href={href("/study-in-korea")}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-hairline bg-surface p-[22px] transition duration-300 hover:-translate-y-0.5 hover:border-primary-500 dark:border-hairline-dark dark:bg-night dark:hover:border-primary-400"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-night-pill dark:text-primary-400">
                    <Icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-ink dark:text-snow">{title}</span>
                    <span className="mt-1 block text-[13px] text-ink-muted dark:text-snow-muted">{body}</span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-teal transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-teal-dark" />
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className={pill}>샘플 안내 · 행동 전 반드시 확인</span>
              <p className="text-[13px] text-ink-muted dark:text-snow-muted">
                비자, 법률, 건강 관련 정보는 반드시 관련 공식 기관에서 확인하세요.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Getting started */}
      <section className="py-14 lg:py-16">
        <div className={`${container} grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16`}>
          <Reveal>
            <p className={`${eyebrow} mb-3`}>더 명확한 다음 단계</p>
            <h2 className="text-[28px] font-semibold leading-[1.2] text-ink dark:text-snow sm:text-[32px]">
              지금 있는 곳에서 시작하세요.
            </h2>
            <PathDivider className="mt-5 h-3 w-32" />
          </Reveal>
          <StepsTimeline steps={steps} />
        </div>
      </section>

      {/* Connections roadmap */}
      <section className="bg-surface-card py-14 dark:bg-night-card lg:py-16">
        <div className={container}>
          <Reveal>
            <p className={`${eyebrow} mb-3`}>신중하게 준비 중인 다음 단계</p>
            <h2 className={`${h2} mb-3`}>사람과의 연결도 계획에 있습니다.</h2>
            <p className={`${lead} mb-8 max-w-3xl`}>
              학습이 먼저입니다. 플랫폼이 성장하면서 사람 중심의 지원과 커뮤니티가 따라옵니다.
            </p>
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-2">
            {planned.map((p, i) => (
              <Reveal key={p.name} delay={i * 120}>
                <div className="relative h-full overflow-hidden rounded-2xl border border-hairline bg-surface p-8 dark:border-hairline-dark dark:bg-night">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary-500/10 blur-2xl" aria-hidden="true" />
                  <span className={pill}>출시 예정</span>
                  <h3 className="mb-3 mt-5 text-3xl font-semibold text-ink dark:text-snow">{p.name}</h3>
                  <p className="mb-3 text-lg font-medium text-ink dark:text-snow">{p.purpose}</p>
                  <p className={`${lead} mb-6 text-[15px]`}>{p.body}</p>
                  <Link
                    href={href(p.href)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-teal dark:text-teal-dark"
                  >
                    계획 보기
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Service principles */}
      <section className="py-14 lg:py-16">
        <div className={`${container} grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-12`}>
          <Reveal>
            <h2 className="text-3xl font-semibold leading-[1.2] text-ink dark:text-snow sm:text-4xl">
              LNK가 지키려는 원칙.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="space-y-3 text-base leading-[1.6] text-ink-muted dark:text-snow-muted">
              <p>확인되지 않은 정보를 사실처럼 말하지 않습니다.</p>
              <p>비자·법률·건강은 항상 공식 출처 확인을 먼저 안내합니다.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Common questions */}
      <section className="pb-14 lg:pb-16">
        <div className={container}>
          <Reveal>
            <p className={`${eyebrow} mb-3`}>시작하기 전에</p>
            <h2 className={`${h2} mb-8`}>자주 묻는 질문.</h2>
          </Reveal>
          <Reveal delay={80}>
            <FaqList items={faqs} />
          </Reveal>
        </div>
      </section>

      {/* Final invitation */}
      <section className="pb-16 lg:pb-24">
        <div className={container}>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-hairline bg-primary-50 px-6 py-10 dark:border-hairline-dark dark:bg-night-card sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
              <div
                className="pointer-events-none absolute -left-20 -bottom-24 h-64 w-64 rounded-full bg-primary-500/15 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative">
                <h2 className="mb-2 text-3xl font-semibold text-ink dark:text-snow sm:text-4xl">
                  한국에서의 시작을 더 명확하게.
                </h2>
                <p className={`${lead} text-lg`}>코스 미리보기와 생활 가이드로 오늘 첫걸음을 시작해 보세요.</p>
              </div>
              <Link
                href={href("/lectures")}
                className="relative mt-6 inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700 dark:bg-primary-500 dark:text-night dark:hover:bg-primary-400 lg:mt-0"
              >
                코스 둘러보기
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
