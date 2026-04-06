import { Request, Response } from "express";
import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { NotificationService } from "./notification.service";

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await NotificationService.getNotifications(user.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications fetched successfully",
    data: result
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.markAsRead(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification marked as read",
    data: result
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await NotificationService.markAllAsRead(user.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All notifications marked as read",
    data: result
  });
});

export const NotificationController = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
};
