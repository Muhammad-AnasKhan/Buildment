import type { Response } from "express";
import { SESSION_COOKIE_NAME } from "@buildment/shared/api/auth";
import { isProduction } from "../config/env.js";

const COOKIE_OPTIONS = { httpOnly: true, sameSite: "lax" as const, secure: isProduction, path: "/" };

/** Web clients get the session as an httpOnly cookie; API clients use the token as a Bearer header. */
export function setSessionCookie(res: Response, token: string, expires: Date) {
  res.cookie(SESSION_COOKIE_NAME, token, { ...COOKIE_OPTIONS, expires });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, COOKIE_OPTIONS);
}
