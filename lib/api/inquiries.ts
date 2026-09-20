export const inquiryApi = {
  list: async () => {
    try {
      const { listMyInquiries } = await import("@/lib/supabase/inquiries");
      const inquiries = await listMyInquiries();
      return { data: { inquiries } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "문의 목록을 불러오지 못했습니다." };
    }
  },
  create: async (payload: { subject: string; body: string }) => {
    try {
      const { createInquiry } = await import("@/lib/supabase/inquiries");
      const inquiry = await createInquiry(payload);
      return { data: { inquiry } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "문의 등록에 실패했습니다." };
    }
  },
  update: async (id: string, payload: { subject?: string; body?: string }) => {
    try {
      const { updateInquiry } = await import("@/lib/supabase/inquiries");
      const inquiry = await updateInquiry(id, payload);
      return { data: { inquiry } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "문의 수정에 실패했습니다." };
    }
  },
  remove: async (id: string) => {
    try {
      const { deleteInquiry } = await import("@/lib/supabase/inquiries");
      await deleteInquiry(id);
      return { data: { ok: true } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "문의 삭제에 실패했습니다." };
    }
  },
};
