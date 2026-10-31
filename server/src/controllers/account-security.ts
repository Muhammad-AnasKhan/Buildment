import type { Request, Response } from "express";
import * as mfa from "../services/auth/account-mfa.js";
import type { MfaCodeBody } from "../validations/auth.js";
import { created, noContent, ok } from "../utils/responses.js";

export async function getMfaStatus(req: Request, res: Response) {
  ok(res, await mfa.getAccountMfaStatus(req.user!.id));
}

export async function beginMfaEnrollment(req: Request, res: Response) {
  created(res, await mfa.beginAccountTotpEnrollment(req.user!.id, req.user!.email));
}

export async function activateMfa(req: Request, res: Response) {
  ok(res, await mfa.activateAccountTotp(req.user!.id, (req.body as MfaCodeBody).code));
}

export async function regenerateMfaRecoveryCodes(req: Request, res: Response) {
  ok(res, await mfa.regenerateAccountRecoveryCodes(req.user!.id, (req.body as MfaCodeBody).code));
}

export async function disableMfa(req: Request, res: Response) {
  await mfa.disableAccountTotp(req.user!.id, (req.body as MfaCodeBody).code);
  noContent(res);
}
