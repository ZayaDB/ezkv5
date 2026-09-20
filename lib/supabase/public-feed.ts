import { createClient } from "@/lib/supabase/client";
import { fetchPublicProfiles } from "@/lib/supabase/publicProfiles";
import { requireUserId } from "@/lib/supabase/requireUser";

export type PublicFeedType = "community" | "freelancer";

function asFeedType(v: string): PublicFeedType | null {
  return v === "community" || v === "freelancer" ? v : null;
}

export async function listPublicFeed(
  feedTypeRaw: string,
  opts?: { viewerUserId?: string; limit?: number }
) {
  const feedType = asFeedType(feedTypeRaw);
  if (!feedType) return { error: "잘못된 피드입니다." };

  const supabase = createClient();
  const limit = Math.min(80, Math.max(1, opts?.limit ?? 40));
  const { data: rows, error } = await supabase
    .from("public_feed_posts")
    .select("id, feed_type, body, attachment_urls, created_at, author_id")
    .eq("feed_type", feedType)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { error: error.message };
  const feedRows = rows || [];
  const postIds = feedRows.map((r) => r.id);
  if (!postIds.length) return { posts: [] };

  const profileMap = await fetchPublicProfiles(
    supabase,
    feedRows.map((r) => String(r.author_id))
  );

  const [{ data: comments }, { data: likes }] = await Promise.all([
    supabase.from("public_feed_comments").select("post_id").in("post_id", postIds),
    supabase.from("public_feed_likes").select("post_id, user_id").in("post_id", postIds),
  ]);

  const commentCount = new Map<string, number>();
  for (const c of comments || []) {
    commentCount.set(c.post_id, (commentCount.get(c.post_id) || 0) + 1);
  }
  const likeCount = new Map<string, number>();
  const likedSet = new Set<string>();
  for (const l of likes || []) {
    likeCount.set(l.post_id, (likeCount.get(l.post_id) || 0) + 1);
    if (opts?.viewerUserId && l.user_id === opts.viewerUserId) {
      likedSet.add(l.post_id);
    }
  }

  const posts = feedRows.map((r) => {
    const name = profileMap.get(String(r.author_id))?.name || "User";
    return {
      id: String(r.id),
      feedType: r.feed_type,
      body: r.body,
      attachmentUrls: Array.isArray(r.attachment_urls) ? r.attachment_urls.slice(0, 10) : [],
      createdAt: r.created_at,
      author: { id: String(r.author_id), name },
      commentCount: commentCount.get(r.id) || 0,
      likeCount: likeCount.get(r.id) || 0,
      likedByMe: likedSet.has(r.id),
    };
  });

  return { posts };
}

export async function createPublicFeedPost(
  feedTypeRaw: string,
  body: string,
  attachmentUrls: string[]
) {
  const feedType = asFeedType(feedTypeRaw);
  if (!feedType) return { error: "잘못된 피드입니다." };
  const { supabase, userId } = await requireUserId();
  const text = body.trim();
  if (!text) return { error: "내용을 입력해 주세요." };
  const urls = (attachmentUrls || []).map((u) => String(u).trim()).filter(Boolean).slice(0, 10);

  const { data, error } = await supabase
    .from("public_feed_posts")
    .insert({
      feed_type: feedType,
      author_id: userId,
      body: text.slice(0, 20000),
      attachment_urls: urls,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { post: { id: String(data.id) } };
}

export async function listPublicFeedComments(postId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("public_feed_comments")
    .select("id, body, created_at, author_id")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) return { error: error.message };
  const commentRows = data || [];
  const profileMap = await fetchPublicProfiles(
    supabase,
    commentRows.map((r) => String(r.author_id))
  );
  return {
    comments: commentRows.map((r) => {
      const name = profileMap.get(String(r.author_id))?.name || "User";
      return {
        id: String(r.id),
        body: r.body,
        createdAt: r.created_at,
        author: { id: String(r.author_id), name },
      };
    }),
  };
}

export async function addPublicFeedComment(postId: string, body: string) {
  const { supabase, userId } = await requireUserId();
  const { data: post } = await supabase.from("public_feed_posts").select("id").eq("id", postId).maybeSingle();
  if (!post) return { error: "글을 찾을 수 없습니다." };
  const text = body.trim();
  if (!text) return { error: "댓글을 입력해 주세요." };

  const { error } = await supabase.from("public_feed_comments").insert({
    post_id: postId,
    author_id: userId,
    body: text.slice(0, 5000),
  });
  if (error) return { error: error.message };
  return { ok: true as const };
}

export async function togglePublicFeedLike(postId: string) {
  const { supabase, userId } = await requireUserId();
  const { data: post } = await supabase.from("public_feed_posts").select("id").eq("id", postId).maybeSingle();
  if (!post) return { error: "글을 찾을 수 없습니다." };

  const { data: existing } = await supabase
    .from("public_feed_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase.from("public_feed_likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("public_feed_likes").insert({ post_id: postId, user_id: userId });
  }

  const { count } = await supabase
    .from("public_feed_likes")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  const { data: liked } = await supabase
    .from("public_feed_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  return { ok: true as const, likeCount: count || 0, likedByMe: Boolean(liked) };
}
