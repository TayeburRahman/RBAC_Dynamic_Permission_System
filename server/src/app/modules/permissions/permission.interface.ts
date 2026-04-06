import { Model } from 'mongoose';

export type IPermission = {
  key: string;
  label: string;
  description: string;
  category?: string;
};

export type PermissionModel = Model<IPermission>;
