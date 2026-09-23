import { beforeEach, describe, expect, it, vi } from "vitest";

const { enrollmentFindMany, helpFindMany, helpCount } = vi.hoisted(() => ({
  enrollmentFindMany: vi.fn(),
  helpFindMany: vi.fn(),
  helpCount: vi.fn(),
}));

vi.mock("@/server/db", () => ({
  prisma: {
    enrollment: { findMany: enrollmentFindMany },
    helpThread: { findMany: helpFindMany, count: helpCount },
    dailyActivity: { findMany: vi.fn() },
    studySession: { findMany: vi.fn() },
    response: { findMany: vi.fn() },
  },
}));

import { loadMenteeDashboard } from "./load-mentee-dashboard";

describe("loadMenteeDashboard learner scope", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enrollmentFindMany.mockResolvedValue([]);
    helpFindMany.mockResolvedValue([]);
    helpCount.mockResolvedValue(0);
  });

  it("scopes enrollment and help records to the authorized learner", async () => {
    await loadMenteeDashboard({ learnerId: "learner-a", learnerName: "A" });

    expect(enrollmentFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: "learner-a" },
    }));
    expect(helpFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { menteeId: "learner-a" },
    }));
    expect(helpCount).toHaveBeenCalledWith({
      where: { menteeId: "learner-a", status: "OPEN" },
    });
  });
});
