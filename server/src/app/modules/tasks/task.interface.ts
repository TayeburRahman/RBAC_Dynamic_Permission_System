import { Model, Types } from 'mongoose';

export type ITask = {
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: Types.ObjectId;
  createdBy: Types.ObjectId;
  dueDate?: Date;
};

export type TaskModel = Model<ITask>;
