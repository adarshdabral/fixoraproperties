import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { UserModel } from "./user.model.js";
import { toPrivateUserDTO } from "./user.dto.js";

const router = Router();

/**
 * Admin/super-admin user directory. Buyer/seller/broker self-service lives
 * under /auth/me and each role's own profile endpoints, not here — this
 * route is for staff managing accounts.
 */
router.get(
  "/",
  requireAuth(),
  requirePermission("USERS_VIEW"),
  asyncHandler(async (req, res) => {
    const role = typeof req.query.role === "string" ? req.query.role : undefined;
    const users = await UserModel.find(role ? { role } : {}).sort({ createdAt: -1 }).limit(200);
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

export default router;
