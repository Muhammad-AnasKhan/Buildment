import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env, isProduction } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { logger } from "../../utils/logger.js";
import { UnauthorizedError } from "../../utils/errors.js";
import type { RealtimeTicket } from "../../shared/api/notifications.js";

// A browser EventSource cannot send headers, and one opened straight to the API host (not through
// the Next.js proxy) has no session cookie either. It first asks the API — over the normal
// cookie-backed request — for a ticket: a signed, two-minute credential naming its session, passed
// as `?ticket=` when the stream opens. The session behind it is checked again, so signing out
// still wins. The ticket only opens the stream; it cannot call any other endpoint.

const TICKET_TTL_MS = 2 * 60 * 1000;

const secret = env.REALTIME_TOKEN_SECRET ?? randomBytes(32).toString("hex");
if (!env.REALTIME_TOKEN_SECRET && isProduction) {
  logger.warn("[realtime] REALTIME_TOKEN_SECRET not set; tickets only verify on the API process that issued them");
}

type TicketClaims = { sid: string; uid: string; exp: number };

function sign(payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function signRealtimeTicket(claims: TicketClaims): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** Claims of a well-signed, unexpired ticket, or null. Does not look at the database. */
export function verifyRealtimeTicket(token: string, now = Date.now()): TicketClaims | null {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<TicketClaims>;
    if (typeof claims.sid !== "string" || typeof claims.uid !== "string" || typeof claims.exp !== "number") return null;
    if (claims.exp <= now) return null;
    return { sid: claims.sid, uid: claims.uid, exp: claims.exp };
  } catch {
    return null;
  }
}

/** Issues a ticket for the session the current request authenticated with. */
export async function issueRealtimeTicket(sessionToken: string, userId: string): Promise<RealtimeTicket> {
  const session = await prisma.session.findUnique({ where: { sessionToken }, select: { id: true, userId: true } });
  if (!session || session.userId !== userId) throw new UnauthorizedError("Not signed in");
  const exp = Date.now() + TICKET_TTL_MS;
  return { token: signRealtimeTicket({ sid: session.id, uid: userId, exp }), expiresAt: new Date(exp).toISOString() };
}
