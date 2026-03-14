import { Response, Request } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import ApiError from '../../../errors/ApiError';
import { TicketService } from './ticket.service';
import { IReqUser } from '../auth/auth.interface';

const createTicket = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const customerId = actor.authId || actor.userId || actor._id;
  const attachments = (req.files as any[])?.map((file: any) => file.path) || [];
  const result = await TicketService.createTicket(customerId, { ...req.body, attachments });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Ticket created successfully',
    data: result,
  });
});

const getAllTickets = catchAsync(async (req: Request, res: Response) => {
  const result = await TicketService.getAllTickets(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tickets retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getMyTickets = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const customerId = actor.authId || actor.userId || actor._id;
  const result = await TicketService.getMyTickets(customerId, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My tickets retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getTicketById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const actor = req.user as any;
  const currentUserId = actor.authId || actor.userId || actor._id;

  const result = await TicketService.getTicketById(id);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
  }

  // Ownership check: If customer, must own the ticket.
  if (actor.role === 'CUSTOMER' && result.customerId.toString() !== currentUserId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You cannot access this ticket');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ticket details retrieved successfully',
    data: result,
  });
});

const updateTicketStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  const result = await TicketService.updateTicketStatus(id, actorId, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ticket status updated successfully',
    data: result,
  });
});

const assignTicket = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { assignedTo } = req.body;
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  const result = await TicketService.assignTicket(id, actorId, assignedTo);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ticket assigned successfully',
    data: result,
  });
});

const addMessage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text } = req.body;
  const actor = req.user as any;
  const senderId = actor.authId || actor.userId || actor._id;

  const ticket = await TicketService.getTicketById(id);
  if (!ticket) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
  }

  // If customer, check ownership
  if (actor.role === 'CUSTOMER' && ticket.customerId.toString() !== senderId.toString()) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You can only message your own tickets');
  }

  const result = await TicketService.addMessage(id, senderId, text);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Message added successfully',
    data: result,
  });
});

const getTicketStats = catchAsync(async (req: Request, res: Response) => {
  const result = await TicketService.getTicketStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ticket statistics retrieved successfully',
    data: result,
  });
});

const getMyTicketStats = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const customerId = actor.authId || actor.userId || actor._id;
  const result = await TicketService.getCustomerTicketStats(customerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My ticket statistics retrieved successfully',
    data: result,
  });
});

export const TicketController = {
  createTicket,
  getAllTickets,
  getMyTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket,
  addMessage,
  getTicketStats,
  getMyTicketStats,
};
