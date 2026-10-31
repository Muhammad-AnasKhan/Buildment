import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  learnerTimeZone: vi.fn(),
  awardXp: vi.fn(),
  grantStreakFreeze: vi.fn(),
}));

vi.mock("../../../../src/db/prisma.js", () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) => mocks.transaction(fn),
  },
}));
vi.mock("../../../../src/services/learner/time-zone.js", () => ({
  learnerTimeZone: (...args: unknown[]) => mocks.learnerTimeZone(...args),
}));
vi.mock("../../../../src/services/gamification/xp.js", () => ({
  awardXp: (...args: unknown[]) => mocks.awardXp(...args),
}));
vi.mock("../../../../src/services/gamification/flags.js", () => ({
  gamificationFeatures: () => ({ streakFreezes: true, xp: true }),
}));

import { settleWeeklyGoal } from "../../../../src/services/gamification/habit.js";
import type { LearnerHabit } from "../../../../src/shared/lib/streak.js";

describe("settleWeeklyGoal periods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.learnerTimeZone.mockResolvedValue("UTC");
  });

  it("pays daily goal XP once without a streak freeze", async () => {
    const created = { id: "evt-daily", type: "daily_goal_met", dedupeKey: "daily_goal_met:2026-10-31" };
    const tx = {
      engagementEvent: {
        createManyAndReturn: vi.fn().mockResolvedValue([created]),
        update: vi.fn(),
      },
      user: { updateMany: vi.fn() },
    };
    mocks.transaction.mockImplementation(async (fn: (client: typeof tx) => unknown) => fn(tx));
    mocks.awardXp.mockResolvedValue(10);

    const habit: LearnerHabit = {
      streakCount: 2,
      graceUsed: false,
      streakMilestone: null,
      weeklyGoal: null,
      goal: {
        period: "DAILY",
        kind: "MINUTES",
        target: 10,
        progress: 12,
        note: null,
        dailyReminder: false,
      },
    };

    const event = await settleWeeklyGoal("user-1", habit, "web", new Date("2026-10-31T12:00:00.000Z"));
    expect(event).toEqual(created);
    expect(mocks.awardXp).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({ source: "daily_goal_met", sourceKey: "daily_goal:2026-10-31" }),
    );
    expect(tx.user.updateMany).not.toHaveBeenCalled();
  });
});
