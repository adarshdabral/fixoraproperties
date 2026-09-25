import { ShortlistModel } from "./shortlist.model.js";
import { PropertyModel } from "../properties/property.model.js";
import { AppError } from "../../utils/AppError.js";

export async function addShortlist(buyerId: string, propertyId: string) {
  const property = await PropertyModel.findOne({ _id: propertyId, status: "published" });
  if (!property) throw AppError.notFound("Property not found");

  try {
    return await ShortlistModel.create({ buyerId, propertyId });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && (err as { code: unknown }).code === 11000) {
      throw AppError.conflict("Property is already shortlisted");
    }
    throw err;
  }
}

export async function removeShortlist(buyerId: string, propertyId: string) {
  const result = await ShortlistModel.deleteOne({ buyerId, propertyId });
  if (result.deletedCount === 0) throw AppError.notFound("Shortlist entry not found");
}

export async function listShortlistedProperties(buyerId: string) {
  const entries = await ShortlistModel.find({ buyerId }).sort({ createdAt: -1 });
  const propertyIds = entries.map((e) => e.propertyId);
  // Listings that were unpublished, sold or sent back for edits since being shortlisted drop out of view.
  const properties = await PropertyModel.find({ _id: { $in: propertyIds }, status: "published" });

  const byId = new Map(properties.map((p) => [p.id, p]));
  return entries.map((e) => byId.get(e.propertyId.toString())).filter((p): p is NonNullable<typeof p> => Boolean(p));
}

export async function isShortlisted(buyerId: string, propertyId: string): Promise<boolean> {
  return Boolean(await ShortlistModel.exists({ buyerId, propertyId }));
}
