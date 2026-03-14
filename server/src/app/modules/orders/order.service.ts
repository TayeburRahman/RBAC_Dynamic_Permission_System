import { Types } from 'mongoose';
import { IOrder } from './order.interface';
import { Order } from './order.model';
import QueryBuilder from '../../../builder/QueryBuilder';
import { AuditLogService } from '../audit-logs/auditLog.service';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { sendNotification } from '../../../utils/notification';
import { CacheService } from '../cache/cache.service';

const CACHE_KEY_ORDER_STATS = 'order_stats';

const createOrder = async (customerId: string, payload: Partial<IOrder>, actorId?: string) => {
  // Auto-generate orderId if not provided
  if (!payload.orderId) {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    payload.orderId = `ORD-${timestamp}-${random}`;
  }

  const result = await Order.create({
    ...payload,
    customerId: new Types.ObjectId(customerId),
  });
  
  await AuditLogService.log(
    actorId || customerId,
    'CREATE_ORDER',
    { target: 'Order', targetId: result._id, metadata: { orderId: result.orderId, amount: result.amount } }
  );

  await CacheService.del(CACHE_KEY_ORDER_STATS);
  
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

  await CacheService.del(CACHE_KEY_ORDER_STATS);

  return result;
};

const getOrderStats = async () => {
  const cachedData = await CacheService.get<any>(CACHE_KEY_ORDER_STATS);
  if (cachedData) return cachedData;

  const [total, pending, paid, delivered, cancelled] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ status: 'paid' }),
    Order.countDocuments({ status: 'delivered' }),
    Order.countDocuments({ status: 'cancelled' }),
  ]);
  const stats = { total, pending, paid, delivered, cancelled };
  await CacheService.set(CACHE_KEY_ORDER_STATS, stats, 300);
  return stats;
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
