import "server-only";
import { cookies } from "next/headers";
import { API_BASE_URL, parseApiResponse, toQueryString } from "./api-core";

/**
 * Server Component / Server Action API client. Forwards the incoming
 * request's cookies to the API so authenticated SSR reads (e.g. a
 * dashboard page rendering server-side) see the same session the browser
 * has — the API is the only place that ever verifies the JWT.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: { "Content-Type": "application/json", cookie: cookieStore.toString(), ...options.headers },
  });
  return parseApiResponse<T>(res);
}

export const serverApi = {
  get: <T>(path: string, query?: Record<string, unknown>) => request<T>(`${path}${toQueryString(query)}`),
};

export { ApiError } from "./api-core";
