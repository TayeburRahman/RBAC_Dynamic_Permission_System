import Lead from './lead.model';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import Auth from '../auth/auth.model';
import { Order } from '../orders/order.model';
import { ENUM_USER_ROLE } from '../../../enums/user';

const createLead = async (data: {
  title: string;
  name: string;
  email: string;
  phone_number: string;
  description?: string;
  createdBy: string;
}) => {
  return Lead.create(data);
};

const getLeads = async (query: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .lean(),
    Lead.countDocuments(filter),
  ]);

  return { leads, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getLeadById = async (id: string) => {
  const lead = await Lead.findById(id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .lean();
  if (!lead) throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  return lead;
};

const updateLead = async (
  id: string,
  data: { title?: string; description?: string; status?: string; assignedTo?: string }
) => {
  const lead = await Lead.findByIdAndUpdate(id, { $set: data }, { new: true });
  if (!lead) throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  return lead;
};

const deleteLead = async (id: string) => {
  await Lead.findByIdAndDelete(id);
};

const convertToOrder = async (leadId: string, actorId: string) => {
  const lead = await Lead.findById(leadId);
  if (!lead) throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  if (lead.status === 'converted') throw new ApiError(httpStatus.BAD_REQUEST, 'Lead already converted');

  // 1. Check if user exists
  let user = await Auth.findOne({ email: lead.email });
  if (!user) {
    // Create a skeleton customer account
    user = await Auth.create({
      name: lead.name,
      email: lead.email,
      phone_number: lead.phone_number,
      password: 'PlaceholderPassword123!', // User will need to reset this
      role: ENUM_USER_ROLE.CUSTOMER,
      isActive: true, // Auto-activate for conversion flow
      termsAccepted: true,
    });
  }

  // 2. Create Order
  const order = await Order.create({
    orderId: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    amount: 0, // Admin will update this later or it comes from a product selection
    status: 'pending',
    customerId: user._id,
    items: [{ name: lead.title, price: 0, quantity: 1 }],
  });

  // 3. Update Lead Status
  lead.status = 'converted';
  await lead.save();

  return { user, order };
};

export const LeadService = { createLead, getLeads, getLeadById, updateLead, deleteLead, convertToOrder };
