import { InquiryModel, type InquiryDocument } from "./inquiry.model.js";
import { PropertyModel } from "../properties/property.model.js";
import { createLead } from "../leads/lead.service.js";
import { AppError } from "../../utils/AppError.js";
import type { LeadSource } from "@fixora/types";

interface CreateInquiryInput {
  buyerId: string;
  propertyId: string;
  message: string;
  source?: LeadSource;
  requirements?: Record<string, unknown>;
}

/**
 * The controlled-communication workflow: an enquiry always creates a Lead
 * (which resolves broker assignment) and stores only the assigned broker's
 * id, never the seller's contact details. See docs/WHATSAPP.md for how this
 * lead later becomes a WhatsApp handoff to the assigned broker.
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
    assignedTo: lead.assignedTo,
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

export async function listAssignedInquiries(brokerId: string): Promise<InquiryDocument[]> {
  return InquiryModel.find({ assignedTo: brokerId }).sort({ createdAt: -1 });
}

export async function listAllInquiries(): Promise<InquiryDocument[]> {
  return InquiryModel.find({}).sort({ createdAt: -1 }).limit(500);
}
