import { z } from "zod";
import { STREAK_MILESTONES } from "../shared/lib/streak.js";

export const weeklyGoalBody = z.object({
  kind: z.enum(["SESSIONS", "CHAPTERS"]),
  target: z.number().int().min(1).max(50),
  note: z.string().trim().max(240).optional(),
  dailyReminder: z.boolean().optional(),
});

export const streakMilestoneParams = z.object({
  milestone: z.coerce
    .number()
    .refine((value): value is (typeof STREAK_MILESTONES)[number] => (STREAK_MILESTONES as readonly number[]).includes(value), {
      message: `Milestone must be one of ${STREAK_MILESTONES.join(", ")}`,
    }),
});

export const profileBody = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  timezone: z.string().trim().min(1, "Timezone is required").max(64),
  skills: z.array(z.string().trim().min(1).max(60)).max(30),
});

export const instructorAccessRequestBody = z.object({ message: z.string().trim().max(500).optional() });
