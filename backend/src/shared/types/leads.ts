export const LEAD_SOURCES = ["website", "property_page", "search", "ai", "whatsapp"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "visit_scheduled",
  "negotiation",
  "converted",
  "lost",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
