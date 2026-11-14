import { trError } from "@/lib/i18n/runtime";
/** 어드민 — Supabase 전용 */
export const adminApi = {
  getStats: async (period: "all" | "day" | "month" | "year" = "all") => {
    try {
      const { fetchAdminStats } = await import("@/lib/supabase/admin-dashboard");
      const data = await fetchAdminStats(period);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("statsLoadFailed") };
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
      return { error: e instanceof Error ? e.message : trError("usersLoadFailed") };
    }
  },
  getUserDetail: async (userId: string) => {
    try {
      const { fetchAdminUserDetail } = await import("@/lib/supabase/admin-dashboard");
      const data = await fetchAdminUserDetail(userId);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("userLoadFailed") };
    }
  },
  createAdminUser: async (_payload: {
    email: string;
    name: string;
    password: string;
    locale?: "kr" | "en" | "mn";
  }) => ({
    error: trError("adminCreateUnsupported"),
  }),
  resetUserPassword: async (_payload: { userId: string; newPassword: string }) => ({
    error: trError("passwordResetUnsupported"),
  }),
  getModerationQueue: async () => {
    try {
      const { getSocialModerationQueue } = await import("@/lib/supabase/admin-social");
      const data = await getSocialModerationQueue();
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("moderationLoadFailed") };
    }
  },
  updateModerationStatus: async (payload: {
    type: "community" | "freelancer" | "mentor";
    id: string;
    status: string;
  }) => {
    if (payload.type === "mentor") {
      return { error: trError("mentorApprovalUseModeration") };
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
      return { error: e instanceof Error ? e.message : trError("statusChangeFailed") };
    }
  },
  getChannelPosts: async (limit?: number) => {
    try {
      const { listChannelPostsForAdmin } = await import("@/lib/supabase/channel-feed");
      const posts = await listChannelPostsForAdmin(limit ?? 80);
      return { data: { posts } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("channelPostsLoadFailed") };
    }
  },
  deleteChannelPost: async (postId: string, reason: string) => {
    try {
      const { adminDeleteChannelPost } = await import("@/lib/supabase/channel-feed");
      const res = await adminDeleteChannelPost(postId, reason);
      if ("error" in res && res.error) return { error: res.error };
      return { data: res };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("deleteFailed") };
    }
  },
  listInquiries: async () => {
    try {
      const { listInquiriesAdmin } = await import("@/lib/supabase/inquiries");
      const inquiries = await listInquiriesAdmin();
      return { data: { inquiries } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("inquiriesLoadFailed") };
    }
  },
  replyInquiry: async (id: string, adminReply: string) => {
    try {
      const { replyInquiryAdmin } = await import("@/lib/supabase/inquiries");
      const inquiry = await replyInquiryAdmin(id, adminReply);
      return { data: { inquiry } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("replyFailed") };
    }
  },
};
