import { Model } from 'mongoose';

export type IPermission = {
  key: string;
  label: string;
  description: string;
};

export type PermissionModel = Model<IPermission>;
