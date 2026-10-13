import { prisma } from "../../db/prisma.js";
import type { SessionUser } from "../../types/auth.js";

// Sessions are opaque tokens in the `Session` table — the same rows Auth.js
// writes today, so the web app's existing cookie keeps working while login moves
// to the API. Desktop and third-party clients send the token as a Bearer header.

export const SESSION_COOKIE = "authjs.session-token";
export const SECURE_SESSION_COOKIE = "__Secure-authjs.session-token";
export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function toSessionUser(user: {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: SessionUser["role"];
  canInstruct: boolean;
  emailVerified: Date | null;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    canInstruct: user.canInstruct,
    emailVerified: user.emailVerified,
  };
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

export async function createSession(userId: string, sessionToken: string) {
  const expires = new Date(Date.now() + SESSION_MAX_AGE_MS);
  await prisma.session.create({ data: { sessionToken, userId, expires } });
  return { sessionToken, expires };
}
