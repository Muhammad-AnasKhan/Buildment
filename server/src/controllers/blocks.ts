import type { Request, Response } from "express";
import { ok } from "../utils/responses.js";
import { submitBlockResponse } from "../services/blocks/respond.js";

// POST /api/v1/blocks/:blockId/respond
export async function respond(req: Request, res: Response) {
  const result = await submitBlockResponse({
    blockId: req.params.blockId as string,
    user: req.user,
    payload: req.body as Record<string, unknown>,
  });
  ok(res, result);
}
