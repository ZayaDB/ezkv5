"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

export const TOUR_OPEN_EVENT = "lnk-tour-open";
const SEEN_KEY = "lnk_home_tour_seen";
const TARGETS = ["top", "how", "services", "ask"];

/** HUR식 첫 방문 안내: 처음 온 사람에게 4단계로 홈을 소개. 끝내거나 닫으면 다시 안 뜸. */
export default function FirstVisitGuide() {
  const t = useTranslations("homeB");
  const guide = t.raw("guide") as [string, string][];
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  const mark = useCallback((idx: number | null) => {
    document.querySelectorAll("[data-tour-on]").forEach((el) => el.removeAttribute("data-tour-on"));
    if (idx === null) return;
    const el = document.getElementById(TARGETS[idx]);
    if (!el) return;
    const ring = (el.querySelector("[data-tour-ring]") as HTMLElement | null) ?? el;
    ring.setAttribute("data-tour-on", "true");
    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    mark(null);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  }, [mark]);

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = true;
    }
    const timer = seen ? null : window.setTimeout(() => setOpen(true), 1200);
    const reopen = () => {
      setI(0);
      setOpen(true);
      mark(0);
    };
    window.addEventListener(TOUR_OPEN_EVENT, reopen);
    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener(TOUR_OPEN_EVENT, reopen);
    };
  }, [mark]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;
  const last = i === guide.length - 1;
  const next = () => {
    if (last) return close();
    const n = i + 1;
    setI(n);
    mark(n);
  };

  return (
    <aside role="dialog" aria-modal="false" aria-labelledby="b3-guide-title" className="b3-guide">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-extrabold text-[#ffcf3f]">
          {t("gLabel")} · {i + 1}/{guide.length}
        </span>
        <button type="button" onClick={close} aria-label={t("gClose")} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#26322f] transition-colors hover:bg-[#3a4846]">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p id="b3-guide-title" className="mt-3 text-[22px] font-extrabold leading-[1.3] tracking-[-0.02em]">
        {guide[i][0]}
      </p>
      <p className="mt-2 text-[15px] leading-[1.65] text-[#c4d3cf]">{guide[i][1]}</p>
      <div className="mt-4 flex gap-1.5" aria-hidden="true">
        {guide.map((_, k) => (
          <span key={k} className={`h-1.5 rounded-full transition-all duration-300 ${k === i ? "w-6 bg-[#ffcf3f]" : "w-1.5 bg-[#4a5a57]"}`} />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <button type="button" onClick={close} className="min-h-[44px] px-1.5 text-[14px] text-[#c4d3cf] hover:text-white">
          {t("gSkip")}
        </button>
        <button type="button" onClick={next} className="b3-btn b3-btn-sun min-h-[48px] px-6">
          {last ? t("gDone") : t("gNext")}
        </button>
      </div>
    </aside>
  );
}
