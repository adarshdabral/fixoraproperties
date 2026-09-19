import type { Types } from "mongoose";
import { InquiryModel, type InquiryDocument } from "./inquiry.model.js";
import { PropertyModel } from "../properties/property.model.js";
import { createLead } from "../leads/lead.service.js";
import { AppError } from "../../utils/AppError.js";
import type { LeadSource, AdminInquiryDTO } from "@fixora/types";

interface CreateInquiryInput {
  buyerId: string;
  propertyId: string;
  message: string;
  source?: LeadSource;
  requirements?: Record<string, unknown>;
}

/**
 * The controlled-communication workflow: an enquiry always creates a Lead
 * that the admin team reviews and progresses — buyers and sellers never
 * exchange contact details directly through this flow. See docs/WHATSAPP.md
 * for how this lead later becomes a WhatsApp handoff to the seller.
 */
export async function createInquiry(input: CreateInquiryInput): Promise<InquiryDocument> {
  const property = await PropertyModel.findOne({ _id: input.propertyId, status: "published" });
  if (!property) throw AppError.notFound("Property not found");

  const lead = await createLead({
    buyerId: input.buyerId,
    propertyId: input.propertyId,
    source: input.source ?? "property_page",
    requirements: input.requirements,
  });

  return InquiryModel.create({
    buyerId: input.buyerId,
    propertyId: input.propertyId,
    leadId: lead.id,
    message: input.message,
    requirements: input.requirements ?? {},
    source: lead.source,
    status: lead.status,
  });
}

export async function listOwnInquiries(buyerId: string): Promise<InquiryDocument[]> {
  return InquiryModel.find({ buyerId }).sort({ createdAt: -1 });
}

export async function getOwnInquiry(inquiryId: string, buyerId: string): Promise<InquiryDocument> {
  const inquiry = await InquiryModel.findById(inquiryId);
  if (!inquiry) throw AppError.notFound("Inquiry not found");
  if (inquiry.buyerId.toString() !== buyerId) throw AppError.forbidden();
  return inquiry;
}

/**
 * Admin-facing view: unlike the buyer's own /inquiries/mine (which never
 * needs a buyerId — it's implicitly "me"), the admin team needs to know
 * exactly who sent an enquiry and for which property to review and follow
 * up on it, so this populates both. Contact fields go out only here — to
 * staff, never to another buyer or the seller.
 */
export async function listAllInquiriesForAdmin(): Promise<AdminInquiryDTO[]> {
  const rows = await InquiryModel.find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .populate("buyerId", "name email phone")
    .populate("propertyId", "title slug")
    .lean<
      Array<{
        _id: Types.ObjectId;
        buyerId: { _id: Types.ObjectId; name: string; email: string; phone: string } | null;
        propertyId: { _id: Types.ObjectId; title: string; slug: string } | null;
        message: string;
        status: string;
        source: string;
        createdAt: Date;
      }>
    >();

  return rows.map((row) => ({
    id: row._id.toString(),
    buyer: row.buyerId
      ? { id: row.buyerId._id.toString(), name: row.buyerId.name, email: row.buyerId.email, phone: row.buyerId.phone }
      : null,
    property: row.propertyId
      ? { id: row.propertyId._id.toString(), title: row.propertyId.title, slug: row.propertyId.slug }
      : null,
    message: row.message,
    status: row.status,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
  }));
}
