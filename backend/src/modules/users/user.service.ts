import { UserModel, type UserDocument } from "./user.model.js";
import { AppError } from "../../utils/AppError.js";
import { roleHasPermission, type Role } from "../../shared/types/index.js";
import { recordAudit } from "../audit/audit.service.js";

const STAFF_ROLES: Role[] = ["ADMIN", "SUPER_ADMIN"];

export async function searchUsers(filters: { role?: string; search?: string }): Promise<UserDocument[]> {
  const query: Record<string, unknown> = {};
  if (filters.role) query.role = filters.role;
  if (filters.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escaped, "i");
    query.$or = [{ email: pattern }, { name: pattern }];
  }
  return UserModel.find(query).sort({ createdAt: -1 }).limit(50);
}

/**
 * Same admin-tier boundary as changeUserRole: an ADMIN can (de)activate
 * buyers and sellers, but only a SUPER_ADMIN can lock out another admin —
 * otherwise an admin could deactivate the super admin. Nobody can
 * deactivate themselves (it would lock them out mid-session).
 */
export async function setUserActive(
  actorId: string,
  actorRole: Role,
  targetUserId: string,
  isActive: boolean,
  req?: import("express").Request
): Promise<UserDocument> {
  if (actorId === targetUserId) {
    throw AppError.badRequest("You cannot change your own account status");
  }

  const target = await UserModel.findById(targetUserId);
  if (!target) throw AppError.notFound("User not found");

  if (STAFF_ROLES.includes(target.role as Role) && !roleHasPermission(actorRole, "ADMINS_MANAGE")) {
    throw AppError.forbidden("Only a super admin can change an admin-tier account's status");
  }

  if (target.isActive === isActive) return target;

  target.isActive = isActive;
  await target.save();

  await recordAudit({
    req,
    actorId,
    actorRole,
    action: "USER_DEACTIVATED",
    resourceType: "User",
    resourceId: target.id,
    metadata: { isActive },
  });

  return target;
}

/**
 * Enforces the admin/super-admin boundary from the product spec: ADMIN
 * holds USERS_MANAGE and can move a user between BUYER/SELLER, but only
 * SUPER_ADMIN (via ADMINS_MANAGE) can promote someone to ADMIN/SUPER_ADMIN
 * or change the role of an existing admin/super-admin. Callers only need
 * USERS_MANAGE to reach this function — the finer-grained check happens
 * here so it can't be bypassed by hitting the route directly.
 */
export async function changeUserRole(
  actorId: string,
  actorRole: Role,
  targetUserId: string,
  newRole: Role,
  req?: import("express").Request
): Promise<UserDocument> {
  if (actorId === targetUserId) {
    throw AppError.badRequest("You cannot change your own role");
  }

  const target = await UserModel.findById(targetUserId);
  if (!target) throw AppError.notFound("User not found");

  const touchesAdminTier = STAFF_ROLES.includes(newRole) || STAFF_ROLES.includes(target.role as Role);
  if (touchesAdminTier && !roleHasPermission(actorRole, "ADMINS_MANAGE")) {
    throw AppError.forbidden("Only a super admin can assign or change an admin-tier role");
  }

  const previousRole = target.role;
  if (previousRole === newRole) return target;

  target.role = newRole;
  await target.save();

  await recordAudit({
    req,
    actorId,
    actorRole,
    action: "ROLE_CHANGED",
    resourceType: "User",
    resourceId: target.id,
    metadata: { from: previousRole, to: newRole },
  });

  return target;
}
