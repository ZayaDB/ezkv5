import mongoose, { Schema, Document } from "mongoose";

export type ChannelKind = "community" | "freelancer";

export interface IChannelPost extends Document {
  channelType: ChannelKind;
  channelId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChannelPostSchema = new Schema<IChannelPost>(
  {
    channelType: {
      type: String,
      enum: ["community", "freelancer"],
      required: true,
      index: true,
    },
    channelId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      maxlength: 20000,
    },
  },
  { timestamps: true }
);

ChannelPostSchema.index({ channelType: 1, channelId: 1, createdAt: -1 });

export default mongoose.models?.ChannelPost ||
  mongoose.model<IChannelPost>("ChannelPost", ChannelPostSchema);
