import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import UserPermission from './userPermission.model';
import { PermissionService } from '../permissions/permission.service';

// Get user's permissions
const getUserPermissions = async (userId: string): Promise<string[]> => {
  const record = await UserPermission.findOne({ userId }).lean();
  return record?.permissions || [];
};

// Set a user's permissions (with Grant Ceiling enforcement)
const updateUserPermissions = async (
  actorId: string,
  targetUserId: string,
  permissions: string[]
): Promise<string[]> => {
  // Grant Ceiling: actor cannot assign permissions they don't have themselves
  const actorPermissions = await getUserPermissions(actorId);
  const allPermKeys = await PermissionService.getPermissionKeys();

  const invalid = permissions.filter(p => !allPermKeys.includes(p));
  if (invalid.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid permission keys: ${invalid.join(', ')}`);
  }

  const ceiling = permissions.filter(p => !actorPermissions.includes(p));
  if (ceiling.length > 0) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `You cannot grant permissions you do not have: ${ceiling.join(', ')}`
    );
  }

  const record = await UserPermission.findOneAndUpdate(
    { userId: targetUserId },
    { $set: { userId: targetUserId, permissions } },
    { upsert: true, new: true }
  );
  return record.permissions;
};

// Bypass Grant Ceiling for super admin seeder
const setPermissionsDirectly = async (userId: string, permissions: string[]): Promise<void> => {
  await UserPermission.findOneAndUpdate(
    { userId },
    { $set: { userId, permissions } },
    { upsert: true }
  );
};

// Grant default permissions for new registrations
const handleNewUserPermissions = async (userId: string, role: string): Promise<void> => {
  if (role === 'CUSTOMER') {
    const defaultCustomerPerms = ['view_dashboard', 'view_tickets', 'view_orders'];
    await setPermissionsDirectly(userId, defaultCustomerPerms);
  }
};

export const UserPermissionService = {
  getUserPermissions,
  updateUserPermissions,
  setPermissionsDirectly,
  handleNewUserPermissions,
};
