"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";

type Expert = { name: string; photo: string | null; href: string } | null;

const CHOICES = [
  { label: "예요", right: false },
  { label: "이에요", right: true },
  { label: "이다", right: false },
];

/** Skola식 분할: 왼쪽 화면은 고정, 오른쪽 단계가 스크롤되면 화면이 따라 바뀜. */
export default function HowSplit({ expert }: { expert: Expert }) {
  const t = useTranslations("homeB");
  const locale = useLocale();
  const { user } = useAuth();
  const steps = t.raw("steps") as { title: string; body: string; tag: string }[];
  const [cur, setCur] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    // 넓은 화면에서만 스크롤 연동 (좁은 화면은 가로로 넘기는 단계 카드)
    if (!window.matchMedia("(min-width: 960px)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.step);
            if (!Number.isNaN(i)) setCur(i);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (path: string) => {
    const target = `/${locale}${path}`;
    return user ? target : `/${locale}/login?redirect=${encodeURIComponent(target)}`;
  };
  const stepHref = [
    user ? `/${locale}/my/dashboard` : `/${locale}/signup?visa=D-2`,
    go("/my/dashboard"),
    go("/my/korean"),
    expert?.href ?? `/${locale}/mentors`,
  ];
  const route = [
    { code: "D-2", note: t("rNow") },
    { code: "E-7", note: t("rNext") },
    { code: "F-2-7", note: t("rPoints") },
    { code: "F-5", note: t("rPr") },
  ];

  return (
    <div className="b3-split">
      {/* 고정 화면 */}
      <div className="b3-stage" aria-live="polite">
        <div className="flex items-center justify-between text-[13px] font-extrabold">
          <span className="text-[#9fe0d2]">{cur + 1} / 4</span>
          <span className="text-[#ffcf3f]">{steps[cur]?.tag}</span>
        </div>
        <div className="b3-screen">
          {cur === 0 && (
            <div key="s0" className="b3-scene">
              <p className="text-[14px] font-extrabold text-[#1f6f62]">{t("m1Title")}</p>
              <span className="b3-mock-label">{t("m1Visa")}</span>
              <div className="b3-mock-field is-on"><span>D-2</span><span aria-hidden="true" className="text-[13px] text-[#47605b]">▾</span></div>
              <span className="b3-mock-label">{t("m1Exp")}</span>
              <div className="b3-mock-field">2027. 8. 24.</div>
              <span className="b3-mock-label">{t("m1Goal")}</span>
              <div className="b3-mock-field">{t("m1GoalVal")}</div>
              <div className="mt-auto flex min-h-[52px] items-center justify-center rounded-full bg-[#ffcf3f] font-extrabold">{t("m1Btn")}</div>
            </div>
          )}
          {cur === 1 && (
            <div key="s1" className="b3-scene">
              <p className="text-[14px] font-extrabold text-[#1f6f62]">{t("m2Title")}</p>
              <ol className="flex flex-col">
                {route.map((r, i) => (
                  <li key={r.code} className="flex items-stretch gap-3.5">
                    <div className="flex w-[18px] flex-none flex-col items-center">
                      <span className={`b3-route-dot ${i === 0 ? "is-now" : ""}`} />
                      {i < route.length - 1 && <span className="b3-route-line" style={{ animationDelay: `${i * 0.12}s` }} />}
                    </div>
                    <div className="flex flex-wrap items-baseline gap-2 pb-4">
                      <span className="text-[22px] font-extrabold tracking-[-0.02em] text-[#1f6f62]">{r.code}</span>
                      <span className="text-[13px] text-[#47605b]">{r.note}</span>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-auto flex flex-col gap-1 rounded-[14px] bg-[#f1f4f3] px-4 py-3.5">
                <span className="text-[12px] font-extrabold text-[#1f6f62]">{t("m2Now")}</span>
                <span className="text-[15px] font-bold">{t("m2Todo")}</span>
              </div>
            </div>
          )}
          {cur === 2 && (
            <div key="s2" className="b3-scene">
              <p className="text-[14px] font-extrabold text-[#1f6f62]">TOPIK · {t("m3Title")}</p>
              <p lang="ko" className="text-[20px] font-extrabold leading-[1.45]">{t("m3Q")}</p>
              <div className="flex flex-col gap-2">
                {CHOICES.map((c, i) => (
                  <button
                    key={c.label}
                    type="button"
                    lang="ko"
                    onClick={() => setPick(i)}
                    aria-pressed={pick === i}
                    className={`b3-quiz-choice ${pick === i ? (c.right ? "is-right" : "is-wrong") : ""}`}
                  >
                    {i + 1}. {c.label}
                  </button>
                ))}
              </div>
              <p className="mt-auto min-h-[44px] text-[14px] leading-[1.6] text-[#47605b]" aria-live="polite">
                {pick === null ? t("m3Pick") : CHOICES[pick].right ? t("m3Right") : t("m3Wrong")}
              </p>
            </div>
          )}
          {cur === 3 && (
            <div key="s3" className="b3-scene">
              <p className="text-[14px] font-extrabold text-[#1f6f62]">{t("m4Title")}</p>
              <div className="flex items-center gap-3.5">
                <div className="b3-photo">
                  {expert?.photo ? <Image src={expert.photo} alt={expert.name} fill sizes="76px" className="object-cover" /> : null}
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-[18px] font-extrabold">{expert?.name ?? "임효선"}</span>
                  <span className="text-[14px] text-[#47605b]">{t("m4Role")}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2" aria-hidden="true">
                <span className="rounded-full bg-[#f1f4f3] px-3 py-2 text-[13px] font-bold">{t("m4Date")}</span>
                <span className="rounded-full bg-[#f1f4f3] px-3 py-2 text-[13px] font-bold">{t("m4Time")}</span>
                <span className="rounded-full bg-[#ffcf3f] px-3 py-2 text-[13px] font-bold">{t("m4Time")}</span>
              </div>
              <div className="mt-auto flex min-h-[52px] items-center justify-center rounded-full bg-[#111a19] font-extrabold text-white">{t("m4Btn")}</div>
            </div>
          )}
        </div>
        <Link href={stepHref[cur]} className="b3-btn b3-btn-sun self-start">
          {t("stepCta")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* 스크롤되는 단계 */}
      <ol className="b3-steps">
        {steps.map((s, i) => (
          <li key={s.title} data-step={i} ref={(el) => { refs.current[i] = el; }}>
            <button type="button" onClick={() => setCur(i)} aria-current={cur === i ? "step" : undefined} className={`b3-step ${cur === i ? "is-on" : ""}`}>
              <span className="b3-step-n">0{i + 1}</span>
              <span className="b3-step-t">{s.title}</span>
              <span className="b3-step-b">{s.body}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
