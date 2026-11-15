"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Star } from "lucide-react";
import type { Review } from "@/lib/supabase/reviews";
import { ui } from "@/components/lnk/ui";

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(value) ? "fill-teal text-teal dark:fill-teal-dark dark:text-teal-dark" : "text-hairline dark:text-hairline-dark"}
        />
      ))}
    </span>
  );
}

/** 별점 + 후기 입력 폼 */
export function ReviewForm({
  initial,
  onSubmit,
  title,
}: {
  initial?: { rating: number; comment: string } | null;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  title: string;
}) {
  const t = useTranslations("reviews");
  const [rating, setRating] = useState(initial?.rating || 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initial?.comment || "");
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<"idle" | "saved" | "error">("idle");

  const submit = async () => {
    if (!rating) return;
    setBusy(true);
    setState("idle");
    try {
      await onSubmit(rating, comment);
      setState("saved");
    } catch {
      setState("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`${ui.card} space-y-3 p-5`}>
      <p className="text-sm font-semibold text-ink dark:text-snow">{title}</p>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label={t("ratingLabel")}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={rating === i}
            aria-label={t("starsN", { n: i })}
            onMouseEnter={() => setHover(i)}
            onClick={() => setRating(i)}
            className="p-0.5"
          >
            <Star
              className={`h-7 w-7 transition ${
                i <= (hover || rating) ? "fill-teal text-teal dark:fill-teal-dark dark:text-teal-dark" : "text-hairline dark:text-hairline-dark"
              }`}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder={t("commentPlaceholder")}
        className={`${ui.input} h-auto resize-none py-2.5`}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={submit} disabled={!rating || busy} className={ui.btnPrimary}>
          {initial ? t("update") : t("submit")}
        </button>
        {state === "saved" && <span className="text-xs font-medium text-teal dark:text-teal-dark">{t("saved")}</span>}
        {state === "error" && <span className="text-xs text-red-600 dark:text-red-400">{t("failed")}</span>}
      </div>
    </div>
  );
}

/** 리뷰 목록 + 평균 */
export function ReviewList({ reviews, average, count }: { reviews: Review[]; average: number; count: number }) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(locale === "kr" ? "ko-KR" : locale === "mn" ? "mn-MN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className={ui.h2}>{t("title")}</h2>
        {count > 0 && (
          <span className="flex items-center gap-2 text-sm">
            <Stars value={average} />
            <span className="font-semibold text-ink dark:text-snow">{average.toFixed(1)}</span>
            <span className={ui.muted}>{t("count", { count })}</span>
          </span>
        )}
      </div>
      {reviews.length === 0 ? (
        <p className={`text-sm ${ui.muted}`}>{t("empty")}</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className={`${ui.card} p-4`}>
              <div className="flex flex-wrap items-center gap-2">
                <Stars value={r.rating} size={14} />
                <span className="text-sm font-semibold text-ink dark:text-snow">{r.reviewerName || t("anonymous")}</span>
                <span className={`text-xs ${ui.muted}`}>{fmt(r.createdAt)}</span>
              </div>
              {r.comment && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted dark:text-snow-muted">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
