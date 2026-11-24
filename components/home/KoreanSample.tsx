"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { KOREAN_QUESTIONS } from "@/lib/korean/questions";

/** 홈의 한국어 맛보기: 실제 문제 하나를 그 자리에서 풀어 봄 */
export default function KoreanSample() {
  const t = useTranslations("homeV3");
  const locale = useLocale();
  const q = KOREAN_QUESTIONS.find((x) => x.id === "g1-ieyo")!;
  const [picked, setPicked] = useState<number | null>(null);
  const right = picked === q.answer;

  return (
    <div className="border-y border-[var(--doc-rule)] py-4">
      <p className="text-[16px] font-semibold text-[var(--doc-ink)]" lang="ko">
        {q.prompt}
      </p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t("koreanTry")}>
        {q.choices.map((c, i) => (
          <button
            key={c}
            type="button"
            lang="ko"
            className="lnk-q-choice"
            disabled={picked !== null}
            data-state={picked === null ? undefined : i === q.answer ? "right" : i === picked ? "wrong" : undefined}
            onClick={() => setPicked(i)}
          >
            {c}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {picked !== null ? (
          <div className="mt-3 flex flex-col gap-1.5">
            <p className={`text-[14px] font-bold ${right ? "text-[var(--doc-teal)]" : "text-[var(--doc-red)]"}`}>
              {right ? t("koreanRight") : t("koreanWrong")}
            </p>
            <p className="break-keep text-[14px] leading-[1.55] text-[var(--doc-ink)]">
              {locale === "en" ? q.explain.en : locale === "mn" ? q.explain.mn : q.explain.kr}
            </p>
            {locale !== "mn" ? (
              <p className="text-[14px] leading-[1.55] text-[var(--doc-soft)]" lang="mn">
                {q.explain.mn}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-[13px] text-[var(--doc-soft)]">{t("koreanTry")}</p>
        )}
      </div>
    </div>
  );
}
