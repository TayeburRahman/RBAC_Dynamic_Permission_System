import express from 'express';
import auth from '../../middlewares/auth';
import requirePermission from '../../middlewares/requirePermission';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { UserPermissionController } from './userPermission.controller';

const router = express.Router();

// Get permissions for a specific user
router.get(
  '/:userId',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.MANAGER),
  requirePermission('manage_permissions'),
  UserPermissionController.getForUser
);

// Update permissions for a specific user (Grant Ceiling enforced in service)
router.put(
  '/:userId',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.MANAGER),
  requirePermission('manage_permissions'),
  UserPermissionController.updateForUser
);

export const UserPermissionRoutes = router;
