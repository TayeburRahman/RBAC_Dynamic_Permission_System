import express from 'express';
import auth from '../../middlewares/auth';
import requirePermission from '../../middlewares/requirePermission';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { LeadController } from './lead.controller';

const router = express.Router();

router.get(
  '/',
  auth(
    ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
  ),
  requirePermission('manage_leads'),
  LeadController.getAll
);

router.post(
  '/',
  auth(
    ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
  ),
  requirePermission('manage_leads'),
  LeadController.create
);

router.get(
  '/:id',
  auth(
    ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
  ),
  requirePermission('manage_leads'),
  LeadController.getOne
);

router.patch(
  '/:id',
  auth(
    ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
  ),
  requirePermission('manage_leads'),
  LeadController.update
);

router.post(
  '/:id/convert',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT),
  requirePermission('manage_leads'),
  LeadController.convertToOrder
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.MANAGER),
  requirePermission('manage_leads'),
  LeadController.remove
);

export const LeadRoutes = router;
