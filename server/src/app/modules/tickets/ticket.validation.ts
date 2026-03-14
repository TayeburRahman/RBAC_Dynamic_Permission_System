import { z } from 'zod';

const createTicketSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    description: z.string({ required_error: 'Description is required' }),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }),
});

const updateTicketStatusSchema = z.object({
  body: z.object({
    status: z.enum(['open', 'pending', 'closed']),
  }),
});

const assignTicketSchema = z.object({
  body: z.object({
    assignedTo: z.string({ required_error: 'Agent ID is required' }),
  }),
});

const addMessageSchema = z.object({
  body: z.object({
    text: z.string({ required_error: 'Message text is required' }),
  }),
});

export const TicketValidation = {
  createTicketSchema,
  updateTicketStatusSchema,
  assignTicketSchema,
  addMessageSchema,
};
