import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPublicFeedLike extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
}

const PublicFeedLikeSchema = new Schema<IPublicFeedLike>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "PublicFeedPost", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

PublicFeedLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export default mongoose.models?.PublicFeedLike ||
  mongoose.model<IPublicFeedLike>("PublicFeedLike", PublicFeedLikeSchema);
