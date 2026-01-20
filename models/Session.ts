import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  mentorId: mongoose.Types.ObjectId;
  menteeId: mongoose.Types.ObjectId;
  date: Date;
  duration: number; // 분 단위
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'Mentor',
      required: true,
    },
    menteeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 15, // 최소 15분
    },
    type: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

SessionSchema.index({ mentorId: 1, date: 1 });
SessionSchema.index({ menteeId: 1, date: 1 });
SessionSchema.index({ status: 1 });

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);

