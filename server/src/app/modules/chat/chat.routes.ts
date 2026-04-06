import express from 'express';
import auth from '../../middlewares/auth';
import { ChatController } from './chat.controller';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { UploadMiddleware } from '../../middlewares/upload';

const router = express.Router();

router.get(
  '/conversations',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.CUSTOMER),
  ChatController.getConversations
);

router.post(
  '/conversation',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.CUSTOMER),
  ChatController.createConversation
);

router.get(
  '/messages/:conversationId',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.CUSTOMER),
  ChatController.getMessages
);

router.post(
  '/send-message',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.CUSTOMER),
  UploadMiddleware.uploadArray('attachments', 5),
  ChatController.sendMessageWithFiles
);

router.patch(
  '/delete-message/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.CUSTOMER),
  ChatController.deleteMessage
);

router.get(
  '/users',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.CUSTOMER),
  ChatController.searchUsers
);

router.patch(
  '/mark-as-read/:conversationId',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.CUSTOMER),
  ChatController.markAsRead
);

export const ChatRoutes = router;
