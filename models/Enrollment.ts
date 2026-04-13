import mongoose, { Schema, Document } from "mongoose";

export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  lectureId: mongoose.Types.ObjectId;
  status: "active" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  enrolledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lectureId: {
      type: Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "paid",
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

EnrollmentSchema.index({ userId: 1, lectureId: 1 }, { unique: true });

export default mongoose.models?.Enrollment ||
  mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);
