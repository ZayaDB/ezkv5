"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useDashboardMode, type DashboardMode } from "@/lib/hooks/useDashboardMode";

export default function DashboardModeToggle({ canUseMentorMode }: { canUseMentorMode: boolean }) {
  const t = useTranslations("dashboardV2");
  const [mode, setMode] = useDashboardMode();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  if (!canUseMentorMode) return null;

  // 모드를 바꾸면 반대 모드 전용 페이지에 머물지 않게 홈으로 이동
  const setDashboardMode = (next: DashboardMode) => {
    if (next === mode) return;
    setMode(next);
    const mentorOnly = ["/my/lectures", "/my/mentor"].some((p) => pathname.includes(p));
    const menteeOnly = ["/my/courses", "/my/wishlist", "/my/korean", "/my/admission"].some((p) => pathname.includes(p));
    if ((next === "mentee" && mentorOnly) || (next === "mentor" && menteeOnly)) {
      router.push(`/${locale}/my/dashboard`);
    }
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
