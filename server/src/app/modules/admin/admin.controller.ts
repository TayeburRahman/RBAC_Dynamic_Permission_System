import { Request, Response } from "express";
import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { AdminService } from "./admin.service";

// ─── CREATE ADMIN ───────────────────────────────────────────────────
const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.createAdmin(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Admin created successfully",
    data: result,
  });
});

// ─── UPDATE ADMIN PROFILE ───────────────────────────────────────────
const updateAdminProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.updateAdminProfile(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin profile updated successfully",
    data: result,
  });
});

// ─── DELETE ADMIN ───────────────────────────────────────────────────
const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.deleteAdmin(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});

export const AuthController = {
  createAdmin,
  updateAdminProfile,
  deleteAdmin,
};

// Backwards compatibility for AdminRoutes if needed
export const AdminController = AuthController;
