import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  password: string; // 해시된 비밀번호
  role: 'mentee' | 'mentor' | 'admin';
  avatar?: string;
  locale: string;
  bio?: string;
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
      enum: ['mentee', 'mentor', 'admin'],
      required: true,
      default: 'mentee',
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

