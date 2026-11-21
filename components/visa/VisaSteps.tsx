"use client";

import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { describeCond, describeStep } from "@/lib/visa/content";
import type { CondResult, CondStatus } from "@/lib/visa/types";
import { formatDate } from "@/lib/i18n/dateFormat";

const STATUS_STYLE: Record<CondStatus, string> = {
  ok: "text-emerald-600 dark:text-emerald-400",
  missing: "text-rose-600 dark:text-rose-400",
  check: "text-[#75582b] dark:text-[#e2c48f]",
};

export function CondList({ results }: { results: CondResult[] }) {
  const t = useTranslations("visa");
  const locale = useLocale();
  const label: Record<CondStatus, string> = { ok: t("statusOk"), missing: t("statusMissing"), check: t("statusCheck") };
  return (
    <ul className="flex flex-col gap-2">
      {results.map((r) => {
        const Icon = r.status === "ok" ? CheckCircle2 : r.status === "missing" ? AlertCircle : HelpCircle;
        return (
          <li key={r.key} className="flex items-start gap-2 text-sm">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${STATUS_STYLE[r.status]}`} aria-hidden="true" />
            <span className="min-w-0 flex-1 text-ink dark:text-snow">{describeCond(locale, r)}</span>
            <span className={`shrink-0 text-xs font-semibold ${STATUS_STYLE[r.status]}`}>{label[r.status]}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** 단계 하나의 설명 (제목은 바깥에서) */
export function StepBody({ stepKey, conds }: { stepKey: string; conds?: CondResult[] }) {
  const t = useTranslations("visa");
  const locale = useLocale();
  const d = describeStep(locale, stepKey);
  if (!d) return null;
  return (
    <div className="flex flex-col gap-3">
      {d.body ? (
        <p className="whitespace-pre-line text-sm leading-[1.6] text-ink-muted dark:text-snow-muted">{d.body}</p>
      ) : null}
      {conds && conds.length ? <CondList results={conds} /> : null}
      {d.docs.length ? (
        <div>
          <p className="mb-1.5 text-xs font-bold text-ink dark:text-snow">{t("stepDocs")}</p>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-ink-muted dark:text-snow-muted">
            {d.docs.map((doc) => (
              <li key={doc}>{doc}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function DueLabel({ date }: { date: string | null | undefined }) {
  const t = useTranslations("visa");
  const locale = useLocale();
  return (
    <span className="text-xs font-semibold text-ink-muted dark:text-snow-muted">
      {date ? t("due", { date: formatDate(new Date(`${date}T00:00:00`), locale, { dateStyle: "medium" }) }) : t("noDue")}
    </span>
  );
}
