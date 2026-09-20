/** 멘토·강의 마켓 — Supabase (Mongo `/api/mentors` 미사용) */

export const mentorsApi = {
  getAll: async (params?: {
    category?: string;
    location?: string;
    specialty?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const { listApprovedMentors } = await import("@/lib/supabase/mentors");
      const supabase = createClient();
      const { mentors, total, page, limit } = await listApprovedMentors(supabase, {
        page: params?.page,
        limit: params?.limit,
      });
      let filtered = mentors;
      if (params?.location) {
        const q = params.location.toLowerCase();
        filtered = filtered.filter((m) => m.location.toLowerCase().includes(q));
      }
      if (params?.specialty || params?.category) {
        const q = (params.specialty || params.category || "").toLowerCase();
        filtered = filtered.filter((m) =>
          m.specialties.some((s) => s.toLowerCase().includes(q))
        );
      }
      return {
        data: {
          mentors: filtered,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
        },
      };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "멘토 목록을 불러오지 못했습니다." };
    }
  },

  getById: async (id: string) => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const { getApprovedMentorById } = await import("@/lib/supabase/mentors");
      const supabase = createClient();
      const mentor = await getApprovedMentorById(supabase, id);
      if (!mentor) return { error: "멘토를 찾을 수 없습니다." };
      return { data: mentor };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "멘토 정보를 불러오지 못했습니다." };
    }
  },

  getMine: async () => {
    try {
      const { getMyMentorProfile } = await import("@/lib/supabase/mentors");
      const mentor = await getMyMentorProfile();
      return { data: { mentor } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "멘토 정보를 불러오지 못했습니다." };
    }
  },

  apply: async (payload: {
    title: string;
    location: string;
    bio: string;
    languages?: string[];
    specialties?: string[];
    price?: number | string;
    availability?: string;
    photo?: string;
    sessionDuration?: number;
    sessionFormat?: "online" | "offline" | "both";
    yearsOfExperience?: number;
    education?: string;
    careerSummary?: string;
    responseTime?: string;
    timezone?: string;
    introVideoUrl?: string;
    portfolioLinks?: string[];
    mentoringStyle?: string;
    recommendedFor?: string;
    notRecommendedFor?: string;
  }) => {
    try {
      const { applyMentorProfile } = await import("@/lib/supabase/mentors");
      const data = await applyMentorProfile(payload);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "멘토 신청에 실패했습니다." };
    }
  },
};
