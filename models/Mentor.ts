import mongoose, { Schema, Document } from 'mongoose';

export type MentorApprovalStatus = "pending" | "approved" | "rejected";

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
  /** mentee가 신청 시 pending → 관리자 승인 시 approved */
  approvalStatus?: MentorApprovalStatus;
  bio: string;
  rating: number;
  reviewCount: number;
  yearsOfExperience?: number;
  education?: string;
  careerSummary?: string;
  sessionDuration?: number;
  sessionFormat?: 'online' | 'offline' | 'both';
  timezone?: string;
  responseTime?: string;
  introVideoUrl?: string;
  portfolioLinks?: string[];
  mentoringStyle?: string;
  recommendedFor?: string;
  notRecommendedFor?: string;
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
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
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
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 60,
      default: 0,
    },
    education: {
      type: String,
      default: '',
    },
    careerSummary: {
      type: String,
      default: '',
    },
    sessionDuration: {
      type: Number,
      min: 15,
      max: 240,
      default: 60,
    },
    sessionFormat: {
      type: String,
      enum: ['online', 'offline', 'both'],
      default: 'online',
    },
    timezone: {
      type: String,
      default: 'Asia/Seoul',
    },
    responseTime: {
      type: String,
      default: '',
    },
    introVideoUrl: {
      type: String,
      default: '',
    },
    portfolioLinks: {
      type: [String],
      default: [],
    },
    mentoringStyle: {
      type: String,
      default: '',
    },
    recommendedFor: {
      type: String,
      default: '',
    },
    notRecommendedFor: {
      type: String,
      default: '',
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

export default mongoose.models?.Mentor || mongoose.model<IMentor>('Mentor', MentorSchema);

