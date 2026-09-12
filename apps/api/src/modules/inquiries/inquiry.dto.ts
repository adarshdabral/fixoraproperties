import type { InquiryDocument } from "./inquiry.model.js";

/**
 * Never includes seller contact info — a buyer's enquiry confirmation is
 * "Fixora has received your enquiry", not a phone number. See SECURITY.md.
 */
export interface InquiryDTO {
  id: string;
  propertyId: string;
  message: string;
  status: string;
  source: string;
  createdAt: string;
}

export function toInquiryDTO(inquiry: InquiryDocument): InquiryDTO {
  return {
    id: inquiry.id,
    propertyId: inquiry.propertyId.toString(),
    message: inquiry.message,
    status: inquiry.status,
    source: inquiry.source,
    createdAt: inquiry.createdAt.toISOString(),
  };
}
