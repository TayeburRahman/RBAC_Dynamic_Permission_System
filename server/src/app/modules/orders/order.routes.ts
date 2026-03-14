import express from 'express';
import auth from '../../middlewares/auth';
import requirePermission from '../../middlewares/requirePermission';
import { validateRequest } from '../../middlewares/validateRequest';
import { OrderController } from './order.controller';
import { OrderValidation } from './order.validation';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

// ─── Customer Routes ───────────────────────────────────────────────────────

// Customer only - Create order
// Create order - Allowed for any role with order.create permission
router.post(
  '/',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MANAGER,
    ENUM_USER_ROLE.CUSTOMER
  ),
  requirePermission('order.create'),
  validateRequest(OrderValidation.createOrderSchema),
  OrderController.createOrder
);

// Get my orders (Customer)
router.get(
  '/my-orders',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MANAGER,
    ENUM_USER_ROLE.CUSTOMER
  ),
  requirePermission('order.view.own'),
  OrderController.getMyOrders
);

router.post(
  '/:id/pay',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.CUSTOMER),
  OrderController.payOrder
);

router.get(
  '/:id/invoice',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.CUSTOMER),
  OrderController.generateInvoice
);

router.get(
  '/my-stats',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MANAGER,
    ENUM_USER_ROLE.CUSTOMER
  ),
  requirePermission('order.view.own'),
  OrderController.getMyOrderStats
);

// ─── Staff Routes (Admin / Manager / Agent with permission) ───────────────

// Order stats — Admin always allowed; Manager & Agent need view_orders
// Order stats — Admin always allowed; Manager & Agent need view_orders
router.get(
  '/stats',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
  requirePermission(['view_orders', 'view_reports']),
  OrderController.getOrderStats
);

// Get all orders — Admin always allowed; Manager & Agent need view_orders
router.get(
  '/',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
  requirePermission('view_orders'),
  OrderController.getAllOrders
);

// Get single order — Admin always allowed; Manager & Agent need view_orders; Customer sees their own
router.get(
  '/:id',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.MANAGER,
    ENUM_USER_ROLE.CUSTOMER,
  ),
  OrderController.getOrderById
);

// Update order status — Admin always allowed; Manager needs manage_orders
router.patch(
  '/:id/status',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
  requirePermission('manage_orders'),
  validateRequest(OrderValidation.updateOrderStatusSchema),
  OrderController.updateOrderStatus
);

export const OrderRoutes = router;
