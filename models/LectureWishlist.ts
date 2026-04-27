import mongoose, { Schema, Document } from 'mongoose';

export interface ILectureWishlist extends Document {
  userId: mongoose.Types.ObjectId;
  lectureId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LectureWishlistSchema = new Schema<ILectureWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lectureId: {
      type: Schema.Types.ObjectId,
      ref: 'Lecture',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

LectureWishlistSchema.index({ userId: 1, lectureId: 1 }, { unique: true });
LectureWishlistSchema.index({ lectureId: 1 });

export default mongoose.models?.LectureWishlist ||
  mongoose.model<ILectureWishlist>('LectureWishlist', LectureWishlistSchema);
