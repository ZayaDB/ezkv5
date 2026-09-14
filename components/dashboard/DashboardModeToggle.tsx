"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function DashboardModeToggle({ canUseMentorMode }: { canUseMentorMode: boolean }) {
  const t = useTranslations("dashboardV2");
  const [mode, setMode] = useState<"mentee" | "mentor">("mentee");

  useEffect(() => {
    const raw = localStorage.getItem("dashboard_mode");
    if (raw === "mentor" || raw === "mentee") setMode(raw);
  }, []);

  if (!canUseMentorMode) return null;

  const setDashboardMode = (next: "mentee" | "mentor") => {
    setMode(next);
    localStorage.setItem("dashboard_mode", next);
    window.dispatchEvent(new Event("dashboard-mode-changed"));
  };

  return (
    <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 ring-1 ring-slate-200 dark:ring-slate-700">
      <button
        type="button"
        onClick={() => setDashboardMode("mentee")}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
          mode === "mentee"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
            : "text-slate-600 dark:text-slate-300"
        }`}
      >
        {t("modeMentee")}
      </button>
      <button
        type="button"
        onClick={() => setDashboardMode("mentor")}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
          mode === "mentor"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
            : "text-slate-600 dark:text-slate-300"
        }`}
      >
        {t("modeMentor")}
      </button>
    </div>
  );
}
