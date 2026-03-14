import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { PermissionService } from './permission.service';

const getAll = catchAsync(async (_req: Request, res: Response) => {
  const result = await PermissionService.getAllPermissions();
  sendResponse(res, { statusCode: 200, success: true, message: 'Permissions fetched', data: result });
});

export const PermissionController = { getAll };
