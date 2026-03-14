import express from 'express';
import auth from '../../middlewares/auth';
import requirePermission from '../../middlewares/requirePermission';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { TaskController } from './task.controller';

const router = express.Router();

router.get('/stats', auth(
  ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
  ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
), 
requirePermission(['task.view', 'view_reports']),
TaskController.getStats);

router.get('/', auth(
  ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
  ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
), 
requirePermission(['task.view', 'task.view.own']),
TaskController.getAll);

router.post('/', auth(
  ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
  ENUM_USER_ROLE.MANAGER
), 
requirePermission('task.create'),
TaskController.create);

router.get('/:id', auth(
  ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
  ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
), 
requirePermission(['task.view', 'task.view.own']),
TaskController.getOne);

router.patch('/:id', auth(
  ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
  ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT
), 
requirePermission(['task.update', 'task.complete', 'task.assign']),
TaskController.update);

router.delete('/:id', auth(
  ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN,
  ENUM_USER_ROLE.MANAGER
), 
requirePermission('task.delete'),
TaskController.remove);

export const TaskRoutes = router;
