import { z } from 'zod';

const createOrderSchema = z.object({
  body: z.object({
    orderId: z.string().optional(),
    amount: z.number({ required_error: 'Amount is required' }),
    items: z.array(z.object({
      name: z.string({ required_error: 'Item name is required' }),
      quantity: z.number({ required_error: 'Quantity is required' }),
      price: z.number({ required_error: 'Price is required' }),
    })).min(1, 'At least one item is required'),
  }),
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'paid', 'delivered', 'cancelled']),
  }),
});

export const OrderValidation = {
  createOrderSchema,
  updateOrderStatusSchema,
};
