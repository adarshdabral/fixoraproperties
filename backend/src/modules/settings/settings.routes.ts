import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as settingsService from "./settings.service.js";

const router = Router();

const platformFeeSchema = z.object({ platformFeePercent: z.number().min(0).max(100) });

router.get(
  "/platform-fee",
  requireAuth(),
  requirePermission("SYSTEM_SETTINGS_MANAGE"),
  asyncHandler(async (_req, res) => {
    const platformFeePercent = await settingsService.getPlatformFeePercent();
    sendSuccess(res, { platformFeePercent });
  })
);

router.patch(
  "/platform-fee",
  requireAuth(),
  requirePermission("SYSTEM_SETTINGS_MANAGE"),
  validate(platformFeeSchema),
  asyncHandler(async (req, res) => {
    const { platformFeePercent } = req.body as { platformFeePercent: number };
    const updated = await settingsService.setPlatformFeePercent(platformFeePercent, req.user!.id, req);
    sendSuccess(res, { platformFeePercent: updated }, "Platform fee updated");
  })
);

export default router;
