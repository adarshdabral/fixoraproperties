import rateLimit from "express-rate-limit";

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many attempts, please try again later" } },
});

/**
 * Separate from authRateLimit: the web app calls /auth/refresh on page load
 * for every visitor whose access token has expired (or who has none), so
 * sharing a budget with login would lock people out of logging in.
 */
export const refreshRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests, please slow down" } },
});

/**
 * Reads are exempt: public pages are server-rendered on Vercel, so every
 * visitor's page load reaches this API from the same few Vercel IPs — a
 * per-IP cap on GETs would start returning 429s to everyone at once under
 * modest traffic. Writes (and auth, via authRateLimit) stay limited.
 */
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  skip: (req) => req.method === "GET",
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests, please slow down" } },
});

export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many AI requests, please slow down" } },
});
