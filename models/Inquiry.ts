import mongoose, { Schema, Document } from "mongoose";

export type InquiryStatus = "open" | "answered";

export interface IInquiry extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  body: string;
  status: InquiryStatus;
  adminReply: string;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "answered"],
      default: "open",
    },
    adminReply: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models?.Inquiry || mongoose.model<IInquiry>("Inquiry", InquirySchema);
