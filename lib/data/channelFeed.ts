import mongoose from "mongoose";
import ChannelPost, { type ChannelKind } from "@/models/ChannelPost";
import ChannelComment from "@/models/ChannelComment";
import CommunityMembership from "@/models/CommunityMembership";
import FreelancerApplication from "@/models/FreelancerApplication";
import CommunityGroup from "@/models/CommunityGroup";
import FreelancerGroup from "@/models/FreelancerGroup";
import { createChannelPostRemovedNotification } from "@/lib/data/userNotifications";

function oid(id: string) {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
}

export async function assertCanPostToChannel(
  userId: string,
  channelType: ChannelKind,
  channelId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const gid = oid(channelId);
  if (!gid) return { ok: false, message: "잘못된 그룹입니다." };
  const uid = oid(userId);
  if (!uid) return { ok: false, message: "잘못된 사용자입니다." };

  if (channelType === "community") {
    const m = await CommunityMembership.findOne({
      userId: uid,
      groupId: gid,
      status: "approved",
    }).lean();
    if (!m) {
      return {
        ok: false,
        message: "커뮤니티에 가입한 뒤 글을 작성할 수 있습니다.",
      };
    }
    return { ok: true };
  }

  const a = await FreelancerApplication.findOne({
    userId: uid,
    groupId: gid,
    status: "accepted",
  }).lean();
  if (!a) {
    return {
      ok: false,
      message: "프리랜서 그룹에 참여한 뒤 글을 작성할 수 있습니다.",
    };
  }
  return { ok: true };
}

export async function listPosts(channelType: ChannelKind, channelId: string) {
  const gid = oid(channelId);
  if (!gid) return [];
  const rows = await ChannelPost.find({ channelType, channelId: gid })
    .sort({ createdAt: -1 })
    .limit(80)
    .populate("authorId", "name")
    .lean();
  return rows.map((r: any) => ({
    id: String(r._id),
    title: r.title,
    body: r.body,
    createdAt: r.createdAt,
    author: {
      id: r.authorId?._id ? String(r.authorId._id) : String(r.authorId),
      name: r.authorId?.name || "User",
    },
  }));
}

export async function createPost(
  userId: string,
  channelType: ChannelKind,
  channelId: string,
  title: string,
  body: string
) {
  const gate = await assertCanPostToChannel(userId, channelType, channelId);
  if (!gate.ok) return { error: gate.message };

  const gid = oid(channelId);
  const uid = oid(userId);
  if (!gid || !uid) return { error: "요청이 올바르지 않습니다." };

  const doc = await ChannelPost.create({
    channelType,
    channelId: gid,
    authorId: uid,
    title: title.trim().slice(0, 200),
    body: body.trim().slice(0, 20000),
  });
  return { post: { id: String(doc._id) } };
}

export async function getPostForChannel(
  channelType: ChannelKind,
  channelId: string,
  postId: string
) {
  const gid = oid(channelId);
  const pid = oid(postId);
  if (!gid || !pid) return null;
  return ChannelPost.findOne({
    _id: pid,
    channelType,
    channelId: gid,
  })
    .populate("authorId", "name")
    .lean();
}

export async function listComments(postId: string) {
  const pid = oid(postId);
  if (!pid) return [];
  const rows = await ChannelComment.find({ postId: pid })
    .sort({ createdAt: 1 })
    .limit(200)
    .populate("authorId", "name")
    .lean();
  return rows.map((r: any) => ({
    id: String(r._id),
    body: r.body,
    createdAt: r.createdAt,
    author: {
      id: r.authorId?._id ? String(r.authorId._id) : String(r.authorId),
      name: r.authorId?.name || "User",
    },
  }));
}

export async function addComment(
  userId: string,
  channelType: ChannelKind,
  channelId: string,
  postId: string,
  body: string
) {
  const post = await getPostForChannel(channelType, channelId, postId);
  if (!post) return { error: "글을 찾을 수 없습니다." };

  const gate = await assertCanPostToChannel(userId, channelType, channelId);
  if (!gate.ok) {
    return {
      error: gate.message || "댓글을 작성할 수 없습니다.",
    };
  }

  const uid = oid(userId);
  const pid = oid(postId);
  if (!uid || !pid) return { error: "요청이 올바르지 않습니다." };

  await ChannelComment.create({
    postId: pid,
    authorId: uid,
    body: body.trim().slice(0, 5000),
  });
  return { ok: true };
}

export async function listChannelPostsForAdmin(limit = 80) {
  const rows = await ChannelPost.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("authorId", "name email")
    .lean();

  const out: {
    id: string;
    channelType: ChannelKind;
    channelId: string;
    groupName: string;
    title: string;
    bodyPreview: string;
    createdAt: Date;
    author: { id: string; name: string; email: string };
  }[] = [];

  for (const r of rows as any[]) {
    const channelType = r.channelType as ChannelKind;
    const channelId = String(r.channelId);
    let groupName = "";
    if (channelType === "community") {
      const g = await CommunityGroup.findById(r.channelId).select("name").lean();
      groupName = (g as any)?.name || "";
    } else {
      const g = await FreelancerGroup.findById(r.channelId).select("name").lean();
      groupName = (g as any)?.name || "";
    }
    const aid = r.authorId;
    out.push({
      id: String(r._id),
      channelType,
      channelId,
      groupName,
      title: r.title,
      bodyPreview: String(r.body || "").slice(0, 240),
      createdAt: r.createdAt,
      author: {
        id: aid?._id ? String(aid._id) : String(r.authorId),
        name: aid?.name || "User",
        email: aid?.email || "",
      },
    });
  }
  return out;
}

export async function adminDeleteChannelPost(postId: string, reason: string) {
  const pid = oid(postId);
  if (!pid) return { error: "잘못된 글입니다." };
  const reasonTrim = reason.trim();
  if (!reasonTrim) return { error: "삭제 사유를 입력해 주세요." };

  const post = await ChannelPost.findById(pid).lean();
  if (!post) return { error: "글을 찾을 수 없습니다." };

  const authorId = String((post as any).authorId);
  const title = String((post as any).title || "");
  const channelType = (post as any).channelType as ChannelKind;
  const channelId = String((post as any).channelId);

  await ChannelComment.deleteMany({ postId: pid });
  await ChannelPost.deleteOne({ _id: pid });

  await createChannelPostRemovedNotification({
    userId: authorId,
    reason: reasonTrim,
    postTitle: title,
    channelType,
    channelId,
  });

  return { ok: true };
}
