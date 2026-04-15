import mongoose, { Schema, Document } from "mongoose";

export interface IPersonalCalendarEvent extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  notes?: string;
  startsAt: Date;
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
  },
  { timestamps: true }
);

PersonalCalendarEventSchema.index({ userId: 1, startsAt: 1 });

export default mongoose.models?.PersonalCalendarEvent ||
  mongoose.model<IPersonalCalendarEvent>("PersonalCalendarEvent", PersonalCalendarEventSchema);
