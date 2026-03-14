import { Types } from 'mongoose';
import { ITicket } from './ticket.interface';
import { Ticket } from './ticket.model';
import QueryBuilder from '../../../builder/QueryBuilder';
import { AuditLogService } from '../audit-logs/auditLog.service';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { broadcastToRoles, sendNotification } from '../../../utils/notification';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { CacheService } from '../cache/cache.service';

const CACHE_KEY_TICKET_STATS = 'ticket_stats';

const createTicket = async (customerId: string, payload: Partial<ITicket>) => {
  const result = await Ticket.create({
    ...payload,
    customerId: new Types.ObjectId(customerId),
    messages: [], // Initial ticket has no messages yet, or can include description as first message
  });
  
  await AuditLogService.log(
    customerId,
    'CREATE_TICKET',
    { target: 'Ticket', targetId: result._id, metadata: { title: result.title } }
  );
  
  broadcastToRoles(
    [ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER],
    `New ticket: ${result.title}`,
    { ticketId: result._id }
  );
  
  await CacheService.del(CACHE_KEY_TICKET_STATS);
  
  return result;
};

const getAllTickets = async (query: Record<string, unknown>) => {
  const ticketQuery = new QueryBuilder(
    Ticket.find().populate('customerId', 'name email').populate('assignedTo', 'name email'),
    query
  )
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await ticketQuery.modelQuery;
  const meta = await ticketQuery.countTotal();

  return { meta, result };
};

const getMyTickets = async (customerId: string, query: Record<string, unknown>) => {
  const ticketQuery = new QueryBuilder(
    Ticket.find({ customerId: new Types.ObjectId(customerId) }).populate('assignedTo', 'name email'),
    query
  )
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await ticketQuery.modelQuery;
  const meta = await ticketQuery.countTotal();

  return { meta, result };
};

const getTicketById = async (id: string) => {
  const result = await Ticket.findById(id)
    .populate('customerId', 'name email')
    .populate('assignedTo', 'name email')
    .populate('messages.sender', 'name email role');
  return result;
};

const updateTicketStatus = async (id: string, actorId: string, status: string) => {
  const result = await Ticket.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
  }

  await AuditLogService.log(
    actorId,
    'UPDATE_TICKET_STATUS',
    { target: 'Ticket', targetId: id, metadata: { status } }
  );

  sendNotification(
    result.customerId.toString(),
    `Ticket #${id.slice(-6).toUpperCase()} status updated to ${status}`,
    { ticketId: id, status }
  );

  await CacheService.del(CACHE_KEY_TICKET_STATS);

  return result;
};

const assignTicket = async (id: string, actorId: string, assignedTo: string) => {
  const result = await Ticket.findByIdAndUpdate(
    id,
    { assignedTo: new Types.ObjectId(assignedTo), status: 'pending' },
    { new: true }
  );

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
  }

  await AuditLogService.log(
    actorId,
    'ASSIGN_TICKET',
    { target: 'Ticket', targetId: id, metadata: { assignedTo } }
  );

  await CacheService.del(CACHE_KEY_TICKET_STATS);

  return result;
};

const addMessage = async (id: string, senderId: string, text: string) => {
  const result = await Ticket.findByIdAndUpdate(
    id,
    {
      $push: {
        messages: {
          sender: new Types.ObjectId(senderId),
          text,
          createdAt: new Date(),
        },
      },
      // If an agent replies, mark as pending if it was open
      // This is basic logic, can be refined
    },
    { new: true }
  ).populate('messages.sender', 'name email role');

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
  }

  // Notify recipient
  const lastMsg = result.messages[result.messages.length - 1];
  if (senderId === result.customerId.toString()) {
    // Notify agent
    if (result.assignedTo) {
      sendNotification(result.assignedTo.toString(), "New message on assigned ticket", { ticketId: id });
    }
  } else {
    // Notify customer
    sendNotification(result.customerId.toString(), "Support agent replied to your ticket", { ticketId: id });
  }

  return result;
};

const getTicketStats = async () => {
  const cachedData = await CacheService.get<any>(CACHE_KEY_TICKET_STATS);
  if (cachedData) return cachedData;

  const [total, open, pending, closed] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ status: 'open' }),
    Ticket.countDocuments({ status: 'pending' }),
    Ticket.countDocuments({ status: 'closed' }),
  ]);
  const stats = { total, open, pending, closed };
  await CacheService.set(CACHE_KEY_TICKET_STATS, stats, 300);
  return stats;
};

const getCustomerTicketStats = async (customerId: string) => {
  const [total, open, pending, closed] = await Promise.all([
    Ticket.countDocuments({ customerId: new Types.ObjectId(customerId) }),
    Ticket.countDocuments({ customerId: new Types.ObjectId(customerId), status: 'open' }),
    Ticket.countDocuments({ customerId: new Types.ObjectId(customerId), status: 'pending' }),
    Ticket.countDocuments({ customerId: new Types.ObjectId(customerId), status: 'closed' }),
  ]);
  return { total, open, pending, closed };
};

export const TicketService = {
  createTicket,
  getAllTickets,
  getMyTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket,
  addMessage,
  getTicketStats,
  getCustomerTicketStats,
};
