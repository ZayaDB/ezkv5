import { createClient } from "@/lib/supabase/client";
import { buildVisaAlertsFromProfile, listAlerts, type UserAlert } from "@/lib/supabase/alerts";
import { getNextStepTitle } from "@/lib/roadmap/progressUtils";
import type { User } from "@/lib/contexts/AuthContext";

const RECOMMENDED_ACTIONS = [
  { id: "arc", title: "외국인등록증 갱신 확인", actionUrl: "/assistant" },
  { id: "visa", title: "비자 연장 준비", actionUrl: "/assistant" },
  { id: "insurance", title: "건강보험 확인", actionUrl: "/calendar" },
];

function daysUntil(date: Date): number | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const SEVERITY_RANK: Record<string, number> = { urgent: 3, warning: 2, info: 1 };

function mergeAlerts(visa: UserAlert[], fromDb: UserAlert[]): UserAlert[] {
  const merged = [...visa, ...fromDb];
  merged.sort((a, b) => {
    const sd = (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0);
    if (sd !== 0) return sd;
    const da = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const db = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    return da - db;
  });
  return merged;
}

export async function getControlCenter(profileUser: User) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user || session.user.id !== profileUser.id) {
    throw new Error("인증이 필요합니다.");
  }

  const userId = profileUser.id;
  const profileFields = {
    name: profileUser.name,
    university: profileUser.university ?? null,
    nationality: profileUser.nationality ?? null,
    visa_type: profileUser.visaType ?? null,
    visa_expire_date: profileUser.visaExpireDate ?? null,
    country_status: profileUser.countryStatus ?? "unknown",
    onboarding_status: profileUser.onboardingStatus ?? "pending",
  };

  const visaDday =
    profileFields.visa_expire_date && profileFields.country_status === "residing_korea"
      ? daysUntil(new Date(profileFields.visa_expire_date))
      : null;

  const statusCard = {
    name: profileFields.name,
    university: profileFields.university,
    nationality: profileFields.nationality,
    visaType: profileFields.visa_type,
    visaDday,
    countryStatus: profileFields.country_status,
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [dbAlerts, roadmapsResult, eventsResult] = await Promise.all([
    listAlerts(userId),
    supabase
      .from("roadmaps")
      .select(
        "id, title, progress, due_date, template_key, roadmap_steps(id, title, description, completed, active, sort_order)"
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("calendar_events")
      .select("id, title, starts_at, category, status")
      .eq("user_id", userId)
      .gte("starts_at", todayStart.toISOString())
      .lte("starts_at", todayEnd.toISOString())
      .neq("status", "cancelled")
      .order("starts_at", { ascending: true }),
  ]);

  if (roadmapsResult.error) throw new Error(roadmapsResult.error.message);
  if (eventsResult.error) throw new Error(eventsResult.error.message);

  const visaAlerts = buildVisaAlertsFromProfile(userId, profileFields);
  const alerts = mergeAlerts(visaAlerts, dbAlerts);

  const activeRoadmaps = (roadmapsResult.data || []).map((r) => {
    const nested = r.roadmap_steps as
      | Array<{
          id: string;
          title: string;
          description: string | null;
          completed: boolean;
          active: boolean;
          sort_order: number;
        }>
      | null;
    const rSteps = (nested || [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => ({
        id: String(s.id),
        title: s.title,
        description: s.description || undefined,
        completed: s.completed,
        active: s.active,
      }));
    return {
      id: r.id,
      title: r.title,
      templateKey: r.template_key as string | null,
      progress: r.progress,
      nextStep: getNextStepTitle(rSteps),
      dueDate: r.due_date,
      steps: rSteps,
    };
  });

  const todaySchedule = (eventsResult.data || []).map((e) => ({
    id: e.id,
    type: "calendar" as const,
    title: e.title,
    startsAt: e.starts_at,
    category: e.category,
  }));

  const recommendedActions = RECOMMENDED_ACTIONS.filter((a) => {
    if (a.id === "visa" && visaDday !== null && visaDday <= 60) return true;
    if (a.id === "insurance" && profileFields.country_status === "residing_korea") return true;
    if (a.id === "arc" && profileFields.country_status === "residing_korea") return true;
    return false;
  });

  if (recommendedActions.length === 0) {
    recommendedActions.push(RECOMMENDED_ACTIONS[0]);
  }

  return {
    statusCard,
    alerts,
    activeRoadmaps,
    todaySchedule,
    recommendedActions,
    onboardingStatus: profileFields.onboarding_status,
  };
}
