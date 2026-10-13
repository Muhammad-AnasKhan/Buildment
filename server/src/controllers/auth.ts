import type { Request, Response } from "express";
import { env, isProduction } from "../config/env.js";
import { ok } from "../utils/responses.js";
import { confirmEmailVerificationToken } from "../services/auth/email-verification.js";
import { createDevLoginSession } from "../services/auth/dev-login.js";
import { SESSION_COOKIE } from "../services/auth/session.js";

// GET /api/v1/auth/confirm-email?token= — email link target; always lands on the login page.
export async function confirmEmail(req: Request, res: Response) {
  const token = (req.query.token as string | undefined)?.trim();
  if (!token) return res.redirect(`${env.APP_URL}/login?error=verify-missing`);

  const result = await confirmEmailVerificationToken(token);
  if (!result.ok) {
    const param = result.reason === "expired" ? "verify-expired" : "verify-invalid";
    return res.redirect(`${env.APP_URL}/login?error=${param}`);
  }
  res.redirect(`${env.APP_URL}/login?verified=1&email=${encodeURIComponent(result.email)}`);
}

// GET /api/v1/auth/dev-login?email=&redirectTo= — seeded accounts only, never in production.
export async function devLogin(req: Request, res: Response) {
  const { email, redirectTo } = req.query as { email?: string; redirectTo?: string };
  const session = await createDevLoginSession({ email, redirectTo });

  res.cookie(SESSION_COOKIE, session.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    expires: session.expires,
  });
  res.redirect(`${env.APP_URL}${session.redirectTo}`);
}

// GET /api/v1/auth/me
export async function me(req: Request, res: Response) {
  ok(res, { user: req.user });
}
