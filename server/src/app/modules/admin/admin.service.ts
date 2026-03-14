import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import Auth from "../auth/auth.model";
import Admin from "./admin.model";
import { ENUM_USER_ROLE } from "../../../enums/user";

// ─── CREATE ADMIN (Only Super Admin) ────────────────────────────────
const createAdmin = async (payload: {
  name: string;
  email: string;
  phone_number: string;
  password: string;
}) => {
  const existingAuth = await Auth.findOne({ email: payload.email });
  if (existingAuth) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
  }

  const authData = await Auth.create({
    name: payload.name,
    email: payload.email,
    phone_number: payload.phone_number,
    password: payload.password,
    role: ENUM_USER_ROLE.ADMIN,
    isActive: true,
    termsAccepted: true,
  });

  const admin = await Admin.create({
    authId: authData._id,
    name: payload.name,
    email: payload.email,
    phone_number: payload.phone_number,
  });

  return admin;
};

// ─── UPDATE ADMIN PROFILE ───────────────────────────────────────────
const updateAdminProfile = async (
  adminId: string,
  payload: { name?: string; email?: string; phone_number?: string; profile_image?: string }
) => {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");
  }

  // Update Admin profile
  const updatedAdmin = await Admin.findByIdAndUpdate(adminId, payload, {
    new: true,
    runValidators: true,
  }).populate("authId", "name email phone_number is_block isActive role");

  // Sync name/email/phone on Auth record
  const authUpdate: Record<string, any> = {};
  if (payload.name) authUpdate.name = payload.name;
  if (payload.email) authUpdate.email = payload.email;
  if (payload.phone_number) authUpdate.phone_number = payload.phone_number;

  if (Object.keys(authUpdate).length > 0) {
    await Auth.findByIdAndUpdate(admin.authId, authUpdate);
  }

  return updatedAdmin;
};

// ─── DELETE ADMIN ───────────────────────────────────────────────────
const deleteAdmin = async (adminId: string) => {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");
  }

  // Prevent deleting a Super Admin
  const auth = await Auth.findById(admin.authId);
  if (auth?.role === ENUM_USER_ROLE.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, "Cannot delete a Super Admin");
  }

  await Promise.all([
    Admin.findByIdAndDelete(adminId),
    Auth.findByIdAndDelete(admin.authId),
  ]);

  return { message: "Admin deleted successfully" };
};

export const AdminService = {
  createAdmin,
  updateAdminProfile,
  deleteAdmin,
};
