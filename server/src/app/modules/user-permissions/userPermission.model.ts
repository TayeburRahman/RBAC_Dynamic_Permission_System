import { Schema, model, Types } from 'mongoose';
import { IUserPermission, UserPermissionModel } from './userPermission.interface';

const UserPermissionSchema = new Schema<IUserPermission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'Auth', required: true, unique: true },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

const UserPermission = model<IUserPermission, UserPermissionModel>('UserPermission', UserPermissionSchema);

export default UserPermission;
