import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { LeadService } from './lead.service';
import { IReqUser } from '../auth/auth.interface';
import { AuditLogService } from '../audit-logs/auditLog.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IReqUser;
  const result = await LeadService.createLead({ ...req.body, createdBy: user.userId });
  await AuditLogService.log(user.userId, 'CREATE_LEAD', { actorName: (user as any).name, target: 'Lead', targetId: result._id });
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
  const user = req.user as IReqUser;
  const result = await LeadService.updateLead(req.params.id, req.body);
  await AuditLogService.log(user.userId, 'UPDATE_LEAD', { target: 'Lead', targetId: req.params.id });
  sendResponse(res, { statusCode: 200, success: true, message: 'Lead updated', data: result });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IReqUser;
  await LeadService.deleteLead(req.params.id);
  await AuditLogService.log(user.userId, 'DELETE_LEAD', { target: 'Lead', targetId: req.params.id });
  sendResponse(res, { statusCode: 200, success: true, message: 'Lead deleted', data: null });
});

const convertToOrder = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IReqUser;
  const result = await LeadService.convertToOrder(req.params.id, user.userId);
  await AuditLogService.log(user.userId, 'CONVERT_LEAD', { target: 'Lead', targetId: req.params.id, metadata: { orderId: result.order._id } });
  sendResponse(res, { statusCode: 200, success: true, message: 'Lead converted to order successfully', data: result });
});

export const LeadController = { create, getAll, getOne, update, remove, convertToOrder };
