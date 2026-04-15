import mongoose from "mongoose";
import PublicFeedPost, { type PublicFeedType } from "@/models/PublicFeedPost";
import PublicFeedComment from "@/models/PublicFeedComment";
import PublicFeedLike from "@/models/PublicFeedLike";

function oid(id: string) {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
}

function asFeedType(v: string): PublicFeedType | null {
  if (v === "community" || v === "freelancer") return v;
  return null;
}

export async function listPublicFeed(
  feedTypeRaw: string,
  opts?: { viewerUserId?: string; limit?: number }
) {
  const feedType = asFeedType(feedTypeRaw);
  if (!feedType) return { error: "잘못된 피드입니다." };
  const limit = Math.min(80, Math.max(1, opts?.limit ?? 40));
  const rows = await PublicFeedPost.find({ feedType })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("authorId", "name")
    .lean();

  const viewer = opts?.viewerUserId ? oid(opts.viewerUserId) : null;

  const posts = await Promise.all(
    (rows as any[]).map(async (r) => {
      const pid = r._id as mongoose.Types.ObjectId;
      const [commentCount, likeCount, liked] = await Promise.all([
        PublicFeedComment.countDocuments({ postId: pid }),
        PublicFeedLike.countDocuments({ postId: pid }),
        viewer
          ? PublicFeedLike.exists({ postId: pid, userId: viewer })
          : Promise.resolve(null),
      ]);
      const aid = r.authorId;
      return {
        id: String(r._id),
        feedType: r.feedType,
        body: r.body,
        attachmentUrls: Array.isArray(r.attachmentUrls) ? r.attachmentUrls.slice(0, 10) : [],
        createdAt: r.createdAt,
        author: {
          id: aid?._id ? String(aid._id) : String(r.authorId),
          name: aid?.name || "User",
        },
        commentCount,
        likeCount,
        likedByMe: Boolean(liked),
      };
    })
  );

  return { posts };
}

export async function createPublicFeedPost(
  userId: string,
  feedTypeRaw: string,
  body: string,
  attachmentUrls: string[]
) {
  const feedType = asFeedType(feedTypeRaw);
  if (!feedType) return { error: "잘못된 피드입니다." };
  const uid = oid(userId);
  if (!uid) return { error: "로그인이 필요합니다." };
  const text = body.trim();
  if (!text) return { error: "내용을 입력해 주세요." };
  const urls = (attachmentUrls || [])
    .map((u) => String(u).trim())
    .filter(Boolean)
    .slice(0, 10);
  const doc = await PublicFeedPost.create({
    feedType,
    authorId: uid,
    body: text.slice(0, 20000),
    attachmentUrls: urls,
  });
  return { post: { id: String(doc._id) } };
}

export async function listPublicFeedComments(postId: string) {
  const pid = oid(postId);
  if (!pid) return { error: "잘못된 글입니다." };
  const rows = await PublicFeedComment.find({ postId: pid })
    .sort({ createdAt: 1 })
    .limit(200)
    .populate("authorId", "name")
    .lean();
  return {
    comments: (rows as any[]).map((r) => ({
      id: String(r._id),
      body: r.body,
      createdAt: r.createdAt,
      author: {
        id: r.authorId?._id ? String(r.authorId._id) : String(r.authorId),
        name: r.authorId?.name || "User",
      },
    })),
  };
}

export async function addPublicFeedComment(userId: string, postId: string, body: string) {
  const pid = oid(postId);
  const uid = oid(userId);
  if (!pid || !uid) return { error: "요청이 올바르지 않습니다." };
  const post = await PublicFeedPost.findById(pid).lean();
  if (!post) return { error: "글을 찾을 수 없습니다." };
  const text = body.trim();
  if (!text) return { error: "댓글을 입력해 주세요." };
  await PublicFeedComment.create({
    postId: pid,
    authorId: uid,
    body: text.slice(0, 5000),
  });
  return { ok: true };
}

export async function togglePublicFeedLike(userId: string, postId: string) {
  const pid = oid(postId);
  const uid = oid(userId);
  if (!pid || !uid) return { error: "요청이 올바르지 않습니다." };
  const post = await PublicFeedPost.findById(pid).lean();
  if (!post) return { error: "글을 찾을 수 없습니다." };
  const existing = await PublicFeedLike.findOne({ postId: pid, userId: uid }).lean();
  if (existing) {
    await PublicFeedLike.deleteOne({ _id: (existing as any)._id });
  } else {
    try {
      await PublicFeedLike.create({ postId: pid, userId: uid });
    } catch {
      /* duplicate race */
    }
  }
  const likeCount = await PublicFeedLike.countDocuments({ postId: pid });
  const likedByMe = Boolean(await PublicFeedLike.exists({ postId: pid, userId: uid }));
  return { ok: true, likeCount, likedByMe };
}
