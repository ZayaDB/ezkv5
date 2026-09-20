/** 어드민 — Supabase 전용 */
export const adminApi = {
  getStats: async (period: "all" | "day" | "month" | "year" = "all") => {
    try {
      const { fetchAdminStats } = await import("@/lib/supabase/admin-dashboard");
      const data = await fetchAdminStats(period);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "통계를 불러오지 못했습니다." };
    }
  },
  getUsers: async (params?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const { fetchAdminUsers } = await import("@/lib/supabase/admin-dashboard");
      const data = await fetchAdminUsers(params);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "사용자 목록을 불러오지 못했습니다." };
    }
  },
  getUserDetail: async (userId: string) => {
    try {
      const { fetchAdminUserDetail } = await import("@/lib/supabase/admin-dashboard");
      const data = await fetchAdminUserDetail(userId);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "사용자 정보를 불러오지 못했습니다." };
    }
  },
  createAdminUser: async (_payload: {
    email: string;
    name: string;
    password: string;
    locale?: "kr" | "en" | "mn";
  }) => ({
    error: "Supabase 대시보드에서 사용자를 생성한 뒤 profiles.role을 admin으로 설정해 주세요.",
  }),
  resetUserPassword: async (_payload: { userId: string; newPassword: string }) => ({
    error: "비밀번호 재설정은 Supabase Auth 또는 비밀번호 찾기 기능을 사용해 주세요.",
  }),
  getModerationQueue: async () => {
    try {
      const { getSocialModerationQueue } = await import("@/lib/supabase/admin-social");
      const data = await getSocialModerationQueue();
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "검수 목록을 불러오지 못했습니다." };
    }
  },
  updateModerationStatus: async (payload: {
    type: "community" | "freelancer" | "mentor";
    id: string;
    status: string;
  }) => {
    if (payload.type === "mentor") {
      return { error: "멘토 승인은 Supabase 모더레이션 API를 사용하세요." };
    }
    try {
      const { updateSocialModerationStatus } = await import("@/lib/supabase/admin-social");
      await updateSocialModerationStatus({
        type: payload.type,
        id: payload.id,
        status: payload.status,
      });
      return { data: { ok: true } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "상태 변경에 실패했습니다." };
    }
  },
  getChannelPosts: async (limit?: number) => {
    try {
      const { listChannelPostsForAdmin } = await import("@/lib/supabase/channel-feed");
      const posts = await listChannelPostsForAdmin(limit ?? 80);
      return { data: { posts } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "채널 글 목록을 불러오지 못했습니다." };
    }
  },
  deleteChannelPost: async (postId: string, reason: string) => {
    try {
      const { adminDeleteChannelPost } = await import("@/lib/supabase/channel-feed");
      const res = await adminDeleteChannelPost(postId, reason);
      if ("error" in res && res.error) return { error: res.error };
      return { data: res };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "삭제에 실패했습니다." };
    }
  },
  listInquiries: async () => {
    try {
      const { listInquiriesAdmin } = await import("@/lib/supabase/inquiries");
      const inquiries = await listInquiriesAdmin();
      return { data: { inquiries } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "문의 목록을 불러오지 못했습니다." };
    }
  },
  replyInquiry: async (id: string, adminReply: string) => {
    try {
      const { replyInquiryAdmin } = await import("@/lib/supabase/inquiries");
      const inquiry = await replyInquiryAdmin(id, adminReply);
      return { data: { inquiry } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "답변 등록에 실패했습니다." };
    }
  },
};
