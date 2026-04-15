import mongoose, { Schema, Document } from "mongoose";

export interface IChannelComment extends Document {
  postId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChannelCommentSchema = new Schema<IChannelComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "ChannelPost",
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    body: {
      type: String,
      required: true,
      maxlength: 5000,
      trim: true,
    },
  },
  { timestamps: true }
);

ChannelCommentSchema.index({ postId: 1, createdAt: 1 });

export default mongoose.models?.ChannelComment ||
  mongoose.model<IChannelComment>("ChannelComment", ChannelCommentSchema);
