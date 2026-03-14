import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import { AuthService } from './auth.service';
import sendResponse from '../../../shared/sendResponse';
import config from '../../../config';
import { IReqUser } from './auth.interface';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';

// ─── REGISTER (generic) ─────────────────────────────────────────────
const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});

// ─── VERIFY OTP  ──────────────────────────────────────────
const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyOtp({
    activation_code: req.body.activation_code,
    userEmail: req.body.email,
  });

  const cookieOptions = {
    secure: config.env === "production",
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
  };
  res.cookie("refreshToken", result.refreshToken, cookieOptions);


  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Account verified successfully.",
    data: result,
  });
});

// ─── RESEND OTP ─────────────────────────────────────────────────────
const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resendOtp(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});

// ─── LOGIN ──────────────────────────────────────────────────────────
const loginAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginAccount(req.body);
  const cookieOptions = {
    secure: config.env === "production",
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
  };
  res.cookie("refreshToken", result.refreshToken, cookieOptions);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logged in successfully!",
    data: result,
  });
});

// ─── FORGOT PASSWORD ────────────────────────────────────────────────
const forgotPass = catchAsync(async (req: Request, res: Response) => {
  await AuthService.forgotPass(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Check your email for the reset code!",
  });
});

// ─── VERIFY FORGOT PASSWORD OTP ─────────────────────────────────────
const verifyForgotOtp = catchAsync(async (req: Request, res: Response) => {
  await AuthService.checkIsValidForgetActivationCode(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Code verified successfully",
  });
});

// ─── RESEND FORGOT PASSWORD CODE ────────────────────────────────────
const resendForgotCode = catchAsync(async (req: Request, res: Response) => {
  await AuthService.resendCodeForgotAccount(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Code resent successfully",
  });
});

// ─── RESET PASSWORD ─────────────────────────────────────────────────
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.resetPassword(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password has been reset successfully.",
  });
});

// ─── CHANGE PASSWORD ────────────────────────────────────────────────
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  await AuthService.changePassword({ authId: actorId }, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password changed successfully!",
  });
});

// ─── GET MY PROFILE ─────────────────────────────────────────────────
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const actorId = actor.authId || actor.userId || actor._id;
  const result = await AuthService.myProfile({ userId: actorId, role: actor.role });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
});

// ─── REFRESH TOKEN ─────────────────────────────────────────────────
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  console.log('Refresh token request received. Cookies:', req.cookies, 'Body:', req.body);
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    console.log('No refresh token provided in cookies or body');
    throw new ApiError(httpStatus.UNAUTHORIZED, 'No refresh token provided');
  }

  try {
    const result = await AuthService.refreshToken(refreshToken);

    const cookieOptions = {
      secure: config.env === 'production',
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
    };
    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
        permissions: result.permissions
      },
    });
  } catch (error) {
    // Clear cookie if refresh fails to prevent stale loops
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax' as const,
      path: '/',
    });
    throw error;
  }
});

// ─── LOGOUT ────────────────────────────────────────────────────────
const logout = catchAsync(async (req: Request, res: Response) => {
  // Optionally accept refresh token to blacklist; for now, clear cookie
  const cookieOptions = {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: new Date(0),
  };
  res.cookie('refreshToken', '', cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Logged out successfully',
  });
});

const updateProfileImage = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const authId = actor.authId || actor.userId || actor._id;
  const profileImage = req.file?.path;

  if (!profileImage) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please upload a profile image');
  }

  const result = await AuthService.updateProfileImage(authId, profileImage);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile image updated successfully',
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const authId = actor.authId || actor.userId || actor._id;
  const result = await AuthService.updateProfile(authId, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

export const AuthController = {
  register,
  verifyOtp,
  resendOtp,
  loginAccount,
  forgotPass,
  verifyForgotOtp,
  resendForgotCode,
  resetPassword,
  changePassword,
  getMyProfile,
  refreshToken,
  logout,
  updateProfileImage,
  updateProfile,
};
