import { randomBytes } from "node:crypto";
import { SESSION_COOKIE_NAME, type SessionUser as SessionUserWire } from "../../shared/api/auth.js";
import { prisma } from "../../db/prisma.js";
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
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    emailVerified: user.emailVerified,
  };
}

/** JSON shape sent to clients. */
export function serializeSessionUser(user: SessionUser): SessionUserWire {
  return { ...user, emailVerified: user.emailVerified?.toISOString() ?? null };
}

/** Resolves a session token to its user, or null when unknown or expired. */
export async function findSessionUser(sessionToken: string): Promise<SessionUser | null> {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expires <= new Date()) {
    await prisma.session.delete({ where: { sessionToken } }).catch(() => undefined);
    return null;
  }
  return toSessionUser(session.user);
}

export async function createSession(userId: string, sessionToken = randomBytes(32).toString("hex")) {
  const expires = new Date(Date.now() + SESSION_MAX_AGE_MS);
  await prisma.session.create({ data: { sessionToken, userId, expires } });
  return { sessionToken, expires };
}

export async function deleteSession(sessionToken: string) {
  await prisma.session.deleteMany({ where: { sessionToken } });
}
