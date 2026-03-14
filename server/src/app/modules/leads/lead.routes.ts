import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { LeadController } from './lead.controller';

const router = express.Router();

router.get(
  '/',
  auth(
    ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
  ),
  LeadController.getAll
);

router.post(
  '/',
  auth(
    ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
  ),
  LeadController.create
);

router.get(
  '/:id',
  auth(
    ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
  ),
  LeadController.getOne
);

router.patch(
  '/:id',
  auth(
    ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
  ),
  LeadController.update
);

router.post(
  '/:id/convert',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.MANAGER),
  LeadController.convertToOrder
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.MANAGER),
  LeadController.remove
);

export const LeadRoutes = router;
