import type { Request, Response } from "express";
import { ok } from "../utils/responses.js";
import { acceptInvite, getInvitePublicView } from "../services/invites/invites.js";

// GET /api/v1/invites/:token — public
export async function show(req: Request, res: Response) {
  ok(res, await getInvitePublicView(req.params.token as string));
}

// POST /api/v1/invites/:token/accept
export async function accept(req: Request, res: Response) {
  const { name } = req.body as { name?: string };
  ok(res, await acceptInvite(req.user!, req.params.token as string, name));
}
