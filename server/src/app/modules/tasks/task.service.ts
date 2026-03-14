import Task from './task.model';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';

const createTask = async (data: {
  title: string;
  description?: string;
  priority?: string;
  assignedTo?: string;
  dueDate?: Date;
  createdBy: string;
}) => {
  return Task.create(data);
};

const getTasks = async (query: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  search?: string;
  assignedTo?: string;
}) => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (query.search) {
    filter.$or = [{ title: { $regex: query.search, $options: 'i' } }];
  }

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .lean(),
    Task.countDocuments(filter),
  ]);

  return { tasks, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getTaskById = async (id: string) => {
  const task = await Task.findById(id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .lean();
  if (!task) throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
  return task;
};

const updateTask = async (
  id: string,
  data: { title?: string; description?: string; status?: string; priority?: string; assignedTo?: string; dueDate?: Date }
) => {
  const task = await Task.findByIdAndUpdate(id, { $set: data }, { new: true });
  if (!task) throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
  return task;
};

const deleteTask = async (id: string) => {
  await Task.findByIdAndDelete(id);
};

const getStats = async () => {
  const [total, todo, inProgress, review, done] = await Promise.all([
    Task.countDocuments(),
    Task.countDocuments({ status: 'todo' }),
    Task.countDocuments({ status: 'in-progress' }),
    Task.countDocuments({ status: 'review' }),
    Task.countDocuments({ status: 'done' }),
  ]);
  return { total, todo, inProgress, review, done };
};

export const TaskService = { createTask, getTasks, getTaskById, updateTask, deleteTask, getStats };
