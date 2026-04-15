import mongoose, { Schema, Document, Types } from "mongoose";

export type PublicFeedType = "community" | "freelancer";

export interface IPublicFeedPost extends Document {
  feedType: PublicFeedType;
  authorId: Types.ObjectId;
  body: string;
  attachmentUrls: string[];
}

const PublicFeedPostSchema = new Schema<IPublicFeedPost>(
  {
    feedType: {
      type: String,
      enum: ["community", "freelancer"],
      required: true,
      index: true,
    },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    body: { type: String, required: true, maxlength: 20000, trim: true },
    attachmentUrls: { type: [String], default: [] },
  },
  { timestamps: true }
);

PublicFeedPostSchema.index({ feedType: 1, createdAt: -1 });

export default mongoose.models?.PublicFeedPost ||
  mongoose.model<IPublicFeedPost>("PublicFeedPost", PublicFeedPostSchema);
