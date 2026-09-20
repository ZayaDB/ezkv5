import { requireAdmin, requireUserId } from "@/lib/supabase/requireUser";

export async function listMyInquiries() {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("user_inquiries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map((row) => ({
    ...mapInquiry(row as Record<string, unknown>),
    status: row.admin_reply ? "answered" : "open",
  }));
}

export async function createInquiry(payload: { subject: string; body: string }) {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("user_inquiries")
    .insert({ user_id: userId, subject: payload.subject, body: payload.body })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapInquiry(data);
}

export async function updateInquiry(id: string, payload: { subject?: string; body?: string }) {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("user_inquiries")
    .update({
      ...(payload.subject !== undefined ? { subject: payload.subject } : {}),
      ...(payload.body !== undefined ? { body: payload.body } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapInquiry(data);
}

export async function deleteInquiry(id: string) {
  const { supabase, userId } = await requireUserId();
  const { error } = await supabase.from("user_inquiries").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function listInquiriesAdmin() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("user_inquiries")
    .select("*, profiles(name, email)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return (data || []).map((row) => {
    const p = row.profiles as { name?: string; email?: string } | null;
    const base = mapInquiry(row);
    return {
      ...base,
      status: base.adminReply ? "answered" : "open",
      adminReply: base.adminReply || "",
      user: p
        ? { id: String(row.user_id), name: p.name || "", email: p.email || "" }
        : { id: String(row.user_id), name: "", email: "" },
    };
  });
}

export async function replyInquiryAdmin(id: string, adminReply: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("user_inquiries")
    .update({ admin_reply: adminReply, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapInquiry(data);
}

function mapInquiry(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    subject: String(row.subject || ""),
    body: String(row.body || ""),
    adminReply: row.admin_reply ? String(row.admin_reply) : undefined,
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
  };
}
