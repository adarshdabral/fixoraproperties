import type { Response } from "express";
import { AUTH_COOKIES } from "../../shared/config/index.js";
import { env } from "../../config/env.js";

const ACCESS_TOKEN_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * `sameSite: "none"` in production because the backend (Render) and frontend
 * (Vercel) are deployed on different sites, not just different subdomains of
 * one domain — a cross-site fetch only carries the cookie back when it's
 * `SameSite=None; Secure`. `"lax"` is fine (and required, since `Secure`
 * needs HTTPS) for local dev where both run on http://localhost. Getting
 * this wrong doesn't fail loudly: login still sets the cookie, it just never
 * comes back on the next request, so every "am I logged in" check 401s.
 */
export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const secure = env.NODE_ENV === "production";
  const common = {
    httpOnly: true as const,
    secure,
    sameSite: (secure ? "none" : "lax") as "none" | "lax",
    domain: env.COOKIE_DOMAIN,
    path: "/",
  };

  res.cookie(AUTH_COOKIES.accessToken, accessToken, { ...common, maxAge: ACCESS_TOKEN_MS });
  res.cookie(AUTH_COOKIES.refreshToken, refreshToken, {
    ...common,
    maxAge: REFRESH_TOKEN_MS,
    path: "/api/v1/auth",
  });
}

export function clearAuthCookies(res: Response) {
  const secure = env.NODE_ENV === "production";
  const sameSite = secure ? "none" : "lax";
  res.clearCookie(AUTH_COOKIES.accessToken, { domain: env.COOKIE_DOMAIN, path: "/", secure, sameSite });
  res.clearCookie(AUTH_COOKIES.refreshToken, {
    domain: env.COOKIE_DOMAIN,
    path: "/api/v1/auth",
    secure,
    sameSite,
  });
}
