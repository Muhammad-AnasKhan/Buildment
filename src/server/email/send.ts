import "server-only";

// Transactional email via the Resend HTTP API — the same AUTH_RESEND_KEY the
// Auth.js magic-link provider uses, so there is exactly one email credential
// to configure. Deliberately no SDK dependency: one POST, one auth header.
//
// When no key is configured (typical in local dev) sending is a no-op that
// logs the payload instead, and callers surface the raw link in the UI so the
// flow stays fully testable without email delivery.

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult =
  | { sent: true; id: string }
  | { sent: false; reason: "no-api-key" | "api-error"; detail?: string };

export function emailConfigured(): boolean {
  return Boolean(process.env.AUTH_RESEND_KEY);
}

export function appBaseUrl(): string {
  return (process.env.AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function inviteAcceptUrl(token: string): string {
  return `${appBaseUrl()}/invite/${token}`;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.AUTH_RESEND_KEY;
  const from = process.env.EMAIL_FROM ?? "buildment <onboarding@resend.dev>";

  if (!apiKey) {
    console.info(
      `[email] AUTH_RESEND_KEY not set — skipping send to ${input.to}: "${input.subject}"`
    );
    return { sent: false, reason: "no-api-key" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`[email] Resend API error ${response.status}: ${detail}`);
    return { sent: false, reason: "api-error", detail };
  }

  const body = (await response.json().catch(() => null)) as { id?: string } | null;
  return { sent: true, id: body?.id ?? "unknown" };
}
