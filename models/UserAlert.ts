import mongoose, { Schema, Document } from "mongoose";

export type UserAlertKind =
  | "visa_expiry"
  | "tuition"
  | "insurance"
  | "roadmap"
  | "custom";
export type UserAlertSeverity = "info" | "warning" | "urgent";

export interface IUserAlert extends Document {
  userId: mongoose.Types.ObjectId;
  kind: UserAlertKind;
  severity: UserAlertSeverity;
  title: string;
  body?: string;
  dueDate?: Date;
  actionUrl?: string;
  dismissedAt?: Date;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const UserAlertSchema = new Schema<IUserAlert>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    kind: {
      type: String,
      enum: ["visa_expiry", "tuition", "insurance", "roadmap", "custom"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "urgent"],
      default: "info",
    },
    title: {
      type: String,
      required: true,
      maxlength: 300,
    },
    body: {
      type: String,
      maxlength: 2000,
    },
    dueDate: {
      type: Date,
    },
    actionUrl: {
      type: String,
      maxlength: 500,
    },
    dismissedAt: {
      type: Date,
    },
    meta: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

UserAlertSchema.index({ userId: 1, dismissedAt: 1, dueDate: 1 });

export default mongoose.models?.UserAlert ||
  mongoose.model<IUserAlert>("UserAlert", UserAlertSchema);
