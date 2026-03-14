import { Model, Types } from 'mongoose';

export type ITicketMessage = {
  sender: Types.ObjectId;
  text: string;
  createdAt: Date;
};

export type ITicket = {
  title: string;
  description: string;
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'medium' | 'high';
  customerId: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  messages: ITicketMessage[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type TicketModel = Model<ITicket>;
