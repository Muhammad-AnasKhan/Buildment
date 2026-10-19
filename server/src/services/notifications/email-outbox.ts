import type { EmailOutbox } from "../../generated/prisma/index.js";
import { prisma } from "../../db/prisma.js";
import { logger } from "../../utils/logger.js";
import { NOTIFICATION_CATEGORY_INFO, type NotificationCategory } from "../../shared/api/notifications.js";
import { appBaseUrl, sendEmail, type SendEmailResult } from "../email/send.js";

// Sends queued notification email outside the API request that caused it. Rows are claimed one
// at a time with a compare-and-set update (the WHERE is re-checked under the row lock), so several
// workers or API replicas can run this concurrently and each row is sent by exactly one of them.
// Failures retry with backoff; Resend's idempotency key makes a retry after a lost response safe.

export type EmailContent = { subject: string; html: string; text: string };

export const EMAIL_MAX_ATTEMPTS = 5;
/** Wait before attempt N+1, indexed by attempts already made (1-based). */
const RETRY_DELAYS_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000];
/** A SENDING row older than this belonged to a worker that died; it is retried. */
const STALE_LOCK_MS = 5 * 60_000;
const BATCH_SIZE = 20;

export function retryDelayMs(attempts: number): number {
  return RETRY_DELAYS_MS[Math.min(Math.max(attempts, 1), RETRY_DELAYS_MS.length) - 1]!;
}

/** Whether a failed send is worth retrying: network trouble, timeouts, rate limits, 5xx. */
export function isRetryableFailure(result: SendEmailResult | { thrown: true }): boolean {
  if ("thrown" in result) return true;
  if (result.sent || result.reason !== "api-error") return false;
  const status = result.status ?? 0;
  return status === 0 || status === 408 || status === 409 || status === 429 || status >= 500;
}

export function withPreferencesFooter(content: EmailContent): EmailContent {
  const url = `${appBaseUrl()}/notifications`;
  return {
    subject: content.subject,
    html: `${content.html}
<p style="margin-top:24px;font-size:12px;color:#64748b;">You can choose which emails you get in <a href="${url}">notification settings</a>.</p>`,
    text: `${content.text}\n\nNotification settings: ${url}`,
  };
}

// The worker registers here so notify() can wake it right after queueing email, instead of the
// email waiting for the next interval tick.
let onQueued: (() => void) | null = null;

export function setEmailQueuedListener(listener: (() => void) | null): void {
  onQueued = listener;
}

export function signalEmailQueued(): void {
  onQueued?.();
}

async function claim(row: Pick<EmailOutbox, "id" | "status">, now: Date): Promise<boolean> {
  const staleBefore = new Date(now.getTime() - STALE_LOCK_MS);
  const { count } = await prisma.emailOutbox.updateMany({
    where:
      row.status === "PENDING"
        ? { id: row.id, status: "PENDING", nextAttemptAt: { lte: now } }
        : { id: row.id, status: "SENDING", lockedAt: { lt: staleBefore } },
    data: { status: "SENDING", lockedAt: now, attempts: { increment: 1 } },
  });
  return count === 1;
}

/** False when the recipient switched this category's email off after it was queued. */
async function stillWanted(row: EmailOutbox): Promise<boolean> {
  if (!row.userId) return true;
  const category = row.category as NotificationCategory;
  if (!NOTIFICATION_CATEGORY_INFO[category]?.optional.email) return true;
  const preference = await prisma.notificationPreference.findUnique({
    where: { userId: row.userId },
    select: { emailOptOut: true },
  });
  return !(preference?.emailOptOut ?? []).includes(category);
}

async function deliver(row: EmailOutbox, now: Date): Promise<"sent" | "skipped" | "retry" | "failed"> {
  if (!(await stillWanted(row))) {
    await prisma.emailOutbox.update({
      where: { id: row.id },
      data: { status: "SKIPPED", lockedAt: null, lastError: "recipient turned this email off" },
    });
    return "skipped";
  }

  let result: SendEmailResult | { thrown: true; message: string };
  try {
    result = await sendEmail({ to: row.toEmail, subject: row.subject, html: row.html, text: row.text, idempotencyKey: row.id });
  } catch (error) {
    result = { thrown: true, message: error instanceof Error ? error.message : String(error) };
  }

  if (!("thrown" in result) && result.sent) {
    await prisma.emailOutbox.update({
      where: { id: row.id },
      data: { status: "SENT", sentAt: now, providerId: result.id, lockedAt: null, lastError: null },
    });
    return "sent";
  }

  if (!("thrown" in result) && result.reason === "no-api-key") {
    // Local development without Resend: the payload was logged by sendEmail; nothing to retry.
    await prisma.emailOutbox.update({
      where: { id: row.id },
      data: { status: "SKIPPED", lockedAt: null, lastError: "AUTH_RESEND_KEY not set" },
    });
    return "skipped";
  }

  const detail = "thrown" in result ? result.message : `${result.status ?? ""} ${result.detail ?? ""}`.trim();
  const retry = isRetryableFailure(result) && row.attempts < EMAIL_MAX_ATTEMPTS;
  await prisma.emailOutbox.update({
    where: { id: row.id },
    data: retry
      ? { status: "PENDING", lockedAt: null, lastError: detail, nextAttemptAt: new Date(now.getTime() + retryDelayMs(row.attempts)) }
      : { status: "FAILED", lockedAt: null, lastError: detail },
  });
  if (!retry) logger.error({ outboxId: row.id, type: row.type, detail }, "[notifications] email failed permanently");
  return retry ? "retry" : "failed";
}

/** Sends one batch of due email. Returns what happened to each claimed row. */
export async function processEmailOutbox(now = new Date()) {
  const staleBefore = new Date(now.getTime() - STALE_LOCK_MS);
  const due = await prisma.emailOutbox.findMany({
    where: {
      OR: [
        { status: "PENDING", nextAttemptAt: { lte: now } },
        { status: "SENDING", lockedAt: { lt: staleBefore } },
      ],
    },
    orderBy: { nextAttemptAt: "asc" },
    take: BATCH_SIZE,
    select: { id: true, status: true },
  });

  const summary = { sent: 0, skipped: 0, retry: 0, failed: 0 };
  for (const candidate of due) {
    if (!(await claim(candidate, now))) continue;
    const row = await prisma.emailOutbox.findUnique({ where: { id: candidate.id } });
    if (!row) continue;
    summary[await deliver(row, now)] += 1;
  }
  return summary;
}
