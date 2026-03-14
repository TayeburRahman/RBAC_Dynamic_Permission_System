import { Request, Response } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';
import { LeadService } from '../leads/lead.service';
import Auth from '../auth/auth.model';
import { Order } from '../orders/order.model';
import { ExportService } from './export.service';
import catchAsync from '../../../shared/catchasync';

const exportLeads = catchAsync(async (req: Request, res: Response) => {
  const { leads } = await LeadService.getLeads({ limit: 1000 });
  const format = req.query.format as string;

  const data = leads.map((l: any) => ({
    title: l.title,
    name: l.name,
    email: l.email,
    phone: l.phone_number,
    status: l.status,
    created: new Date(l.createdAt).toLocaleDateString(),
  }));

  if (format === 'csv') {
    const csv = await ExportService.toCSV(data, ['title', 'name', 'email', 'phone', 'status', 'created']);
    res.header('Content-Type', 'text/csv');
    res.attachment('leads_report.csv');
    return res.send(csv);
  }

  const pdf = await ExportService.toPDF('Leads Report', data, [
    { header: 'Title', key: 'title' },
    { header: 'Name', key: 'name' },
    { header: 'Email', key: 'email' },
    { header: 'Status', key: 'status' },
    { header: 'Created', key: 'created' },
  ]);

  res.header('Content-Type', 'application/pdf');
  res.attachment('leads_report.pdf');
  res.send(pdf);
});

const exportUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await Auth.find().lean();
  const format = req.query.format as string;

  const data = users.map((u: any) => ({
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.is_block ? 'Blocked' : 'Active',
    created: new Date(u.createdAt).toLocaleDateString(),
  }));

  if (format === 'csv') {
    const csv = await ExportService.toCSV(data, ['name', 'email', 'role', 'status', 'created']);
    res.header('Content-Type', 'text/csv');
    res.attachment('users_report.csv');
    return res.send(csv);
  }

  const pdf = await ExportService.toPDF('Users Report', data, [
    { header: 'Name', key: 'name' },
    { header: 'Email', key: 'email' },
    { header: 'Role', key: 'role' },
    { header: 'Status', key: 'status' },
  ]);

  res.header('Content-Type', 'application/pdf');
  res.attachment('users_report.pdf');
  res.send(pdf);
});

export const ExportController = {
  exportLeads,
  exportUsers,
};
