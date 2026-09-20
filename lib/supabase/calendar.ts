import { createClient } from "@/lib/supabase/client";
import type { LifeEvent, LifeEventCategory, LifeEventStatus } from "@/lib/types/life-plan";

async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다.");
  return { supabase, userId: user.id };
}

function mapEvent(row: Record<string, unknown>): LifeEvent {
  return {
    id: String(row.id),
    title: String(row.title),
    notes: String(row.notes || ""),
    startsAt: String(row.starts_at),
    endsAt: (row.ends_at as string | null) ?? null,
    category: (row.category as LifeEventCategory) || "general",
    status: (row.status as LifeEventStatus) || "planned",
    recurrence: { type: "none" },
  };
}

export async function getLifeEvents(fromIso: string, toIso: string) {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("user_id", userId)
    .gte("starts_at", fromIso)
    .lte("starts_at", toIso)
    .order("starts_at", { ascending: true });

  if (error) throw new Error(error.message);
  return { events: (data || []).map((r) => mapEvent(r as Record<string, unknown>)) };
}

export async function addLifeEvent(payload: {
  title: string;
  startsAt: string;
  endsAt?: string | null;
  notes?: string;
  category?: LifeEventCategory;
  status?: LifeEventStatus;
}) {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      user_id: userId,
      title: payload.title,
      starts_at: payload.startsAt,
      ends_at: payload.endsAt || null,
      notes: payload.notes || null,
      category: payload.category || "general",
      status: payload.status || "planned",
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message || "일정 추가 실패");
  return { event: mapEvent(data as Record<string, unknown>) };
}

export async function updateLifeEvent(
  id: string,
  payload: {
    title: string;
    startsAt: string;
    endsAt?: string | null;
    notes?: string;
    category?: LifeEventCategory;
    status?: LifeEventStatus;
  }
) {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("calendar_events")
    .update({
      title: payload.title,
      starts_at: payload.startsAt,
      ends_at: payload.endsAt || null,
      notes: payload.notes || null,
      category: payload.category || "general",
      status: payload.status || "planned",
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message || "일정 수정 실패");
  return { event: mapEvent(data as Record<string, unknown>) };
}

export async function deleteLifeEvent(id: string) {
  const { supabase, userId } = await requireUserId();
  const { error } = await supabase.from("calendar_events").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}
