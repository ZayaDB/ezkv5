"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Check, ExternalLink, GraduationCap, Users } from "lucide-react";
import { Notice, PageIntro, SectionHeader, ui } from "@/components/lnk/ui";
import { useAuth } from "@/lib/contexts/AuthContext";
import type { Tri } from "@/lib/korean/questions";
import { CHECKLIST, ELIGIBILITY, JINHAK_URL, SCHOLARSHIPS, TIMELINE, UWAY_STEPS, UWAY_URL } from "@/lib/admission/content";

const tri = (v: Tri, locale: string) => (locale === "en" ? v.en : locale === "mn" ? v.mn : v.kr);
const storeKey = (uid: string) => `lnk-admission-checklist:${uid}`;

export default function AdmissionGuide() {
  const t = useTranslations("admission");
  const locale = useLocale();
  const { user } = useAuth();
  const uid = user?.id ?? "guest";
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storeKey(uid));
      setDone(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setDone([]);
    }
  }, [uid]);

  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    setDone(next);
    try {
      localStorage.setItem(storeKey(uid), JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const doneCount = CHECKLIST.filter((c) => done.includes(c.id)).length;

  return (
    <div className="flex flex-col gap-10">
      <PageIntro
        size="md"
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <a href={UWAY_URL} target="_blank" rel="noopener noreferrer" className={ui.btnPrimary}>
            {t("openUway")}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        }
      />
      <Notice tone="caution">{t("notice")}</Notice>

      {/* 일정 */}
      <section className="flex flex-col gap-4">
        <SectionHeader title={t("timelineTitle")} description={t("timelineBody")} />
        <ol className={`${ui.card} flex flex-col divide-y divide-hairline dark:divide-hairline-dark`}>
          {TIMELINE.map((row, i) => (
            <li key={i} className="flex flex-col gap-1 p-5 sm:flex-row sm:gap-6">
              <span className="w-full shrink-0 text-sm font-bold text-teal dark:text-teal-dark sm:w-56">{tri(row.when, locale)}</span>
              <span className="text-sm leading-[1.6] text-ink dark:text-snow">{tri(row.what, locale)}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 지원 자격 */}
      <section className="flex flex-col gap-4">
        <SectionHeader title={t("eligibilityTitle")} />
        <ul className={`${ui.card} flex flex-col gap-3 p-5 sm:p-6`}>
          {ELIGIBILITY.map((e, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-[1.6] text-ink dark:text-snow">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal dark:text-teal-dark" aria-hidden="true" />
              {tri(e, locale)}
            </li>
          ))}
        </ul>
      </section>

      {/* 서류 체크리스트 */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          title={t("checklistTitle")}
          description={t("checklistBody", { done: String(doneCount), total: String(CHECKLIST.length) })}
        />
        <div className={`${ui.card} flex flex-col gap-1 p-3 sm:p-4`}>
          <div className="mx-2 mb-2 h-2 overflow-hidden rounded-full bg-surface dark:bg-night">
            <div
              className="h-full rounded-full bg-teal transition-all dark:bg-teal-dark"
              style={{ width: `${(doneCount / CHECKLIST.length) * 100}%` }}
            />
          </div>
          {CHECKLIST.map((c) => {
            const on = done.includes(c.id);
            return (
              <label key={c.id} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-surface dark:hover:bg-night">
                <input type="checkbox" checked={on} onChange={() => toggle(c.id)} className="mt-1 h-4 w-4 accent-teal" />
                <span className="flex flex-col gap-0.5">
                  <span className={`text-sm font-semibold ${on ? `${ui.muted} line-through` : "text-ink dark:text-snow"}`}>{tri(c.label, locale)}</span>
                  {c.note ? <span className={`text-xs ${ui.muted}`}>{tri(c.note, locale)}</span> : null}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {/* 유웨이 지원 순서 */}
      <section className="flex flex-col gap-4">
        <SectionHeader title={t("uwayTitle")} description={t("uwayBody")} />
        <ol className="grid gap-3 md:grid-cols-2">
          {UWAY_STEPS.map((s, i) => (
            <li key={i} className={`${ui.card} flex gap-4 p-5`}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-white dark:bg-teal-dark dark:text-night">
                {i + 1}
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-ink dark:text-snow">{tri(s.title, locale)}</p>
                <p className={`text-sm leading-[1.6] ${ui.muted}`}>{tri(s.body, locale)}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2">
          <a href={UWAY_URL} target="_blank" rel="noopener noreferrer" className={ui.btnOutline}>
            UwayApply
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href={JINHAK_URL} target="_blank" rel="noopener noreferrer" className={ui.btnOutline}>
            JinhakApply
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* 장학금 */}
      <section className="flex flex-col gap-4">
        <SectionHeader title={t("scholarTitle")} />
        <div className="grid gap-3 md:grid-cols-3">
          {SCHOLARSHIPS.map((s, i) => (
            <div key={i} className={`${ui.card} flex flex-col gap-2 p-5`}>
              <GraduationCap className="h-6 w-6 text-teal dark:text-teal-dark" aria-hidden="true" />
              <p className="font-semibold text-ink dark:text-snow">{tri(s.title, locale)}</p>
              <p className={`text-sm leading-[1.6] ${ui.muted}`}>{tri(s.body, locale)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 멘토 도움 */}
      <section className={`${ui.card} flex flex-col items-start gap-3 border-2 border-teal p-6 dark:border-teal-dark sm:p-8`}>
        <Users className="h-8 w-8 text-teal dark:text-teal-dark" aria-hidden="true" />
        <h2 className={ui.h2}>{t("mentorTitle")}</h2>
        <p className={ui.lead}>{t("mentorBody")}</p>
        <div className="flex flex-wrap gap-2">
          <Link href={`/${locale}/mentors?category=academic`} className={ui.btnPrimary}>
            {t("mentorCta")}
          </Link>
          <Link href={`/${locale}/my/korean`} className={ui.btnOutline}>
            {t("koreanCta")}
          </Link>
        </div>
      </section>
    </div>
  );
}
