import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("listAdminRecipients", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns admin accounts and only the ADMIN_NOTIFY_EMAIL inboxes that are not accounts", async () => {
    vi.stubEnv("ADMIN_NOTIFY_EMAIL", "ops@example.com, ops@example.com, Admin@buildment.dev");
    vi.doMock("../../../../src/db/prisma.js", () => ({
      prisma: {
        user: {
          findMany: vi.fn().mockResolvedValue([{ id: "admin-1", email: "admin@buildment.dev" }]),
        },
      },
    }));
    const { listAdminRecipients } = await import("../../../../src/services/email/admin-recipients.js");
    expect(await listAdminRecipients()).toEqual({ userIds: ["admin-1"], extraEmails: ["ops@example.com"] });
  });
});
