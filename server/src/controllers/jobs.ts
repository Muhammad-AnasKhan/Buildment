import type { Request, Response } from "express";
import { ok } from "../utils/responses.js";
import { runInactivityNudges } from "../services/jobs/inactivity-nudges.js";
import { runWeeklyGoalReminders } from "../services/jobs/weekly-goal-reminders.js";
import { runIntegrityRetention } from "../services/jobs/integrity-retention.js";
import { pruneAppActivity } from "../services/activity/app-activity.js";

// POST /api/v1/jobs/inactivity-nudge — triggered by an external scheduler.
export async function inactivityNudge(_req: Request, res: Response) {
  ok(res, await runInactivityNudges());
}

// POST /api/v1/jobs/weekly-goal-reminder — triggered by an external scheduler.
export async function weeklyGoalReminder(_req: Request, res: Response) {
  ok(res, await runWeeklyGoalReminders());
}

// POST /api/v1/jobs/integrity-retention: triggered by an external scheduler.
export async function integrityRetention(_req: Request, res: Response) {
  ok(res, await runIntegrityRetention());
}

// POST /api/v1/jobs/app-activity-cleanup — deletes daily app-activity rows past retention.
export async function appActivityCleanup(_req: Request, res: Response) {
  ok(res, await pruneAppActivity());
}
