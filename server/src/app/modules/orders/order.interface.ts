import { Model, Types } from 'mongoose';

export type IOrderItem = {
  name: string;
  quantity: number;
  price: number;
};

export type IOrder = {
  orderId: string;
  amount: number;
  status: 'pending' | 'paid' | 'delivered' | 'cancelled';
  customerId: Types.ObjectId;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
};

export type OrderModel = Model<IOrder>;
