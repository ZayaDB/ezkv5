import { currentLocale, trError } from "@/lib/i18n/runtime";
/** 이름은 예전 Mongo 시절 그대로지만 지금은 전부 Supabase 기반 (피드·커뮤니티·생활계획·로드맵) + 어시스턴트 API */
import { apiRequest } from "./core";
import type {
  LifeBudgetKind,
  LifeBudgetLine,
  LifeBudgetOccurrence,
  LifeEventCategory,
  LifeEventStatus,
  LifeRecurrence,
} from "@/lib/types/life-plan";

export type { LifeBudgetKind, LifeRecurrence } from "@/lib/types/life-plan";
export type {
  LifeEventCategory,
  LifeEventStatus,
  LifeBudgetLine,
  LifeBudgetOccurrence,
  LifeEvent,
  LifeRecurrenceType,
} from "@/lib/types/life-plan";

export { publicFeedApi, channelFeedApi, communityApi, freelancerApi } from "./social";
export type { ChannelFeedKind, PublicFeedKind } from "./social-types";

export const lifePlanApi = {
  getBudgetLines: async (params?: { fromIso?: string; toIso?: string }) => {
    try {
      const { listBudgetLines } = await import("@/lib/supabase/life-budget");
      const data = await listBudgetLines(params);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("budgetLoadFailed") };
    }
  },
  addBudgetLine: async (payload: {
    kind: LifeBudgetKind;
    label: string;
    amount: number;
    date: string;
    recurrence?: LifeRecurrence;
  }) => {
    try {
      const { addBudgetLine } = await import("@/lib/supabase/life-budget");
      const line = await addBudgetLine(payload);
      return { data: { line } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("budgetAddFailed") };
    }
  },
  deleteBudgetLine: async (id: string) => {
    try {
      const { deleteBudgetLine } = await import("@/lib/supabase/life-budget");
      const data = await deleteBudgetLine(id);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("budgetDeleteFailed") };
    }
  },
  updateBudgetLine: async (
    id: string,
    payload: {
      kind: LifeBudgetKind;
      label: string;
      amount: number;
      date: string;
      recurrence?: LifeRecurrence;
    }
  ) => {
    try {
      const { updateBudgetLine } = await import("@/lib/supabase/life-budget");
      const line = await updateBudgetLine(id, payload);
      return { data: { line } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("budgetUpdateFailed") };
    }
  },
  getLifeEvents: async (fromIso: string, toIso: string) => {
    try {
      const { getLifeEvents } = await import("@/lib/supabase/calendar");
      const data = await getLifeEvents(fromIso, toIso);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("eventsLoadFailed") };
    }
  },
  addLifeEvent: async (payload: {
    title: string;
    startsAt: string;
    endsAt?: string | null;
    notes?: string;
    category?: LifeEventCategory;
    status?: LifeEventStatus;
    recurrence?: LifeRecurrence;
  }) => {
    try {
      const { addLifeEvent } = await import("@/lib/supabase/calendar");
      const data = await addLifeEvent(payload);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("eventAddFailed") };
    }
  },
  updateLifeEvent: async (
    id: string,
    payload: {
      title: string;
      startsAt: string;
      endsAt?: string | null;
      notes?: string;
      category?: LifeEventCategory;
      status?: LifeEventStatus;
      recurrence?: LifeRecurrence;
    }
  ) => {
    try {
      const { updateLifeEvent } = await import("@/lib/supabase/calendar");
      const data = await updateLifeEvent(id, payload);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("eventUpdateFailed") };
    }
  },
  deleteLifeEvent: async (id: string) => {
    try {
      const { deleteLifeEvent } = await import("@/lib/supabase/calendar");
      const data = await deleteLifeEvent(id);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("eventDeleteFailed") };
    }
  },
};

export const roadmapsApi = {
  list: async (status = "active") => {
    try {
      const { listRoadmaps } = await import("@/lib/supabase/roadmaps");
      const data = await listRoadmaps(status);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("roadmapLoadFailed") };
    }
  },
  get: async (_id: string) => ({ error: "Not implemented" }),
  create: async (payload: { templateKey?: string }) => {
    try {
      if (!payload.templateKey) return { error: trError("templateKeyRequired") };
      const { createFromTemplate } = await import("@/lib/supabase/roadmaps");
      const data = await createFromTemplate(payload.templateKey);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("roadmapCreateFailed") };
    }
  },
  update: async (_id: string, _payload: Record<string, unknown>) => ({ error: "Not implemented" }),
  completeStep: async (roadmapId: string, stepId: string, completed: boolean) => {
    try {
      const { completeStep } = await import("@/lib/supabase/roadmaps");
      await completeStep(roadmapId, stepId, completed);
      return { data: { ok: true } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("stepUpdateFailed") };
    }
  },
  delete: async (_id: string) => ({ error: "Not implemented" }),
};

export const assistantApi = {
  suggest: async (message: string, locale: string) =>
    apiRequest<{ response: string; actions: unknown[]; links: unknown[]; mode: string }>(
      "/api/assistant/actions",
      { method: "POST", body: JSON.stringify({ message, locale }) }
    ),
  execute: async (executeAction: Record<string, unknown>) =>
    apiRequest<{
      ok: boolean;
      roadmapId?: string;
      redirectUrl?: string;
      roadmap?: {
        id: string;
        title: string;
        templateKey?: string;
        progress: number;
        steps: Array<{ id: string; title: string; description?: string; completed: boolean }>;
      };
    }>(
      "/api/assistant/actions",
      { method: "POST", body: JSON.stringify({ executeAction, locale: currentLocale() }) }
    ),
};
