import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("listAdminNotificationEmails", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("merges ADMIN_NOTIFY_EMAIL with admin users", async () => {
    vi.stubEnv("ADMIN_NOTIFY_EMAIL", "ops@example.com, ops@example.com");
    vi.doMock("../../../../src/db/prisma.js", () => ({
      prisma: {
        user: {
          findMany: vi.fn().mockResolvedValue([{ email: "admin@buildment.dev" }]),
        },
      },
    }));
    const { listAdminNotificationEmails } = await import("../../../../src/services/email/admin-recipients.js");
    const emails = await listAdminNotificationEmails();
    expect(emails).toEqual(["ops@example.com", "admin@buildment.dev"]);
  });
});
