import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { createUploadSignature } from "./media.service.js";

const router = Router();

router.post(
  "/signature",
  requireAuth(),
  requirePermission("PROPERTIES_CREATE"),
  asyncHandler(async (_req, res) => {
    sendSuccess(res, createUploadSignature());
  })
);

export default router;
