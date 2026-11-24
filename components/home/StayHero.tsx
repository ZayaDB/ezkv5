"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { describeStep, visaContent } from "@/lib/visa/content";
import { buildVisaPlan, findRoute } from "@/lib/visa/plan";
import { CURRENT_VISAS, EMPTY_FACTS, TARGET_VISAS, type VisaCode } from "@/lib/visa/types";

/** 오늘 날짜 (사용자 시간대 기준, YYYY-MM-DD) */
function localToday() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function addMonths(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1 + n, Math.min(d, 28));
  const p = (x: number) => String(x).padStart(2, "0");
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}
function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(`${b}T00:00:00`) - Date.parse(`${a}T00:00:00`)) / 86400000);
}

const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** 서버·브라우저가 같은 결과를 내도록 직접 형식화 (Intl 차이로 생기는 오류 방지) */
function fmt(iso: string | null, locale: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (locale === "en") return `${d} ${EN_MONTHS[m - 1]} ${y}`;
  if (locale === "mn") return `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")}`;
  return `${y}. ${m}. ${d}.`;
}

const NEXT: Partial<Record<VisaCode, VisaCode>> = {
  "D-4": "D-2",
  "D-2": "F-5-16",
  "D-10": "F-5-16",
  "E-7": "F-5-16",
  "F-2-7": "F-5-16",
  "F-2": "F-5-1",
};

/** 문서 칸: 보이는 글자(코드 + 이름)는 직접 그리고, 실제 선택은 투명한 기본 select가 받음 */
function DocSelect({
  label,
  value,
  options,
  names,
  onChange,
}: {
  label: string;
  value: VisaCode;
  options: VisaCode[];
  names: Record<string, { name: string }>;
  onChange: (v: VisaCode) => void;
}) {
  return (
    <label className="lnk-field lnk-field-pick">
      <span className="lnk-field-label">{label}</span>
      <span className="lnk-field-value" aria-hidden="true">
        <span className="lnk-mono text-[18px] font-bold leading-none">{value}</span>
        <span className="lnk-caret" />
      </span>
      <span className="lnk-field-name" aria-hidden="true">
        {names[value].name}
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value as VisaCode)} className="lnk-field-native" aria-label={label}>
        {options.map((v) => (
          <option key={v} value={v}>
            {v} · {names[v].name}
          </option>
        ))}
      </select>
    </label>
  );
}

