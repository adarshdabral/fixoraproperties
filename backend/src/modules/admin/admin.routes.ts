import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { UserModel } from "../users/user.model.js";
import { PropertyModel } from "../properties/property.model.js";
import { LeadModel } from "../leads/lead.model.js";
import { InquiryModel } from "../inquiries/inquiry.model.js";

const router = Router();

/**
 * Real aggregate counts from the database — never hardcoded placeholder
 * numbers (product spec §21).
 */
router.get(
  "/dashboard",
  requireAuth(),
  requirePermission("ANALYTICS_VIEW"),
  asyncHandler(async (_req, res) => {
    const [usersByRole, propertiesByStatus, leadsByStatus, totalInquiries] = await Promise.all([
      UserModel.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      PropertyModel.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      LeadModel.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      InquiryModel.countDocuments(),
    ]);

    const countOf = (rows: { _id: string; count: number }[], key: string) =>
      rows.find((r) => r._id === key)?.count ?? 0;

    sendSuccess(res, {
      users: {
        total: usersByRole.reduce((sum, r) => sum + r.count, 0),
        buyers: countOf(usersByRole, "BUYER"),
        sellers: countOf(usersByRole, "SELLER"),
      },
      properties: {
        active: countOf(propertiesByStatus, "published"),
        pending: countOf(propertiesByStatus, "pending_review"),
        rejected: countOf(propertiesByStatus, "rejected"),
        sold: countOf(propertiesByStatus, "sold"),
      },
      leads: {
        new: countOf(leadsByStatus, "new"),
        qualified: countOf(leadsByStatus, "qualified"),
        negotiation: countOf(leadsByStatus, "negotiation"),
        converted: countOf(leadsByStatus, "converted"),
      },
      inquiries: { total: totalInquiries },
    });
  })
);

export default router;
