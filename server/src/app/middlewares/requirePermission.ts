import { NextFunction, Request, Response } from 'express';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { UserPermissionService } from '../modules/user-permissions/userPermission.service';
import { ENUM_USER_ROLE } from '../../enums/user';

/**
 * Middleware to check if the authenticated user has a required permission.
 * SUPER_ADMIN always passes. ADMIN always passes (full access).
 * MANAGER and AGENT must have the specific permission key.
 * Can accept a single key or an array of keys (OR logic: passes if user has ANY of them).
 */
const requirePermission = (permissionKey: string | string[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      // Super Admin and Admin have unrestricted access
      if (user.role === ENUM_USER_ROLE.SUPER_ADMIN || user.role === ENUM_USER_ROLE.ADMIN) {
        return next();
      }

      const userId = user.authId || user.userId || user._id;
      const permissions = await UserPermissionService.getUserPermissions(userId);

      const keys = Array.isArray(permissionKey) ? permissionKey : [permissionKey];
      const hasAny = keys.some(k => permissions.includes(k));

      if (!hasAny) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Access Denied: You need one of the following permissions: ${keys.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default requirePermission;
