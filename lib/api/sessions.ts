export const sessionApi = {
  getMine: async () => {
    try {
      const { listMySessions } = await import("@/lib/supabase/sessions");
      const sessions = await listMySessions();
      return { data: { sessions } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "세션 목록을 불러오지 못했습니다." };
    }
  },
  create: async (payload: {
    mentorId: string;
    date: string;
    duration?: number;
    type?: "online" | "offline";
    notes?: string;
  }) => {
    try {
      const { bookMentorSession } = await import("@/lib/supabase/sessions");
      const session = await bookMentorSession(payload);
      return { data: { session } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "세션 예약에 실패했습니다." };
    }
  },
  updateStatus: async (sessionId: string, status: "upcoming" | "completed" | "cancelled") => {
    try {
      const { updateSessionStatus } = await import("@/lib/supabase/sessions");
      const session = await updateSessionStatus(sessionId, status);
      return { data: { session } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "세션 상태 변경에 실패했습니다." };
    }
  },
};
