import { ENUM_USER_ROLE } from '../enums/user';

export const sendNotification = (userId: string, message: string, data?: any) => {
  if (!(global as any).io) return;

  (global as any).io.to(userId).emit('notification', {
    message,
    data,
    timestamp: new Date(),
  });
};

export const broadcastToRoles = (roles: string[], message: string, data?: any) => {
  if (!(global as any).io) return;

  // This is a simple implementation. In a real app, you might join users to role rooms.
  // For now, we'll just emit a global event that clients filter, or loop through online users if tracked.
  // A better way is: io.to('admin_room').emit(...)
  
  (global as any).io.emit('role_notification', {
    roles,
    message,
    data,
    timestamp: new Date(),
  });
};
