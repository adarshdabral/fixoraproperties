import { PropertyModel, type PropertyDocument } from "./property.model.js";
import { generateUniqueSlug } from "./property.slug.js";
import { AppError } from "../../utils/AppError.js";
import type { CreatePropertyInput, UpdatePropertyInput, PropertySearchInput } from "../../shared/validation/index.js";
import type { PaginatedResult } from "../../shared/types/index.js";

const EDITABLE_STATUSES = ["draft", "pending_review", "rejected", "published"];

export async function createDraft(sellerId: string, input: CreatePropertyInput): Promise<PropertyDocument> {
  const slug = await generateUniqueSlug(input.title);
  return PropertyModel.create({ ...input, sellerId, slug, status: "draft" });
}

export async function getOwnedProperty(propertyId: string, sellerId: string): Promise<PropertyDocument> {
  const property = await PropertyModel.findById(propertyId);
  if (!property) throw AppError.notFound("Property not found");
  if (property.sellerId.toString() !== sellerId) throw AppError.forbidden();
  return property;
}

export async function getPropertyById(propertyId: string): Promise<PropertyDocument> {
  const property = await PropertyModel.findById(propertyId);
  if (!property) throw AppError.notFound("Property not found");
  return property;
}

export async function getPublishedBySlug(slug: string): Promise<PropertyDocument> {
  const property = await PropertyModel.findOne({ slug, status: "published" });
  if (!property) throw AppError.notFound("Property not found");
  return property;
}

/**
 * Sellers may edit their own listing while it's draft/pending_review/rejected
 * freely. Editing a published listing sends it back to pending_review since
 * the content changed and hasn't been re-reviewed — this is a reasonable
 * production default in the absence of a client-specified re-review policy;
 * revisit if the client wants minor edits (e.g. price drops) to skip review.
 */
export async function updateOwnedProperty(
  propertyId: string,
  sellerId: string,
  input: UpdatePropertyInput
): Promise<PropertyDocument> {
  const property = await getOwnedProperty(propertyId, sellerId);
  if (!EDITABLE_STATUSES.includes(property.status)) {
    throw AppError.badRequest(`Cannot edit a property with status "${property.status}"`);
  }

  Object.assign(property, input);
  if (property.status === "published") {
    property.status = "pending_review";
  }
  if (property.status === "rejected") {
    property.rejectionReason = null;
  }

  await property.save();
  return property;
}

/** Admin/super-admin edit path: bypasses ownership and the editable-status restriction. */
export async function updatePropertyAsStaff(propertyId: string, input: UpdatePropertyInput): Promise<PropertyDocument> {
  const property = await getPropertyById(propertyId);
  Object.assign(property, input);
  await property.save();
  return property;
}

export async function submitForReview(propertyId: string, sellerId: string): Promise<PropertyDocument> {
  const property = await getOwnedProperty(propertyId, sellerId);
  if (!["draft", "rejected"].includes(property.status)) {
    throw AppError.badRequest(`Cannot submit a property with status "${property.status}" for review`);
  }
  property.status = "pending_review";
  property.rejectionReason = null;
  await property.save();
  return property;
}

export async function listOwnedProperties(sellerId: string): Promise<PropertyDocument[]> {
  return PropertyModel.find({ sellerId }).sort({ createdAt: -1 });
}

export async function listForModeration(status?: string): Promise<PropertyDocument[]> {
  return PropertyModel.find(status ? { status } : {}).sort({ createdAt: -1 }).limit(200);
}

export async function approveProperty(propertyId: string): Promise<PropertyDocument> {
  const property = await getPropertyById(propertyId);
  if (property.status !== "pending_review") {
    throw AppError.badRequest(`Only properties pending review can be approved (current status: "${property.status}")`);
  }
  property.status = "published";
  property.rejectionReason = null;
  await property.save();
  return property;
}

export async function rejectProperty(propertyId: string, reason: string): Promise<PropertyDocument> {
  const property = await getPropertyById(propertyId);
  if (property.status !== "pending_review") {
    throw AppError.badRequest(`Only properties pending review can be rejected (current status: "${property.status}")`);
  }
  property.status = "rejected";
  property.rejectionReason = reason;
  await property.save();
  return property;
}

