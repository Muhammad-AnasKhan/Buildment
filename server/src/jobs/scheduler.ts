import { env, isProduction, isTest } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { runInactivityNudges } from "../services/jobs/inactivity-nudges.js";
import { runWeeklyGoalReminders } from "../services/jobs/weekly-goal-reminders.js";
import { runIntegrityRetention } from "../services/jobs/integrity-retention.js";

// Background jobs run inside the API process on a fixed daily time, so a
// deployment needs no external cron. The /api/v1/jobs endpoints stay for
// platforms that prefer to trigger runs themselves (they share the same
// services), and JOBS_ENABLED=false turns the in-process timer off — for
// example when several API replicas run and only one should send email.

export type ScheduledJob = {
  name: string;
  /** UTC hour of the day the job runs at. */
  hourUtc: number;
  run: () => Promise<unknown>;
};

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Next occurrence of `hourUtc:00` strictly after `from`. */
export function nextRunAt(hourUtc: number, from: Date = new Date()): Date {
  const next = new Date(from);
  next.setUTCHours(hourUtc, 0, 0, 0);
  if (next.getTime() <= from.getTime()) next.setTime(next.getTime() + DAY_MS);
  return next;
}

export function defaultJobs(): ScheduledJob[] {
  return [
    { name: "inactivity-nudges", hourUtc: env.INACTIVITY_NUDGE_HOUR_UTC, run: runInactivityNudges },
    { name: "weekly-goal-reminders", hourUtc: env.WEEKLY_GOAL_REMINDER_HOUR_UTC, run: runWeeklyGoalReminders },
    { name: "integrity-retention", hourUtc: env.INTEGRITY_RETENTION_HOUR_UTC, run: () => runIntegrityRetention() },
  ];
}

/**
 * Schedules each job for its next daily slot and keeps rescheduling after every
 * run. Returns a stop function for graceful shutdown. A job that is still
 * running when its next slot arrives is skipped once rather than overlapped.
 */
export function startScheduler(jobs: ScheduledJob[] = defaultJobs()): () => void {
  if (!env.JOBS_ENABLED || isTest) {
    logger.info("[jobs] in-process scheduler disabled");
    return () => undefined;
  }

  const timers = new Set<NodeJS.Timeout>();
  const running = new Set<string>();

  const schedule = (job: ScheduledJob) => {
    const at = nextRunAt(job.hourUtc);
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
    logger.info({ job: job.name, at: at.toISOString() }, "[jobs] scheduled");
  };

  for (const job of jobs) schedule(job);
  if (!isProduction) logger.debug("[jobs] scheduler running in development; set JOBS_ENABLED=false to silence it");

  return () => {
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
  };
}
