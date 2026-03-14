import { Schema, model } from 'mongoose';
import { ITicket, TicketModel } from './ticket.interface';

const ticketMessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const ticketSchema = new Schema<ITicket, TicketModel>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'pending', 'closed'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    customerId: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Auth' },
    messages: [ticketMessageSchema],
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

export const Ticket = model<ITicket, TicketModel>('Ticket', ticketSchema);
