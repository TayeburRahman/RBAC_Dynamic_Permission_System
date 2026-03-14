import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { AuditLogController } from './auditLog.controller';

const router = express.Router();

router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.MANAGER),
  AuditLogController.getAll
);

router.get(
  '/my-logs',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.CUSTOMER),
  AuditLogController.getMyLogs
);

export const AuditLogRoutes = router;
