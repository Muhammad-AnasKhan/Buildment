import { z } from "zod";
import { STREAK_MILESTONES } from "@buildment/shared/lib/streak";

export const weeklyGoalBody = z.object({
  kind: z.enum(["SESSIONS", "CHAPTERS"]),
  target: z.number().int().min(1).max(50),
});

export const streakMilestoneParams = z.object({
  milestone: z.coerce
    .number()
    .refine((value): value is (typeof STREAK_MILESTONES)[number] => (STREAK_MILESTONES as readonly number[]).includes(value), {
      message: `Milestone must be one of ${STREAK_MILESTONES.join(", ")}`,
    }),
});
