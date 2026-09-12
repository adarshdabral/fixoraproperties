import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { UserModel } from "../users/user.model.js";
import { PropertyModel } from "../properties/property.model.js";
import { LeadModel } from "../leads/lead.model.js";

const router = Router();

/**
 * Real aggregate counts from the database — never hardcoded placeholder
 * numbers (product spec §21). Negotiation/transaction/commission counts
 * are 0 until those modules land; the shape is stable so the admin UI
 * doesn't need to change when they do.
 */
router.get(
  "/dashboard",
  requireAuth(),
  requirePermission("ANALYTICS_VIEW"),
  asyncHandler(async (_req, res) => {
    const [usersByRole, propertiesByStatus, leadsByStatus] = await Promise.all([
      UserModel.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      PropertyModel.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      LeadModel.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const countOf = (rows: { _id: string; count: number }[], key: string) =>
      rows.find((r) => r._id === key)?.count ?? 0;

    sendSuccess(res, {
      users: {
        total: usersByRole.reduce((sum, r) => sum + r.count, 0),
        buyers: countOf(usersByRole, "BUYER"),
        sellers: countOf(usersByRole, "SELLER"),
        brokers: countOf(usersByRole, "BROKER"),
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
      // Populated once the negotiations/transactions/commissions modules land.
      transactions: { completed: 0 },
      commissions: { total: 0 },
    });
  })
);

export default router;
