import mongoose, { Schema, Document } from "mongoose";

export type PersonalBudgetKind = "expense" | "income";

export interface IPersonalBudgetLine extends Document {
  userId: mongoose.Types.ObjectId;
  kind: PersonalBudgetKind;
  label: string;
  amount: number;
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
  },
  { timestamps: true }
);

PersonalBudgetLineSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models?.PersonalBudgetLine ||
  mongoose.model<IPersonalBudgetLine>("PersonalBudgetLine", PersonalBudgetLineSchema);
