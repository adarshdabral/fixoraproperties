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

export const NEGOTIATION_STATUSES = ["open", "buyer_offer", "seller_counter", "agreed", "cancelled"] as const;
export type NegotiationStatus = (typeof NEGOTIATION_STATUSES)[number];

export const TRANSACTION_STATUSES = ["initiated", "in_progress", "completed", "cancelled"] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const COMMISSION_TYPES = ["percentage", "fixed"] as const;
export type CommissionType = (typeof COMMISSION_TYPES)[number];

export const COMMISSION_PAYER = ["seller", "buyer", "builder"] as const;
export type CommissionPayer = (typeof COMMISSION_PAYER)[number];
