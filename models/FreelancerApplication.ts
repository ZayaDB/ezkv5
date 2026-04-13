import mongoose, { Schema, Document } from "mongoose";

export interface IFreelancerApplication extends Document {
  userId: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const FreelancerApplicationSchema = new Schema<IFreelancerApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "FreelancerGroup",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

FreelancerApplicationSchema.index({ userId: 1, groupId: 1 }, { unique: true });

export default mongoose.models?.FreelancerApplication ||
  mongoose.model<IFreelancerApplication>("FreelancerApplication", FreelancerApplicationSchema);
