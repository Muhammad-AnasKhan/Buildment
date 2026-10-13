import type { NextFunction, Request, RequestHandler, Response } from "express";
import { UnauthorizedError } from "../utils/errors.js";
import { SECURE_SESSION_COOKIE, SESSION_COOKIE, findSessionUser } from "../services/auth/session.js";

function readSessionToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();
    if (token) return token;
  }
  const cookies = (req.cookies ?? {}) as Record<string, string | undefined>;
  return cookies[SECURE_SESSION_COOKIE] ?? cookies[SESSION_COOKIE];
}

async function resolveUser(req: Request) {
  if (req.user) return req.user;
  const token = readSessionToken(req);
  if (!token) return undefined;
  const user = await findSessionUser(token);
  if (!user) return undefined;
  req.user = user;
  req.sessionToken = token;
  return user;
}

/** Attaches `req.user` when a valid session is present; never rejects. */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  try {
    await resolveUser(req);
    next();
  } catch (error) {
    next(error);
  }
};

/** Rejects with 401 unless the request carries a valid session. */
export const authenticate: RequestHandler = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const user = await resolveUser(req);
    if (!user) throw new UnauthorizedError("Not signed in");
    next();
  } catch (error) {
    next(error);
  }
};
