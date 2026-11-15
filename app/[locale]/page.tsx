import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
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

const guideIcons = [Plane, GraduationCap, Home, HeartPulse, TrainFront, Briefcase];
const covers = [CampusCover, KoreanCover, SettleCover];
const plannedHrefs = ["/mentors", "/community"];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const href = (path: string) => `/${locale}${path}`;
  const t = await getTranslations({ locale, namespace: "homeV2" });
  const raw = <T,>(key: string) => t.raw(key) as T;
  const heroTitle = raw<string[]>("heroTitle");
  const courses = raw<{ topic: string; title: string; body: string; meta: string }[]>("courses");
  const guides = raw<{ title: string; body: string }[]>("guides");
  const stepTexts = raw<{ title: string; body: string }[]>("steps");
  const steps = stepTexts.map((x, i) => ({ marker: String(i + 1).padStart(2, "0"), ...x }));
  const planned = raw<{ name: string; purpose: string; body: string }[]>("planned");
  const principles = raw<string[]>("principles");
  const faqs = raw<{ q: string; a: string }[]>("faqs");

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
              {t("heroPill")}
            </span>
            <h1
              className="lnk-hero-in mb-5 mt-5 break-keep text-[2rem] font-bold leading-[1.22] text-ink dark:text-snow sm:text-[2.6rem] lg:text-[2.7rem] xl:text-[3.1rem]"
              style={{ animationDelay: "0.08s" }}
            >
              {heroTitle.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p
              className={`${lead} lnk-hero-in mb-8 max-w-[34rem] text-[17px]`}
              style={{ animationDelay: "0.16s" }}
            >
              {t("heroBody")}
            </p>

            <div className="lnk-hero-in mb-8 flex flex-wrap gap-3" style={{ animationDelay: "0.24s" }}>
              <Link
                href={href("/lectures")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700 dark:bg-primary-500 dark:text-night dark:hover:bg-primary-400"
              >
                {t("ctaCourses")}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href={href("/study-in-korea")}
                className="inline-flex h-12 items-center justify-center rounded-lg border border-hairline px-5 text-sm font-semibold text-ink transition hover:border-primary-500 dark:border-hairline-dark dark:bg-night-card dark:text-snow dark:hover:border-primary-400"
              >
                {t("ctaGuide")}
              </Link>
            </div>

            <div className="lnk-hero-in flex flex-col items-start gap-2 text-xs" style={{ animationDelay: "0.32s" }}>
              {[
                [t("metaTargetLabel"), t("metaTarget")],
                [t("metaFeaturesLabel"), t("metaFeatures")],
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
              <HeroIllustration label={t("heroAlt")} className="h-auto w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.35)]" />
            </Parallax>
            <div className="mt-3 flex items-center justify-between text-xs text-ink-muted dark:text-snow-muted">
              <span>{t("heroCaption")}</span>
              <span>SEOUL, KR</span>
            </div>
          </div>
        </div>
      </section>

      {/* Course discovery */}
      <section className="py-14 lg:py-16">
        <div className={container}>
          <Reveal>
            <p className={`${eyebrow} mb-3`}>{t("coursesEyebrow")}</p>
            <h2 className={`${h2} mb-3`}>{t("coursesTitle")}</h2>
            <p className={`${lead} mb-8 max-w-3xl`}>{t("coursesBody")}</p>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {courses.map((c, i) => (
              <Reveal key={c.title} delay={i * 110}>
                <Link
                  href={href("/lectures")}
                  className={`${card} group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-primary-500 dark:hover:border-primary-400`}
                >
                  <div className="h-[184px] overflow-hidden">
                    <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">{(() => {
                      const Cover = covers[i];
                      return <Cover className="h-full w-full" />;
                    })()}</div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <span className={`${pill} self-start`}>{t("sampleBadge")}</span>
                    <p className="text-xs font-semibold text-teal dark:text-teal-dark">{c.topic}</p>
                    <h3 className="text-[22px] font-semibold leading-snug text-ink dark:text-snow">{c.title}</h3>
                    <p className="text-sm leading-[1.55] text-ink-muted dark:text-snow-muted">{c.body}</p>
                    <div className="mt-auto border-t border-hairline pt-3 dark:border-hairline-dark">
                      <p className="mb-3 text-xs text-ink-muted dark:text-snow-muted">{c.meta}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal dark:text-teal-dark">
                        {t("coursePreview")}
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
              {t("coursesAll")}
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
            <p className={`${eyebrow} mb-3`}>{t("guideEyebrow")}</p>
            <h2 className={`${h2} mb-3`}>{t("guideTitle")}</h2>
            <p className={`${lead} mb-8 max-w-3xl`}>{t("guideBody")}</p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map(({ title, body }, i) => {
              const Icon = guideIcons[i];
              return (
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
              );
            })}
          </div>
          <Reveal className="mt-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className={pill}>{t("guideBadge")}</span>
              <p className="text-[13px] text-ink-muted dark:text-snow-muted">{t("guideNote")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Getting started */}
      <section className="py-14 lg:py-16">
        <div className={`${container} grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16`}>
          <Reveal>
            <p className={`${eyebrow} mb-3`}>{t("stepsEyebrow")}</p>
            <h2 className="text-[28px] font-semibold leading-[1.2] text-ink dark:text-snow sm:text-[32px]">
              {t("stepsTitle")}
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
            <p className={`${eyebrow} mb-3`}>{t("plannedEyebrow")}</p>
            <h2 className={`${h2} mb-3`}>{t("plannedTitle")}</h2>
            <p className={`${lead} mb-8 max-w-3xl`}>{t("plannedBody")}</p>
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-2">
            {planned.map((p, i) => (
              <Reveal key={p.name} delay={i * 120}>
                <div className="relative h-full overflow-hidden rounded-2xl border border-hairline bg-surface p-8 dark:border-hairline-dark dark:bg-night">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary-500/10 blur-2xl" aria-hidden="true" />
                  <span className={pill}>{t("comingSoon")}</span>
                  <h3 className="mb-3 mt-5 text-3xl font-semibold text-ink dark:text-snow">{p.name}</h3>
                  <p className="mb-3 text-lg font-medium text-ink dark:text-snow">{p.purpose}</p>
                  <p className={`${lead} mb-6 text-[15px]`}>{p.body}</p>
                  <Link
                    href={href(plannedHrefs[i])}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-teal dark:text-teal-dark"
                  >
                    {t("viewPlan")}
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
              {t("principlesTitle")}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="space-y-3 text-base leading-[1.6] text-ink-muted dark:text-snow-muted">
              {principles.map((x) => (
                <p key={x}>{x}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Common questions */}
      <section className="pb-14 lg:pb-16">
        <div className={container}>
          <Reveal>
            <p className={`${eyebrow} mb-3`}>{t("faqEyebrow")}</p>
            <h2 className={`${h2} mb-8`}>{t("faqTitle")}</h2>
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
                  {t("finalTitle")}
                </h2>
                <p className={`${lead} text-lg`}>{t("finalBody")}</p>
              </div>
              <Link
                href={href("/lectures")}
                className="relative mt-6 inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700 dark:bg-primary-500 dark:text-night dark:hover:bg-primary-400 lg:mt-0"
              >
                {t("ctaCourses")}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
