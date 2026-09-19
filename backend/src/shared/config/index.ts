export const APP_NAME = "Fixora Properties";

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 12,
  maxLimit: 50,
};

/**
 * Cookie names shared between the API (which sets them) and any server-side
 * code in the web app that needs to read auth state during SSR.
 */
export const AUTH_COOKIES = {
  accessToken: "fixora_at",
  refreshToken: "fixora_rt",
} as const;
