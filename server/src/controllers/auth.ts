import type { Request, Response } from "express";
import type { AuthSession } from "../shared/api/auth.js";
import { created, noContent, ok } from "../utils/responses.js";
import { changePassword } from "../services/auth/change-password.js";
import type { ChangePasswordBody } from "../validations/auth.js";
import { clearSessionCookie, setSessionCookie } from "../utils/session-cookie.js";
import { confirmEmailVerificationToken, resendVerification } from "../services/auth/email-verification.js";
import { createDevLoginSession } from "../services/auth/dev-login.js";
import { loginWithPassword, logout as endSession, resolveVerificationState } from "../services/auth/login.js";
import { signup as createAccount } from "../services/auth/signup.js";
import { consumeMagicLink, requestMagicLink as sendMagicLink } from "../services/auth/magic-link.js";
import { serializeSessionUser } from "../services/auth/session.js";
import type { LoginBody, SignupBody } from "../validations/auth.js";

function authSession(result: Awaited<ReturnType<typeof loginWithPassword>>): AuthSession {
  return {
    user: serializeSessionUser(result.user),
    session: { token: result.session.sessionToken, expiresAt: result.session.expires.toISOString() },
  };
}

// PATCH /api/v1/auth/password
export async function updatePassword(req: Request, res: Response) {
  await changePassword(req.user!.id, req.sessionToken!, req.body as ChangePasswordBody);
  noContent(res);
}

// POST /api/v1/auth/signup
export async function signup(req: Request, res: Response) {
  created(res, await createAccount(req.body as SignupBody));
}

// POST /api/v1/auth/login — sets the cookie for browsers and returns the token for API clients.
export async function login(req: Request, res: Response) {
  const result = await loginWithPassword(req.body as LoginBody);
  setSessionCookie(res, result.session.sessionToken, result.session.expires);
  ok(res, authSession(result));
}

// POST /api/v1/auth/logout
export async function logout(req: Request, res: Response) {
  if (req.sessionToken) await endSession(req.sessionToken);
  clearSessionCookie(res);
  ok(res, { loggedOut: true });
}

// GET /api/v1/auth/me
export async function me(req: Request, res: Response) {
  const user = await resolveVerificationState(req.user!);
  ok(res, { user: serializeSessionUser(user) });
}

// POST /api/v1/auth/resend-verification
export async function resend(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  ok(res, await resendVerification({ email, user: req.user }));
}

// POST /api/v1/auth/magic-link — always 200 so the endpoint cannot enumerate accounts.
export async function requestMagicLink(req: Request, res: Response) {
  const { email, redirectTo } = req.body as { email: string; redirectTo?: string };
  await sendMagicLink({ email, redirectTo });
  ok(res, { requested: true });
}

// Browser-facing redirects below are relative on purpose: these endpoints are reached
// through the web app's proxy (email links use APP_URL, the login page links are
// same-origin), so the browser resolves them against whatever host it is on.

// GET /api/v1/auth/magic-link/verify?token=&redirectTo= — link target; signs in and lands in the app.
export async function verifyMagicLink(req: Request, res: Response) {
  const { token, redirectTo } = req.query as { token: string; redirectTo?: string };
  const result = await consumeMagicLink(token, redirectTo);
  if (!result.ok) {
    return res.redirect(`/login?error=magic-${result.reason}`);
  }
  setSessionCookie(res, result.session.sessionToken, result.session.expires);
  res.redirect(result.redirectTo);
}

// GET /api/v1/auth/confirm-email?token= — email link target; always lands on the login page.
export async function confirmEmail(req: Request, res: Response) {
  const token = (req.query.token as string | undefined)?.trim();
  if (!token) return res.redirect("/login?error=verify-missing");

  const result = await confirmEmailVerificationToken(token);
  if (!result.ok) {
    const param = result.reason === "expired" ? "verify-expired" : "verify-invalid";
    return res.redirect(`/login?error=${param}`);
  }
  res.redirect(`/login?verified=1&email=${encodeURIComponent(result.email)}`);
}

// GET /api/v1/auth/dev-login?email=&redirectTo= — seeded accounts only, never in production.
export async function devLogin(req: Request, res: Response) {
  const { email, redirectTo } = req.query as { email?: string; redirectTo?: string };
  const session = await createDevLoginSession({ email, redirectTo });
  setSessionCookie(res, session.sessionToken, session.expires);
  res.redirect(session.redirectTo);
}
