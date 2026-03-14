import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { UserPermissionService } from './userPermission.service';
import { IReqUser } from '../auth/auth.interface';

const getForUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const permissions = await UserPermissionService.getUserPermissions(userId);
  sendResponse(res, { statusCode: 200, success: true, message: 'Permissions fetched', data: permissions });
});

const updateForUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  const { permissions } = req.body as { permissions: string[] };
  const result = await UserPermissionService.updateUserPermissions(actorId, userId, permissions);
  sendResponse(res, { statusCode: 200, success: true, message: 'Permissions updated', data: result });
});

export const UserPermissionController = { getForUser, updateForUser };
