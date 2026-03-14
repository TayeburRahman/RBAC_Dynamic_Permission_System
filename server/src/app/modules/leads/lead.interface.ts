import { Model, Types } from 'mongoose';

export type ILead = {
  title: string;
  name: string;
  email: string;
  phone_number: string;
  description: string;
  status: 'new' | 'in-progress' | 'closed' | 'lost' | 'converted';
  assignedTo: Types.ObjectId | null;
  createdBy: Types.ObjectId;
};

export type LeadModel = Model<ILead>;
