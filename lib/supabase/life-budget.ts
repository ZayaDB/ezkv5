import { requireUserId } from "@/lib/supabase/requireUser";
import type {
  LifeBudgetKind,
  LifeBudgetLine,
  LifeBudgetOccurrence,
  LifeRecurrence,
} from "@/lib/types/life-plan";

function mapLine(row: Record<string, unknown>): LifeBudgetLine {
  return {
    id: String(row.id),
    kind: row.kind as LifeBudgetKind,
    label: String(row.label || ""),
    amount: Number(row.amount) || 0,
    date: String(row.line_date || row.date || ""),
    recurrence: (row.recurrence as LifeRecurrence) || { type: "none" },
  };
}

export async function listBudgetLines(params?: { fromIso?: string; toIso?: string }) {
  const { supabase, userId } = await requireUserId();
  let q = supabase.from("life_budget_lines").select("*").eq("user_id", userId).order("line_date", {
    ascending: true,
  });

  if (params?.fromIso) q = q.gte("line_date", params.fromIso.slice(0, 10));
  if (params?.toIso) q = q.lte("line_date", params.toIso.slice(0, 10));

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const lines = (data || []).map((r) => mapLine(r as Record<string, unknown>));
  return { lines, occurrences: [] as LifeBudgetOccurrence[] };
}

export async function addBudgetLine(payload: {
  kind: LifeBudgetKind;
  label: string;
  amount: number;
  date: string;
  recurrence?: LifeRecurrence;
}) {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("life_budget_lines")
    .insert({
      user_id: userId,
      kind: payload.kind,
      label: payload.label,
      amount: payload.amount,
      line_date: payload.date.slice(0, 10),
      recurrence: payload.recurrence ?? { type: "none" },
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapLine(data as Record<string, unknown>);
}

export async function updateBudgetLine(
  id: string,
  payload: {
    kind: LifeBudgetKind;
    label: string;
    amount: number;
    date: string;
    recurrence?: LifeRecurrence;
  }
) {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("life_budget_lines")
    .update({
      kind: payload.kind,
      label: payload.label,
      amount: payload.amount,
      line_date: payload.date.slice(0, 10),
      recurrence: payload.recurrence ?? { type: "none" },
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapLine(data as Record<string, unknown>);
}

export async function deleteBudgetLine(id: string) {
  const { supabase, userId } = await requireUserId();
  const { error } = await supabase.from("life_budget_lines").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}
