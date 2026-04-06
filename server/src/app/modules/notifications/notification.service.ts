import { Notification } from "./notification.model";
import { Types } from "mongoose";

const createNotification = async (payload: {
  recipient: Types.ObjectId | string;
  sender?: Types.ObjectId | string;
  title: string;
  message: string;
  type: "TASK_ASSIGNED" | "TASK_STATUS_UPDATE" | "ORDER_CREATED" | "NEW_MESSAGE" | "TICKET_UPDATE" | "SYSTEM";
  link?: string;
}) => {
  const result = await Notification.create(payload);
  
  // Real-time socket emission
  if (typeof (global as any).io !== 'undefined') {
    (global as any).io.to(String(payload.recipient)).emit("new_notification", result);
  }
  
  return result;
};

const getNotifications = async (recipientId: string) => {
  const result = await Notification.find({ recipient: recipientId })
    .sort({ createdAt: -1 })
    .limit(50);
  
  const unreadCount = await Notification.countDocuments({ 
    recipient: recipientId, 
    isRead: false 
  });
  
  return { notifications: result, unreadCount };
};

const markAsRead = async (notificationId: string) => {
  const result = await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
  return result;
};

const markAllAsRead = async (recipientId: string) => {
  const result = await Notification.updateMany(
    { recipient: recipientId, isRead: false },
    { isRead: true }
  );
  return result;
};

export const NotificationService = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead
};
