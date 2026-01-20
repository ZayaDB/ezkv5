import mongoose, { Schema, Document } from 'mongoose';

export interface IFreelancerGroup extends Document {
  name: string;
  description: string;
  members: number;
  category: string;
  image?: string;
  jobsPosted: number;
  createdAt: Date;
  updatedAt: Date;
}

const FreelancerGroupSchema = new Schema<IFreelancerGroup>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    members: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    jobsPosted: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

FreelancerGroupSchema.index({ category: 1 });

export default mongoose.models.FreelancerGroup || mongoose.model<IFreelancerGroup>('FreelancerGroup', FreelancerGroupSchema);

