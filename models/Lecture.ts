import mongoose, { Schema, Document } from 'mongoose';

export interface ILecture extends Document {
  title: string;
  instructorId: mongoose.Types.ObjectId;
  type: 'online' | 'offline';
  category: string;
  price: number;
  duration: string;
  rating: number;
  students: number;
  image?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const LectureSchema = new Schema<ILecture>(
  {
    title: {
      type: String,
      required: true,
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['online', 'offline'],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    duration: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    students: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

LectureSchema.index({ category: 1 });
LectureSchema.index({ type: 1 });
LectureSchema.index({ rating: -1 });

export default mongoose.models.Lecture || mongoose.model<ILecture>('Lecture', LectureSchema);

