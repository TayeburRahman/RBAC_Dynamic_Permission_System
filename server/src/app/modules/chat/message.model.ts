import { Schema, model, Types } from 'mongoose';

export type IMessage = {
  conversationId: Types.ObjectId;
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  content: string;
  attachments?: string[]; // Array of file filenames
  isDeleted: boolean;
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
};

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
    content: { type: String, default: '' },
    attachments: [{ type: String }],
    isDeleted: { type: Boolean, default: false },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'Auth' }],
  },
  { timestamps: true }
);

export const Message = model<IMessage>('Message', messageSchema);
