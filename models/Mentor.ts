import mongoose, { Schema, Document } from 'mongoose';

export interface IMentor extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  location: string;
  languages: string[];
  specialties: string[];
  price: number | 'Free';
  availability: 'available' | 'limited' | 'unavailable';
  photo?: string;
  verified: boolean;
  bio: string;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MentorSchema = new Schema<IMentor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    languages: {
      type: [String],
      default: [],
    },
    specialties: {
      type: [String],
      default: [],
    },
    price: {
      type: Schema.Types.Mixed, // number or 'Free'
      default: 0,
    },
    availability: {
      type: String,
      enum: ['available', 'limited', 'unavailable'],
      default: 'available',
    },
    photo: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 인덱스 추가 (검색 성능 향상)
MentorSchema.index({ specialties: 1 });
MentorSchema.index({ location: 1 });
MentorSchema.index({ rating: -1 });

export default mongoose.models.Mentor || mongoose.model<IMentor>('Mentor', MentorSchema);

