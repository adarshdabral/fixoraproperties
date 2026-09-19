import { env, integrations } from "../config/env.js";
import { logger } from "../config/logger.js";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Thin wrapper around the Resend API. When RESEND_API_KEY isn't configured
 * (development, or before this integration is provisioned), it logs the
 * email instead of failing the request — the calling flow (password reset,
 * notifications) must keep working either way. Never throws on delivery
 * failure; email is best-effort, not something that should 500 a request.
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (!integrations.email) {
    logger.info({ to: input.to, subject: input.subject }, "Email not configured — logging instead of sending");
    logger.debug({ html: input.html }, "Email content");
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Fixora Properties <no-reply@fixora.dev>",
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });
    if (!res.ok) {
      logger.error({ status: res.status, body: await res.text() }, "Failed to send email via Resend");
    }
  } catch (err) {
    logger.error({ err }, "Failed to send email");
  }
}
