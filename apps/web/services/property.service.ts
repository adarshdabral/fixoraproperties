"use client";

import { api } from "@/lib/api";
import type { SellerPropertyDTO } from "@fixora/types";
import type { CreatePropertyInput, UpdatePropertyInput } from "@fixora/validation";

export function createProperty(input: CreatePropertyInput) {
  return api.post<{ property: SellerPropertyDTO }>("/properties", input);
}

export function updateProperty(id: string, input: UpdatePropertyInput) {
  return api.patch<{ property: SellerPropertyDTO }>(`/properties/${id}`, input);
}

export function submitPropertyForReview(id: string) {
  return api.post<{ property: SellerPropertyDTO }>(`/properties/${id}/submit`);
}

export function listMyProperties() {
  return api.get<{ properties: SellerPropertyDTO[] }>("/properties/mine");
}

export function getPropertyById(id: string) {
  return api.get<{ property: SellerPropertyDTO }>(`/properties/${id}`);
}
