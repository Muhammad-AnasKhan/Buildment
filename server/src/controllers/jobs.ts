import type { Request, Response } from "express";
import { ok } from "../utils/responses.js";
import { runInactivityNudges } from "../services/jobs/inactivity-nudges.js";

// POST /api/v1/jobs/inactivity-nudge — triggered by an external scheduler.
export async function inactivityNudge(_req: Request, res: Response) {
  ok(res, await runInactivityNudges());
}
