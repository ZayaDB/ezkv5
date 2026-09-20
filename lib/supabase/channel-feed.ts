import { createClient } from "@/lib/supabase/client";
import { requireAdmin, requireUserId } from "@/lib/supabase/requireUser";
import { createUserAlert } from "@/lib/supabase/notifications";

export type ChannelKind = "community" | "freelancer";

async function assertCanPostToChannel(userId: string, channelType: ChannelKind, channelId: string) {
  const supabase = createClient();
  if (channelType === "community") {
    const { data } = await supabase
      .from("community_memberships")
      .select("id")
      .eq("user_id", userId)
      .eq("group_id", channelId)
      .eq("status", "approved")
      .maybeSingle();
    if (!data) return { ok: false as const, message: "커뮤니티에 가입한 뒤 글을 작성할 수 있습니다." };
    return { ok: true as const };
  }
  const { data } = await supabase
    .from("freelancer_applications")
    .select("id")
    .eq("user_id", userId)
    .eq("group_id", channelId)
    .eq("status", "accepted")
    .maybeSingle();
  if (!data) return { ok: false as const, message: "프리랜서 그룹에 참여한 뒤 글을 작성할 수 있습니다." };
  return { ok: true as const };
}

export async function listChannelPosts(channelType: ChannelKind, channelId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("channel_posts")
    .select("id, title, body, created_at, author_id, profiles(name)")
    .eq("channel_type", channelType)
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) throw new Error(error.message);
  return (data || []).map((r) => {
    const p = r.profiles as { name?: string } | null;
    return {
      id: String(r.id),
      title: r.title,
      body: r.body,
      createdAt: r.created_at,
      author: { id: String(r.author_id), name: p?.name || "User" },
    };
  });
}

export async function createChannelPost(
  channelType: ChannelKind,
  channelId: string,
  title: string,
  body: string
) {
  const { supabase, userId } = await requireUserId();
  const gate = await assertCanPostToChannel(userId, channelType, channelId);
  if (!gate.ok) return { error: gate.message };

  const { data, error } = await supabase
    .from("channel_posts")
    .insert({
      channel_type: channelType,
      channel_id: channelId,
      author_id: userId,
      title: title.trim().slice(0, 200),
      body: body.trim().slice(0, 20000),
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { post: { id: String(data.id) } };
}

export async function listChannelComments(postId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("channel_comments")
    .select("id, body, created_at, author_id, profiles(name)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) throw new Error(error.message);
  return (data || []).map((r) => {
    const p = r.profiles as { name?: string } | null;
    return {
      id: String(r.id),
      body: r.body,
      createdAt: r.created_at,
      author: { id: String(r.author_id), name: p?.name || "User" },
    };
  });
}

export async function addChannelComment(
  channelType: ChannelKind,
  channelId: string,
  postId: string,
  body: string
) {
  const { supabase, userId } = await requireUserId();
  const { data: post } = await supabase
    .from("channel_posts")
    .select("id")
    .eq("id", postId)
    .eq("channel_type", channelType)
    .eq("channel_id", channelId)
    .maybeSingle();
  if (!post) return { error: "글을 찾을 수 없습니다." };

  const gate = await assertCanPostToChannel(userId, channelType, channelId);
  if (!gate.ok) return { error: gate.message || "댓글을 작성할 수 없습니다." };

  const { error } = await supabase.from("channel_comments").insert({
    post_id: postId,
    author_id: userId,
    body: body.trim().slice(0, 5000),
  });
  if (error) return { error: error.message };
  return { ok: true as const };
}

export async function listChannelPostsForAdmin(limit = 80) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("channel_posts")
    .select("id, channel_type, channel_id, title, body, created_at, author_id, profiles(name, email)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  const rows = data || [];
  const communityIds = [...new Set(rows.filter((r) => r.channel_type === "community").map((r) => r.channel_id))];
  const freelancerIds = [...new Set(rows.filter((r) => r.channel_type === "freelancer").map((r) => r.channel_id))];

  const [{ data: commGroups }, { data: freeGroups }] = await Promise.all([
    communityIds.length
      ? supabase.from("community_groups").select("id, name").in("id", communityIds)
      : Promise.resolve({ data: [] }),
    freelancerIds.length
      ? supabase.from("freelancer_groups").select("id, name").in("id", freelancerIds)
      : Promise.resolve({ data: [] }),
  ]);

  const nameMap = new Map<string, string>();
  for (const g of commGroups || []) nameMap.set(String(g.id), String(g.name));
  for (const g of freeGroups || []) nameMap.set(String(g.id), String(g.name));

  return rows.map((r) => {
    const p = r.profiles as { name?: string; email?: string } | null;
    return {
      id: String(r.id),
      channelType: r.channel_type as ChannelKind,
      channelId: String(r.channel_id),
      groupName: nameMap.get(String(r.channel_id)) || "",
      title: r.title,
      bodyPreview: String(r.body || "").slice(0, 240),
      createdAt: r.created_at,
      author: {
        id: String(r.author_id),
        name: p?.name || "User",
        email: p?.email || "",
      },
    };
  });
}

export async function adminDeleteChannelPost(postId: string, reason: string) {
  const { supabase } = await requireAdmin();
  const reasonTrim = reason.trim();
  if (!reasonTrim) return { error: "삭제 사유를 입력해 주세요." };

  const { data: post } = await supabase
    .from("channel_posts")
    .select("id, title, author_id, channel_type, channel_id")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return { error: "글을 찾을 수 없습니다." };

  await supabase.from("channel_comments").delete().eq("post_id", postId);
  const { error } = await supabase.from("channel_posts").delete().eq("id", postId);
  if (error) return { error: error.message };

  await createUserAlert({
    userId: post.author_id,
    kind: "channel_post_removed",
    title: "게시글이 관리자에 의해 삭제되었습니다",
    message: reasonTrim,
    severity: "warning",
    actionUrl:
      post.channel_type === "community"
        ? `/community/${post.channel_id}`
        : `/freelancers/${post.channel_id}`,
  });

  return { ok: true as const };
}
