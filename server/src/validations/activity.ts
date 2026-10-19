import { z } from "zod";
import { APP_HEARTBEAT_MAX_SECONDS } from "../shared/api/activity.js";
import { id } from "./common.js";

export const appHeartbeatBody = z.object({
  activeSeconds: z.number().int().min(1).max(APP_HEARTBEAT_MAX_SECONDS),
  beatId: z
    .string()
    .trim()
    .min(8)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/)
    .optional(),
});
export type AppHeartbeatBody = z.infer<typeof appHeartbeatBody>;

/** Weekly reports: the latest 7 UTC calendar days (today included), inside the 35-day retention. */
const days = z.coerce.number().int().min(1).max(7).default(7);

export const appActivityOverviewQuery = z.object({ days });

export const appActivityUsersQuery = z.object({
  days,
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
  inactiveForDays: z.coerce.number().int().min(1).max(365).optional(),
  userId: id.optional(),
});
export type AppActivityUsersQuery = z.infer<typeof appActivityUsersQuery>;
