import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { ExportController } from './export.controller';

const router = express.Router();

router.get(
  '/leads',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
  ExportController.exportLeads
);

router.get(
  '/users',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
  ExportController.exportUsers
);

export const ExportRoutes = router;
