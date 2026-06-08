import mongoose, { Schema, Document } from "mongoose";

export type RoadmapStatus = "active" | "completed" | "archived";
export type RoadmapPriority = "low" | "medium" | "high";

export interface IRoadmap extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  progress: number;
  priority: RoadmapPriority;
  dueDate?: Date;
  status: RoadmapStatus;
  templateKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapSchema = new Schema<IRoadmap>(
  {
    userId: {
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
    description: {
      type: String,
      maxlength: 2000,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
      index: true,
    },
    templateKey: {
      type: String,
      maxlength: 80,
    },
  },
  { timestamps: true }
);

RoadmapSchema.index({ userId: 1, status: 1 });

export default mongoose.models?.Roadmap || mongoose.model<IRoadmap>("Roadmap", RoadmapSchema);
