import { LeadModel, type LeadDocument } from "./lead.model.js";
import { InquiryModel } from "../inquiries/inquiry.model.js";
import { AppError } from "../../utils/AppError.js";
import { recordAudit } from "../audit/audit.service.js";
import type { LeadSource } from "../../shared/types/index.js";

interface CreateLeadInput {
  buyerId: string;
  propertyId: string;
  source: LeadSource;
  requirements?: Record<string, unknown>;
}

export async function createLead(input: CreateLeadInput): Promise<LeadDocument> {
  const lead = await LeadModel.create({
    buyerId: input.buyerId,
    propertyId: input.propertyId,
    source: input.source,
    requirements: input.requirements ?? {},
    status: "new",
  });

  await recordAudit({
    actorId: input.buyerId,
    actorRole: "BUYER",
    action: "LEAD_CREATED",
    resourceType: "Lead",
    resourceId: lead.id,
    metadata: { source: input.source },
  });

  return lead;
}

export async function listAllLeads(filters: { status?: string }): Promise<LeadDocument[]> {
  const query: Record<string, unknown> = {};
  if (filters.status) query.status = filters.status;
  return LeadModel.find(query).sort({ createdAt: -1 }).limit(500);
}

export async function updateLeadStatus(leadId: string, status: string): Promise<LeadDocument> {
  const lead = await LeadModel.findById(leadId);
  if (!lead) throw AppError.notFound("Lead not found");

  lead.status = status as LeadDocument["status"];
  await lead.save();
  // The buyer's dashboard reads status from their Inquiry, so keep it in step with the Lead.
  await InquiryModel.updateMany({ leadId: lead._id }, { status: lead.status });
  return lead;
}

export async function addNote(leadId: string, actorId: string, text: string): Promise<LeadDocument> {
  const lead = await LeadModel.findById(leadId);
  if (!lead) throw AppError.notFound("Lead not found");

  lead.notes.push({ authorId: actorId as never, text, createdAt: new Date() });
  await lead.save();
  return lead;
}
