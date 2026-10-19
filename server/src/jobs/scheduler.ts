import { env, isProduction, isTest } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { pruneAppActivity } from "../services/activity/app-activity.js";
import { runStudyReminders } from "../services/notifications/reminders.js";
import { pruneNotifications } from "../services/notifications/cleanup.js";
import { runWeeklyGoalReminders } from "../services/jobs/weekly-goal-reminders.js";
import { runIntegrityRetention } from "../services/jobs/integrity-retention.js";

// Background jobs run inside the API process on a fixed schedule, so a
// deployment needs no external cron. The /api/v1/jobs endpoints stay for
// platforms that prefer to trigger runs themselves (they share the same
// services), and JOBS_ENABLED=false turns the in-process timer off — for
// example when several API replicas run and only one should send email.

export type ScheduledJob = {
  name: string;
  /** UTC hour of the day a daily job runs at. Omit for an hourly job. */
  hourUtc?: number;
  /** Minute past the hour the job runs at (default 0). */
  minute?: number;
  run: () => Promise<unknown>;
};

/**
 * Runs right after the UTC day boundary (the reporting timezone), so the rolling app-activity
 * window drops its oldest day as soon as a new one starts. One indexed DELETE a day.
 */
const CLEANUP_HOUR_UTC = 0;
/**
 * Study reminders are evaluated every hour because each user has their own send hour (see
 * services/notifications/reminders.ts). A few minutes past the hour keeps clear of the cleanup run.
 */
const STUDY_REMINDER_MINUTE = 5;

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Next occurrence of `hourUtc:minute` strictly after `from`. */
export function nextRunAt(hourUtc: number, from: Date = new Date(), minute = 0): Date {
  const next = new Date(from);
  next.setUTCHours(hourUtc, minute, 0, 0);
  if (next.getTime() <= from.getTime()) next.setTime(next.getTime() + DAY_MS);
  return next;
}

/** Next occurrence of `:minute` past any hour, strictly after `from`. */
export function nextHourlyRunAt(minute: number, from: Date = new Date()): Date {
  const next = new Date(from);
  next.setUTCMinutes(minute, 0, 0);
  if (next.getTime() <= from.getTime()) next.setTime(next.getTime() + HOUR_MS);
  return next;
}

export function nextJobRunAt(job: Pick<ScheduledJob, "hourUtc" | "minute">, from: Date = new Date()): Date {
  return job.hourUtc === undefined
    ? nextHourlyRunAt(job.minute ?? 0, from)
    : nextRunAt(job.hourUtc, from, job.minute ?? 0);
}

export function defaultJobs(): ScheduledJob[] {
  return [
    { name: "study-reminders", minute: STUDY_REMINDER_MINUTE, run: () => runStudyReminders() },
    {
      name: "daily-cleanup",
      hourUtc: CLEANUP_HOUR_UTC,
      run: async () => ({ appActivity: await pruneAppActivity(), notifications: await pruneNotifications() }),
    },
    { name: "weekly-goal-reminders", hourUtc: env.WEEKLY_GOAL_REMINDER_HOUR_UTC, run: runWeeklyGoalReminders },
    { name: "integrity-retention", hourUtc: env.INTEGRITY_RETENTION_HOUR_UTC, run: () => runIntegrityRetention() },
  ];
}

/**
 * Schedules each job for its next slot and keeps rescheduling after every run.
 * Returns a stop function for graceful shutdown. A job that is still running
 * when its next slot arrives is skipped once rather than overlapped.
 */
export function startScheduler(jobs: ScheduledJob[] = defaultJobs()): () => void {
  if (!env.JOBS_ENABLED || isTest) {
    logger.info("[jobs] in-process scheduler disabled");
    return () => undefined;
  }

  const timers = new Set<NodeJS.Timeout>();
  const running = new Set<string>();

  const schedule = (job: ScheduledJob) => {
    const at = nextJobRunAt(job);
    const timer = setTimeout(async () => {
      timers.delete(timer);
      if (running.has(job.name)) {
        logger.warn({ job: job.name }, "[jobs] previous run still active, skipping this slot");
      } else {
        running.add(job.name);
        const startedAt = Date.now();
        try {
          const result = await job.run();
          logger.info({ job: job.name, result, ms: Date.now() - startedAt }, "[jobs] run finished");
        } catch (error) {
          logger.error({ job: job.name, err: error }, "[jobs] run failed");
        } finally {
          running.delete(job.name);
        }
      }
      schedule(job);
    }, at.getTime() - Date.now());
    timer.unref();
    timers.add(timer);
    logger.debug({ job: job.name, at: at.toISOString() }, "[jobs] scheduled");
  };

  for (const job of jobs) schedule(job);
  if (!isProduction) logger.debug("[jobs] scheduler running in development; set JOBS_ENABLED=false to silence it");

  return () => {
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
  };
}
