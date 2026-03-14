import Permission from './permission.model';
import { logger } from '../../../shared/logger';

const PERMISSION_ATOMS = [
  { key: 'view_dashboard', label: 'Dashboard', description: 'View the main dashboard' },
  { key: 'manage_users', label: 'Users', description: 'Create, edit, suspend users' },
  { key: 'manage_leads', label: 'Leads', description: 'Create and manage leads' },
  { key: 'manage_tasks', label: 'Tasks', description: 'Create and manage tasks' },
  { key: 'view_reports', label: 'Reports', description: 'View analytics and reports' },
  { key: 'view_audit_logs', label: 'Audit Logs', description: 'View the audit activity log' },
  { key: 'manage_settings', label: 'Settings', description: 'Configure system settings' },
  { key: 'manage_permissions', label: 'Permission Management', description: 'Assign user permissions' },
  { key: 'view_tickets', label: 'View Tickets', description: 'View and track support tickets' },
  { key: 'manage_tickets', label: 'Manage Tickets', description: 'Respond to and close tickets' },
  { key: 'view_orders', label: 'View Orders', description: 'View and track customer orders' },
  { key: 'manage_orders', label: 'Manage Orders', description: 'Process and manage orders' },
  { key: 'create_tickets', label: 'Create Tickets', description: 'Open new support inquiries' },
  { key: 'task.view', label: 'View All Tasks', description: 'View every task in the system' },
  { key: 'task.view.own', label: 'View Own Tasks', description: 'View tasks assigned to you' },
  { key: 'task.create', label: 'Create Tasks', description: 'Create new tasks' },
  { key: 'task.update', label: 'Edit Tasks', description: 'Modify task details' },
  { key: 'task.assign', label: 'Assign Tasks', description: 'Assign tasks to team members' },
  { key: 'task.complete', label: 'Complete Tasks', description: 'Mark tasks as done' },
  { key: 'task.delete', label: 'Delete Tasks', description: 'Permanently remove tasks' },
  { key: 'order.create', label: 'Create Orders', description: 'Initiate new orders' },
  { key: 'order.view.own', label: 'View Own Orders', description: 'View orders you have placed' },
];

const seedPermissions = async (): Promise<void> => {
  for (const atom of PERMISSION_ATOMS) {
    await Permission.findOneAndUpdate(
      { key: atom.key },
      { $set: atom },
      { upsert: true, new: true }
    );
  }
  logger.info(`✅ Permissions seeded (${PERMISSION_ATOMS.length} atoms)`);
};

const getAllPermissions = async () => {
  return Permission.find().lean();
};

const getPermissionKeys = async (): Promise<string[]> => {
  const perms = await Permission.find().select('key').lean();
  return perms.map(p => p.key);
};

export const PermissionService = { seedPermissions, getAllPermissions, getPermissionKeys };
