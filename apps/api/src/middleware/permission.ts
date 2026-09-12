import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { roleHasPermission, type Permission } from "@fixora/types";

/**
 * Checks the requesting user's role against the centralized
 * ROLE_PERMISSIONS map in @fixora/types. This is the primary authorization
 * mechanism for business actions — prefer it over requireRole() so that
 * permission changes only ever need to happen in one place.
 */
export function requirePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(AppError.unauthorized());
    const ok = permissions.every((p) => roleHasPermission(req.user!.role, p));
    if (!ok) return next(AppError.forbidden());
    next();
  };
}

type OwnerIdGetter = (req: Request) => Promise<string | null | undefined> | string | null | undefined;

/**
 * Verifies the authenticated user owns the resource being acted on, using a
 * server-side lookup rather than any client-supplied ownerId field. Roles
 * passed in `bypassRoles` (e.g. ADMIN, SUPER_ADMIN) skip the ownership
 * check entirely.
 *
 * Usage: requireOwnership(async (req) => (await Property.findById(req.params.id))?.sellerId?.toString(), ["ADMIN", "SUPER_ADMIN"])
 */
export function requireOwnership(getOwnerId: OwnerIdGetter, bypassRoles: string[] = ["ADMIN", "SUPER_ADMIN"]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) return next(AppError.unauthorized());
      if (bypassRoles.includes(req.user.role)) return next();

      const ownerId = await getOwnerId(req);
      if (!ownerId) return next(AppError.notFound());
      if (ownerId !== req.user.id) return next(AppError.forbidden());
      next();
    } catch (err) {
      next(err);
    }
  };
}
