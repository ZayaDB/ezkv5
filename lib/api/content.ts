import { trError } from "@/lib/i18n/runtime";
import { lecturesApi } from "./lectures";

export const contentApi = {
  getLecture: (id: string) => lecturesApi.getById(id),
  getCommunity: async (id: string) => {
    try {
      const { queryCommunityById } = await import("@/lib/supabase/catalog");
      const data = await queryCommunityById(id);
      if (!data) return { error: trError("communityNotFound") };
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("loadFailed") };
    }
  },
  getFreelancer: async (id: string) => {
    try {
      const { queryFreelancerById } = await import("@/lib/supabase/catalog");
      const data = await queryFreelancerById(id);
      if (!data) return { error: trError("freelancerGroupNotFound") };
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("loadFailed") };
    }
  },
  joinCommunity: async (id: string) => {
    try {
      const { joinCommunityGroup } = await import("@/lib/supabase/catalog");
      await joinCommunityGroup(id);
      return { data: { ok: true } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("joinFailed") };
    }
  },
  createCommunityGroup: async (payload: { name: string; description: string; category: string }) => {
    try {
      const { createCommunityGroup } = await import("@/lib/supabase/catalog");
      const data = await createCommunityGroup(payload);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("groupCreateFailed") };
    }
  },
  applyFreelancer: async (id: string) => {
    try {
      const { applyFreelancerGroup } = await import("@/lib/supabase/catalog");
      await applyFreelancerGroup(id);
      return { data: { ok: true } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("applyFailed") };
    }
  },
};
