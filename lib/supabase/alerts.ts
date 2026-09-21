import { createClient } from "@/lib/supabase/client";

export const ALERTS_CHANGED_EVENT = "alerts:changed";

export type UserAlert = {
  id: string;
  kind: string | null;
  severity: string;
  title: string;
  body: string | null;
  dueDate: string | null;
  actionUrl: string | null;
  read: boolean;
  createdAt: string | null;
};

export function notifyAlertsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ALERTS_CHANGED_EVENT));
}

function seenStorageKey(userId: string) {
  return `alerts-seen:${userId}`;
}

function getLocalSeenAt(userId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(seenStorageKey(userId));
  } catch {
    return null;
  }
}

function setLocalSeenAt(userId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(seenStorageKey(userId), new Date().toISOString());
  } catch {
    /* ignore quota */
  }
}

function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function severityForVisaDays(days: number): "info" | "warning" | "urgent" {
  if (days <= 14) return "urgent";
  if (days <= 30) return "warning";
  return "info";
}

/** DB 쓰기 없이 프로필 기준 비자 D-day 알림 (대시보드용) */
export function buildVisaAlertsFromProfile(
  userId: string,
  profile: {
    visa_expire_date?: string | null;
    visa_type?: string | null;
    country_status?: string | null;
  }
): UserAlert[] {
  if (profile.country_status !== "residing_korea" || !profile.visa_expire_date) return [];

  const days = daysUntil(new Date(profile.visa_expire_date));
  const visaLabel = profile.visa_type ? `${profile.visa_type} ` : "";

  if (days < 0) {
    return [
      {
        id: `client:visa_expiry:${userId}`,
        kind: "visa_expiry",
        severity: "urgent",
        title: "비자가 만료되었습니다",
        body: "즉시 연장·체류 자격을 확인하세요.",
        dueDate: profile.visa_expire_date,
        actionUrl: "/roadmap",
        read: true,
        createdAt: null,
      },
    ];
  }

  if (days <= 90) {
    return [
      {
        id: `client:visa_expiry:${userId}`,
        kind: "visa_expiry",
        severity: severityForVisaDays(days),
        title: `${visaLabel}비자 만료 D-${days}`,
        body: days <= 30 ? "연장 준비를 시작하세요." : "만료일을 확인하고 일정을 잡으세요.",
        dueDate: profile.visa_expire_date,
        actionUrl: "/roadmap",
        read: true,
        createdAt: null,
      },
    ];
  }

  return [];
}

const ALERT_SELECT_READ =
  "id, kind, severity, title, message, due_date, action_url, read, created_at";
const ALERT_SELECT_FALLBACK = "id, kind, severity, title, message, due_date, action_url, created_at";

type AlertRow = {
  id: string;
  kind: string | null;
  severity: string;
  title: string;
  message: string | null;
  due_date: string | null;
  action_url: string | null;
  read?: boolean | null;
  created_at?: string | null;
};

function mapAlert(a: AlertRow, userId: string, hasReadCol: boolean): UserAlert {
  const createdAt = a.created_at || null;
  const seenAt = getLocalSeenAt(userId);
  const locallyRead = Boolean(
    seenAt && createdAt && !Number.isNaN(new Date(createdAt).getTime()) &&
      new Date(createdAt).getTime() <= new Date(seenAt).getTime()
  );
  return {
    id: a.id,
    kind: a.kind,
    severity: a.severity,
    title: a.title,
    body: a.message,
    dueDate: a.due_date,
    actionUrl: a.action_url,
    read: hasReadCol ? Boolean(a.read) || locallyRead : locallyRead,
    createdAt,
  };
}

/** 관리자·시스템이 user_alerts에 저장한 알림 (비자 D-day는 buildVisaAlertsFromProfile 사용) */
export async function listAlerts(userId: string) {
  const supabase = createClient();
  const applyFilters = (select: string) =>
    supabase
      .from("user_alerts")
      .select(select)
      .eq("user_id", userId)
      .eq("dismissed", false)
      .or("kind.is.null,kind.neq.visa_expiry")
      .order("severity", { ascending: false })
      .order("due_date", { ascending: true });

  let hasReadCol = true;
  let { data, error } = await applyFilters(ALERT_SELECT_READ);

  if (error) {
    hasReadCol = false;
    ({ data, error } = await applyFilters(ALERT_SELECT_FALLBACK));
  }

  if (error) throw new Error(error.message);

  return ((data || []) as unknown as AlertRow[]).map((a) => mapAlert(a, userId, hasReadCol));
}

export async function markAlertsRead(userId: string) {
  setLocalSeenAt(userId);
  notifyAlertsChanged();

  const supabase = createClient();
  await supabase
    .from("user_alerts")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("dismissed", false)
    .eq("read", false);
}

export async function dismissAlert(userId: string, alertId: string) {
  if (alertId.startsWith("client:")) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("user_alerts")
    .update({ dismissed: true, dismissed_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("id", alertId);

  if (error) throw new Error(error.message);
  notifyAlertsChanged();
}
