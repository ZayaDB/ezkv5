import { requireAdmin } from "@/lib/supabase/requireUser";

export async function getSocialModerationQueue() {
  const { supabase } = await requireAdmin();

  const [{ data: communityPending }, { data: freelancerPending }] = await Promise.all([
    supabase
      .from("community_memberships")
      .select("id, created_at, user_id, group_id, profiles(name, email), community_groups(name, category)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("freelancer_applications")
      .select("id, created_at, user_id, group_id, profiles(name, email), freelancer_groups(name, category)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return {
    mentorPending: [] as unknown[],
    communityPending: (communityPending || []).map(mapMembershipQueue),
    freelancerPending: (freelancerPending || []).map(mapFreelancerQueue),
  };
}

function mapMembershipQueue(row: Record<string, unknown>) {
  const p = row.profiles as { name?: string; email?: string } | null;
  const g = row.community_groups as { name?: string; category?: string } | null;
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    user: p
      ? { id: String(row.user_id), name: p.name || "", email: p.email || "" }
      : { id: String(row.user_id), name: "", email: "" },
    group: g
      ? { id: String(row.group_id), name: g.name || "", category: g.category || "" }
      : null,
  };
}

function mapFreelancerQueue(row: Record<string, unknown>) {
  const p = row.profiles as { name?: string; email?: string } | null;
  const g = row.freelancer_groups as { name?: string; category?: string } | null;
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    user: p
      ? { id: String(row.user_id), name: p.name || "", email: p.email || "" }
      : { id: String(row.user_id), name: "", email: "" },
    group: g
      ? { id: String(row.group_id), name: g.name || "", category: g.category || "" }
      : null,
  };
}

export async function updateSocialModerationStatus(payload: {
  type: "community" | "freelancer";
  id: string;
  status: string;
}) {
  const { supabase } = await requireAdmin();

  if (payload.type === "community") {
    if (!["pending", "approved", "rejected"].includes(payload.status)) {
      throw new Error("community status는 pending/approved/rejected만 허용됩니다.");
    }
    const { data: row, error: fetchErr } = await supabase
      .from("community_memberships")
      .select("id, group_id, status")
      .eq("id", payload.id)
      .maybeSingle();
    if (fetchErr || !row) throw new Error("요청 대상을 찾을 수 없습니다.");

    const { error } = await supabase
      .from("community_memberships")
      .update({ status: payload.status, updated_at: new Date().toISOString() })
      .eq("id", payload.id);
    if (error) throw new Error(error.message);

    if (payload.status === "approved" && row.status !== "approved") {
      const { data: g } = await supabase.from("community_groups").select("members").eq("id", row.group_id).single();
      if (g) {
        await supabase
          .from("community_groups")
          .update({ members: (g.members || 0) + 1 })
          .eq("id", row.group_id);
      }
    }
    return { ok: true };
  }

  if (payload.type === "freelancer") {
    if (!["pending", "accepted", "rejected"].includes(payload.status)) {
      throw new Error("freelancer status는 pending/accepted/rejected만 허용됩니다.");
    }
    const { data: row, error: fetchErr } = await supabase
      .from("freelancer_applications")
      .select("id, group_id, status")
      .eq("id", payload.id)
      .maybeSingle();
    if (fetchErr || !row) throw new Error("요청 대상을 찾을 수 없습니다.");

    const { error } = await supabase
      .from("freelancer_applications")
      .update({ status: payload.status, updated_at: new Date().toISOString() })
      .eq("id", payload.id);
    if (error) throw new Error(error.message);

    if (payload.status === "accepted" && row.status !== "accepted") {
      const { data: g } = await supabase.from("freelancer_groups").select("members").eq("id", row.group_id).single();
      if (g) {
        await supabase
          .from("freelancer_groups")
          .update({ members: (g.members || 0) + 1 })
          .eq("id", row.group_id);
      }
    }
    return { ok: true };
  }

  throw new Error("type은 community 또는 freelancer 여야 합니다.");
}
