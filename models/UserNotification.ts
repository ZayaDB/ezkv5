import mongoose, { Schema, Document, Types } from "mongoose";

export type UserNotificationKind = "channel_post_removed" | "inquiry_replied";

export interface IUserNotification extends Document {
  userId: Types.ObjectId;
  kind: UserNotificationKind;
  /** 관리자가 입력한 삭제 사유(원문) */
  body: string;
  readAt?: Date | null;
  meta?: {
    postTitle?: string;
    channelType?: "community" | "freelancer";
    channelId?: string;
  };
}

const UserNotificationSchema = new Schema<IUserNotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kind: {
      type: String,
      enum: ["channel_post_removed", "inquiry_replied"],
      required: true,
      index: true,
    },
    body: { type: String, required: true, maxlength: 4000 },
    readAt: { type: Date, default: null },
    meta: {
      postTitle: { type: String },
      channelType: { type: String, enum: ["community", "freelancer"] },
      channelId: { type: String },
      inquiryId: { type: String },
      inquirySubject: { type: String },
    },
  },
  { timestamps: true }
);

UserNotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models?.UserNotification ||
  mongoose.model<IUserNotification>("UserNotification", UserNotificationSchema);
