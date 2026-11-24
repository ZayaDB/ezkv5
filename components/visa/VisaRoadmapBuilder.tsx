"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";
import { Notice, ui } from "@/components/lnk/ui";
import { DueLabel, StepBody } from "@/components/visa/VisaSteps";
import { useAuth } from "@/lib/contexts/AuthContext";
import { normalizeVisa } from "@/lib/visa/normalize";
import { describeStep, visaContent, VISA_SOURCE_DATE } from "@/lib/visa/content";
import { buildVisaPlan, computeF27Points } from "@/lib/visa/plan";
import {
  CURRENT_VISAS,
  DEGREE_LEVELS,
  EMPTY_FACTS,
  TARGET_VISAS,
  visaSlug,
  type VisaCode,
  type VisaFacts,
} from "@/lib/visa/types";

const label = "flex flex-col gap-1.5 text-sm font-semibold text-ink dark:text-snow";
const check = "flex items-center gap-2 text-sm text-ink dark:text-snow";

/** 대시보드 안에서 쓰는 비자 로드맵 만들기 (가입 때 넣은 비자·만료일을 먼저 채움) */
export default function VisaRoadmapBuilder({ onSaved, onCancel }: { onSaved: () => void; onCancel?: () => void }) {
  const locale = useLocale();
  const t = useTranslations("visa");
  const { user } = useAuth();
  const content = visaContent(locale);

  const [from, setFrom] = useState<VisaCode>("D-2");
  const [to, setTo] = useState<VisaCode>("E-7");
  const [expiry, setExpiry] = useState("");
  const [facts, setFacts] = useState<VisaFacts>(EMPTY_FACTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // 프로필에 저장된 지금 비자·만료일, 주소의 ?to= 로 처음 값 채우기
  useEffect(() => {
    const visa = normalizeVisa(user?.visaType);
    if (visa) setFrom(visa);
    if (user?.visaExpireDate) setExpiry(String(user.visaExpireDate).slice(0, 10));
  }, [user?.visaType, user?.visaExpireDate]);

  const set = <K extends keyof VisaFacts>(k: K, v: VisaFacts[K]) => {
    setSaved(false);
    setFacts((f) => ({ ...f, [k]: v }));
  };

  const plan = useMemo(
    () => (from === to ? null : buildVisaPlan({ from, to, expiry: expiry || null, facts })),
    [from, to, expiry, facts]
  );
  const points = useMemo(() => computeF27Points(facts), [facts]);

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/visa/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, expiry: expiry || null, facts, locale }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      window.dispatchEvent(new Event("roadmap-updated"));
      onSaved();
    } catch {
      setError(t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  const visaOption = (code: VisaCode) => (
    <option key={code} value={code}>
      {code} · {content.guides[code].name}
    </option>
  );

  return (
    <div className="flex flex-col gap-5">
      <Notice tone="caution">{t("sourceNote", { date: VISA_SOURCE_DATE })}</Notice>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* 입력 */}
        <section className={`${ui.card} flex flex-col gap-5 p-5 sm:p-6`}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <label className={label}>
              {t("formCurrent")}
              <select className={ui.input} value={from} onChange={(e) => { setSaved(false); setFrom(e.target.value as VisaCode); }}>
                {CURRENT_VISAS.map(visaOption)}
              </select>
            </label>
            <label className={label}>
              {t("formExpiry")}
              <input type="date" className={ui.input} value={expiry} onChange={(e) => { setSaved(false); setExpiry(e.target.value); }} />
            </label>
          </div>
          <label className={label}>
            {t("formTarget")}
            <select className={ui.input} value={to} onChange={(e) => { setSaved(false); setTo(e.target.value as VisaCode); }}>
              {TARGET_VISAS.map(visaOption)}
            </select>
          </label>

          <div className="border-t border-hairline pt-4 dark:border-hairline-dark">
            <p className="text-sm font-bold text-ink dark:text-snow">{t("aboutYou")}</p>
            <p className={`mt-0.5 text-xs ${ui.muted}`}>{t("aboutYouHint")}</p>
          </div>

          <label className={label}>
            {t("degree")}
            <select className={ui.input} value={facts.degree} onChange={(e) => set("degree", e.target.value as VisaFacts["degree"])}>
              {DEGREE_LEVELS.map((d) => (
                <option key={d} value={d}>
                  {t(`degree_${d}`)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-2">
            <label className={check}>
              <input type="checkbox" checked={facts.domesticDegree} onChange={(e) => set("domesticDegree", e.target.checked)} />
              {t("domesticDegree")}
            </label>
            <label className={check}>
              <input type="checkbox" checked={facts.stem} onChange={(e) => set("stem", e.target.checked)} />
              {t("stem")}
            </label>
          </div>
          <label className={label}>
            {t("gradDate")}
            <input type="date" className={ui.input} value={facts.gradDate ?? ""} onChange={(e) => set("gradDate", e.target.value || null)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <label className={label}>
              {t("topik")}
              <select className={ui.input} value={facts.topik} onChange={(e) => set("topik", Number(e.target.value))}>
                {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n === 0 ? t("none") : t("level", { n: String(n) })}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              {t("kiip")}
              <select className={ui.input} value={facts.kiip} onChange={(e) => set("kiip", Number(e.target.value))}>
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n === 0 ? t("none") : t("stage", { n: String(n) })}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className={check}>
            <input type="checkbox" checked={facts.jobOffer} onChange={(e) => set("jobOffer", e.target.checked)} />
            {t("jobOffer")}
          </label>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <label className={label}>
              {t("income")}
              <input
                type="number"
                inputMode="numeric"
                min={0}
                className={ui.input}
                placeholder={t("incomeHint")}
                value={facts.income ?? ""}
                onChange={(e) => set("income", e.target.value === "" ? null : Math.max(0, Number(e.target.value)))}
              />
            </label>
            <label className={label}>
              {t("birthYear")}
              <input
                type="number"
                inputMode="numeric"
                min={1940}
                className={ui.input}
                placeholder={t("birthYearHint")}
                value={facts.birthYear ?? ""}
                onChange={(e) => set("birthYear", e.target.value === "" ? null : Number(e.target.value))}
              />
            </label>
          </div>
        </section>

        {/* 결과 */}
        <section className={`${ui.card} flex flex-col gap-5 p-5 sm:p-6`}>
          <h2 className={ui.h2}>{t("preview")}</h2>
          {from === to ? (
            <p className={`text-sm ${ui.muted}`}>{t("sameVisa")}</p>
          ) : !plan ? (
            <p className={`text-sm ${ui.muted}`}>{t("noRoute")}</p>
          ) : (
            <>
              <div>
                <p className={`mb-2 text-xs font-bold ${ui.muted}`}>{t("route")}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {plan.route.map((code, i) => (
                    <span key={code} className="flex items-center gap-2">
                      <Link href={`/${locale}/my/visa/${visaSlug(code)}`} className={ui.pillTeal}>
                        {code}
                      </Link>
                      {i < plan.route.length - 1 ? <ArrowRight className="h-4 w-4 text-ink-muted" aria-hidden="true" /> : null}
                    </span>
                  ))}
                </div>
                {!expiry ? <p className={`mt-2 text-xs ${ui.muted}`}>{t("noExpiry")}</p> : null}
              </div>

              {plan.points ? (
                <div className="rounded-lg bg-surface p-4 dark:bg-night">
                  <p className="text-sm font-bold text-ink dark:text-snow">
                    {t("points")}: {points.total}
                  </p>
                  <p className={`mt-1 text-xs ${ui.muted}`}>
                    {t("pointsDetail", {
                      age: points.age == null ? "?" : String(points.age),
                      degree: String(points.degree),
                      korean: String(points.korean),
                      income: points.income == null ? "?" : String(points.income),
                      bonus: String(points.bonus),
                    })}
                  </p>
                  <p className={`mt-1 text-xs ${ui.muted}`}>{t("pointsNote")}</p>
                </div>
              ) : null}

              <ol className="flex flex-col gap-4">
                {plan.steps.map((s, i) => {
                  const d = describeStep(locale, s.key);
                  const conds = s.kind === "check" ? plan.conditions.find((c) => c.hop === s.hop)?.results : undefined;
                  return (
                    <li key={s.key} className="flex gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-teal text-xs font-bold text-teal dark:border-teal-dark dark:text-teal-dark">
                        {i + 1}
                      </span>
                      <details className="min-w-0 flex-1" open={i === 0}>
                        <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                          <span className="font-semibold text-ink dark:text-snow">{d?.title ?? s.key}</span>
                          <DueLabel date={s.dueDate} />
                        </summary>
                        <div className="mt-2">
                          <StepBody stepKey={s.key} conds={conds} />
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ol>

              <div className="flex flex-col gap-3 border-t border-hairline pt-4 dark:border-hairline-dark">
                <p className={`text-xs ${ui.muted}`}>{t("replaceNote")}</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={ui.btnPrimary} disabled={saving} onClick={save}>
                    {saved ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
                    {saving ? t("saving") : t("save")}
                  </button>
                  {onCancel ? (
                    <button type="button" className={ui.btnOutline} onClick={onCancel}>
                      {t("cancel")}
                    </button>
                  ) : null}
                </div>
                {error ? <p className="text-sm text-rose-600">{error}</p> : null}
              </div>
            </>
          )}
        </section>
      </div>

    </div>
  );
}

