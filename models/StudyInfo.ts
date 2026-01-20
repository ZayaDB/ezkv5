import mongoose, { Schema, Document } from 'mongoose';

export interface IStudyInfo extends Document {
  category: 'visa' | 'housing' | 'hospital' | 'lifeTips';
  title: string;
  content: string;
  image?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const StudyInfoSchema = new Schema<IStudyInfo>(
  {
    category: {
      type: String,
      enum: ['visa', 'housing', 'hospital', 'lifeTips'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

StudyInfoSchema.index({ category: 1 });
StudyInfoSchema.index({ tags: 1 });

export default mongoose.models.StudyInfo || mongoose.model<IStudyInfo>('StudyInfo', StudyInfoSchema);

