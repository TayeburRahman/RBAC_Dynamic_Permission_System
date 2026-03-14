import { Document, Model, Types } from 'mongoose';

export type IEmailOptions = {
  email: string;
  subject: string;
  html: string;
};

export type IAuth = Document & {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  role: 'CUSTOMER' | 'AGENT' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
  activationCode?: string;
  expirationTime?: Date;
  verifyCode?: string;
  verifyExpire?: Date;
  codeVerify?: boolean;
  is_block?: boolean;
  isActive?: boolean;
  profile_image: string | null;
  termsAccepted: boolean;
  managedBy?: Types.ObjectId | string;
};

export interface IAuthModel extends Model<IAuth> {
  isAuthExist(email: string): Promise<IAuth | null>;
  isPasswordMatched(givenPassword: string, savedPassword: string): Promise<boolean>;
}

export type IReqUser = {
  userId: string;
  authId: string;
  role: string;
};

export interface ActivationPayload {
  activation_code: string;
  userEmail: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
