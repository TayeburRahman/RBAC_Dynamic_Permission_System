import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { TaskController } from './task.controller';

const router = express.Router();

router.get('/stats', auth(
  ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
  ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
), TaskController.getStats);

router.get('/', auth(
  ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
  ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
), TaskController.getAll);

router.post('/', auth(
  ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
  ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
), TaskController.create);

router.get('/:id', auth(
  ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
  ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
), TaskController.getOne);

router.patch('/:id', auth(
  ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
  ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
), TaskController.update);

router.delete('/:id', auth(
  ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
  ENUM_USER_ROLE.MANAGER
), TaskController.remove);

export const TaskRoutes = router;
