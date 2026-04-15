import mongoose from "mongoose";
import UserNotification from "@/models/UserNotification";

function oid(id: string) {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
}

export async function createInquiryRepliedNotification(params: {
  userId: string;
  inquiryId: string;
  subject: string;
  replyPreview: string;
}) {
  const uid = oid(params.userId);
  if (!uid) return;
  const body = params.replyPreview.trim().slice(0, 4000);
  if (!body) return;
  await UserNotification.create({
    userId: uid,
    kind: "inquiry_replied",
    body,
    meta: {
      inquiryId: params.inquiryId,
      inquirySubject: params.subject.slice(0, 200),
    },
  });
}

export async function createChannelPostRemovedNotification(params: {
  userId: string;
  reason: string;
  postTitle: string;
  channelType: "community" | "freelancer";
  channelId: string;
}) {
  const uid = oid(params.userId);
  if (!uid) return;
  const reason = params.reason.trim().slice(0, 4000);
  if (!reason) return;
  await UserNotification.create({
    userId: uid,
    kind: "channel_post_removed",
    body: reason,
    meta: {
      postTitle: params.postTitle.slice(0, 200),
      channelType: params.channelType,
      channelId: params.channelId,
    },
  });
}

export async function listNotificationsForUser(userId: string, limit = 50) {
  const uid = oid(userId);
  if (!uid) return { items: [] as any[], unreadCount: 0 };
  const [items, unreadCount] = await Promise.all([
    UserNotification.find({ userId: uid })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    UserNotification.countDocuments({ userId: uid, readAt: null }),
  ]);
  return {
    items: items.map((r: any) => ({
      id: String(r._id),
      kind: r.kind,
      body: r.body,
      readAt: r.readAt ? new Date(r.readAt).toISOString() : null,
      createdAt: new Date(r.createdAt).toISOString(),
      meta: r.meta || {},
    })),
    unreadCount,
  };
}

export async function markNotificationsRead(userId: string, ids?: string[]) {
  const uid = oid(userId);
  if (!uid) return { modified: 0 };
  const filter: Record<string, unknown> = { userId: uid, readAt: null };
  if (ids?.length) {
    const oids = ids.map((id) => oid(id)).filter(Boolean) as mongoose.Types.ObjectId[];
    if (!oids.length) return { modified: 0 };
    filter._id = { $in: oids };
  }
  const res = await UserNotification.updateMany(filter, { $set: { readAt: new Date() } });
  return { modified: res.modifiedCount ?? 0 };
}
