import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, BadgeCheck } from "lucide-react";
import type { Mentor } from "@/types";
import { queryMentorsSupabase } from "@/lib/supabase/public-queries";
import { CHECKLIST } from "@/lib/admission/content";
import { CURRENT_VISAS, EMPTY_FACTS } from "@/lib/visa/types";
import { buildVisaPlan } from "@/lib/visa/plan";
import { describeStep } from "@/lib/visa/content";
import StayHero from "@/components/home/StayHero";
import ServiceLink from "@/components/home/ServiceLink";
import KoreanSample from "@/components/home/KoreanSample";
import "@fontsource-variable/jetbrains-mono";
import "./home.css";

export const revalidate = 3600;

/**
 * 홈 — "체류 문서" 디자인 (PRODUCT.md, .impeccable/surfaces/app-locale-page-tsx.md)
 * 실제로 있는 것만 보여줌: 로드맵 규칙, 한국어 문제, 입시 서류, 검증된 실제 멘토.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "homeV3" });
  const tri = (v: { kr: string; en: string; mn: string }) => (locale === "en" ? v.en : locale === "mn" ? v.mn : v.kr);

  // 실제 사람만: 검증되고 사진이 있는 멘토
  let experts: Mentor[] = [];
  try {
    const { mentors } = await queryMentorsSupabase({ limit: 30 });
    experts = mentors.filter((m) => m.verified && m.photo).slice(0, 1);
  } catch {
    experts = [];
  }
  const expert = experts[0] ?? null;

  const docs = CHECKLIST.slice(0, 4);
  const visaPoints = t.raw("visaPoints") as string[];
  // 예시 경로 D-2 → E-7 의 실제 단계 (규칙 엔진 그대로)
  const sample = buildVisaPlan({ from: "D-2", to: "E-7", expiry: null, facts: EMPTY_FACTS });
  const sampleSteps = (sample?.steps ?? []).map((st) => describeStep(locale, st.key)?.title ?? st.key);
  const sourcePoints = t.raw("sourcePoints") as string[];

  return (
    <div className="lnk-home">
      <StayHero />

      {/* 세 가지 서비스 */}
      <section className="lnk-section">
        <div className="lnk-wrap">
          <h2 className="lnk-h2">{t("servicesTitle")}</h2>
          <p className="lnk-lead">{t("servicesLead")}</p>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {/* 비자 로드맵: 핵심, 한 줄 전체 */}
            <article className="lnk-slip lnk-slip-main lg:col-span-2 lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-10">
              <div className="flex flex-col gap-3">
                <h3 className="lnk-h3 text-[26px] sm:text-[30px]">{t("visaTitle")}</h3>
                <p className="lnk-body max-w-[46ch]">{t("visaBody")}</p>
                <ul className="my-4 flex flex-col divide-y divide-[var(--doc-rule)] border-y border-[var(--doc-rule)]">
                  {visaPoints.map((p) => (
                    <li key={p} className="break-keep py-3 text-[15px] leading-[1.5] text-[var(--doc-ink)]">
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <ServiceLink path="/my/dashboard" guestPath="/signup" label={t("visaCta")} />
                  <span className="text-sm text-[var(--doc-soft)]">{t("freeWithSignup")}</span>
                </div>
              </div>
              <div className="mt-6 lg:mt-0">
                <p className="text-[13px] font-semibold text-[var(--doc-soft)]">{t("visaSample")}</p>
                <ol className="mt-3 flex flex-col border-t border-[var(--doc-rule)]">
                  {sampleSteps.map((title, i) => (
                    <li key={title} className="flex items-baseline gap-3 border-b border-[var(--doc-rule)] py-3">
                      <span className="lnk-mono text-[13px] font-bold text-[var(--doc-teal)]">{i + 1}</span>
                      <span className="break-keep text-[16px] font-semibold text-[var(--doc-ink)]">{title}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-3 break-keep text-[13px] leading-[1.5] text-[var(--doc-soft)]">{t("visaSampleNote")}</p>
              </div>
            </article>

            {/* 한국어 연습 */}
            <article className="lnk-slip">
              <h3 className="lnk-h3">{t("koreanTitle")}</h3>
              <KoreanSample />
              <p className="lnk-body">{t("koreanBody")}</p>
              <div className="mt-auto">
                <ServiceLink path="/my/korean" label={t("koreanCta")} variant="quiet" />
              </div>
            </article>

            {/* 대학 입시 */}
            <article className="lnk-slip">
              <h3 className="lnk-h3">{t("admissionTitle")}</h3>
              <div className="border-y border-[var(--doc-rule)] py-4">
                <p className="text-[13px] font-semibold text-[var(--doc-soft)]">{t("admissionSample")}</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {docs.map((d) => (
                    <li key={d.id} className="flex items-start gap-2.5 break-keep text-[15px] leading-[1.45] text-[var(--doc-ink)]">
                      <span aria-hidden="true" className="mt-[9px] h-[2px] w-3 shrink-0 bg-[var(--doc-teal)]" />
                      {tri(d.label)}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="lnk-body">{t("admissionBody", { n: String(CHECKLIST.length) })}</p>
              <div className="mt-auto">
                <ServiceLink path="/my/admission" label={t("admissionCta")} variant="quiet" />
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 근거 */}
      <section className="lnk-section lnk-paper border-y border-[var(--doc-rule)]">
        <div className="lnk-wrap grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <h2 className="lnk-h2">{t("sourceTitle")}</h2>
            <p className="lnk-lead">{t("sourceLead")}</p>
            <ul className="mt-6 flex flex-col gap-3">
              {sourcePoints.map((p) => (
                <li key={p} className="flex gap-3 text-[16px] leading-[1.55] text-[var(--doc-ink)]">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--doc-teal)]" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <figure className="lg:col-span-7">
            <div className="rounded-[12px] border border-[var(--doc-rule)] bg-[var(--doc-sheet)] p-6 sm:p-8">
              <p className="lnk-mono text-[12px] uppercase tracking-[0.14em] text-[var(--doc-soft)]">{t("excerptSource")}</p>
              <p className="mt-4 text-[15px] font-bold text-[var(--doc-ink)]" lang="ko">
                영 주(F-5) · 해당자 1.
              </p>
              <blockquote className="mt-2 break-keep text-[17px] leading-[1.7] text-[var(--doc-ink)]" lang="ko">
                대한민국 「민법」에 따른 성년으로서 … 주재(D-7)부터 20.{" "}
                <mark className="lnk-mark">특정활동(E-7)까지의 체류자격이나</mark> … 24.{" "}
                <mark className="lnk-mark">거주(F-2) 체류자격으로 5년 이상</mark> 대한민국에 체류하고 있는 사람
              </blockquote>
              {locale !== "kr" ? <p className="mt-3 break-keep text-[15px] leading-[1.6] text-[var(--doc-soft)]">{t("excerptGloss")}</p> : null}
              <figcaption className="mt-5 border-t border-[var(--doc-rule)] pt-4 text-[14px] leading-[1.55] text-[var(--doc-soft)]">
                {t("excerptNote")}
              </figcaption>
            </div>
          </figure>
        </div>
      </section>

      {/* 실제 사람 */}
      {expert ? (
        <section className="lnk-section">
          <div className="lnk-wrap grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5 lg:order-2">
              <h2 className="lnk-h2">{t("humanTitle")}</h2>
              <p className="lnk-lead">{t("humanLead")}</p>
            </div>
            <article className="lnk-slip lnk-slip-row lg:col-span-7 lg:order-1">
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-[8px] border border-[var(--doc-rule)] sm:h-36 sm:w-32">
                <Image src={expert.photo!} alt={expert.name} fill sizes="128px" className="object-cover" />
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <p className="flex items-center gap-1.5 text-[20px] font-bold text-[var(--doc-ink)]">
                  {expert.name}
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--doc-teal)]">
                    <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                    {t("verified")}
                  </span>
                </p>
                <p className="break-keep text-[15px] text-[var(--doc-soft)]">{expert.title}</p>
                <Link href={`/${locale}/mentors/${expert.id}`} className="lnk-link mt-1 inline-flex items-center gap-1.5 text-[15px] font-semibold">
                  {t("humanCta")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {/* 마무리: 지금 비자로 바로 시작 */}
      <section className="lnk-close">
        <div className="lnk-wrap flex flex-col gap-8">
          <h2 className="break-keep text-[30px] font-extrabold leading-[1.15] tracking-[-0.03em] sm:text-[44px]">{t("closeTitle")}</h2>
          <div className="flex flex-col gap-3">
            <p className="text-[15px] text-[var(--close-soft)]">{t("closePick")}</p>
            <ul className="flex flex-wrap gap-2.5">
              {CURRENT_VISAS.map((v) => (
                <li key={v}>
                  <Link href={`/${locale}/signup?visa=${encodeURIComponent(v)}`} className="lnk-visa-chip lnk-mono">
                    {v}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p className="flex flex-wrap gap-x-5 gap-y-2 text-[15px] text-[var(--close-soft)]">
            {[
              ["kr", "한국어"],
              ["en", "English"],
              ["mn", "Монгол хэл"],
            ].map(([code, name]) => (
              <Link key={code} href={`/${code}`} lang={code === "kr" ? "ko" : code} className="lnk-lang" aria-current={code === locale ? "true" : undefined}>
                {name}
              </Link>
            ))}
          </p>
        </div>
      </section>
    </div>
  );
}
