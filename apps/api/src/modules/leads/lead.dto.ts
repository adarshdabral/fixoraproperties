import type { LeadDocument } from "./lead.model.js";

export interface LeadDTO {
  id: string;
  buyerId: string;
  propertyId: string;
  assignedTo: string | null;
  source: string;
  requirements: Record<string, unknown>;
  status: string;
  notes: { text: string; authorId: string; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export function toLeadDTO(lead: LeadDocument): LeadDTO {
  return {
    id: lead.id,
    buyerId: lead.buyerId.toString(),
    propertyId: lead.propertyId.toString(),
    assignedTo: lead.assignedTo ? lead.assignedTo.toString() : null,
    source: lead.source,
    requirements: (lead.requirements as Record<string, unknown>) ?? {},
    status: lead.status,
    notes: (lead.notes ?? []).map((n) => ({
      text: n.text,
      authorId: n.authorId.toString(),
      createdAt: n.createdAt.toISOString(),
    })),
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}
