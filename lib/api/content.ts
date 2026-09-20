import { lecturesApi } from "./lectures";

export const contentApi = {
  getLecture: (id: string) => lecturesApi.getById(id),
  getCommunity: async (id: string) => {
    try {
      const { queryCommunityById } = await import("@/lib/supabase/catalog");
      const data = await queryCommunityById(id);
      if (!data) return { error: "커뮤니티를 찾을 수 없습니다." };
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "불러오지 못했습니다." };
    }
  },
  getFreelancer: async (id: string) => {
    try {
      const { queryFreelancerById } = await import("@/lib/supabase/catalog");
      const data = await queryFreelancerById(id);
      if (!data) return { error: "프리랜서 그룹을 찾을 수 없습니다." };
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "불러오지 못했습니다." };
    }
  },
  joinCommunity: async (id: string) => {
    try {
      const { joinCommunityGroup } = await import("@/lib/supabase/catalog");
      await joinCommunityGroup(id);
      return { data: { ok: true } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "가입 신청에 실패했습니다." };
    }
  },
  applyFreelancer: async (id: string) => {
    try {
      const { applyFreelancerGroup } = await import("@/lib/supabase/catalog");
      await applyFreelancerGroup(id);
      return { data: { ok: true } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "신청에 실패했습니다." };
    }
  },
};
