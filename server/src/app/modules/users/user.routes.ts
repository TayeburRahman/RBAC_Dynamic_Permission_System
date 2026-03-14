import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { UserController } from './user.controller';

const router = express.Router();

router.get(
  '/stats',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.MANAGER),
  UserController.getStats
);

router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.MANAGER),
  UserController.getAll
);

router.post(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UserController.create
);

router.get(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.MANAGER),
  UserController.getOne
);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UserController.update
);

router.patch(
  '/:id/suspend',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UserController.suspend
);

router.patch(
  '/:id/unsuspend',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UserController.unsuspend
);

export const UserRoutes = router;
