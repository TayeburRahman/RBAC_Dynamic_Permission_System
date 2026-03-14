import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
import { validateRequest } from '../../middlewares/validateRequest';
import { UploadMiddleware } from '../../middlewares/upload';

const router = express.Router();

// ─── Register (generic) ─────────────────────────────────────────────
router.post(
  "/register",
  validateRequest(AuthValidation.register),
  AuthController.register
);

// ─── Shared Auth Routes ─────────────────────────────────────────────
router.post(
  "/verify-otp",
  validateRequest(AuthValidation.verifyOtp),
  AuthController.verifyOtp
);

router.post(
  "/resend-otp",
  validateRequest(AuthValidation.resendOtp),
  AuthController.resendOtp
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.loginAccount
);

router.post(
  "/forgot-password",
  validateRequest(AuthValidation.forgotPasswordSchema),
  AuthController.forgotPass
);

router.post(
  "/verify-forgot-otp",
  validateRequest(AuthValidation.verifyForgotOtp),
  AuthController.verifyForgotOtp
);

router.post(
  "/resend-forgot-code",
  validateRequest(AuthValidation.resendOtp),
  AuthController.resendForgotCode
);

router.post(
  "/reset-password",
  validateRequest(AuthValidation.resetPasswordSchema),
  AuthController.resetPassword
);

router.patch(
  "/change-password",
  auth(
    ENUM_USER_ROLE.CUSTOMER,
    ENUM_USER_ROLE.AGENT,
    ENUM_USER_ROLE.MANAGER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN
  ),
  validateRequest(AuthValidation.changePasswordSchema),
  AuthController.changePassword
);

router.get(
  "/profile",
  auth(
    ENUM_USER_ROLE.CUSTOMER,
    ENUM_USER_ROLE.AGENT,
    ENUM_USER_ROLE.MANAGER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN
  ),
  AuthController.getMyProfile
);

router.patch(
  "/profile-image",
  auth(
    ENUM_USER_ROLE.CUSTOMER,
    ENUM_USER_ROLE.AGENT,
    ENUM_USER_ROLE.MANAGER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN
  ),
  UploadMiddleware.uploadSingle('profileImage'),
  AuthController.updateProfileImage
);

router.patch(
  "/update-profile",
  auth(
    ENUM_USER_ROLE.CUSTOMER,
    ENUM_USER_ROLE.AGENT,
    ENUM_USER_ROLE.MANAGER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN
  ),
  validateRequest(AuthValidation.updateProfile),
  AuthController.updateProfile
);

// Refresh access token using httpOnly refresh cookie
router.post('/refresh', AuthController.refreshToken);

// Logout and clear refresh cookie
router.post('/logout', AuthController.logout);

export const AuthRoutes = router;