export async function setFeatured(propertyId: string, featured: boolean): Promise<PropertyDocument> {
  const property = await getPropertyById(propertyId);
  property.featured = featured;
  await property.save();
  return property;
}

/**
 * Sellers can only move a listing that has been through review between
 * published/sold/inactive. Pausing a draft or a listing awaiting review would
 * strand it: neither edit nor submit accepts sold/inactive listings.
 */
const SELLER_LIFECYCLE_FROM = ["published", "sold", "inactive"];

export async function setLifecycleStatus(
  propertyId: string,
  status: "sold" | "inactive" | "published",
  isStaff = false
): Promise<PropertyDocument> {
  const property = await getPropertyById(propertyId);
  if (!isStaff && !SELLER_LIFECYCLE_FROM.includes(property.status)) {
    throw AppError.badRequest(`Cannot mark a property with status "${property.status}" as ${status}`);
  }
  property.status = status;
  await property.save();
  return property;
}

export async function deleteProperty(propertyId: string): Promise<void> {
  const property = await PropertyModel.findById(propertyId);
  if (!property) throw AppError.notFound("Property not found");
  await property.deleteOne();
}

/** `_id` breaks ties so equal prices/areas keep a stable order — otherwise skip/limit pagination can repeat or drop listings. */
const SORT_MAP: Record<PropertySearchInput["sort"], Record<string, 1 | -1>> = {
  newest: { createdAt: -1, _id: -1 },
  price_asc: { "price.amount": 1, _id: 1 },
  price_desc: { "price.amount": -1, _id: -1 },
  area_asc: { "specifications.area": 1, _id: 1 },
  area_desc: { "specifications.area": -1, _id: -1 },
};

/**
 * minPrice/maxPrice arrive in buyer-facing (fee-inclusive) terms since
 * that's what the buyer sees and types; convert back to the seller's raw
 * ask price — what's actually stored — before querying. A fixed percentage
 * markup is monotonic, so sort order by price is unaffected either way.
 */
export async function searchPublishedProperties(
  filters: PropertySearchInput,
  platformFeePercent: number
): Promise<PaginatedResult<PropertyDocument>> {
  const query: Record<string, unknown> = { status: "published" };
  const feeMultiplier = 1 + platformFeePercent / 100;

  if (filters.q) query.$text = { $search: filters.q };
  if (filters.city) query["location.city"] = new RegExp(`^${escapeRegex(filters.city)}$`, "i");
  if (filters.state) query["location.state"] = new RegExp(`^${escapeRegex(filters.state)}$`, "i");
  if (filters.category) query.category = filters.category;
  if (filters.listingType) query.listingType = filters.listingType;
  if (filters.constructionStatus) query.constructionStatus = filters.constructionStatus;
  if (filters.negotiable !== undefined) query["price.negotiable"] = filters.negotiable;
  if (filters.featured !== undefined) query.featured = filters.featured;
  if (filters.bedrooms !== undefined) query["specifications.bedrooms"] = { $gte: filters.bedrooms };
  if (filters.bathrooms !== undefined) query["specifications.bathrooms"] = { $gte: filters.bathrooms };

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query["price.amount"] = {
      ...(filters.minPrice !== undefined ? { $gte: filters.minPrice / feeMultiplier } : {}),
      ...(filters.maxPrice !== undefined ? { $lte: filters.maxPrice / feeMultiplier } : {}),
    };
  }
  if (filters.minArea !== undefined || filters.maxArea !== undefined) {
    query["specifications.area"] = {
      ...(filters.minArea !== undefined ? { $gte: filters.minArea } : {}),
      ...(filters.maxArea !== undefined ? { $lte: filters.maxArea } : {}),
    };
  }

  const skip = (filters.page - 1) * filters.limit;
  const [items, total] = await Promise.all([
    PropertyModel.find(query).sort(SORT_MAP[filters.sort]).skip(skip).limit(filters.limit),
    PropertyModel.countDocuments(query),
  ]);

  return {
    items,
    page: filters.page,
    limit: filters.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.limit)),
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
