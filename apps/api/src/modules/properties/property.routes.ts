import { Router } from "express";
import { requireAuth, optionalAuth } from "../../middleware/auth.js";
import { requirePermission, requireOwnership } from "../../middleware/permission.js";
import { requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createPropertySchema, updatePropertySchema, propertySearchSchema } from "@fixora/validation";
import { PropertyModel } from "./property.model.js";
import * as propertyController from "./property.controller.js";

const router = Router();

const getSellerIdOwner = async (req: import("express").Request) => {
  const property = await PropertyModel.findById(req.params.id).select("sellerId");
  return property?.sellerId?.toString();
};

// --- Public ---
router.get("/", optionalAuth(), validate(propertySearchSchema, "query"), propertyController.search);
router.get("/slug/:slug", optionalAuth(), propertyController.getBySlug);

// --- Seller: own listings (must come before the generic /:id routes) ---
router.get("/mine", requireAuth(), requireRole("SELLER"), propertyController.listMine);
router.post(
  "/",
  requireAuth(),
  requirePermission("PROPERTIES_CREATE"),
  validate(createPropertySchema),
  propertyController.create
);

// --- Admin moderation queue (before /:id) ---
router.get("/admin/all", requireAuth(), requirePermission("PROPERTIES_APPROVE"), propertyController.listForModeration);

// --- Owner or staff detail/edit (ownership re-derived server-side, never trusts client-supplied ids) ---
router.get("/:id", requireAuth(), propertyController.getOwnedOrModerated);
router.patch(
  "/:id",
  requireAuth(),
  requirePermission("PROPERTIES_EDIT"),
  requireOwnership(getSellerIdOwner),
  validate(updatePropertySchema),
  propertyController.update
);
router.post(
  "/:id/submit",
  requireAuth(),
  requireRole("SELLER"),
  requireOwnership(getSellerIdOwner),
  propertyController.submit
);

// --- Admin/super-admin moderation actions ---
router.patch("/:id/approve", requireAuth(), requirePermission("PROPERTIES_APPROVE"), propertyController.approve);
router.patch("/:id/reject", requireAuth(), requirePermission("PROPERTIES_APPROVE"), propertyController.reject);
router.patch("/:id/feature", requireAuth(), requirePermission("PROPERTIES_EDIT"), propertyController.feature);
router.patch("/:id/status", requireAuth(), requirePermission("PROPERTIES_EDIT"), propertyController.setStatus);
router.delete("/:id", requireAuth(), requirePermission("PROPERTIES_DELETE"), propertyController.remove);

export default router;
