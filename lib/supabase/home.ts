import { createClient } from "@/lib/supabase/client";
import { syncVisaAlerts, listAlerts } from "@/lib/supabase/alerts";
import { getNextStepTitle } from "@/lib/roadmap/progressUtils";

const RECOMMENDED_ACTIONS = [
  { id: "arc", title: "외국인등록증 갱신 확인", actionUrl: "/roadmap" },
  { id: "visa", title: "비자 연장 준비", actionUrl: "/roadmap" },
  { id: "insurance", title: "건강보험 확인", actionUrl: "/calendar" },
];

function daysUntil(date: Date): number | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export async function getControlCenter() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다.");

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile) throw new Error("프로필을 불러오지 못했습니다.");

  await syncVisaAlerts(user.id, profile);

  const visaDday =
    profile.visa_expire_date && profile.country_status === "residing_korea"
      ? daysUntil(new Date(profile.visa_expire_date))
      : null;

  const statusCard = {
    name: profile.name,
    university: profile.university || null,
    nationality: profile.nationality || null,
    visaType: profile.visa_type || null,
    visaDday,
    countryStatus: profile.country_status,
  };

  const alerts = await listAlerts(user.id);

  const { data: roadmaps } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(5);

  const roadmapIds = (roadmaps || []).map((r) => r.id);
  let steps: Array<Record<string, unknown>> = [];
  if (roadmapIds.length) {
    const { data: stepRows } = await supabase
      .from("roadmap_steps")
      .select("*")
      .in("roadmap_id", roadmapIds)
      .order("sort_order", { ascending: true });
    steps = (stepRows || []) as Array<Record<string, unknown>>;
  }

  const activeRoadmaps = (roadmaps || []).map((r) => {
    const rSteps = steps
      .filter((s) => s.roadmap_id === r.id)
      .map((s) => ({
        title: String(s.title),
        completed: Boolean(s.completed),
        active: Boolean(s.active),
      }));
    return {
      id: r.id,
      title: r.title,
      progress: r.progress,
      nextStep: getNextStepTitle(rSteps),
      dueDate: r.due_date,
    };
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data: events } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("user_id", user.id)
    .gte("starts_at", todayStart.toISOString())
    .lte("starts_at", todayEnd.toISOString())
    .neq("status", "cancelled")
    .order("starts_at", { ascending: true });

  const todaySchedule = (events || []).map((e) => ({
    id: e.id,
    type: "calendar" as const,
    title: e.title,
    startsAt: e.starts_at,
    category: e.category,
  }));

  const recommendedActions = RECOMMENDED_ACTIONS.filter((a) => {
    if (a.id === "visa" && visaDday !== null && visaDday <= 60) return true;
    if (a.id === "insurance" && profile.country_status === "residing_korea") return true;
    if (a.id === "arc" && profile.country_status === "residing_korea") return true;
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
    onboardingStatus: profile.onboarding_status,
  };
}
