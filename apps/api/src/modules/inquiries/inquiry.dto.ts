import type { InquiryDocument } from "./inquiry.model.js";
import type { InquiryDTO } from "@fixora/types";

export type { InquiryDTO };

/**
 * Never includes seller contact info — a buyer's enquiry confirmation is
 * "Fixora has received your enquiry", not a phone number. See SECURITY.md.
 */

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
