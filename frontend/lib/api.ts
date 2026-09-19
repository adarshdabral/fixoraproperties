"use client";

import { API_BASE_URL, parseApiResponse, toQueryString } from "./api-core";

/**
 * Client-side API client. Always sends credentials so the httpOnly auth
 * cookies (set by the API on login/register) travel with the request — the
 * frontend never reads or stores the JWTs itself.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
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
