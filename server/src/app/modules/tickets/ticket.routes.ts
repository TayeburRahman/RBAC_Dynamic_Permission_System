import express from 'express';
import auth from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { TicketController } from './ticket.controller';
import { TicketValidation } from './ticket.validation';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { UploadMiddleware } from '../../middlewares/upload';

const router = express.Router();

// Customer only - Create ticket
router.post(
  '/',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.CUSTOMER, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
  UploadMiddleware.uploadArray('attachments', 5),
  validateRequest(TicketValidation.createTicketSchema),
  TicketController.createTicket
);

// Get my tickets (Customer/Agent/Admin)
router.get(
  '/my-tickets',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.CUSTOMER, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
  TicketController.getMyTickets
);

router.get(
  '/stats',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT),
  TicketController.getTicketStats
);

router.get(
  '/my-stats',
  auth(ENUM_USER_ROLE.CUSTOMER),
  TicketController.getMyTicketStats
);

// Admin/Manager/Agent - Get all tickets (with permission check)
router.get(
  '/',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT),
  // We should ideally have a middleware that checks the specific "view_tickets" atom
  // But for now, role-based is a fallback, and we'll refine it
  TicketController.getAllTickets
);

router.get(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.CUSTOMER),
  TicketController.getTicketById
);

router.patch(
  '/:id/status',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT),
  validateRequest(TicketValidation.updateTicketStatusSchema),
  TicketController.updateTicketStatus
);

router.patch(
  '/:id/assign',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
  validateRequest(TicketValidation.assignTicketSchema),
  TicketController.assignTicket
);

router.post(
  '/:id/messages',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.CUSTOMER),
  validateRequest(TicketValidation.addMessageSchema),
  TicketController.addMessage
);

export const TicketRoutes = router;
