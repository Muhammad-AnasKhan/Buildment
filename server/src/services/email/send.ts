import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { renderEmailLayout } from "./render.js";

// Transactional email via the Resend HTTP API. Deliberately no SDK dependency:
// one POST, one auth header. When no key is configured (typical in local dev)
// sending is a no-op that logs the payload instead, and callers surface the raw
// link in the UI so the flow stays fully testable without email delivery.

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Resend drops a repeat of the same key for 24h, so a retry after a timeout is not a second email. */
  idempotencyKey?: string;
};

export type SendEmailResult =
  | { sent: true; id: string }
  | { sent: false; reason: "no-api-key" | "api-error"; detail?: string; status?: number };

const SEND_TIMEOUT_MS = 20_000;

export function emailConfigured(): boolean {
  return Boolean(env.AUTH_RESEND_KEY);
}

/** Public web app URL — every link inside an email starts here. */
export function appBaseUrl(): string {
  return env.APP_URL;
}

export function inviteAcceptUrl(token: string): string {
  return `${appBaseUrl()}/invite/${token}`;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!env.AUTH_RESEND_KEY) {
    logger.info({ to: input.to, subject: input.subject }, "[email] AUTH_RESEND_KEY not set — skipping send");
    return { sent: false, reason: "no-api-key" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.AUTH_RESEND_KEY}`,
      "Content-Type": "application/json",
      ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}),
    },
    signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [input.to],
      subject: input.subject,
      html: await renderEmailLayout(input, appBaseUrl()),
      text: input.text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    logger.error({ status: response.status, detail }, "[email] Resend API error");
    return { sent: false, reason: "api-error", detail, status: response.status };
  }

  const body = (await response.json().catch(() => null)) as { id?: string } | null;
  return { sent: true, id: body?.id ?? "unknown" };
}
