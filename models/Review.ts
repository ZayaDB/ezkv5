import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  mentorId: mongoose.Types.ObjectId;
  menteeId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'Mentor',
      required: true,
    },
    menteeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ mentorId: 1, createdAt: -1 });
ReviewSchema.index({ menteeId: 1 });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

