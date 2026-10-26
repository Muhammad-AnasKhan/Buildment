import type { NextFunction, Request, RequestHandler, Response } from "express";
import { AUTH_ERROR_CODES } from "../shared/api/auth.js";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";
import { SECURE_SESSION_COOKIE, SESSION_COOKIE, findSessionState } from "../services/auth/session.js";

function readSessionToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();
    if (token) return token;
  }
  const cookies = (req.cookies ?? {}) as Record<string, string | undefined>;
  return cookies[SECURE_SESSION_COOKIE] ?? cookies[SESSION_COOKIE];
}

/** Resolved session, or undefined when there is no usable token. */
async function resolveSession(req: Request) {
  const token = readSessionToken(req);
  if (!token) return undefined;
  const state = await findSessionState(token);
  if (!state) return undefined;
  return { ...state, token };
}

/** Attaches `req.user` when a valid, active session is present; never rejects. */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  try {
    if (!req.user) {
      const session = await resolveSession(req);
      if (session && !session.suspended) {
        req.user = session.user;
        req.sessionToken = session.token;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Rejects with 401 unless the request carries a valid session. A suspended account
 * gets a distinct 403 (`ACCOUNT_SUSPENDED`) so clients can explain the sign-out.
 */
export const authenticate: RequestHandler = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      const session = await resolveSession(req);
      if (!session) throw new UnauthorizedError("Not signed in");
      if (session.suspended) {
        throw new ForbiddenError(
          "This account has been suspended. Contact a platform admin.",
          AUTH_ERROR_CODES.ACCOUNT_SUSPENDED
        );
      }
      req.user = session.user;
      req.sessionToken = session.token;
    }
    next();
  } catch (error) {
    next(error);
  }
};
