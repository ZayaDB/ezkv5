import { trError } from "@/lib/i18n/runtime";
import { createClient } from "@/lib/supabase/client";
import { currentLocale } from "@/lib/i18n/runtime";
import { requireUserId } from "@/lib/supabase/requireUser";
import {
  queryCommunityByIdWith,
  queryCommunityGroupsWith,
  queryFreelancerByIdWith,
  queryFreelancerGroupsWith,
  queryStudyInfosWith,
} from "@/lib/supabase/catalog-core";

export async function queryCommunityGroups(options?: { category?: string; limit?: number }) {
  return queryCommunityGroupsWith(createClient(), { locale: currentLocale(), ...options });
}

export async function queryCommunityById(id: string) {
  return queryCommunityByIdWith(createClient(), id, currentLocale());
}

export async function queryFreelancerGroups(options?: { category?: string; limit?: number }) {
  return queryFreelancerGroupsWith(createClient(), { locale: currentLocale(), ...options });
}

export async function queryFreelancerById(id: string) {
  return queryFreelancerByIdWith(createClient(), id, currentLocale());
}

export async function queryStudyInfos(options?: { category?: import("@/types").StudyInfo["category"] }) {
  return queryStudyInfosWith(createClient(), { locale: currentLocale(), ...options });
}

export async function joinCommunityGroup(groupId: string) {
  const { supabase, userId } = await requireUserId();
  const { data: group } = await supabase.from("community_groups").select("id").eq("id", groupId).maybeSingle();
  if (!group) throw new Error(trError("communityNotFound"));

  const { data: existing } = await supabase
    .from("community_memberships")
    .select("id")
    .eq("user_id", userId)
    .eq("group_id", groupId)
    .maybeSingle();
  if (existing) {
    await supabase
      .from("community_memberships")
      .update({ status: "approved" })
      .eq("id", existing.id);
    return { ok: true as const };
  }

  const { error } = await supabase.from("community_memberships").insert({
    user_id: userId,
    group_id: groupId,
    status: "approved",
  });
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function createCommunityGroup(payload: {
  name: string;
  description: string;
  category: string;
}) {
  const { supabase, userId } = await requireUserId();
  const name = payload.name.trim().slice(0, 80);
  const description = payload.description.trim().slice(0, 500);
  const category = payload.category.trim().slice(0, 40) || "모임";
  if (!name) throw new Error(trError("groupNameRequired"));

  const { data, error } = await supabase
    .from("community_groups")
    .insert({
      name,
      description: description || name,
      category,
      created_by: userId,
      members: 1,
      tags: [],
      image: "",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const { error: memError } = await supabase.from("community_memberships").insert({
    user_id: userId,
    group_id: data.id,
    status: "approved",
  });
  if (memError) throw new Error(memError.message);

  return { id: String(data.id) };
}

export async function applyFreelancerGroup(groupId: string) {
  const { supabase, userId } = await requireUserId();
  const { data: group } = await supabase.from("freelancer_groups").select("id").eq("id", groupId).maybeSingle();
  if (!group) throw new Error(trError("freelancerGroupNotFound"));

  const { data: existing } = await supabase
    .from("freelancer_applications")
    .select("id")
    .eq("user_id", userId)
    .eq("group_id", groupId)
    .maybeSingle();
  if (existing) return { ok: true as const };

  const { error } = await supabase.from("freelancer_applications").insert({
    user_id: userId,
    group_id: groupId,
    status: "pending",
  });
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function listMyCommunityMemberships() {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("community_memberships")
    .select("id, status, created_at, group_id, community_groups(id, name, category, image, members)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((row) => {
    const rawG = row.community_groups as Record<string, unknown> | Record<string, unknown>[] | null;
    const g = Array.isArray(rawG) ? rawG[0] : rawG;
    return {
      id: String(row.id),
      status: row.status,
      group: g
        ? {
            id: String(g.id),
            name: String(g.name || ""),
            category: String(g.category || ""),
            image: String(g.image || ""),
            members: Number(g.members) || 0,
          }
        : null,
    };
  });
}

export async function listMyFreelancerApplications() {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("freelancer_applications")
    .select("id, status, created_at, group_id, freelancer_groups(id, name, category, image, members)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((row) => {
    const rawG = row.freelancer_groups as Record<string, unknown> | Record<string, unknown>[] | null;
    const g = Array.isArray(rawG) ? rawG[0] : rawG;
    return {
      id: String(row.id),
      status: row.status,
      group: g
        ? {
            id: String(g.id),
            name: String(g.name || ""),
            category: String(g.category || ""),
            image: String(g.image || ""),
            members: Number(g.members) || 0,
          }
        : null,
    };
  });
}
