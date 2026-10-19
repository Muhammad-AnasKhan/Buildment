import { prisma } from "../../db/prisma.js";
import { APP_HEARTBEAT_MAX_SECONDS, type AppHeartbeatResult } from "../../shared/api/activity.js";
import { utcDateOnly } from "../progress/heartbeat.js";

// Overall app activity: estimated active time anywhere in the signed-in app, kept apart from the
// chapter study clock (StudySession / ChapterProgress / DailyActivity), which it never writes.
//
// Each heartbeat claims the interval [now - activeSeconds, now]. Only the part of that interval
// after the user's previously credited instant counts, so overlapping tabs, several devices,
// retries and bursts can never add up to more than wall-clock time. A per-user advisory lock
// serialises heartbeats for one user; different users never wait on each other.

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Rolling window of daily rows kept, in UTC calendar days including today: today and the previous
 * 34 days. The daily cleanup job deletes anything older, so on day 36 day 1 goes.
 */
export const APP_ACTIVITY_RETENTION_DAYS = 35;

/** Network jitter allowance: a beat may overlap the previous one by this much. */
export const APP_CREDIT_SLACK_MS = 2_000;

export type CreditedSlice = { date: Date; seconds: number; from: Date; to: Date };

/**
 * Seconds of a heartbeat's claimed interval that are not already credited, split by UTC day.
 * Pure, so the counting rules are unit-tested without a database.
 */
export function creditHeartbeat(input: {
  claimedSeconds: number;
  previousActiveAt: Date | null;
  now: Date;
}): CreditedSlice[] {
  const claimed = Number.isFinite(input.claimedSeconds)
    ? Math.min(Math.max(Math.floor(input.claimedSeconds), 0), APP_HEARTBEAT_MAX_SECONDS)
    : 0;
  if (claimed === 0) return [];

  const nowMs = input.now.getTime();
  const floorMs = input.previousActiveAt ? input.previousActiveAt.getTime() - APP_CREDIT_SLACK_MS : -Infinity;
  const startMs = Math.max(nowMs - claimed * 1000, floorMs);
  const total = Math.min(claimed, Math.round((nowMs - startMs) / 1000));
  if (total <= 0) return [];

  // A claim is at most two minutes, so it spans at most one UTC midnight.
  const midnightMs = utcDateOnly(input.now).getTime();
  if (startMs >= midnightMs) {
    return [{ date: new Date(midnightMs), seconds: total, from: new Date(startMs), to: input.now }];
  }
  const before = Math.min(total, Math.round((midnightMs - startMs) / 1000));
  return [
    { date: new Date(midnightMs - DAY_MS), seconds: before, from: new Date(startMs), to: new Date(midnightMs) },
    { date: new Date(midnightMs), seconds: total - before, from: new Date(midnightMs), to: input.now },
  ].filter((slice) => slice.seconds > 0);
}

export async function recordAppHeartbeat(input: {
  userId: string;
  activeSeconds: number;
  beatId?: string;
  now?: Date;
}): Promise<AppHeartbeatResult> {
  const now = input.now ?? new Date();

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`app-activity:${input.userId}`}))`;

    const state = await tx.userAppActivity.findUnique({ where: { userId: input.userId } });
    if (input.beatId && state?.lastBeatId === input.beatId) {
      return { creditedSeconds: 0, duplicate: true };
    }

    const slices = creditHeartbeat({
      claimedSeconds: input.activeSeconds,
      previousActiveAt: state?.lastActiveAt ?? null,
      now,
    });

    const lastActiveAt = state && state.lastActiveAt > now ? state.lastActiveAt : now;
    await tx.userAppActivity.upsert({
      where: { userId: input.userId },
      create: { userId: input.userId, lastActiveAt, lastBeatId: input.beatId ?? null },
      update: { lastActiveAt, lastBeatId: input.beatId ?? null },
    });

    for (const slice of slices) {
      await tx.appActivityDay.upsert({
        where: { userId_date: { userId: input.userId, date: slice.date } },
        create: {
          userId: input.userId,
          date: slice.date,
          activeSeconds: slice.seconds,
          heartbeats: 1,
          firstActiveAt: slice.from,
          lastActiveAt: slice.to,
        },
        update: {
          activeSeconds: { increment: slice.seconds },
          heartbeats: { increment: 1 },
          lastActiveAt: slice.to,
        },
      });
    }

    return { creditedSeconds: slices.reduce((sum, slice) => sum + slice.seconds, 0), duplicate: false };
  });
}

/** Oldest UTC day kept by the retention window (today counts as one of the days). */
export function appActivityRetentionStart(now: Date = new Date()): Date {
  return new Date(utcDateOnly(now).getTime() - (APP_ACTIVITY_RETENTION_DAYS - 1) * DAY_MS);
}

/**
 * Deletes daily app-activity rows outside the retention window. Per-user `lastActiveAt` and all
 * study tables (DailyActivity, StudySession, ChapterProgress) are never touched.
 */
export async function pruneAppActivity(now: Date = new Date()): Promise<{ deletedDays: number }> {
  const { count } = await prisma.appActivityDay.deleteMany({
    where: { date: { lt: appActivityRetentionStart(now) } },
  });
  return { deletedDays: count };
}
