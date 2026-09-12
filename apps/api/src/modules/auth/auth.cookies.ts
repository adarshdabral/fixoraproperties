import type { Response } from "express";
import { AUTH_COOKIES } from "@fixora/config";
import { env } from "../../config/env.js";

const ACCESS_TOKEN_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MS = 30 * 24 * 60 * 60 * 1000;

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const secure = env.NODE_ENV === "production";
  const common = {
    httpOnly: true as const,
    secure,
    sameSite: "lax" as const,
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
  res.clearCookie(AUTH_COOKIES.accessToken, { domain: env.COOKIE_DOMAIN, path: "/", secure, sameSite: "lax" });
  res.clearCookie(AUTH_COOKIES.refreshToken, {
    domain: env.COOKIE_DOMAIN,
    path: "/api/v1/auth",
    secure,
    sameSite: "lax",
  });
}
