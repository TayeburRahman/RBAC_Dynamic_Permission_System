import { Types } from 'mongoose';
import { IOrder } from './order.interface';
import { Order } from './order.model';
import QueryBuilder from '../../../builder/QueryBuilder';
import { AuditLogService } from '../audit-logs/auditLog.service';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { sendNotification } from '../../../utils/notification';

const createOrder = async (customerId: string, payload: Partial<IOrder>) => {
  const result = await Order.create({
    ...payload,
    customerId: new Types.ObjectId(customerId),
  });
  
  await AuditLogService.log(
    customerId,
    'CREATE_ORDER',
    { target: 'Order', targetId: result._id, metadata: { orderId: result.orderId, amount: result.amount } }
  );
  
  return result;
};

const getAllOrders = async (query: Record<string, unknown>) => {
  const orderQuery = new QueryBuilder(
    Order.find().populate('customerId', 'name email'),
    query
  )
    .search(['orderId'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return { meta, result };
};

const getMyOrders = async (customerId: string, query: Record<string, unknown>) => {
  const orderQuery = new QueryBuilder(
    Order.find({ customerId: new Types.ObjectId(customerId) }),
    query
  )
    .search(['orderId'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return { meta, result };
};

const getOrderById = async (id: string) => {
  const result = await Order.findById(id).populate('customerId', 'name email');
  return result;
};

const updateOrderStatus = async (id: string, actorId: string, status: string) => {
  const result = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  await AuditLogService.log(
    actorId,
    'UPDATE_ORDER_STATUS',
    { target: 'Order', targetId: id, metadata: { status } }
  );

  sendNotification(
    result.customerId.toString(),
    `Order #${result.orderId} status updated to ${status}`,
    { orderId: result._id, status }
  );

  return result;
};

const getOrderStats = async () => {
  const [total, pending, paid, delivered, cancelled] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ status: 'paid' }),
    Order.countDocuments({ status: 'delivered' }),
    Order.countDocuments({ status: 'cancelled' }),
  ]);
  return { total, pending, paid, delivered, cancelled };
};

const getCustomerOrderStats = async (customerId: string) => {
  const [total, pending, paid, delivered, cancelled] = await Promise.all([
    Order.countDocuments({ customerId: new Types.ObjectId(customerId) }),
    Order.countDocuments({ customerId: new Types.ObjectId(customerId), status: 'pending' }),
    Order.countDocuments({ customerId: new Types.ObjectId(customerId), status: 'paid' }),
    Order.countDocuments({ customerId: new Types.ObjectId(customerId), status: 'delivered' }),
    Order.countDocuments({ customerId: new Types.ObjectId(customerId), status: 'cancelled' }),
  ]);
  return { total, pending, paid, delivered, cancelled };
};

export const OrderService = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  getCustomerOrderStats,
};
