import bcrypt from "bcrypt";
import cron from "node-cron";
import httpStatus from "http-status";

import ApiError from "../../../errors/ApiError";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import { logger } from "../../../shared/logger";
import Auth from "./auth.model";
import sendEmail from "../../../utils/sendEmail";
import { ENUM_USER_ROLE } from "../../../enums/user";
import { sendResetEmail } from "./sendResetMails";
import { createActivationToken } from "../../../utils/createActivationToken";
import { registrationSuccessEmailBody } from "../../../mails/user.register";
import { resetEmailTemplate } from "../../../mails/reset.email";
import {
  ActivationPayload,
  ChangePasswordPayload,
  IAuth,
  LoginPayload,
  ResetPasswordPayload,
} from "./auth.interface";
import config from "../../../config";
import { UserPermissionService } from "../user-permissions/userPermission.service";
import { PermissionService } from "../permissions/permission.service";

// ─── REGISTER (generic) ────────────────────────────────────────────
const register = async (payload: IAuth & { confirmPassword: string; role?: string }) => {
  const { password, confirmPassword, email, name, phone_number, termsAccepted, role } = payload as any;

  // Derive a display name if not provided (use part before @ in email)
  const derivedName = name || (typeof email === 'string' && email.includes('@') ? email.split('@')[0] : 'User');
  const termsAcceptedFlag = typeof termsAccepted === 'boolean' ? termsAccepted : false;

  if (password !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password and Confirm Password didn't match");
  }

  const existingAuth = await Auth.findOne({ email }).lean();
  if (existingAuth?.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
  }

  // Clean up unverified accounts with same email
  if (existingAuth && !existingAuth.isActive) {
    await Auth.deleteOne({ email });
  }

  const { activationCode } = createActivationToken();

  const createAuth = await Auth.create({
    name: derivedName,
    email,
    phone_number,
    password,
    role: (role as string) || ENUM_USER_ROLE.CUSTOMER,
    activationCode,
    termsAccepted: termsAcceptedFlag,
    expirationTime: Date.now() + 3 * 60 * 1000,
  });

  if (!createAuth) {
    throw new ApiError(500, "Failed to create account");
  }

  // Send OTP email
  // Warn if terms were not accepted (still allow creation for development/testing)
  if (!termsAcceptedFlag) {
    logger.warn(`User registration without accepted terms: ${email}`);
  }

  sendEmail({
    email,
    subject: "Activate Your Account",
    html: registrationSuccessEmailBody({
      user: { name: derivedName },
      activationCode,
    }),
  }).catch((error) => console.error("Failed to send email:", error.message));

  return { message: "Please check your email for the activation OTP code." };
};

// ─── VERIFY OTP (Both Customer & Shop Owner) ────────────────────────
const verifyOtp = async (payload: ActivationPayload) => {
  const { activation_code, userEmail } = payload;

  const existAuth = await Auth.findOne({ email: userEmail });
  if (!existAuth) {
    throw new ApiError(400, "User not found");
  }
  if (existAuth.activationCode !== activation_code) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP code!");
  }

  // Check expiration
  if (existAuth.expirationTime && new Date() > existAuth.expirationTime) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP has expired. Please request a new one.");
  }

  await Auth.findOneAndUpdate(
    { email: userEmail },
    { isActive: true, activationCode: undefined },
    { new: true, runValidators: true }
  );

  // Grant default permissions for new customers
  await UserPermissionService.handleNewUserPermissions((existAuth._id as any).toString(), existAuth.role);

  const tokenPayload = {
    authId: (existAuth._id as any).toString(),
    role: existAuth.role,
    userId: (existAuth._id as any).toString(),
  };

  const accessToken = jwtHelpers.createToken(
    tokenPayload,
    config.jwt.secret as string,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    tokenPayload,
    config.jwt.refresh_secret as string,
    config.jwt.refresh_expires_in as string
  );

  const user = await Auth.findById(existAuth._id).select("-password");
  const permissions = await UserPermissionService.getUserPermissions((existAuth._id as any).toString());
  return { accessToken, refreshToken, user, permissions };
};

// ─── RESEND OTP ─────────────────────────────────────────────────────
const resendOtp = async (payload: { email: string }) => {
  const user = await Auth.findOne({ email: payload.email });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found!");
  }

  const { activationCode } = createActivationToken();
  user.activationCode = activationCode;
  user.expirationTime = new Date(Date.now() + 3 * 60 * 1000);
  await user.save();

  sendEmail({
    email: user.email,
    subject: "Your Activation Code",
    html: registrationSuccessEmailBody({
      user: { name: user.name },
      activationCode,
    }),
  }).catch((error) => console.error("Failed to send email:", error.message));

  return { message: "OTP resent successfully" };
};

