import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { TaskService } from './task.service';
import { UserPermissionService } from '../user-permissions/userPermission.service';
import ApiError from '../../../errors/ApiError';
import { AuditLogService } from '../audit-logs/auditLog.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  const result = await TaskService.createTask({ ...req.body, createdBy: actorId });
  await AuditLogService.log(actorId, 'CREATE_TASK', { target: 'Task', targetId: result._id });
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: 'Task created', data: result });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  const permissions = await UserPermissionService.getUserPermissions(actorId);
  
  const query = { ...req.query } as any;

  // Filter based on permissions
  const canViewAll = permissions.includes('task.view');
  const canViewOwn = permissions.includes('task.view.own');

  if (!canViewAll && canViewOwn) {
    query.assignedTo = actorId;
  } else if (!canViewAll && !canViewOwn) {
    throw new ApiError(httpStatus.FORBIDDEN, "You don't have permission to view tasks");
  }

  const result = await TaskService.getTasks(query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Tasks fetched', data: result });
});

const getOne = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  const permissions = await UserPermissionService.getUserPermissions(actorId);

  const result = await TaskService.getTaskById(id);
  
  // Scoping check
  const canViewAll = permissions.includes('task.view');
  if (!canViewAll && result.assignedTo?.toString() !== actorId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, "Access denied to this task");
  }

  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Task fetched', data: result });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  const permissions = await UserPermissionService.getUserPermissions(actorId);

  const task = await TaskService.getTaskById(id);

  // Ownership check: Handle either populated object or raw ID
  const assignedId = task.assignedTo?._id?.toString() || task.assignedTo?.toString();
  const isOwner = assignedId === actorId.toString();

  // Permission check for update
  const canUpdateAll = permissions.includes('task.update') && permissions.includes('task.view');
  const canUpdateOwn = permissions.includes('task.update') && isOwner;
  const canCompleteOwn = permissions.includes('task.complete') && isOwner;

  // Broaden status update for owners: Allow any status transition if they have task.update 
  // or specifically 'done' if they have task.complete
  const isOnlyStatusUpdate = Object.keys(req.body).length === 1 && req.body.status;
  
  if (!canUpdateAll && !canUpdateOwn) {
    if (isOnlyStatusUpdate && isOwner) {
       if (req.body.status === 'done' && canCompleteOwn) {
         // ALLOW Done
       } else if (permissions.includes('task.update')) {
         // ALLOW any status if they have task.update (already covered by canUpdateOwn, but being explicit)
       } else {
         throw new ApiError(httpStatus.FORBIDDEN, "You don't have permission to update this task status");
       }
    } else {
        throw new ApiError(httpStatus.FORBIDDEN, "You don't have permission to update this task");
    }
  }

  const result = await TaskService.updateTask(id, req.body);
  await AuditLogService.log(actorId, 'UPDATE_TASK', { target: 'Task', targetId: id });
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Task updated', data: result });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  
  // Note: deletion is usually restricted to Admin/SuperAdmin via requirePermission('task.delete') in routes
  
  await TaskService.deleteTask(id);
  await AuditLogService.log(actorId, 'DELETE_TASK', { target: 'Task', targetId: id });
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Task deleted', data: null });
});

const getStats = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  const permissions = await UserPermissionService.getUserPermissions(actorId);
  
  const canViewAll = permissions.includes('task.view');
  let result;
  
  if (canViewAll) {
    result = await TaskService.getStats();
  } else {
    // Implement per-user stats in service if needed, or just full stats if allowed
    result = await TaskService.getStats(); // For now keep same, but could be filtered
  }

  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Task stats', data: result });
});

export const TaskController = { create, getAll, getOne, update, remove, getStats };

