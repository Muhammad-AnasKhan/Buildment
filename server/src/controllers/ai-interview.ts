import type { Request, Response } from "express";
import { ok } from "../utils/responses.js";
import {
  abandonAiInterview,
  answerAiInterview,
  finishAiInterview,
  startAiInterview,
} from "../services/ai/interview/service.js";

// The learner's AI interview for one block. Responses carry the session only:
// transcript, feedback and counters. The rubric and the learner's key never appear.

const blockId = (req: Request) => req.params.blockId as string;

// POST /api/v1/blocks/:blockId/ai-interview/start
export async function start(req: Request, res: Response) {
  const { context } = req.body as { context?: string | null };
  ok(res, { session: await startAiInterview({ blockId: blockId(req), user: req.user, context }) });
}

// POST /api/v1/blocks/:blockId/ai-interview/answer
export async function answer(req: Request, res: Response) {
  const body = req.body as { sessionId: string; answer: string };
  ok(res, { session: await answerAiInterview({ blockId: blockId(req), user: req.user, ...body }) });
}

// POST /api/v1/blocks/:blockId/ai-interview/finish
export async function finish(req: Request, res: Response) {
  const { sessionId } = req.body as { sessionId: string };
  ok(res, { session: await finishAiInterview({ blockId: blockId(req), user: req.user, sessionId }) });
}

// POST /api/v1/blocks/:blockId/ai-interview/abandon
export async function abandon(req: Request, res: Response) {
  const { sessionId } = req.body as { sessionId: string };
  ok(res, { session: await abandonAiInterview({ blockId: blockId(req), user: req.user, sessionId }) });
}
