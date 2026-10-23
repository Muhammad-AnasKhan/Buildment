import type { Request, Response } from "express";
import { authorizeDesktop, exchangeDesktop } from "../services/auth/desktop.js";
import { ok } from "../utils/responses.js";

export async function authorize(req: Request, res: Response) {
  res.set("Cache-Control", "no-store");
  ok(res, await authorizeDesktop(req.user!.id, req.body.challenge));
}
export async function exchange(req: Request, res: Response) {
  res.set("Cache-Control", "no-store");
  ok(res, await exchangeDesktop(req.body.code, req.body.verifier));
}
