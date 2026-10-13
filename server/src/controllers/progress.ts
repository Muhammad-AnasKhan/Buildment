import type { Request, Response } from "express";
import { ok } from "../utils/responses.js";
import { controlStudyClock, getStudyClock, recordHeartbeat } from "../services/progress/study-timer.js";
import type { HeartbeatBody, SessionBody } from "../validations/progress.js";

// POST /api/v1/progress/heartbeat
export async function heartbeat(req: Request, res: Response) {
  const body = req.body as HeartbeatBody;
  ok(res, await recordHeartbeat({ user: req.user!, ...body }));
}

// GET /api/v1/progress/session?chapterId=
export async function getSession(req: Request, res: Response) {
  const { chapterId } = req.query as { chapterId: string };
  ok(res, await getStudyClock({ user: req.user!, chapterId }));
}

// POST /api/v1/progress/session
export async function controlSession(req: Request, res: Response) {
  const body = req.body as SessionBody;
  ok(res, await controlStudyClock({ user: req.user!, ...body }));
}
