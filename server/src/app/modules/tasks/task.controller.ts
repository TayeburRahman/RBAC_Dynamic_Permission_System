import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { TaskService } from './task.service';
import { IReqUser } from '../auth/auth.interface';
import { AuditLogService } from '../audit-logs/auditLog.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  const result = await TaskService.createTask({ ...req.body, createdBy: actorId });
  await AuditLogService.log(actorId, 'CREATE_TASK', { target: 'Task', targetId: result._id });
  sendResponse(res, { statusCode: 201, success: true, message: 'Task created', data: result });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.getTasks(req.query as any);
  sendResponse(res, { statusCode: 200, success: true, message: 'Tasks fetched', data: result });
});

const getOne = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.getTaskById(req.params.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Task fetched', data: result });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  const result = await TaskService.updateTask(req.params.id, req.body);
  await AuditLogService.log(actorId, 'UPDATE_TASK', { target: 'Task', targetId: req.params.id });
  sendResponse(res, { statusCode: 200, success: true, message: 'Task updated', data: result });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  await TaskService.deleteTask(req.params.id);
  await AuditLogService.log(actorId, 'DELETE_TASK', { target: 'Task', targetId: req.params.id });
  sendResponse(res, { statusCode: 200, success: true, message: 'Task deleted', data: null });
});

const getStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await TaskService.getStats();
  sendResponse(res, { statusCode: 200, success: true, message: 'Task stats', data: result });
});

export const TaskController = { create, getAll, getOne, update, remove, getStats };
