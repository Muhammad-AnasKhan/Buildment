import type { Request, Response } from "express";
import { ok } from "../utils/responses.js";
import { pruneAppActivity } from "../services/activity/app-activity.js";
import { runStudyReminders } from "../services/notifications/reminders.js";
import { processEmailOutbox } from "../services/notifications/email-outbox.js";
import { pruneNotifications } from "../services/notifications/cleanup.js";
import { relayUnpushedNotifications } from "../services/notifications/service.js";
import { runWeeklyGoalReminders } from "../services/jobs/weekly-goal-reminders.js";
import { runIntegrityRetention } from "../services/jobs/integrity-retention.js";

// POST /api/v1/jobs/study-reminders (alias: /inactivity-nudge) — call hourly from an external
// scheduler; each user is reminded at their own hour, so a once-a-day call reaches only some.
export async function studyReminders(_req: Request, res: Response) {
  ok(res, await runStudyReminders());
}

// POST /api/v1/jobs/notification-emails — sends one batch of due notification email.
export async function notificationEmails(_req: Request, res: Response) {
  const pushed = await relayUnpushedNotifications();
  ok(res, { pushed, ...(await processEmailOutbox()) });
}

// POST /api/v1/jobs/app-activity-cleanup — deletes app-activity and notification rows past retention.
export async function appActivityCleanup(_req: Request, res: Response) {
  ok(res, { ...(await pruneAppActivity()), notifications: await pruneNotifications() });
}

// POST /api/v1/jobs/weekly-goal-reminder — triggered by an external scheduler.
export async function weeklyGoalReminder(_req: Request, res: Response) {
  ok(res, await runWeeklyGoalReminders());
}

// POST /api/v1/jobs/integrity-retention: triggered by an external scheduler.
export async function integrityRetention(_req: Request, res: Response) {
  ok(res, await runIntegrityRetention());
}
