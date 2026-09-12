/**
 * Roles are ordered from least to most privileged for readability only;
 * authorization decisions must always go through the permission map in
 * `permissions.ts`, never role comparisons.
 */
export const ROLES = ["BUYER", "SELLER", "BROKER", "ADMIN", "SUPER_ADMIN"] as const;
export type Role = (typeof ROLES)[number];

/**
 * SUPER_ADMIN cannot be created through public registration. It is seeded
 * or created by an existing SUPER_ADMIN via the admin API.
 */
export const PUBLICLY_REGISTERABLE_ROLES: Role[] = ["BUYER", "SELLER"];
