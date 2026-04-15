import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPublicFeedComment extends Document {
  postId: Types.ObjectId;
  authorId: Types.ObjectId;
  body: string;
}

const PublicFeedCommentSchema = new Schema<IPublicFeedComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "PublicFeedPost", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    body: { type: String, required: true, maxlength: 5000, trim: true },
  },
  { timestamps: true }
);

PublicFeedCommentSchema.index({ postId: 1, createdAt: 1 });

export default mongoose.models?.PublicFeedComment ||
  mongoose.model<IPublicFeedComment>("PublicFeedComment", PublicFeedCommentSchema);