// ─── LOGIN ──────────────────────────────────────────────────────────
const loginAccount = async (payload: LoginPayload) => {
  const { email, password } = payload;

  const isAuth = await Auth.isAuthExist(email);
  if (!isAuth) {
    throw new ApiError(404, "User does not exist");
  }
  if (!isAuth.isActive) {
    throw new ApiError(401, "Please activate your account then try to login");
  }
  if (isAuth.is_block) {
    throw new ApiError(403, "You are blocked. Contact support");
  }
  if (isAuth.password && !(await Auth.isPasswordMatched(password, isAuth.password))) {
    throw new ApiError(401, "Password is incorrect");
  }

  const tokenPayload = {
    authId: (isAuth._id as any).toString(),
    role: isAuth.role,
    userId: (isAuth._id as any).toString(),
  };

  const accessToken = jwtHelpers.createToken(
    tokenPayload,
    config.jwt.secret as string,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    tokenPayload,
    config.jwt.refresh_secret as string,
    config.jwt.refresh_expires_in as string
  );

  // Fetch existing permissions
  let permissions = await UserPermissionService.getUserPermissions((isAuth._id as any).toString());

  // Retroactive fix: if no permissions exist, grant defaults
  if (permissions.length === 0) {
    await UserPermissionService.handleNewUserPermissions((isAuth._id as any).toString(), isAuth.role);
    permissions = await UserPermissionService.getUserPermissions((isAuth._id as any).toString());
  }

  // Ensure Super Admin always has full access during login as a safety net
  if (isAuth.role === ENUM_USER_ROLE.SUPER_ADMIN) {
    const allKeys = await PermissionService.getPermissionKeys();
    if (permissions.length !== allKeys.length) {
      await UserPermissionService.setPermissionsDirectly((isAuth._id as any).toString(), allKeys);
      permissions = allKeys;
    }
  }

  const user = await Auth.findById(isAuth._id).select('-password');
  return { accessToken, refreshToken, user, permissions };
};

// ─── FORGOT PASSWORD ────────────────────────────────────────────────
const forgotPass = async (payload: { email: string }) => {
  const user = (await Auth.findOne(
    { email: payload.email },
    { _id: 1, role: 1, email: 1, name: 1 }
  )) as IAuth;

  if (!user?.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found!");
  }

  const verifyCode = createActivationToken().activationCode;
  const verifyExpire = new Date(Date.now() + 15 * 60 * 1000);
  user.verifyCode = verifyCode;
  user.verifyExpire = verifyExpire;
  await user.save();

  await sendEmail({
    email: payload.email,
    subject: "Password Reset Code",
    html: resetEmailTemplate({
      name: user.name,
      verifyCode,
      verifyExpire: Math.round((verifyExpire.getTime() - Date.now()) / (60 * 1000)),
    }),
  });
};

// ─── VERIFY FORGOT PASSWORD OTP ─────────────────────────────────────
const checkIsValidForgetActivationCode = async (payload: { email: string; code: string }) => {
  const account = await Auth.findOne({ email: payload.email });
  if (!account) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Account does not exist!");
  }
  if (account.verifyCode !== payload.code) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid reset code!");
  }
  if (account.verifyExpire && new Date() > account.verifyExpire) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Reset code has expired!");
  }

  await Auth.updateOne({ email: account.email }, { codeVerify: true });
  account.verifyCode = undefined;
  await account.save();
};

// ─── RESET PASSWORD ─────────────────────────────────────────────────
const resetPassword = async (req: { query: { email: string }; body: ResetPasswordPayload }) => {
  const { email } = req.query;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Passwords do not match");
  }

  const auth = await Auth.findOne({ email }, { _id: 1, codeVerify: 1 });
  if (!auth) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found!");
  }
  if (!auth.codeVerify) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Your OTP is not verified!");
  }

  const hashedPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));
  await Auth.updateOne({ email }, { password: hashedPassword, codeVerify: false });
};

