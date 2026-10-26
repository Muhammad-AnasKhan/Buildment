import type { Request, Response } from "express";
import { ok } from "../utils/responses.js";
import { trackEngagementEvent } from "../services/engagement/events.js";
import type { TrackEventBody } from "../validations/engagement.js";

// POST /api/v1/events
export async function track(req: Request, res: Response) {
  ok(res, await trackEngagementEvent(req.user!.id, req.body as TrackEventBody));
}
