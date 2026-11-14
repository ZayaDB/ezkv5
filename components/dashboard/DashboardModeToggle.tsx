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
    <div className="grid grid-cols-2 rounded-lg bg-surface p-1 dark:bg-night" role="group">
      <button
        type="button"
        onClick={() => setDashboardMode("mentee")}
        aria-pressed={mode === "mentee"}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
          mode === "mentee"
            ? "bg-white text-ink shadow-sm dark:bg-night-card dark:text-snow"
            : "text-ink-muted dark:text-snow-muted"
        }`}
      >
        {t("modeMentee")}
      </button>
      <button
        type="button"
        onClick={() => setDashboardMode("mentor")}
        aria-pressed={mode === "mentor"}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
          mode === "mentor"
            ? "bg-white text-ink shadow-sm dark:bg-night-card dark:text-snow"
            : "text-ink-muted dark:text-snow-muted"
        }`}
      >
        {t("modeMentor")}
      </button>
    </div>
  );
}
