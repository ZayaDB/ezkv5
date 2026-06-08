import mongoose, { Schema, Document } from 'mongoose';

export type CountryStatus =
  | 'unknown'
  | 'planning_arrival'
  | 'residing_korea'
  | 'leaving_korea'
  | 'graduated_staying'
  | 'abroad';

export type OnboardingStatus = 'pending' | 'profile_complete' | 'completed';

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  role: 'user' | 'mentee' | 'mentor' | 'admin';
  avatar?: string;
  locale: string;
  bio?: string;
  location?: string;
  phone?: string;
  address?: string;
  languages?: string[];
  nationality?: string;
  university?: string;
  region?: string;
  visaType?: string;
  visaExpireDate?: Date;
  countryStatus: CountryStatus;
  onboardingStatus: OnboardingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'mentee', 'mentor', 'admin'],
      required: true,
      default: 'user',
    },
    avatar: {
      type: String,
    },
    locale: {
      type: String,
      enum: ['kr', 'en', 'mn'],
      default: 'kr',
    },
    bio: {
      type: String,
    },
    location: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    languages: {
      type: [String],
      default: [],
    },
    nationality: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    university: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    region: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    visaType: {
      type: String,
      trim: true,
      maxlength: 40,
    },
    visaExpireDate: {
      type: Date,
    },
    countryStatus: {
      type: String,
      enum: [
        'unknown',
        'planning_arrival',
        'residing_korea',
        'leaving_korea',
        'graduated_staying',
        'abroad',
      ],
      default: 'unknown',
    },
    onboardingStatus: {
      type: String,
      enum: ['pending', 'profile_complete', 'completed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models?.User || mongoose.model<IUser>('User', UserSchema);
