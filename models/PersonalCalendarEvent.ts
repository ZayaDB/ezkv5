import mongoose, { Schema, Document } from "mongoose";

export type PersonalCalendarEventCategory =
  | "personal"
  | "work"
  | "health"
  | "parttime"
  | "other";
export type PersonalCalendarEventStatus = "planned" | "completed" | "cancelled";
export type PersonalRecurrenceType = "none" | "weekly" | "biweekly" | "monthly";

export interface IPersonalRecurrence {
  type: PersonalRecurrenceType;
  interval?: number;
  until?: Date | null;
}

export interface IPersonalCalendarEvent extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  notes?: string;
  startsAt: Date;
  endsAt?: Date;
  category: PersonalCalendarEventCategory;
  status: PersonalCalendarEventStatus;
  recurrence: IPersonalRecurrence;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalCalendarEventSchema = new Schema<IPersonalCalendarEvent>(
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
    notes: {
      type: String,
      maxlength: 5000,
    },
    startsAt: {
      type: Date,
      required: true,
      index: true,
    },
    endsAt: {
      type: Date,
    },
    category: {
      type: String,
      enum: ["personal", "work", "health", "parttime", "other"],
      default: "other",
      required: true,
    },
    status: {
      type: String,
      enum: ["planned", "completed", "cancelled"],
      default: "planned",
      required: true,
    },
    recurrence: {
      type: {
        type: String,
        enum: ["none", "weekly", "biweekly", "monthly"],
        default: "none",
      },
      interval: {
        type: Number,
        default: 1,
      },
      until: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

PersonalCalendarEventSchema.index({ userId: 1, startsAt: 1 });

export default mongoose.models?.PersonalCalendarEvent ||
  mongoose.model<IPersonalCalendarEvent>("PersonalCalendarEvent", PersonalCalendarEventSchema);
