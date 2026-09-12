"use client";

import { api } from "@/lib/api";
import type { PrivateUserDTO, AdminDashboardDTO, SellerPropertyDTO } from "@fixora/types";
import type { Role } from "@fixora/types";

export function searchUsers(search: string, role?: string) {
  return api.get<{ users: PrivateUserDTO[] }>("/users", { search: search || undefined, role: role || undefined });
}

export function changeUserRole(userId: string, role: Role) {
  return api.patch<{ user: PrivateUserDTO }>(`/users/${userId}/role`, { role });
}

export function setUserActive(userId: string, isActive: boolean) {
  return api.patch<{ user: PrivateUserDTO }>(`/users/${userId}/status`, { isActive });
}

export function getDashboard() {
  return api.get<AdminDashboardDTO>("/admin/dashboard");
}

export function listPropertiesForModeration(status?: string) {
  return api.get<{ properties: SellerPropertyDTO[] }>("/properties/admin/all", { status });
}

export function approveProperty(id: string) {
  return api.patch<{ property: SellerPropertyDTO }>(`/properties/${id}/approve`);
}

export function rejectProperty(id: string, reason: string) {
  return api.patch<{ property: SellerPropertyDTO }>(`/properties/${id}/reject`, { reason });
}
