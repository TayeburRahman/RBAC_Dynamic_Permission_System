import express from 'express';
import auth from '../../middlewares/auth';
import requirePermission from '../../middlewares/requirePermission';
import { validateRequest } from '../../middlewares/validateRequest';
import { TicketController } from './ticket.controller';
import { TicketValidation } from './ticket.validation';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { UploadMiddleware } from '../../middlewares/upload';

const router = express.Router();

// ─── Customer / All-role Routes ────────────────────────────────────────────

// All authenticated users can create a ticket
router.post(
  '/',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MANAGER,
    ENUM_USER_ROLE.AGENT,
    ENUM_USER_ROLE.CUSTOMER,
  ),
  UploadMiddleware.uploadArray('attachments', 5),
  requirePermission('create_tickets'),
  validateRequest(TicketValidation.createTicketSchema),
  TicketController.createTicket
);

// Each user sees their own tickets (Customer sees only theirs, staff see all via /tickets)
router.get(
  '/my-tickets',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MANAGER,
    ENUM_USER_ROLE.AGENT,
    ENUM_USER_ROLE.CUSTOMER,
  ),
  requirePermission('view_tickets'),
  TicketController.getMyTickets
);

// Customer-only ticket stats (own tickets)
router.get(
  '/my-stats',
  auth(ENUM_USER_ROLE.CUSTOMER, ENUM_USER_ROLE.SUPER_ADMIN),
  requirePermission('view_tickets'),
  TicketController.getMyTicketStats
);

// ─── Staff Routes (Admin always; Manager/Agent need view_tickets) ──────────

// Ticket stats for staff dashboard
router.get(
  '/stats',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT),
  requirePermission('view_tickets'),
  TicketController.getTicketStats
);

// All tickets listing — Admin always; Manager/Agent need view_tickets permission
router.get(
  '/',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT),
  requirePermission('view_tickets'),
  TicketController.getAllTickets
);

// Single ticket — all roles (Customers can view their own ticket detail)
router.get(
  '/:id',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MANAGER,
    ENUM_USER_ROLE.AGENT,
    ENUM_USER_ROLE.CUSTOMER,
  ),
  requirePermission('view_tickets'),
  TicketController.getTicketById
);

// Add message — all roles allowed
router.post(
  '/:id/messages',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MANAGER,
    ENUM_USER_ROLE.AGENT,
    ENUM_USER_ROLE.CUSTOMER,
  ),
  validateRequest(TicketValidation.addMessageSchema),
  TicketController.addMessage
);

// Update ticket status — Admin always; Manager/Agent need manage_tickets permission
router.patch(
  '/:id/status',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT),
  requirePermission('manage_tickets'),
  validateRequest(TicketValidation.updateTicketStatusSchema),
  TicketController.updateTicketStatus
);

// Assign ticket — Admin/Manager only; need manage_tickets
router.patch(
  '/:id/assign',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
  requirePermission('manage_tickets'),
  validateRequest(TicketValidation.assignTicketSchema),
  TicketController.assignTicket
);

export const TicketRoutes = router;
