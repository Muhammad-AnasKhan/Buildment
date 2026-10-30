import { randomBytes } from "node:crypto";
import { SESSION_COOKIE_NAME, AUTH_ERROR_CODES, type SessionUser as SessionUserWire } from "../../shared/api/auth.js";
import { prisma } from "../../db/prisma.js";
import { ForbiddenError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";

// Sessions are opaque tokens in the `Session` table — the same rows Auth.js
// wrote, so cookies issued before the API owned login keep working. Desktop and
// third-party clients send the token as a Bearer header instead.

export const SESSION_COOKIE = SESSION_COOKIE_NAME;
export const SECURE_SESSION_COOKIE = `__Secure-${SESSION_COOKIE_NAME}`;
export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function toSessionUser(user: {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: SessionUser["role"];
  emailVerified: Date | null;
  passwordHash: string | null;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    emailVerified: user.emailVerified,
    hasPassword: user.passwordHash !== null,
  };
}

/** JSON shape sent to clients. */
export function serializeSessionUser(user: SessionUser): SessionUserWire {
  return { ...user, emailVerified: user.emailVerified?.toISOString() ?? null, hasPassword: user.hasPassword ?? false };
}

/** A session token resolved to its user, with the account's suspension state. */
export type SessionState = { user: SessionUser; suspended: boolean };

/** Resolves a session token to its account, or null when unknown or expired. A
 * suspended account resolves here too (marked `suspended`) so the caller can
 * explain *why* access is refused instead of silently treating it as signed out.
 */
export async function findSessionState(sessionToken: string): Promise<SessionState | null> {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expires <= new Date()) {
    await prisma.session.delete({ where: { sessionToken } }).catch(() => undefined);
    return null;
  }
  return { user: toSessionUser(session.user), suspended: session.user.suspendedAt !== null };
}

/** Blocks minting a new session for a suspended account. */
export function assertNotSuspended(user: { suspendedAt: Date | null }): void {
  if (user.suspendedAt) {
    throw new ForbiddenError("This account has been suspended. Contact a platform admin.", AUTH_ERROR_CODES.ACCOUNT_SUSPENDED);
  }
}

export async function createSession(userId: string, sessionToken = randomBytes(32).toString("hex")) {
  const expires = new Date(Date.now() + SESSION_MAX_AGE_MS);
  await prisma.session.create({ data: { sessionToken, userId, expires } });
  return { sessionToken, expires };
}

export async function deleteSession(sessionToken: string) {
  await prisma.session.deleteMany({ where: { sessionToken } });
}
