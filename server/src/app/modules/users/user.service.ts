import Auth from '../auth/auth.model';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { UserPermissionService } from '../user-permissions/userPermission.service';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { CacheService } from '../cache/cache.service';

const CACHE_KEY_DASHBOARD_STATS = 'dashboard_stats';

const getAllUsers = async (query: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}, requester?: any) => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.role) filter.role = query.role;

  // Hierarchical Scoping
  if (requester?.role === ENUM_USER_ROLE.MANAGER) {
    filter.managedBy = requester.userId;
  }
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
}, requester?: any) => {
  const exists = await Auth.findOne({ email: payload.email });
  if (exists) throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');

  const user = await Auth.create({
    ...payload,
    isActive: true,
    termsAccepted: true,
    managedBy: requester?.role === ENUM_USER_ROLE.MANAGER ? requester.userId : null,
  }) as any;

  await CacheService.del(CACHE_KEY_DASHBOARD_STATS);

  // Seed default permissions based on role
  await UserPermissionService.handleNewUserPermissions(user._id.toString(), user.role);

  // New users start with no permissions
  return Auth.findById(user._id).select('-password');
};

const updateUser = async (id: string, data: { name?: string; role?: string; phone_number?: string }, requester?: any) => {
  if (requester?.role === ENUM_USER_ROLE.MANAGER) {
    const target = await Auth.findById(id).lean();
    if (!target || target.managedBy?.toString() !== requester.userId) {
      throw new ApiError(httpStatus.FORBIDDEN, "You can only update users within your scope.");
    }
  }
  const user = await Auth.findByIdAndUpdate(id, { $set: data }, { new: true }).select('-password');
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  await CacheService.del(CACHE_KEY_DASHBOARD_STATS);
  return user;
};

const suspendUser = async (id: string, requester?: any) => {
  if (requester?.role === ENUM_USER_ROLE.MANAGER) {
    const target = await Auth.findById(id).lean();
    if (!target || target.managedBy?.toString() !== requester.userId) {
      throw new ApiError(httpStatus.FORBIDDEN, "You can only suspend users within your scope.");
    }
  }
  const user = await Auth.findByIdAndUpdate(id, { $set: { is_block: true } }, { new: true }).select('-password');
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  await CacheService.del(CACHE_KEY_DASHBOARD_STATS);
  return user;
};

const unsuspendUser = async (id: string, requester?: any) => {
  if (requester?.role === ENUM_USER_ROLE.MANAGER) {
    const target = await Auth.findById(id).lean();
    if (!target || target.managedBy?.toString() !== requester.userId) {
      throw new ApiError(httpStatus.FORBIDDEN, "You can only unsuspend users within your scope.");
    }
  }
  const user = await Auth.findByIdAndUpdate(id, { $set: { is_block: false } }, { new: true }).select('-password');
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  await CacheService.del(CACHE_KEY_DASHBOARD_STATS);
  return user;
};

const getDashboardStats = async () => {
  const cachedData = await CacheService.get<any>(CACHE_KEY_DASHBOARD_STATS);
  if (cachedData) return cachedData;

  const [total, admins, managers, agents, customers, active, blocked] = await Promise.all([
    Auth.countDocuments(),
    Auth.countDocuments({ role: ENUM_USER_ROLE.ADMIN }),
    Auth.countDocuments({ role: ENUM_USER_ROLE.MANAGER }),
    Auth.countDocuments({ role: ENUM_USER_ROLE.AGENT }),
    Auth.countDocuments({ role: ENUM_USER_ROLE.CUSTOMER }),
    Auth.countDocuments({ isActive: true }),
    Auth.countDocuments({ is_block: true }),
  ]);
  const stats = { total, admins, managers, agents, customers, active, blocked };
  await CacheService.set(CACHE_KEY_DASHBOARD_STATS, stats, 300); // 5 mins cache
  return stats;
};

export const UserService = {
  getAllUsers, getUserById, createUser, updateUser, suspendUser, unsuspendUser, getDashboardStats
};
