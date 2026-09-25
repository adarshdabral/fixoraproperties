import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import * as propertyService from "./property.service.js";
import { toPublicPropertyDTO, toSellerPropertyDTO } from "./property.dto.js";
import { recordAudit } from "../audit/audit.service.js";
import { getPlatformFeePercent } from "../settings/settings.service.js";
import { assertPropertyMedia } from "../media/media.service.js";
import type { CreatePropertyInput, UpdatePropertyInput, PropertySearchInput } from "../../shared/validation/index.js";

export const search = asyncHandler(async (req: Request, res: Response) => {
  const filters = req.query as unknown as PropertySearchInput;
  const feePercent = await getPlatformFeePercent();
  const result = await propertyService.searchPublishedProperties(filters, feePercent);
  sendSuccess(res, { ...result, items: result.items.map((item) => toPublicPropertyDTO(item, feePercent)) });
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const [property, feePercent] = await Promise.all([
    propertyService.getPublishedBySlug(req.params.slug as string),
    getPlatformFeePercent(),
  ]);
  sendSuccess(res, { property: toPublicPropertyDTO(property, feePercent) });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreatePropertyInput;
  assertPropertyMedia(input.media);
  const property = await propertyService.createDraft(req.user!.id, input);
  sendCreated(res, { property: toSellerPropertyDTO(property) }, "Draft property created");
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  const properties = await propertyService.listOwnedProperties(req.user!.id);
  sendSuccess(res, { properties: properties.map(toSellerPropertyDTO) });
});

export const getOwnedOrModerated = asyncHandler(async (req: Request, res: Response) => {
  const property = await propertyService.getPropertyById(req.params.id as string);
  const isOwner = property.sellerId.toString() === req.user!.id;
  const isStaff = ["ADMIN", "SUPER_ADMIN"].includes(req.user!.role);
  if (!isOwner && !isStaff) throw AppError.forbidden();
  sendSuccess(res, { property: toSellerPropertyDTO(property) });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdatePropertyInput;
  assertPropertyMedia(input.media);
  const isStaff = ["ADMIN", "SUPER_ADMIN"].includes(req.user!.role);

  const updated = isStaff
    ? await propertyService.updatePropertyAsStaff(req.params.id as string, input)
    : await propertyService.updateOwnedProperty(req.params.id as string, req.user!.id, input);

  await recordAudit({ req, action: "PROPERTY_UPDATED", resourceType: "Property", resourceId: updated.id });
  sendSuccess(res, { property: toSellerPropertyDTO(updated) });
});

export const submit = asyncHandler(async (req: Request, res: Response) => {
  const property = await propertyService.submitForReview(req.params.id as string, req.user!.id);
  sendSuccess(res, { property: toSellerPropertyDTO(property) }, "Submitted for review");
});

export const listForModeration = asyncHandler(async (req: Request, res: Response) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const properties = await propertyService.listForModeration(status);
  sendSuccess(res, { properties: properties.map(toSellerPropertyDTO) });
});

export const approve = asyncHandler(async (req: Request, res: Response) => {
  const property = await propertyService.approveProperty(req.params.id as string);
  await recordAudit({ req, action: "PROPERTY_APPROVED", resourceType: "Property", resourceId: property.id });
  sendSuccess(res, { property: toSellerPropertyDTO(property) }, "Property approved and published");
});

export const reject = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body as { reason: string };
  if (!reason?.trim()) throw AppError.badRequest("A rejection reason is required");
  const property = await propertyService.rejectProperty(req.params.id as string, reason.trim());
  await recordAudit({ req, action: "PROPERTY_REJECTED", resourceType: "Property", resourceId: property.id, metadata: { reason } });
  sendSuccess(res, { property: toSellerPropertyDTO(property) }, "Property rejected");
});

export const feature = asyncHandler(async (req: Request, res: Response) => {
  const { featured } = req.body as { featured: boolean };
  const property = await propertyService.setFeatured(req.params.id as string, Boolean(featured));
  await recordAudit({ req, action: "PROPERTY_UPDATED", resourceType: "Property", resourceId: property.id, metadata: { featured } });
  sendSuccess(res, { property: toSellerPropertyDTO(property) });
});

/**
 * Sellers may pause/resume their own listing (sold/inactive) but can never
 * set "published" here — publishing only ever happens through submit →
 * pending_review → approve (see submit()/approve() above). Without this
 * check a seller holding PROPERTIES_EDIT could publish any listing directly,
 * skipping admin review entirely. Ownership is enforced on the route via
 * requireOwnership() for non-staff; staff bypass both checks.
 */
export const setStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as { status: "sold" | "inactive" | "published" };
  const isStaff = ["ADMIN", "SUPER_ADMIN"].includes(req.user!.role);
  if (!isStaff && status === "published") {
    throw AppError.forbidden("Only staff can publish a listing — submit it for review instead");
  }
  const property = await propertyService.setLifecycleStatus(req.params.id as string, status);
  await recordAudit({ req, action: "PROPERTY_UPDATED", resourceType: "Property", resourceId: property.id, metadata: { status } });
  sendSuccess(res, { property: toSellerPropertyDTO(property) });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await propertyService.deleteProperty(req.params.id as string);
  await recordAudit({ req, action: "PROPERTY_UPDATED", resourceType: "Property", resourceId: req.params.id as string, metadata: { deleted: true } });
  sendSuccess(res, null, "Property deleted");
});
