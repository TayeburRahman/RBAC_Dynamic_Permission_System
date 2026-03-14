import { Response, Request } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import ApiError from '../../../errors/ApiError';
import { OrderService } from './order.service';
import { IReqUser } from '../auth/auth.interface';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const { userId, _id } = req.user as any;
  const customerId = userId || _id;
  const result = await OrderService.createOrder(customerId, req.body);
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
  const { userId, _id } = req.user as any;
  const customerId = userId || _id;
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
  const result = await OrderService.getOrderById(id);
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
  const { userId, _id } = req.user as any;
  const actorId = userId || _id;
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
  const { userId, _id } = req.user as any;
  const customerId = userId || _id;
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
  const { userId, _id } = req.user as any;
  const customerId = userId || _id;

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

export const OrderController = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  getMyOrderStats,
  payOrder,
};
