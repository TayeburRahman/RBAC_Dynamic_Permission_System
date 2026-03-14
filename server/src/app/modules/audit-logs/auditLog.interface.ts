import { Model, Types } from 'mongoose';

export type IAuditLog = {
  actor: Types.ObjectId;
  actorName?: string;
  action: string;
  target?: string;
  targetId?: Types.ObjectId;
  metadata?: Record<string, any>;
};

export type AuditLogModel = Model<IAuditLog>;
