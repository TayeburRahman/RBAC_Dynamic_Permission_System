import express from 'express';
import auth from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { OrderController } from './order.controller';
import { OrderValidation } from './order.validation';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

// Customer only - Create order
router.post(
  '/',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.CUSTOMER),
  validateRequest(OrderValidation.createOrderSchema),
  OrderController.createOrder
);

// Get my orders (Customer)
router.get(
  '/my-orders',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.CUSTOMER),
  OrderController.getMyOrders
);

router.post(
  '/:id/pay',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.CUSTOMER),
  OrderController.payOrder
);

router.get(
  '/stats',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT),
  OrderController.getOrderStats
);

router.get(
  '/my-stats',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.CUSTOMER),
  OrderController.getMyOrderStats
);

// Admin/Manager/Agent - Get all orders
router.get(
  '/',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT),
  OrderController.getAllOrders
);

router.get(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.CUSTOMER),
  OrderController.getOrderById
);

router.patch(
  '/:id/status',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
  validateRequest(OrderValidation.updateOrderStatusSchema),
  OrderController.updateOrderStatus
);

export const OrderRoutes = router;
