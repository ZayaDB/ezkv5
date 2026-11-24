"use client";

import { useCallback, useEffect, useState } from "react";

export type DashboardMode = "mentee" | "mentor";
const KEY = "dashboard_mode";
const EVENT = "dashboard-mode-changed";

function read(): DashboardMode {
  try {
    const raw = localStorage.getItem(KEY);
    return raw === "mentor" ? "mentor" : "mentee";
  } catch {
    return "mentee";
  }
}

/** 학생/멘토 모드: 모든 화면이 같은 값을 보도록 localStorage + 이벤트로 동기화 */
export function setDashboardMode(next: DashboardMode) {
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
}

export function useDashboardMode(): [DashboardMode, (next: DashboardMode) => void] {
  const [mode, setMode] = useState<DashboardMode>("mentee");
  useEffect(() => {
    const sync = () => setMode(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);
  const change = useCallback((next: DashboardMode) => setDashboardMode(next), []);
  return [mode, change];
}
