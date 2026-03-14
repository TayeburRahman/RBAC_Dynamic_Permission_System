import { z } from "zod";

const register = z.object({
  body: z.object({
    name: z
      .string()
      .optional(),
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format"),
    phone_number: z
      .string({ required_error: "Phone number is required" })
      .min(4, "Phone number is too short"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .min(6, "Confirm password must be at least 6 characters"),
    // Accept boolean or absent; service will enforce/derive as needed
    termsAccepted: z.boolean().optional(),
    role: z
      .enum(["CUSTOMER", "AGENT", "MANAGER", "ADMIN", "SUPER_ADMIN"])
      .optional(),
  }),
});

const verifyOtp = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format"),
    activation_code: z
      .string({ required_error: "OTP code is required" })
      .length(6, "OTP must be 6 digits"),
  }),
});

const resendOtp = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format"),
  }),
});

const loginZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
    password: z.string({ required_error: "Password is required" }),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  }),
});

const verifyForgotOtp = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format"),
    code: z
      .string({ required_error: "Code is required" })
      .length(6, "Code must be 6 digits"),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .min(6, "Confirm password must be at least 6 characters"),
  }),
  query: z.object({
    email: z.string({ required_error: "Email is required" }).email(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: "Old password is required" }),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .min(6, "Confirm password must be at least 6 characters"),
  }),
});

const updateProfile = z.object({
  body: z.object({
    name: z.string().optional(),
    phone_number: z.string().optional(),
  }),
});

export const AuthValidation = {
  register,
  verifyOtp,
  updateProfile,
  resendOtp,
  loginZodSchema,
  forgotPasswordSchema,
  verifyForgotOtp,
  resetPasswordSchema,
  changePasswordSchema,
};
