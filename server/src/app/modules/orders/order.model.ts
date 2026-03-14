import { Schema, model } from 'mongoose';
import { IOrder, OrderModel } from './order.interface';

const orderItemSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
}, { _id: false });

const orderSchema = new Schema<IOrder, OrderModel>(
  {
    orderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'delivered', 'cancelled'], default: 'pending' },
    customerId: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
    items: [orderItemSchema],
  },
  { timestamps: true }
);

export const Order = model<IOrder, OrderModel>('Order', orderSchema);
