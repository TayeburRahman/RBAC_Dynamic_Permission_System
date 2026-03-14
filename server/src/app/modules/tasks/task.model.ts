import { Schema, model } from 'mongoose';
import { ITask, TaskModel } from './task.interface';

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Auth', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

const Task = model<ITask, TaskModel>('Task', TaskSchema);
export default Task;
