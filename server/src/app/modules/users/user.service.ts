import Auth from '../auth/auth.model';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { UserPermissionService } from '../user-permissions/userPermission.service';
import { ENUM_USER_ROLE } from '../../../enums/user';

const getAllUsers = async (query: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}) => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.role) filter.role = query.role;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    Auth.find(filter)
      .select('-password -activationCode -verifyCode -codeVerify')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Auth.countDocuments(filter),
  ]);

  return { users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getUserById = async (id: string) => {
  const user = await Auth.findById(id).select('-password -activationCode -verifyCode -codeVerify').lean();
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  const permissions = await UserPermissionService.getUserPermissions(id);
  return { ...user, permissions };
};

const createUser = async (payload: {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  role: string;
}) => {
  const exists = await Auth.findOne({ email: payload.email });
  if (exists) throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');

  const user = await Auth.create({
    ...payload,
    isActive: true,
    termsAccepted: true,
  });

  // New users start with no permissions
  return Auth.findById(user._id).select('-password');
};

const updateUser = async (id: string, data: { name?: string; role?: string; phone_number?: string }) => {
  const user = await Auth.findByIdAndUpdate(id, { $set: data }, { new: true }).select('-password');
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  return user;
};

const suspendUser = async (id: string) => {
  const user = await Auth.findByIdAndUpdate(id, { $set: { is_block: true } }, { new: true }).select('-password');
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  return user;
};

const unsuspendUser = async (id: string) => {
  const user = await Auth.findByIdAndUpdate(id, { $set: { is_block: false } }, { new: true }).select('-password');
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  return user;
};

const getDashboardStats = async () => {
  const [total, admins, managers, agents, customers, active, blocked] = await Promise.all([
    Auth.countDocuments(),
    Auth.countDocuments({ role: ENUM_USER_ROLE.ADMIN }),
    Auth.countDocuments({ role: ENUM_USER_ROLE.MANAGER }),
    Auth.countDocuments({ role: ENUM_USER_ROLE.AGENT }),
    Auth.countDocuments({ role: ENUM_USER_ROLE.CUSTOMER }),
    Auth.countDocuments({ isActive: true }),
    Auth.countDocuments({ is_block: true }),
  ]);
  return { total, admins, managers, agents, customers, active, blocked };
};

export const UserService = {
  getAllUsers, getUserById, createUser, updateUser, suspendUser, unsuspendUser, getDashboardStats
};