// ─── CHANGE PASSWORD ────────────────────────────────────────────────
const changePassword = async (
  user: { authId: string },
  payload: ChangePasswordPayload
) => {
  const { oldPassword, newPassword, confirmPassword } = payload;

  if (newPassword !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password and confirm password do not match");
  }

  const isUserExist = await Auth.findById(user.authId).select("+password");
  if (!isUserExist) {
    throw new ApiError(404, "Account does not exist!");
  }
  if (isUserExist.password && !(await Auth.isPasswordMatched(oldPassword, isUserExist.password))) {
    throw new ApiError(401, "Old password is incorrect");
  }

  isUserExist.password = newPassword;
  await isUserExist.save();

  return { message: "Password changed successfully" };
};

// ─── RESEND FORGOT PASSWORD CODE ────────────────────────────────────
const resendCodeForgotAccount = async (payload: { email: string }) => {
  const user = await Auth.findOne({ email: payload.email });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found!");
  }

  const verifyCode = createActivationToken().activationCode;
  user.verifyCode = verifyCode;
  user.verifyExpire = new Date(Date.now() + 3 * 60 * 1000);
  await user.save();

  sendResetEmail(
    user.email,
    resetEmailTemplate({
      name: user.name,
      verifyCode,
      verifyExpire: 3,
    })
  );
};

// ─── MY PROFILE ─────────────────────────────────────────────────────
const myProfile = async (user: { userId: string; role: string }) => {
  const auth = await Auth.findById(user.userId).select('-password');
  if (!auth) throw new ApiError(404, 'User not found');
  return auth;
};

// ─── CRON: Clean expired activation codes ───────────────────────────
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const result = await Auth.updateMany(
      {
        isActive: false,
        expirationTime: { $lte: now },
        activationCode: { $ne: null },
      },
      { $unset: { activationCode: "" } }
    );
    if (result.modifiedCount > 0) {
      logger.info(`Removed activation codes from ${result.modifiedCount} expired users`);
    }
  } catch (error) {
    logger.error("Error removing activation codes:", error);
  }
});

const updateProfileImage = async (userId: string, profileImage: string) => {
  const result = await Auth.findByIdAndUpdate(
    userId,
    { profile_image: profileImage },
    { new: true }
  ).select('-password');

  if (!result) {
    throw new ApiError(404, 'User not found');
  }

  return result;
};

const updateProfile = async (userId: string, payload: Partial<IAuth>) => {
  const result = await Auth.findByIdAndUpdate(
    userId,
    { $set: payload },
    { new: true, runValidators: true }
  ).select("-password");

  if (!result) {
    throw new ApiError(404, "User not found");
  }

  return result;
};

export const AuthService = {
  register,
  verifyOtp,
  resendOtp,
  loginAccount,
  forgotPass,
  checkIsValidForgetActivationCode,
  resetPassword,
  changePassword,
  resendCodeForgotAccount,
  myProfile,
  refreshToken,
  logout,
  updateProfileImage,
  updateProfile,
};

// ─── Refresh token handling ─────────────────────────────────────────
async function refreshToken(token: string) {
  try {
    const payload = jwtHelpers.verifyToken(token, config.jwt.refresh_secret as any) as any;
    if (!payload) {
      console.error('[REFRESH ERROR] Token verification returned null payload');
      throw new ApiError(401, 'Invalid refresh token');
    }

    const auth = await Auth.findById(payload.authId);
    if (!auth) {
      console.error(`[REFRESH ERROR] User not found for authId: ${payload.authId}`);
      throw new ApiError(401, 'Invalid token');
    }

    const accessToken = jwtHelpers.createToken(
      { authId: (auth._id as any).toString(), role: auth.role, userId: (auth._id as any).toString() },
      config.jwt.secret as any,
      config.jwt.expires_in as string
    );

    const refreshToken = jwtHelpers.createToken(
      { authId: (auth._id as any).toString(), role: auth.role, userId: (auth._id as any).toString() },
      config.jwt.refresh_secret as any,
      config.jwt.refresh_expires_in as string
    );

    const user = await Auth.findById(auth._id).select('-password');
    const permissions = await UserPermissionService.getUserPermissions((auth._id as any).toString());
    return { accessToken, refreshToken, user, permissions };
  } catch (error: any) {
    console.error('[REFRESH ERROR] Exception during refresh:', error?.message || error);
    throw new ApiError(401, 'Invalid refresh token');
  }
};

async function logout(_token?: string) {
  // For simplicity: no-op server-side blacklist. Clients should clear cookie.
  return { message: 'Logged out' };
}

// (refreshToken and logout are exported above)
