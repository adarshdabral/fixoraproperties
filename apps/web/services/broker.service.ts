"use client";

import { api } from "@/lib/api";
import type { LeadDTO } from "@fixora/types";

export function listMyLeads() {
  return api.get<{ leads: LeadDTO[] }>("/leads/mine");
}

export function updateLeadStatus(id: string, status: string) {
  return api.patch<{ lead: LeadDTO }>(`/leads/${id}/status`, { status });
}

export function addLeadNote(id: string, text: string) {
  return api.post<{ lead: LeadDTO }>(`/leads/${id}/notes`, { text });
}
