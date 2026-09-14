import { createClient } from "@/lib/supabase/client";
import { ROADMAP_TEMPLATES } from "@/lib/roadmap/templates";
import { calcProgress, getNextStepTitle } from "@/lib/roadmap/progressUtils";

async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("인증이 필요합니다.");
  return { supabase, userId: user.id };
}

function serializeRoadmap(
  roadmap: Record<string, unknown>,
  steps: Array<Record<string, unknown>>
) {
  const stepViews = steps.map((s) => ({
    id: String(s.id),
    title: String(s.title),
    description: s.description as string | undefined,
    completed: Boolean(s.completed),
    dueDate: s.due_date as string | undefined,
    sortOrder: Number(s.sort_order),
    active: Boolean(s.active),
  }));

  return {
    id: String(roadmap.id),
    title: roadmap.title,
    description: roadmap.description,
    progress: roadmap.progress,
    priority: roadmap.priority,
    dueDate: roadmap.due_date,
    status: roadmap.status,
    templateKey: roadmap.template_key,
    nextStep: getNextStepTitle(stepViews),
    steps: stepViews,
  };
}

export async function listRoadmaps(status = "active") {
  const { supabase, userId } = await requireUserId();

  let query = supabase.from("roadmaps").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
  if (status !== "all") query = query.eq("status", status);

  const { data: roadmaps, error } = await query;
  if (error) throw new Error(error.message);

  const ids = (roadmaps || []).map((r) => r.id);
  let steps: Record<string, unknown>[] = [];
  if (ids.length) {
    const { data: stepRows, error: stepErr } = await supabase
      .from("roadmap_steps")
      .select("*")
      .in("roadmap_id", ids)
      .order("sort_order", { ascending: true });
    if (stepErr) throw new Error(stepErr.message);
    steps = stepRows || [];
  }

  const templates = Object.values(ROADMAP_TEMPLATES).map((t) => ({
    key: t.key,
    title: t.title,
    description: t.description,
    priority: t.priority,
    stepCount: t.steps.length,
  }));

  return {
    templates,
    roadmaps: (roadmaps || []).map((r) =>
      serializeRoadmap(
        r as Record<string, unknown>,
        steps.filter((s) => s.roadmap_id === r.id) as Record<string, unknown>[]
      )
    ),
  };
}

async function recalculateProgress(supabase: ReturnType<typeof createClient>, roadmapId: string) {
  const { data: steps } = await supabase
    .from("roadmap_steps")
    .select("completed")
    .eq("roadmap_id", roadmapId);

  const progress = calcProgress((steps || []).map((s) => ({ completed: s.completed })));
  const allDone = steps?.length ? steps.every((s) => s.completed) : false;

  await supabase
    .from("roadmaps")
    .update({
      progress,
      status: allDone ? "completed" : "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", roadmapId);

  return progress;
}

export async function createFromTemplate(templateKey: string) {
  const template = ROADMAP_TEMPLATES[templateKey];
  if (!template) throw new Error("알 수 없는 로드맵 템플릿입니다.");

  const { supabase, userId } = await requireUserId();

  const { data: roadmap, error } = await supabase
    .from("roadmaps")
    .insert({
      user_id: userId,
      title: template.title,
      description: template.description,
      priority: template.priority,
      progress: 0,
      status: "active",
      template_key: template.key,
    })
    .select("*")
    .single();

  if (error || !roadmap) throw new Error(error?.message || "로드맵 생성 실패");

  const stepRows = template.steps.map((step, index) => ({
    roadmap_id: roadmap.id,
    user_id: userId,
    title: step.title,
    description: step.description || null,
    completed: false,
    sort_order: index,
    active: index === 0,
  }));

  const { data: steps, error: stepErr } = await supabase
    .from("roadmap_steps")
    .insert(stepRows)
    .select("*");

  if (stepErr) throw new Error(stepErr.message);

  return serializeRoadmap(roadmap as Record<string, unknown>, (steps || []) as Record<string, unknown>[]);
}

export async function completeStep(roadmapId: string, stepId: string, completed: boolean) {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase
    .from("roadmap_steps")
    .update({ completed })
    .eq("id", stepId)
    .eq("user_id", userId)
    .eq("roadmap_id", roadmapId);

  if (error) throw new Error(error.message);

  if (completed) {
    const { data: steps } = await supabase
      .from("roadmap_steps")
      .select("*")
      .eq("roadmap_id", roadmapId)
      .order("sort_order", { ascending: true });

    const hasActive = (steps || []).some((s) => s.active && !s.completed);
    if (!hasActive) {
      const next = (steps || []).find((s) => !s.completed);
      if (next) {
        await supabase.from("roadmap_steps").update({ active: false }).eq("roadmap_id", roadmapId);
        await supabase.from("roadmap_steps").update({ active: true }).eq("id", next.id);
      }
    }
  }

  await recalculateProgress(supabase, roadmapId);
  return { ok: true };
}
