import type { Role } from "./roles.js";

export const PERMISSIONS = [
  "USERS_VIEW",
  "USERS_MANAGE",

  "PROPERTIES_VIEW",
  "PROPERTIES_CREATE",
  "PROPERTIES_EDIT",
  "PROPERTIES_APPROVE",
  "PROPERTIES_DELETE",

  "LEADS_VIEW",
  "LEADS_CREATE",
  "LEADS_EDIT",

  "INQUIRIES_VIEW",
  "INQUIRIES_MANAGE",

  "ANALYTICS_VIEW",

  "ADMINS_MANAGE",
  "SYSTEM_SETTINGS_MANAGE",
  "AUDIT_LOGS_VIEW",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/**
 * Central role -> permission map. This is the single source of truth for
 * authorization. Do not scatter role/permission checks elsewhere; add new
 * permissions here and reference them via requirePermission().
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  BUYER: ["PROPERTIES_VIEW", "INQUIRIES_VIEW"],

  SELLER: [
    "PROPERTIES_VIEW",
    "PROPERTIES_CREATE",
    "PROPERTIES_EDIT",
    "INQUIRIES_VIEW",
  ],

  ADMIN: [
    "USERS_VIEW",
    "USERS_MANAGE",
    "PROPERTIES_VIEW",
    "PROPERTIES_CREATE",
    "PROPERTIES_EDIT",
    "PROPERTIES_APPROVE",
    "PROPERTIES_DELETE",
    "LEADS_VIEW",
    "LEADS_CREATE",
    "LEADS_EDIT",
    "INQUIRIES_VIEW",
    "INQUIRIES_MANAGE",
    "ANALYTICS_VIEW",
    "AUDIT_LOGS_VIEW",
  ],

  SUPER_ADMIN: [...PERMISSIONS],
};

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
