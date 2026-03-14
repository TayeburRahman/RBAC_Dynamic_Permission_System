import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { AuditLogService } from './auditLog.service';

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await AuditLogService.getLogs(req.query as any);
  sendResponse(res, { statusCode: 200, success: true, message: 'Audit logs fetched', data: result });
});

export const AuditLogController = { getAll };
