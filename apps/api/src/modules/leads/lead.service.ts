import { LeadModel, type LeadDocument } from "./lead.model.js";
import { assignBroker } from "./lead.assignment.service.js";
import { AppError } from "../../utils/AppError.js";
import { recordAudit } from "../audit/audit.service.js";
import type { LeadSource } from "@fixora/types";

interface CreateLeadInput {
  buyerId: string;
  propertyId: string;
  source: LeadSource;
  requirements?: Record<string, unknown>;
}

export async function createLead(input: CreateLeadInput): Promise<LeadDocument> {
  const assignedTo = await assignBroker();
  const lead = await LeadModel.create({
    buyerId: input.buyerId,
    propertyId: input.propertyId,
    source: input.source,
    requirements: input.requirements ?? {},
    assignedTo,
    status: "new",
  });

  await recordAudit({
    actorId: input.buyerId,
    actorRole: "BUYER",
    action: "LEAD_CREATED",
    resourceType: "Lead",
    resourceId: lead.id,
    metadata: { assignedTo, source: input.source },
  });
  if (assignedTo) {
    await recordAudit({
      action: "LEAD_ASSIGNED",
      resourceType: "Lead",
      resourceId: lead.id,
      metadata: { assignedTo },
    });
  }

  return lead;
}

export async function getOwnedLead(leadId: string, brokerId: string): Promise<LeadDocument> {
  const lead = await LeadModel.findById(leadId);
  if (!lead) throw AppError.notFound("Lead not found");
  if (!lead.assignedTo || lead.assignedTo.toString() !== brokerId) throw AppError.forbidden();
  return lead;
}

export async function listAssignedLeads(brokerId: string): Promise<LeadDocument[]> {
  return LeadModel.find({ assignedTo: brokerId }).sort({ createdAt: -1 });
}

export async function listAllLeads(filters: { status?: string; assignedTo?: string }): Promise<LeadDocument[]> {
  const query: Record<string, unknown> = {};
  if (filters.status) query.status = filters.status;
  if (filters.assignedTo) query.assignedTo = filters.assignedTo;
  return LeadModel.find(query).sort({ createdAt: -1 }).limit(500);
}

export async function updateLeadStatus(leadId: string, brokerId: string, status: string, isStaff: boolean) {
  const lead = isStaff ? await LeadModel.findById(leadId) : await getOwnedLead(leadId, brokerId);
  if (!lead) throw AppError.notFound("Lead not found");

  lead.status = status as LeadDocument["status"];
  await lead.save();
  return lead;
}

export async function addNote(leadId: string, actorId: string, text: string, isStaff: boolean) {
  const lead = isStaff ? await LeadModel.findById(leadId) : await getOwnedLead(leadId, actorId);
  if (!lead) throw AppError.notFound("Lead not found");

  lead.notes.push({ authorId: actorId as never, text, createdAt: new Date() });
  await lead.save();
  return lead;
}

export async function reassignLead(leadId: string, newBrokerId: string, actorId: string) {
  const lead = await LeadModel.findById(leadId);
  if (!lead) throw AppError.notFound("Lead not found");

  const previousBroker = lead.assignedTo?.toString() ?? null;
  lead.assignedTo = newBrokerId as never;
  await lead.save();

  await recordAudit({
    actorId,
    actorRole: "ADMIN",
    action: "LEAD_REASSIGNED",
    resourceType: "Lead",
    resourceId: lead.id,
    metadata: { previousBroker, newBroker: newBrokerId },
  });

  return lead;
}
