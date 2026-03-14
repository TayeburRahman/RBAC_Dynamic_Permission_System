import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { AdminRoutes } from '../modules/admin/admin.routes';
import { PermissionRoutes } from '../modules/permissions/permission.routes';
import { UserPermissionRoutes } from '../modules/user-permissions/userPermission.routes';
import { UserRoutes } from '../modules/users/user.routes';
import { LeadRoutes } from '../modules/leads/lead.routes';
import { TaskRoutes } from '../modules/tasks/task.routes';
import { AuditLogRoutes } from '../modules/audit-logs/auditLog.routes';
import { TicketRoutes } from '../modules/tickets/ticket.routes';
import { OrderRoutes } from '../modules/orders/order.routes';
import { ExportRoutes } from '../modules/export/export.routes';
import { ReportRoutes } from '../modules/reports/report.routes';
import { HealthRoutes } from '../modules/health/health.routes';

const router = express.Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/admin', route: AdminRoutes },
  { path: '/permissions', route: PermissionRoutes },
  { path: '/user-permissions', route: UserPermissionRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/leads', route: LeadRoutes },
  { path: '/tasks', route: TaskRoutes },
  { path: '/audit-logs', route: AuditLogRoutes },
  { path: '/tickets', route: TicketRoutes },
  { path: '/orders', route: OrderRoutes },
  { path: '/exports', route: ExportRoutes },
  { path: '/reports', route: ReportRoutes },
  { path: '/health', route: HealthRoutes },
];

moduleRoutes.forEach(route => {
  console.log(`[ROUTER] Mounting ${route.path}`);
  router.use(route.path, route.route);
});

export default router;
