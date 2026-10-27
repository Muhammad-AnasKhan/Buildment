import type { Request, Response } from "express";
import { ok } from "../utils/responses.js";
import { recordAppHeartbeat } from "../services/activity/app-activity.js";
import type { AppHeartbeatBody } from "../validations/activity.js";

// POST /api/v1/activity/heartbeat
export async function heartbeat(req: Request, res: Response) {
  const body = req.body as AppHeartbeatBody;
  ok(res, await recordAppHeartbeat({ userId: req.user!.id, ...body }));
}
