import mongoose, { Schema, Document } from "mongoose";

export interface ICommunityMembership extends Document {
  userId: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  status: "pending" | "approved";
  createdAt: Date;
  updatedAt: Date;
}

const CommunityMembershipSchema = new Schema<ICommunityMembership>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "CommunityGroup",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

CommunityMembershipSchema.index({ userId: 1, groupId: 1 }, { unique: true });

export default mongoose.models?.CommunityMembership ||
  mongoose.model<ICommunityMembership>("CommunityMembership", CommunityMembershipSchema);
