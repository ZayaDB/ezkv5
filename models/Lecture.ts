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
  shortDescription?: string;
  targetAudience?: string;
  prerequisites?: string;
  whatYouWillLearn?: string[];
  curriculum?: string[];
  totalLessons?: number;
  totalHours?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  maxStudents?: number;
  language?: string;
  previewVideoUrl?: string;
  materialsIncluded?: string[];
  faq?: string[];
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
    shortDescription: {
      type: String,
      default: '',
    },
    targetAudience: {
      type: String,
      default: '',
    },
    prerequisites: {
      type: String,
      default: '',
    },
    whatYouWillLearn: {
      type: [String],
      default: [],
    },
    curriculum: {
      type: [String],
      default: [],
    },
    totalLessons: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalHours: {
      type: Number,
      min: 0,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    maxStudents: {
      type: Number,
      min: 1,
      default: 30,
    },
    language: {
      type: String,
      default: 'ko',
    },
    previewVideoUrl: {
      type: String,
      default: '',
    },
    materialsIncluded: {
      type: [String],
      default: [],
    },
    faq: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

LectureSchema.index({ category: 1 });
LectureSchema.index({ type: 1 });
LectureSchema.index({ rating: -1 });

export default mongoose.models?.Lecture || mongoose.model<ILecture>('Lecture', LectureSchema);

