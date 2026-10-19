import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "../../src/db/prisma.js";
import { notify } from "../../src/services/notifications/service.js";
import { EMAIL_MAX_ATTEMPTS, processEmailOutbox } from "../../src/services/notifications/email-outbox.js";
import { sendEmail } from "../../src/services/email/send.js";

// The outbox worker against a real database, with the Resend call replaced so nothing leaves the
// machine. Assertions look at this file's own rows; other suites may leave unrelated outbox rows.
vi.mock("../../src/services/email/send.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../src/services/email/send.js")>()),
  sendEmail: vi.fn(),
}));
const send = vi.mocked(sendEmail);

const tag = randomUUID().slice(0, 8);
let userId = "";

beforeAll(async () => {
  const user = await prisma.user.create({
    data: { email: `outbox-${tag}@test.local`, name: "Outbox User", role: "MENTEE", emailVerified: new Date() },
  });
  userId = user.id;
});
afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: userId } });
});
beforeEach(() => {
  send.mockReset();
  send.mockResolvedValue({ sent: false, reason: "api-error", status: 503 });
});

async function queue(name: string) {
  await notify({
    type: "help.reply",
    recipients: [{ userId }],
    dedupeKey: `outbox-test-${tag}-${name}`,
    title: name,
    body: name,
    email: () => ({ subject: name, html: `<p>${name}</p>`, text: name }),
  });
  return prisma.emailOutbox.findFirstOrThrow({ where: { dedupeKey: `outbox-test-${tag}-${name}:outbox-${tag}@test.local` } });
}

/** Runs batches until nothing is due, so rows from other suites cannot crowd this file's rows out. */
async function drain(now = new Date()) {
  for (let i = 0; i < 50; i++) {
    const batch = await processEmailOutbox(now);
    if (batch.sent + batch.skipped + batch.retry + batch.failed === 0) return;
  }
}

const reload = (id: string) => prisma.emailOutbox.findUniqueOrThrow({ where: { id } });
const callsFor = (id: string) => send.mock.calls.filter(([input]) => input.idempotencyKey === id);

describe("notification email outbox", () => {
  it("sends a queued email once, with the row id as the idempotency key", async () => {
    const row = await queue("sent");
    send.mockImplementation(async (input) =>
      input.idempotencyKey === row.id ? { sent: true, id: "re_123" } : { sent: false, reason: "api-error", status: 503 }
    );

    await drain();
    await drain();

    expect(callsFor(row.id)).toHaveLength(1);
    expect(callsFor(row.id)[0]![0]).toMatchObject({ to: `outbox-${tag}@test.local`, subject: "sent" });
    expect(await reload(row.id)).toMatchObject({ status: "SENT", providerId: "re_123", attempts: 1, lockedAt: null });
  });

  it("retries transient failures with backoff, then succeeds", async () => {
    const row = await queue("retry");
    const now = new Date();

    await drain(now);
    const failed = await reload(row.id);
    expect(failed).toMatchObject({ status: "PENDING", attempts: 1 });
    expect(failed.nextAttemptAt.getTime() - now.getTime()).toBe(60_000);

    await drain(new Date(now.getTime() + 30_000)); // not due yet
    expect(callsFor(row.id)).toHaveLength(1);

    send.mockImplementation(async (input) =>
      input.idempotencyKey === row.id ? { sent: true, id: "re_retry" } : { sent: false, reason: "api-error", status: 503 }
    );
    await drain(new Date(now.getTime() + 61_000));
    expect(await reload(row.id)).toMatchObject({ status: "SENT", attempts: 2 });
  });

  it("gives up on permanent errors and after the last attempt", async () => {
    const permanent = await queue("permanent");
    send.mockImplementation(async (input) =>
      input.idempotencyKey === permanent.id
        ? { sent: false, reason: "api-error", status: 422, detail: "invalid to" }
        : { sent: false, reason: "api-error", status: 503 }
    );
    await drain();
    expect(await reload(permanent.id)).toMatchObject({ status: "FAILED", attempts: 1 });

    const flaky = await queue("flaky");
    send.mockRejectedValue(new Error("socket hang up"));
    let clock = Date.now();
    for (let i = 0; i < EMAIL_MAX_ATTEMPTS; i++) {
      await drain(new Date(clock));
      clock += 3 * 60 * 60 * 1000;
    }
    expect(await reload(flaky.id)).toMatchObject({ status: "FAILED", attempts: EMAIL_MAX_ATTEMPTS, lastError: "socket hang up" });
  });

  it("skips email the recipient switched off after it was queued", async () => {
    const row = await queue("muted");
    await prisma.notificationPreference.create({ data: { userId, emailOptOut: ["activity"] } });
    try {
      await drain();
      expect(callsFor(row.id)).toHaveLength(0);
      expect(await reload(row.id)).toMatchObject({ status: "SKIPPED" });
    } finally {
      await prisma.notificationPreference.delete({ where: { userId } });
    }
  });

  it("lets only one of two concurrent workers send a row", async () => {
    const row = await queue("race");
    send.mockImplementation(async (input) => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      return input.idempotencyKey === row.id ? { sent: true, id: "re_race" } : { sent: false, reason: "api-error", status: 503 };
    });

    await Promise.all([drain(), drain()]);
    expect(callsFor(row.id)).toHaveLength(1);
    expect(await reload(row.id)).toMatchObject({ status: "SENT" });
  });

  it("reclaims a row whose worker died mid-send", async () => {
    const row = await queue("stale");
    await prisma.emailOutbox.update({
      where: { id: row.id },
      data: { status: "SENDING", attempts: 1, lockedAt: new Date(Date.now() - 10 * 60 * 1000) },
    });
    send.mockImplementation(async (input) =>
      input.idempotencyKey === row.id ? { sent: true, id: "re_stale" } : { sent: false, reason: "api-error", status: 503 }
    );

    await drain();
    expect(await reload(row.id)).toMatchObject({ status: "SENT", attempts: 2 });
  });
});
