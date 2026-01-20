import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunityGroup extends Document {
  name: string;
  description: string;
  members: number;
  category: string;
  image?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CommunityGroupSchema = new Schema<ICommunityGroup>(
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
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

CommunityGroupSchema.index({ category: 1 });
CommunityGroupSchema.index({ tags: 1 });

export default mongoose.models.CommunityGroup || mongoose.model<ICommunityGroup>('CommunityGroup', CommunityGroupSchema);

