import { logger } from "../shared/logger";
import Auth from "../app/modules/auth/auth.model";
import Admin from "../app/modules/admin/admin.model";
import { ENUM_USER_ROLE } from "../enums/user";
import config from "../config";
import { PermissionService } from "../app/modules/permissions/permission.service";
import { UserPermissionService } from "../app/modules/user-permissions/userPermission.service";

export const seedSuperAdmin = async () => {
  const { email, password, name, phone_number } = config.super_admin;

  let superAdmin = await Auth.findOne({ email });

  if (!superAdmin) {
    logger.info("Creating Super Admin...");
    superAdmin = await Auth.create({
      name, email, phone_number, password,
      role: ENUM_USER_ROLE.SUPER_ADMIN,
      isActive: true,
      termsAccepted: true,
    });
    await Admin.create({ authId: superAdmin._id, name, email, phone_number });
    logger.info(`✅ Super Admin created (${email})`);
  } else if (superAdmin.role !== ENUM_USER_ROLE.SUPER_ADMIN) {
    logger.info(`Upgrading user ${email} to SUPER_ADMIN...`);
    superAdmin.role = ENUM_USER_ROLE.SUPER_ADMIN;
    superAdmin.isActive = true;
    await superAdmin.save();
  }

  // Always ensure Super Admin has all permissions (idempotent)
  const allKeys = await PermissionService.getPermissionKeys();
  await UserPermissionService.setPermissionsDirectly((superAdmin._id as any).toString(), allKeys);
  logger.info(`✅ Super Admin permissions synced (${allKeys.length} atoms)`);
};