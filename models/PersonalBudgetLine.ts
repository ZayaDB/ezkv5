import mongoose, { Schema, Document } from "mongoose";

export type PersonalBudgetKind = "expense" | "income";
export type PersonalRecurrenceType = "none" | "weekly" | "biweekly" | "monthly";

export interface IPersonalRecurrence {
  type: PersonalRecurrenceType;
  interval?: number;
  until?: Date | null;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
}

export interface IPersonalBudgetLine extends Document {
  userId: mongoose.Types.ObjectId;
  kind: PersonalBudgetKind;
  label: string;
  amount: number;
  date: Date;
  recurrence: IPersonalRecurrence;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalBudgetLineSchema = new Schema<IPersonalBudgetLine>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    kind: {
      type: String,
      enum: ["expense", "income"],
      required: true,
    },
    label: {
      type: String,
      required: true,
      maxlength: 120,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      default: () => new Date(),
      index: true,
    },
    recurrence: {
      type: new Schema(
        {
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
          dayOfWeek: {
            type: Number,
            min: 0,
            max: 6,
            default: null,
          },
          dayOfMonth: {
            type: Number,
            min: 1,
            max: 31,
            default: null,
          },
        },
        { _id: false }
      ),
      default: () => ({ type: "none", interval: 1, until: null, dayOfWeek: null, dayOfMonth: null }),
    },
  },
  { timestamps: true }
);

PersonalBudgetLineSchema.index({ userId: 1, createdAt: -1 });
PersonalBudgetLineSchema.index({ userId: 1, date: 1 });

export default mongoose.models?.PersonalBudgetLine ||
  mongoose.model<IPersonalBudgetLine>("PersonalBudgetLine", PersonalBudgetLineSchema);
