import { Schema, model } from 'mongoose';
import { IPermission, PermissionModel } from './permission.interface';

const PermissionSchema = new Schema<IPermission>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
  },
  { timestamps: true }
);

const Permission = model<IPermission, PermissionModel>('Permission', PermissionSchema);

export default Permission;
