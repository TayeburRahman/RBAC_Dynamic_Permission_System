import Permission from './permission.model';
import { logger } from '../../../shared/logger';

const PERMISSION_ATOMS = [
  // Dashboard & System
  { key: 'view_dashboard', label: 'View the main dashboard', description: 'Access to the central dashboard and overview', category: 'System' },
  { key: 'manage_users', label: 'Create, edit, suspend users', description: 'Manage system users and their account status', category: 'Users' },
  { key: 'manage_permissions', label: 'Assign user permissions', description: 'Grant or revoke access for other users', category: 'Users' },
  { key: 'view_audit_logs', label: 'View the audit activity log', description: 'Monitor system changes and user actions', category: 'System' },
  { key: 'manage_settings', label: 'Configure system settings', description: 'Modify global system parameters', category: 'System' },
  { key: 'view_reports', label: 'View analytics and reports', description: 'Access to business intelligence and metrics', category: 'Reports' },

  // Leads
  { key: 'manage_leads', label: 'Create and manage leads', description: 'Add new leads and update their stage', category: 'Leads' },

  // Tasks
  { key: 'manage_tasks', label: 'Create and manage tasks', description: 'Full control over administrative tasks', category: 'Tasks' },
  { key: 'task.view', label: 'View every task in the system', description: 'Global visibility into all task activity', category: 'Tasks' },
  { key: 'task.view.own', label: 'View tasks assigned to you', description: 'See only your personal workload', category: 'Tasks' },
  { key: 'task.create', label: 'Create new tasks', description: 'Initiate new work items', category: 'Tasks' },
  { key: 'task.update', label: 'Modify task details', description: 'Edit existing tasks', category: 'Tasks' },
  { key: 'task.assign', label: 'Assign tasks to team members', description: 'Distribute work across the team', category: 'Tasks' },
  { key: 'task.complete', label: 'Mark tasks as done', description: 'Sign off on completed tasks', category: 'Tasks' },
  { key: 'task.delete', label: 'Permanently remove tasks', description: 'Delete task records', category: 'Tasks' },

  // Support
  { key: 'view_tickets', label: 'View and track support tickets', description: 'Monitor incoming support inquiries', category: 'Support' },
  { key: 'manage_tickets', label: 'Respond to and close tickets', description: 'Interaction and resolution of support cases', category: 'Support' },
  { key: 'create_tickets', label: 'Open new support inquiries', description: 'Submit new support requests', category: 'Support' },

  // Orders
  { key: 'view_orders', label: 'View and track customer orders', description: 'Monitor order flow and status', category: 'Orders' },
  { key: 'manage_orders', label: 'Process and manage orders', description: 'Modify order status and fulfillments', category: 'Orders' },
  { key: 'order.create', label: 'Initiate new orders', description: 'Place new orders in the system', category: 'Orders' },
  { key: 'order.view.own', label: 'View orders you have placed', description: 'Check your personal purchase history', category: 'Orders' },
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
