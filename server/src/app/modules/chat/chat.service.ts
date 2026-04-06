import { Conversation, IConversation } from './conversation.model';
import { Message, IMessage } from './message.model';
import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import Auth from '../auth/auth.model';

const POPULATE_PARTICIPANTS = {
  path: 'participants',
  select: 'name email role profile_image'
};

const POPULATE_LAST_MESSAGE = {
  path: 'lastMessage',
  populate: { path: 'sender', select: 'name' }
};

const createConversation = async (participants: Types.ObjectId[]) => {
  // Check if conversation already exists
  const existingConversation = await Conversation.findOne({
    participants: { $all: participants, $size: participants.length }
  }).populate(POPULATE_PARTICIPANTS);

  if (existingConversation) return existingConversation;

  // Create new conversation
  const newConversation = await Conversation.create({ participants });
  
  // Explicitly fetch the newly created conversation with population
  const populated = await Conversation.findById(newConversation._id).populate(POPULATE_PARTICIPANTS);
  return populated;
};

const getConversations = async (userId: string) => {
  const result = await Conversation.find({
    participants: new Types.ObjectId(userId)
  })
    .populate(POPULATE_PARTICIPANTS)
    .populate(POPULATE_LAST_MESSAGE)
    .sort({ updatedAt: -1 });

  return result;
};

const getMessages = async (conversationId: string) => {
  const result = await Message.find({
    conversationId: new Types.ObjectId(conversationId)
  })
    .populate('sender', 'name email role profile_image')
    .populate('recipient', 'name email role profile_image')
    .sort({ createdAt: 1 });

  return result;
};

const sendMessage = async (payload: Partial<IMessage> & { conversationId: string }) => {
  const { conversationId, sender, recipient, content, attachments } = payload;

  const message = await Message.create({
    conversationId: new Types.ObjectId(conversationId),
    sender: new Types.ObjectId(sender as any),
    recipient: new Types.ObjectId(recipient as any),
    content,
    attachments,
    readBy: [new Types.ObjectId(sender as any)]
  });

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name email role profile_image')
    .populate('recipient', 'name email role profile_image');

  // Update last message in conversation
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id
  });

  return populatedMessage;
};

const deleteMessage = async (userId: string, messageId: string) => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }

  // Only the sender can delete their own message
  if (message.sender.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only delete your own messages');
  }

  const updatedMessage = await Message.findByIdAndUpdate(
    messageId,
    { isDeleted: true },
    { new: true }
  );

  return updatedMessage;
};

const searchUsers = async (searchTerm: string, currentUserId: string) => {
  const query = {
    _id: { $ne: new Types.ObjectId(currentUserId) },
    isActive: true,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } }
    ]
  };

  const result = await Auth.find(query)
    .select('_id name email role profile_image')
    .limit(10);
    
  return result;
};

export const ChatService = {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  searchUsers
};
