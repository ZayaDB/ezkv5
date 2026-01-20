import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  fromId: mongoose.Types.ObjectId;
  toId: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    fromId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ fromId: 1, toId: 1, createdAt: -1 });
MessageSchema.index({ toId: 1, read: 1 });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

