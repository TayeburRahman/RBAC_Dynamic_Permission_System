import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { AuditLogService } from './auditLog.service';

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await AuditLogService.getLogs(req.query as any);
  sendResponse(res, { statusCode: 200, success: true, message: 'Audit logs fetched', data: result });
});

const getMyLogs = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  const result = await AuditLogService.getLogs({ ...req.query, actor: actorId });
  sendResponse(res, { statusCode: 200, success: true, message: 'My audit logs fetched', data: result });
});

export const AuditLogController = { getAll, getMyLogs };
