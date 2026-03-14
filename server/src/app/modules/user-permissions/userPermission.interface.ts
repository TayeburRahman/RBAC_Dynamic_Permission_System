import { Model, Types } from 'mongoose';

export type IUserPermission = {
  userId: Types.ObjectId;
  permissions: string[];
};

export type UserPermissionModel = Model<IUserPermission>;
