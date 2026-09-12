"use client";

import { api } from "@/lib/api";
import type { PublicPropertyDTO, InquiryDTO } from "@fixora/types";

export function addToShortlist(propertyId: string) {
  return api.post<null>(`/shortlists/${propertyId}`);
}

export function removeFromShortlist(propertyId: string) {
  return api.delete<null>(`/shortlists/${propertyId}`);
}

export function listShortlist() {
  return api.get<{ properties: PublicPropertyDTO[] }>("/shortlists");
}

export function createInquiry(propertyId: string, message: string) {
  return api.post<{ inquiry: InquiryDTO }>("/inquiries", { propertyId, message });
}

export function listMyInquiries() {
  return api.get<{ inquiries: InquiryDTO[] }>("/inquiries/mine");
}
