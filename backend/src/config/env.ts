import "dotenv/config";
import { z } from "zod";

/**
 * Startup environment validation. Required infrastructure (DB, JWT secrets)
 * fails fast with a clear message. Optional third-party integrations
 * (AI, WhatsApp, Cloudinary, email) are allowed to be empty in development —
 * the services that depend on them fall back to a clearly-logged disabled
 * mode instead of crashing the whole app (see each module's service file).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 characters"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),
  COOKIE_DOMAIN: z.string().optional(),

  REDIS_URL: z.string().optional(),

  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),

  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),

  /**
   * A trailing slash here breaks CORS silently: the `cors` package does an
   * exact string match against the browser's `Origin` header, which never
   * has a trailing slash, so `https://x.com/` would reject every request
   * from `https://x.com`. Stripped here once so every consumer (CORS
   * origin check, password-reset link building) gets a clean value
   * regardless of how it's set in the platform's env var UI.
   */
  WEB_APP_URL: z
    .string()
    .default("http://localhost:3000")
    .transform((url) => url.replace(/\/+$/, "")),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid or missing environment variables:");
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    console.error("\nCopy .env.example to .env and fill in the required values.");
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();

export const integrations = {
  ai: Boolean(env.OPENAI_API_KEY),
  whatsapp: Boolean(
    env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID && env.WHATSAPP_VERIFY_TOKEN
  ),
  media: Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET),
  email: Boolean(env.RESEND_API_KEY),
  redis: Boolean(env.REDIS_URL),
};
