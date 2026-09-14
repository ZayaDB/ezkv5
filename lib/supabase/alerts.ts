import { createClient } from "@/lib/supabase/client";

export type UserAlert = {
  id: string;
  kind: string | null;
  severity: string;
  title: string;
  body: string | null;
  dueDate: string | null;
  actionUrl: string | null;
};

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

export async function syncVisaAlerts(userId: string, profile: {
  visa_expire_date?: string | null;
  visa_type?: string | null;
  country_status?: string | null;
}) {
  const supabase = createClient();

  await supabase.from("user_alerts").delete().eq("user_id", userId).eq("kind", "visa_expiry");

  if (profile.country_status !== "residing_korea" || !profile.visa_expire_date) return;

  const days = daysUntil(new Date(profile.visa_expire_date));
  const visaLabel = profile.visa_type ? `${profile.visa_type} ` : "";

  if (days < 0) {
    await supabase.from("user_alerts").insert({
      user_id: userId,
      kind: "visa_expiry",
      severity: "urgent",
      title: "비자가 만료되었습니다",
      message: "즉시 연장·체류 자격을 확인하세요.",
      due_date: profile.visa_expire_date,
      action_url: "/roadmap",
    });
    return;
  }

  if (days <= 90) {
    await supabase.from("user_alerts").insert({
      user_id: userId,
      kind: "visa_expiry",
      severity: severityForVisaDays(days),
      title: `${visaLabel}비자 만료 D-${days}`,
      message: days <= 30 ? "연장 준비를 시작하세요." : "만료일을 확인하고 일정을 잡으세요.",
      due_date: profile.visa_expire_date,
      action_url: "/roadmap",
    });
  }
}

export async function listAlerts(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_alerts")
    .select("*")
    .eq("user_id", userId)
    .eq("dismissed", false)
    .order("severity", { ascending: false })
    .order("due_date", { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []).map(
    (a): UserAlert => ({
      id: a.id,
      kind: a.kind,
      severity: a.severity,
      title: a.title,
      body: a.message,
      dueDate: a.due_date,
      actionUrl: a.action_url,
    })
  );
}

export async function dismissAlert(userId: string, alertId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_alerts")
    .update({ dismissed: true, dismissed_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("id", alertId);

  if (error) throw new Error(error.message);
}
