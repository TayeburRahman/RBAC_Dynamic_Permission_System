import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import { ChatService } from './chat.service';
import sendResponse from '../../../shared/sendResponse';
import { Types } from 'mongoose';
import httpStatus from 'http-status';

const createConversation = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const currentUserId = actor.authId || actor._id;
  const { recipientId } = req.body;

  const participants = [new Types.ObjectId(currentUserId), new Types.ObjectId(recipientId)];
  const result = await ChatService.createConversation(participants);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Conversation retrieved successfully',
    data: result
  });
});

const getConversations = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const currentUserId = actor.authId || actor._id;

  const result = await ChatService.getConversations(currentUserId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Conversations retrieved successfully',
    data: result
  });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const result = await ChatService.getMessages(conversationId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Messages retrieved successfully',
    data: result
  });
});

const sendMessageWithFiles = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const currentUserId = actor.authId || actor._id;
  const { conversationId, recipientId, content } = req.body;

  let attachments: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    attachments = req.files.map((file: any) => file.filename);
  }

  const message = await ChatService.sendMessage({
    conversationId,
    sender: new Types.ObjectId(currentUserId),
    recipient: new Types.ObjectId(recipientId),
    content,
    attachments
  });

  // Emit event via socket (optional here, or direct call)
  // In a real app, I'd use io.to(recipientId).emit('receive_message', message)
  // But I'll handle that in the socket.ts or via a global IO variable.
  // @ts-ignore
  if (global.io) {
    // @ts-ignore
    global.io.to(recipientId).emit('receive_message', message);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Message sent successfully',
    data: message
  });
});

const deleteMessage = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const currentUserId = actor.authId || actor._id;
  const { id } = req.params; // message ID

  const result = await ChatService.deleteMessage(currentUserId, id);

  // Notify the other user that the message is deleted
  // @ts-ignore
  if (global.io && result) {
    // @ts-ignore
    global.io.to(result.recipient.toString()).emit('message_deleted', {
      messageId: result._id,
      conversationId: result.conversationId
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Message deleted successfully',
    data: result
  });
});

const searchUsers = catchAsync(async (req: Request, res: Response) => {
  const account = req.user as any;
  const currentUserId = account.authId || account._id;
  const { searchTerm } = req.query;

  const result = await ChatService.searchUsers(searchTerm as string, currentUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users searched successfully',
    data: result
  });
});

export const ChatController = {
  createConversation,
  getConversations,
  getMessages,
  sendMessageWithFiles,
  deleteMessage,
  searchUsers
};
