import type { Request, Response } from "express";
import { ok } from "../utils/responses.js";
import { runInactivityNudges } from "../services/jobs/inactivity-nudges.js";
import { runWeeklyGoalReminders } from "../services/jobs/weekly-goal-reminders.js";

// POST /api/v1/jobs/inactivity-nudge — triggered by an external scheduler.
export async function inactivityNudge(_req: Request, res: Response) {
  ok(res, await runInactivityNudges());
}

// POST /api/v1/jobs/weekly-goal-reminder — triggered by an external scheduler.
export async function weeklyGoalReminder(_req: Request, res: Response) {
  ok(res, await runWeeklyGoalReminders());
}
