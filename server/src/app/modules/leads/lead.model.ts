import { Schema, model, Types } from 'mongoose';
import { ILead, LeadModel } from './lead.interface';

const LeadSchema = new Schema<ILead>(
  {
    title: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'closed', 'lost', 'converted'],
      default: 'new',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Auth', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
  },
  { timestamps: true }
);

const Lead = model<ILead, LeadModel>('Lead', LeadSchema);
export default Lead;
