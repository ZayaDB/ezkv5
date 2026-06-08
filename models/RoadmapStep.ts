import mongoose, { Schema, Document } from "mongoose";

export interface IRoadmapStep extends Document {
  roadmapId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapStepSchema = new Schema<IRoadmapStep>(
  {
    roadmapId: {
      type: Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 300,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

RoadmapStepSchema.index({ roadmapId: 1, sortOrder: 1 });

export default mongoose.models?.RoadmapStep ||
  mongoose.model<IRoadmapStep>("RoadmapStep", RoadmapStepSchema);
