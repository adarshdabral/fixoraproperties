import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { UserModel } from "../modules/users/user.model.js";
import type { Role } from "@fixora/types";
import { AUTH_COOKIES } from "@fixora/config";

export interface AuthUser {
  id: string;
  role: Role;
  tokenVersion: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function extractToken(req: Request): string | undefined {
  const cookieToken = req.cookies?.[AUTH_COOKIES.accessToken];
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);
  return undefined;
}

/**
 * Verifies the access token and re-checks the user against the database on
 * every request (not just the token) so deactivation, role changes, and
 * "logout everywhere" (tokenVersion bump) take effect immediately rather
 * than waiting for the token to expire.
 */
export function requireAuth() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = extractToken(req);
      if (!token) throw AppError.unauthorized();

      const payload = verifyAccessToken(token);
      const user = await UserModel.findById(payload.sub).select("role isActive tokenVersion");

      if (!user || !user.isActive) throw AppError.unauthorized("Account not found or inactive");
      if (user.tokenVersion !== payload.tokenVersion) {
        throw AppError.unauthorized("Session expired, please log in again");
      }

      req.user = { id: user.id, role: user.role as Role, tokenVersion: user.tokenVersion };
      next();
    } catch {
      next(AppError.unauthorized());
    }
  };
}

/**
 * Best-effort auth: attaches req.user when a valid token is present, but
 * never rejects the request. Used on public routes (e.g. property listing)
 * that render slightly differently for authenticated buyers without
 * requiring login.
 */
export function optionalAuth() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) return next();
    try {
      const payload = verifyAccessToken(token);
      const user = await UserModel.findById(payload.sub).select("role isActive tokenVersion");
      if (user && user.isActive && user.tokenVersion === payload.tokenVersion) {
        req.user = { id: user.id, role: user.role as Role, tokenVersion: user.tokenVersion };
      }
    } catch {
      // ignore invalid token on optional auth
    }
    next();
  };
}

/** Restricts a route to an explicit set of roles. Prefer requirePermission() for business actions. */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!roles.includes(req.user.role)) return next(AppError.forbidden());
    next();
  };
}
