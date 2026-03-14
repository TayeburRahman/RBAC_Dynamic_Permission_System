import { Response, Request } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import ApiError from '../../../errors/ApiError';
import { OrderService } from './order.service';
import { IReqUser } from '../auth/auth.interface';
import { ExportService } from '../export/export.service';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  
  let targetCustomerId = actorId;
  // Staff can create orders for others
  if (actor.role !== 'CUSTOMER' && req.body.customerId) {
    targetCustomerId = req.body.customerId;
  }

  const result = await OrderService.createOrder(targetCustomerId, req.body, actorId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Order created successfully',
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrders(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Orders retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const customerId = actor.authId || actor.userId || actor._id;
  const result = await OrderService.getMyOrders(customerId, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My orders retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const actor = req.user as any;
  const currentUserId = actor.authId || actor.userId || actor._id;

  const result = await OrderService.getOrderById(id);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // Ownership check: If customer, must own the order. Staff with view_orders can see it.
  if (actor.role === 'CUSTOMER' && result.customerId.toString() !== currentUserId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You cannot access this order');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order details retrieved successfully',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  const result = await OrderService.updateOrderStatus(id, actorId, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order status updated successfully',
    data: result,
  });
});

const getOrderStats = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getOrderStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order statistics retrieved successfully',
    data: result,
  });
});

const getMyOrderStats = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const customerId = actor.authId || actor.userId || actor._id;
  const result = await OrderService.getCustomerOrderStats(customerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My order statistics retrieved successfully',
    data: result,
  });
});

const payOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const actor = req.user as any;
  const customerId = actor.authId || actor.userId || actor._id;

  const order = await OrderService.getOrderById(id);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  if (order.customerId.toString() !== customerId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only pay for your own orders');
  }

  if (order.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, `Order is already ${order.status}`);
  }

  // Simulate successful payment
  const result = await OrderService.updateOrderStatus(id, customerId, 'paid');

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment successful! Order is now paid.',
    data: result,
  });
});

const generateInvoice = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const actor = req.user as any;
  const currentUserId = actor.authId || actor.userId || actor._id;

  const order = await OrderService.getOrderById(id);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // Ensure customer owns the order or is admin
  if (actor.role === 'CUSTOMER' && order.customerId.toString() !== currentUserId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You cannot access this invoice');
  }

  const pdf = await ExportService.generateInvoicePDF(order);
  
  res.header('Content-Type', 'application/pdf');
  res.attachment(`invoice_${order._id}.pdf`);
  res.send(pdf);
});

export const OrderController = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  getMyOrderStats,
  payOrder,
  generateInvoice,
};
