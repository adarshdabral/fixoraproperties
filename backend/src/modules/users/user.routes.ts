import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { ROLES, type Role } from "../../shared/types/index.js";
import { UserModel } from "./user.model.js";
import { toPrivateUserDTO } from "./user.dto.js";
import * as userService from "./user.service.js";

const router = Router();

/**
 * Admin/super-admin user directory. Buyer/seller self-service lives
 * under /auth/me and each role's own profile endpoints, not here — this
 * route is for staff managing accounts.
 */
router.get(
  "/",
  requireAuth(),
  requirePermission("USERS_VIEW"),
  asyncHandler(async (req, res) => {
    const role = typeof req.query.role === "string" ? req.query.role : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const users = await userService.searchUsers({ role, search });
    sendSuccess(res, { users: users.map(toPrivateUserDTO) });
  })
);

router.patch(
  "/:id/status",
  requireAuth(),
  requirePermission("USERS_MANAGE"),
  asyncHandler(async (req, res) => {
    const { isActive } = req.body as { isActive: boolean };
    const user = await UserModel.findById(req.params.id);
    if (!user) throw AppError.notFound("User not found");

    user.isActive = Boolean(isActive);
    await user.save();

    const { recordAudit } = await import("../audit/audit.service.js");
    await recordAudit({
      req,
      action: "USER_DEACTIVATED",
      resourceType: "User",
      resourceId: user.id,
      metadata: { isActive: user.isActive },
    });

    sendSuccess(res, { user: toPrivateUserDTO(user) });
  })
);

const changeRoleSchema = z.object({ role: z.enum(ROLES as unknown as [string, ...string[]]) });

/**
 * Role assignment by email lookup (there is no separate "username" field —
 * email is the unique login identifier). ADMIN can move a user between
 * BUYER/SELLER; only SUPER_ADMIN can touch the ADMIN/SUPER_ADMIN tier —
 * enforced in user.service#changeUserRole, not just here.
 */
router.patch(
  "/:id/role",
  requireAuth(),
  requirePermission("USERS_MANAGE"),
  validate(changeRoleSchema),
  asyncHandler(async (req, res) => {
    const { role } = req.body as { role: Role };
    const user = await userService.changeUserRole(req.user!.id, req.user!.role, req.params.id as string, role, req);
    sendSuccess(res, { user: toPrivateUserDTO(user) }, "Role updated");
  })
);

export default router;
