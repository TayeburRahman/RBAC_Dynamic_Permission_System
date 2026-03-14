import AuditLog from './auditLog.model';
import { Types } from 'mongoose';

const log = async (
  actor: string | Types.ObjectId,
  action: string,
  options?: {
    actorName?: string;
    target?: string;
    targetId?: string | Types.ObjectId;
    metadata?: Record<string, any>;
  }
): Promise<void> => {
  try {
    await AuditLog.create({
      actor,
      actorName: options?.actorName,
      action,
      target: options?.target,
      targetId: options?.targetId,
      metadata: options?.metadata,
    });
  } catch (e) {
    // Never fail caller due to audit log error
    console.error('AuditLog write failed:', e);
  }
};

const getLogs = async (query: {
  page?: number;
  limit?: number;
  actor?: string;
  action?: string;
}) => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.actor) filter.actor = query.actor;
  if (query.action) filter.action = { $regex: query.action, $options: 'i' };

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('actor', 'name email role')
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return { logs, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const AuditLogService = { log, getLogs };
