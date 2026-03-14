import { Schema, model } from 'mongoose';
import { IAuditLog, AuditLogModel } from './auditLog.interface';

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
    actorName: { type: String, default: '' },
    action: { type: String, required: true },
    target: { type: String, default: null },
    targetId: { type: Schema.Types.ObjectId, default: null },
    metadata: { type: Schema.Types.Mixed, default: null },
  },
  {
    timestamps: true,
    // No updates or deletes allowed - enforce via API only
  }
);

const AuditLog = model<IAuditLog, AuditLogModel>('AuditLog', AuditLogSchema);
export default AuditLog;
