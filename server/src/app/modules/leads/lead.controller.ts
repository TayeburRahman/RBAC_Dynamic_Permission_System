import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { LeadService } from './lead.service';
import { IReqUser } from '../auth/auth.interface';
import { AuditLogService } from '../audit-logs/auditLog.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  const result = await LeadService.createLead({ ...req.body, createdBy: actorId });
  await AuditLogService.log(actorId, 'CREATE_LEAD', { actorName: actor.name, target: 'Lead', targetId: result._id });
  sendResponse(res, { statusCode: 201, success: true, message: 'Lead created', data: result });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await LeadService.getLeads(req.query as any);
  sendResponse(res, { statusCode: 200, success: true, message: 'Leads fetched', data: result });
});

const getOne = catchAsync(async (req: Request, res: Response) => {
  const result = await LeadService.getLeadById(req.params.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Lead fetched', data: result });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  const result = await LeadService.updateLead(req.params.id, req.body);
  await AuditLogService.log(actorId, 'UPDATE_LEAD', { target: 'Lead', targetId: req.params.id });
  sendResponse(res, { statusCode: 200, success: true, message: 'Lead updated', data: result });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  await LeadService.deleteLead(req.params.id);
  await AuditLogService.log(actorId, 'DELETE_LEAD', { target: 'Lead', targetId: req.params.id });
  sendResponse(res, { statusCode: 200, success: true, message: 'Lead deleted', data: null });
});

const convertToOrder = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  const result = await LeadService.convertToOrder(req.params.id, actorId);
  await AuditLogService.log(actorId, 'CONVERT_LEAD', { target: 'Lead', targetId: req.params.id, metadata: { orderId: result.order._id } });
  sendResponse(res, { statusCode: 200, success: true, message: 'Lead converted to order successfully', data: result });
});

export const LeadController = { create, getAll, getOne, update, remove, convertToOrder };
