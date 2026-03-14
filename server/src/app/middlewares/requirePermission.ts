import { NextFunction, Request, Response } from 'express';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { UserPermissionService } from '../modules/user-permissions/userPermission.service';
import { ENUM_USER_ROLE } from '../../enums/user';

/**
 * Middleware to check if the authenticated user has a required permission.
 * SUPER_ADMIN always passes. ADMIN always passes (full access).
 * MANAGER and AGENT must have the specific permission key.
 */
const requirePermission = (permissionKey: string) =>
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

      if (!permissions.includes(permissionKey)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Access Denied: You need the '${permissionKey}' permission to perform this action.`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default requirePermission;