/** 홈 첫 화면: 문구 + "체류 노트" (실제 로드맵 규칙으로 계산) */
export default function StayHero() {
  const t = useTranslations("homeV3");
  const locale = useLocale();
  const { user } = useAuth();
  const guides = visaContent(locale).guides;

  const [from, setFrom] = useState<VisaCode>("D-2");
  const [to, setTo] = useState<VisaCode>("F-5-16");
  // 날짜는 브라우저에서 정함 (서버와 사용자 시간대가 달라도 화면이 어긋나지 않게)
  const [today, setToday] = useState<string | null>(null);
  const [expiry, setExpiry] = useState<string | null>(null);
  useEffect(() => {
    const now = localToday();
    setToday(now);
    setExpiry((e) => e ?? addMonths(now, 9));
  }, []);

  const targets = useMemo(
    () => TARGET_VISAS.filter((v) => v !== from && findRoute(from, v, EMPTY_FACTS)),
    [from]
  );
  const target = targets.includes(to) ? to : NEXT[from] ?? targets[0];
  const plan = useMemo(
    () => (target ? buildVisaPlan({ from, to: target, expiry, facts: EMPTY_FACTS }) : null),
    [from, target, expiry]
  );
  const first = plan?.steps[0] ?? null;
  const firstCopy = first ? describeStep(locale, first.key) : null;
  const route = plan?.route ?? [from];
  const stampKey = route.join(">") + (expiry ?? "");

  const left = today && expiry ? daysBetween(today, expiry) : null;
  const status: "expired" | "soon" | "ok" = left == null ? "ok" : left < 0 ? "expired" : left <= 60 ? "soon" : "ok";

  const q = new URLSearchParams({ visa: from, ...(expiry ? { expiry } : {}), ...(target ? { goal: target } : {}) });
  const ctaHref = user ? `/${locale}/my/dashboard` : `/${locale}/signup?${q.toString()}`;
  const helpHref = `/${locale}/mentors?category=visa`;

  return (
    <section className="lnk-paper relative overflow-hidden border-b border-[var(--doc-rule)]">
      <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-5 pb-16 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-12 lg:pb-24 lg:pt-20">
        {/* 문구 + 주 행동 */}
        <div className="flex min-w-0 flex-col gap-5 sm:gap-6 lg:col-span-5">
          <h1 className="break-keep text-[32px] font-extrabold leading-[1.14] tracking-[-0.03em] text-[var(--doc-ink)] sm:text-5xl lg:text-[54px]">
            {t("heroTitle")}
          </h1>
          <p className="max-w-[36ch] break-keep text-[16px] leading-[1.6] text-[var(--doc-soft)] sm:text-[17px]">{t("heroLead")}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={ctaHref} className="lnk-btn-primary">
              {user ? t("ctaMine") : t("ctaStart")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <span className="text-sm text-[var(--doc-soft)]">{t("ctaNote")}</span>
          </div>
        </div>

        {/* 체류 노트 */}
        <div className="min-w-0 lg:col-span-7">
          <p className="mb-3 break-keep text-[15px] font-semibold text-[var(--doc-ink)]">{t("docTry")}</p>
          <article
            className="lnk-doc relative rounded-[14px] border border-[var(--doc-rule)] bg-[var(--doc-sheet)] shadow-[0_18px_40px_-24px_rgba(16,48,46,0.45)]"
            aria-label={t("docLabel")}
          >
            <svg className="lnk-guilloche pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 600 400">
              {Array.from({ length: 22 }).map((_, i) => (
                <path
                  key={i}
                  d={`M0 ${90 + i * 10} C 90 ${30 + i * 13}, 200 ${250 - i * 7}, 300 ${120 + i * 9} S 500 ${40 + i * 12}, 600 ${140 + i * 8}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.55"
                />
              ))}
              {Array.from({ length: 22 }).map((_, i) => (
                <path
                  key={`b${i}`}
                  d={`M0 ${300 - i * 9} C 120 ${360 - i * 12}, 260 ${150 + i * 6}, 380 ${280 - i * 8} S 520 ${340 - i * 11}, 600 ${260 - i * 7}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.45"
                />
              ))}
            </svg>

            <header className="relative flex items-start justify-between gap-3 border-b border-[var(--doc-rule)] px-5 py-4 sm:px-7">
              <div className="min-w-0">
                <p className="text-[15px] font-bold tracking-[-0.01em] text-[var(--doc-ink)]">{t("docTitle")}</p>
                <p className="lnk-mono hidden text-[12px] uppercase tracking-[0.14em] text-[var(--doc-soft)] sm:block">Learn · Network · Keep</p>
              </div>
              <p className="shrink-0 whitespace-nowrap rounded-full border border-[var(--doc-rule)] px-2.5 py-1 text-[12px] font-semibold text-[var(--doc-soft)]">
                {t("docSample")}
              </p>
            </header>

            {/* 입력 칸 */}
            <div className="lnk-fields relative grid grid-cols-1 border-b border-[var(--doc-rule)] sm:grid-cols-[1fr_0.9fr_1.15fr]">
              <DocSelect label={t("fieldNow")} value={from} options={CURRENT_VISAS} names={guides} onChange={setFrom} />
              <label className="lnk-field lnk-field-date">
                <span className="lnk-field-label">{t("fieldExpiry")}</span>
                <input
                  type="date"
                  value={expiry ?? ""}
                  onChange={(e) => e.target.value && setExpiry(e.target.value)}
                  className="lnk-field-input lnk-mono"
                />
              </label>
              {target ? (
                <DocSelect label={t("fieldGoal")} value={target} options={targets} names={guides} onChange={setTo} />
              ) : null}
            </div>

            {/* 경로: 비자 도장 */}
            <div className="relative px-5 py-5 sm:px-7 sm:py-6">
              <p className="lnk-field-label mb-3">{t("routeLabel")}</p>
              <ol className="lnk-route">
                {route.map((code, i) => (
                  <li key={code} className="lnk-route-item">
                    <span
                      key={i === 0 ? stampKey : code}
                      className={`lnk-stamp ${i === 0 ? "lnk-stamp-now" : i === 1 ? "lnk-stamp-next" : ""}`}
                    >
                      <span className="lnk-mono text-[15px] font-bold leading-none">{code}</span>
                      <span className="text-[12px] font-semibold leading-tight">
                        {i === 0 ? t("stampNow") : i === 1 ? t("stampNext") : t("stampLater")}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* 지금 할 일 / 만료 경고 */}
            <div aria-live="polite" className="relative border-t-2 border-[var(--doc-red)] px-5 py-4 sm:px-7">
              {status === "expired" ? (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[13px] font-bold text-[var(--doc-red)]">{t("expiredLabel")}</p>
                  <p className="break-keep text-[16px] font-bold text-[var(--doc-ink)]">{t("expiredBody")}</p>
                  <Link href={helpHref} className="lnk-link mt-1 inline-flex items-center gap-1.5 text-[15px] font-semibold">
                    {t("expiredCta")}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ) : first && firstCopy ? (
                <div className="grid gap-1 sm:grid-cols-[1fr_auto] sm:items-center">
                  <p className="text-[13px] font-semibold text-[var(--doc-red)]">
                    {status === "soon" ? t("soonLabel", { days: String(left) }) : t("todoLabel")}
                  </p>
                  <p className="lnk-mono text-[13px] font-semibold text-[var(--doc-red)] sm:row-span-2 sm:text-right">
                    {first.dueDate ? t("todoBy", { date: fmt(first.dueDate, locale) }) : ""}
                  </p>
                  <p className="break-keep text-[16px] font-bold text-[var(--doc-ink)]">{firstCopy.title}</p>
                </div>
              ) : null}
            </div>

            <p className="lnk-mono relative truncate border-t border-[var(--doc-rule)] px-5 py-3 text-[12px] text-[var(--doc-soft)] sm:px-7">
              LNK · {route.join(" → ")}
              {expiry ? ` · ${fmt(expiry, locale)}` : ""}
            </p>
          </article>
          <p className="mt-3 break-keep text-[13px] leading-[1.5] text-[var(--doc-soft)]">{t("docNote")}</p>
        </div>
      </div>
    </section>
  );
}
