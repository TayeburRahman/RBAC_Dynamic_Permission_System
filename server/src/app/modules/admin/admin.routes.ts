import express from "express";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/user";
import { AdminController } from "./admin.controller";
import { AdminValidation } from "./admin.validation";
import { validateRequest } from "../../middlewares/validateRequest";

const router = express.Router();

// ─── Admin Management (Super Admin only) ───────────────────────────
router.post(
  "/create",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(AdminValidation.createAdmin),
  AdminController.createAdmin
);

router.patch(
  "/profile/:id",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(AdminValidation.updateAdminProfile),
  AdminController.updateAdminProfile
);

router.delete(
  "/:id",
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(AdminValidation.deleteAdmin),
  AdminController.deleteAdmin
);

export const AdminRoutes = router;
