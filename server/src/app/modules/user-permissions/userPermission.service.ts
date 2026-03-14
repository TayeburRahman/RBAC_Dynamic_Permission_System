import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import UserPermission from './userPermission.model';
import { PermissionService } from '../permissions/permission.service';
import Auth from '../auth/auth.model';
import { ENUM_USER_ROLE } from '../../../enums/user';

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

  // Scoping Check for Managers
  const actor = await Auth.findById(actorId).lean();
  if (actor?.role === ENUM_USER_ROLE.MANAGER) {
    const target = await Auth.findById(targetUserId).lean();
    if (!target || target.managedBy?.toString() !== actorId) {
      throw new ApiError(httpStatus.FORBIDDEN, "You can only manage permissions for your own team.");
    }
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
  const taskAtoms = ['task.view', 'task.view.own', 'task.create', 'task.update', 'task.assign', 'task.complete', 'task.delete'];
  
  const defaults: Record<string, string[]> = {
    [ENUM_USER_ROLE.SUPER_ADMIN]: [
      ...taskAtoms,
      'view_dashboard', 'manage_users', 'manage_perms', 'view_reports', 'view_audit_logs', 'view_orders', 'manage_orders', 'view_tickets', 'manage_tickets', 'create_tickets'
    ],
    [ENUM_USER_ROLE.ADMIN]: [
      'task.view', 'task.create', 'task.assign', 'task.update', 'task.delete',
      'view_dashboard', 'manage_users', 'view_reports', 'view_audit_logs', 'view_tickets', 'manage_tickets', 'view_orders', 'manage_orders', 'create_tickets'
    ],
    [ENUM_USER_ROLE.MANAGER]: [
      'task.view', 'task.create', 'task.assign', 'task.update',
      'view_dashboard', 'manage_users', 'view_reports', 'view_tickets', 'manage_tickets', 'view_orders', 'create_tickets'
    ],
    [ENUM_USER_ROLE.AGENT]: [
      'task.view.own', 'task.update', 'task.complete',
      'view_dashboard', 'manage_leads'
    ],
    [ENUM_USER_ROLE.CUSTOMER]: [
      'view_dashboard', 'view_tickets', 'create_tickets', 'view_orders'
    ],
  };

  const permissions = defaults[role] || [];
  if (permissions.length > 0) {
    await setPermissionsDirectly(userId, permissions);
  }
};

export const UserPermissionService = {
  getUserPermissions,
  updateUserPermissions,
  setPermissionsDirectly,
  handleNewUserPermissions,
};
