import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { LEAD_STATUSES } from "../../shared/types/index.js";
import * as leadService from "./lead.service.js";
import { toLeadDTO } from "./lead.dto.js";

const router = Router();

/**
 * Leads are staff-managed only — with no broker role, the admin team
 * reviews and progresses every buyer enquiry directly. See inquiry.service.ts
 * for how an enquiry creates a lead.
 */
router.get(
  "/",
  requireAuth(),
  requirePermission("LEADS_VIEW"),
  asyncHandler(async (req, res) => {
    const { status } = req.query as { status?: string };
    const leads = await leadService.listAllLeads({ status });
    sendSuccess(res, { leads: leads.map(toLeadDTO) });
  })
);

router.patch(
  "/:id/status",
  requireAuth(),
  requirePermission("LEADS_EDIT"),
  asyncHandler(async (req, res) => {
    const { status } = req.body as { status: string };
    if (!LEAD_STATUSES.includes(status as (typeof LEAD_STATUSES)[number])) {
      throw AppError.badRequest("Invalid lead status");
    }
    const lead = await leadService.updateLeadStatus(req.params.id as string, status);
    sendSuccess(res, { lead: toLeadDTO(lead) });
  })
);

router.post(
  "/:id/notes",
  requireAuth(),
  requirePermission("LEADS_EDIT"),
  asyncHandler(async (req, res) => {
    const { text } = req.body as { text: string };
    if (!text?.trim()) throw AppError.badRequest("Note text is required");
    const lead = await leadService.addNote(req.params.id as string, req.user!.id, text.trim());
    sendSuccess(res, { lead: toLeadDTO(lead) });
  })
);

export default router;
