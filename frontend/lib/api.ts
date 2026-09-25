"use client";

import { API_BASE_URL, parseApiResponse, toQueryString } from "./api-core";

/** Auth endpoints that must never trigger a refresh-and-retry (they *are* the session flow). */
const NO_REFRESH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Access tokens last 15 minutes; the refresh cookie lasts 30 days. When a
 * request 401s, trade the refresh cookie for a new access token once and
 * retry. Concurrent 401s share a single refresh call.
 */
function refreshSession(): Promise<boolean> {
  refreshInFlight ??= fetch(`${API_BASE_URL}/auth/refresh`, { method: "POST", credentials: "include" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

/**
 * Client-side API client. Always sends credentials so the httpOnly auth
 * cookies (set by the API on login/register) travel with the request — the
 * frontend never reads or stores the JWTs itself.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const send = () =>
    fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
    });

  let res = await send();
  if (res.status === 401 && !NO_REFRESH_PATHS.some((p) => path.startsWith(p)) && (await refreshSession())) {
    res = await send();
  }
  return parseApiResponse<T>(res);
}

export const api = {
  get: <T>(path: string, query?: Record<string, unknown>) => request<T>(`${path}${toQueryString(query)}`),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { ApiError } from "./api-core";
