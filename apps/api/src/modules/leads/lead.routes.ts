import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { LEAD_STATUSES } from "@fixora/types";
import * as leadService from "./lead.service.js";
import { toLeadDTO } from "./lead.dto.js";

const router = Router();

router.get(
  "/mine",
  requireAuth(),
  requireRole("BROKER"),
  asyncHandler(async (req, res) => {
    const leads = await leadService.listAssignedLeads(req.user!.id);
    sendSuccess(res, { leads: leads.map(toLeadDTO) });
  })
);

router.get(
  "/",
  requireAuth(),
  requirePermission("LEADS_VIEW"),
  requireRole("ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const { status, assignedTo } = req.query as { status?: string; assignedTo?: string };
    const leads = await leadService.listAllLeads({ status, assignedTo });
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
    const isStaff = ["ADMIN", "SUPER_ADMIN"].includes(req.user!.role);
    const lead = await leadService.updateLeadStatus(req.params.id as string, req.user!.id, status, isStaff);
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
    const isStaff = ["ADMIN", "SUPER_ADMIN"].includes(req.user!.role);
    const lead = await leadService.addNote(req.params.id as string, req.user!.id, text.trim(), isStaff);
    sendSuccess(res, { lead: toLeadDTO(lead) });
  })
);

router.patch(
  "/:id/assign",
  requireAuth(),
  requirePermission("LEADS_ASSIGN"),
  asyncHandler(async (req, res) => {
    const { brokerId } = req.body as { brokerId: string };
    if (!brokerId) throw AppError.badRequest("brokerId is required");
    const lead = await leadService.reassignLead(req.params.id as string, brokerId, req.user!.id);
    sendSuccess(res, { lead: toLeadDTO(lead) }, "Lead reassigned");
  })
);

export default router;
