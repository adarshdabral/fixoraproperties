import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../../utils/apiResponse.js";
import * as shortlistService from "./shortlist.service.js";
import { toPublicPropertyDTO } from "../properties/property.dto.js";
import { getPlatformFeePercent } from "../settings/settings.service.js";

const router = Router();

router.use(requireAuth(), requireRole("BUYER"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const [properties, feePercent] = await Promise.all([
      shortlistService.listShortlistedProperties(req.user!.id),
      getPlatformFeePercent(),
    ]);
    sendSuccess(res, { properties: properties.map((p) => toPublicPropertyDTO(p, feePercent)) });
  })
);

router.post(
  "/:propertyId",
  asyncHandler(async (req, res) => {
    await shortlistService.addShortlist(req.user!.id, req.params.propertyId as string);
    sendCreated(res, null, "Added to shortlist");
  })
);

router.delete(
  "/:propertyId",
  asyncHandler(async (req, res) => {
    await shortlistService.removeShortlist(req.user!.id, req.params.propertyId as string);
    sendSuccess(res, null, "Removed from shortlist");
  })
);

export default router;
