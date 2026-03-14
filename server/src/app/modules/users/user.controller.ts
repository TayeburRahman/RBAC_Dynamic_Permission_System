import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import { IReqUser } from '../auth/auth.interface';
import { AuditLogService } from '../audit-logs/auditLog.service';

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query as any);
  sendResponse(res, { statusCode: 200, success: true, message: 'Users fetched', data: result });
});

const getOne = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserById(req.params.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'User fetched', data: result });
});

const create = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as IReqUser;
  const result = await UserService.createUser(req.body);
  await AuditLogService.log(actor.userId, 'CREATE_USER', { target: 'User', targetId: (result as any)._id, metadata: { email: req.body.email } });
  sendResponse(res, { statusCode: 201, success: true, message: 'User created', data: result });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as IReqUser;
  const result = await UserService.updateUser(req.params.id, req.body);
  await AuditLogService.log(actor.userId, 'UPDATE_USER', { target: 'User', targetId: req.params.id });
  sendResponse(res, { statusCode: 200, success: true, message: 'User updated', data: result });
});

const suspend = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as IReqUser;
  const result = await UserService.suspendUser(req.params.id);
  await AuditLogService.log(actor.userId, 'SUSPEND_USER', { target: 'User', targetId: req.params.id });
  sendResponse(res, { statusCode: 200, success: true, message: 'User suspended', data: result });
});

const unsuspend = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as IReqUser;
  const result = await UserService.unsuspendUser(req.params.id);
  await AuditLogService.log(actor.userId, 'UNSUSPEND_USER', { target: 'User', targetId: req.params.id });
  sendResponse(res, { statusCode: 200, success: true, message: 'User unsuspended', data: result });
});

const getStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await UserService.getDashboardStats();
  sendResponse(res, { statusCode: 200, success: true, message: 'User stats', data: result });
});

export const UserController = { getAll, getOne, create, update, suspend, unsuspend, getStats };
