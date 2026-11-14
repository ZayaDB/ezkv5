import { trError } from "@/lib/i18n/runtime";
export const inquiryApi = {
  list: async () => {
    try {
      const { listMyInquiries } = await import("@/lib/supabase/inquiries");
      const inquiries = await listMyInquiries();
      return { data: { inquiries } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("inquiriesLoadFailed") };
    }
  },
  create: async (payload: { subject: string; body: string }) => {
    try {
      const { createInquiry } = await import("@/lib/supabase/inquiries");
      const inquiry = await createInquiry(payload);
      return { data: { inquiry } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("inquiryCreateFailed") };
    }
  },
  update: async (id: string, payload: { subject?: string; body?: string }) => {
    try {
      const { updateInquiry } = await import("@/lib/supabase/inquiries");
      const inquiry = await updateInquiry(id, payload);
      return { data: { inquiry } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("inquiryUpdateFailed") };
    }
  },
  remove: async (id: string) => {
    try {
      const { deleteInquiry } = await import("@/lib/supabase/inquiries");
      await deleteInquiry(id);
      return { data: { ok: true } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : trError("inquiryDeleteFailed") };
    }
  },
};
