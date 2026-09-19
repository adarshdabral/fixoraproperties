import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../../utils/apiResponse.js";
import * as inquiryService from "./inquiry.service.js";
import { toInquiryDTO } from "./inquiry.dto.js";

const router = Router();

const createInquirySchema = z.object({
  propertyId: z.string().min(1),
  message: z.string().trim().min(5).max(2000),
});

router.post(
  "/",
  requireAuth(),
  requireRole("BUYER"),
  validate(createInquirySchema),
  asyncHandler(async (req, res) => {
    const { propertyId, message } = req.body as { propertyId: string; message: string };
    const inquiry = await inquiryService.createInquiry({ buyerId: req.user!.id, propertyId, message, source: "property_page" });
    sendCreated(res, { inquiry: toInquiryDTO(inquiry) }, "Your enquiry has been received by Fixora");
  })
);

router.get(
  "/mine",
  requireAuth(),
  requireRole("BUYER"),
  asyncHandler(async (req, res) => {
    const inquiries = await inquiryService.listOwnInquiries(req.user!.id);
    sendSuccess(res, { inquiries: inquiries.map(toInquiryDTO) });
  })
);

router.get(
  "/mine/:id",
  requireAuth(),
  requireRole("BUYER"),
  asyncHandler(async (req, res) => {
    const inquiry = await inquiryService.getOwnInquiry(req.params.id as string, req.user!.id);
    sendSuccess(res, { inquiry: toInquiryDTO(inquiry) });
  })
);

router.get(
  "/",
  requireAuth(),
  requirePermission("INQUIRIES_VIEW"),
  requireRole("ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (_req, res) => {
    const inquiries = await inquiryService.listAllInquiriesForAdmin();
    sendSuccess(res, { inquiries });
  })
);

export default router;
