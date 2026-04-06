import { Schema, model, Types } from 'mongoose';

export type IConversation = {
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
};

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'Auth', required: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

export const Conversation = model<IConversation>('Conversation', conversationSchema);
