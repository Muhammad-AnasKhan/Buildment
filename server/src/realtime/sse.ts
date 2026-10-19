import type { Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import { logger } from "../utils/logger.js";
import { UnauthorizedError } from "../utils/errors.js";
import { SECURE_SESSION_COOKIE, SESSION_COOKIE } from "../services/auth/session.js";
import { setRealtimeEmitter } from "../services/notifications/realtime.js";
import { verifyRealtimeTicket } from "../services/notifications/realtime-ticket.js";

// Live notifications over Server-Sent Events: GET /api/v1/notifications/stream keeps one HTTP
// response open per browser tab and writes `event:`/`data:` frames to it. Push is one-way (server
// to client); everything the client does — read, mark read, preferences — stays plain REST.
//
// Authentication matches the rest of the API — the session cookie (same origin, through the
// Next.js proxy) or `Authorization: Bearer <session>` (API clients) — plus `?ticket=` from
// POST /api/v1/notifications/realtime-ticket, because a browser EventSource cannot send headers
// and, connecting straight to the API host, has no cookie. A connection only ever receives its
// own user's events. Sessions are re-checked periodically; signing out closes the stream.
//
// Connections live in this process's memory. With more than one API replica, fan events out
// through a shared channel (Postgres LISTEN/NOTIFY or Redis pub/sub) before scaling out; until then
// clients still catch up from the feed whenever they reconnect.

/** Comment frame interval. Must stay below the Next.js proxy's 30 s idle timeout and typical LB idle timeouts. */
export const SSE_HEARTBEAT_MS = 20_000;
const SESSION_RECHECK_MS = 5 * 60 * 1000;
/** Reconnect delay the browser uses if the connection drops (SSE `retry:` field). */
const CLIENT_RETRY_MS = 5_000;
/** Open streams kept per user (tabs, devices); the oldest is closed beyond this. */
const MAX_STREAMS_PER_USER = 10;

type Stream = { userId: string; sessionId: string; res: Response };

const streamsByUser = new Map<string, Set<Stream>>();

function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) return decodeURIComponent(part.slice(index + 1).trim());
  }
  return undefined;
}

async function liveSession(where: { id: string } | { sessionToken: string }) {
  const session = await prisma.session.findUnique({ where, select: { id: true, userId: true, expires: true } });
  if (!session || session.expires <= new Date()) return null;
  return session;
}

/** The session a stream request proves (ticket, Bearer or cookie), or null. Exported for tests. */
export async function authenticateStreamRequest(input: {
  ticket?: string;
  authorization?: string;
  cookie?: string;
}): Promise<{ userId: string; sessionId: string } | null> {
  if (input.ticket) {
    const claims = verifyRealtimeTicket(input.ticket);
    if (!claims) return null;
    const session = await liveSession({ id: claims.sid });
    return session && session.userId === claims.uid ? { userId: session.userId, sessionId: session.id } : null;
  }

  const bearer = input.authorization?.startsWith("Bearer ") ? input.authorization.slice("Bearer ".length).trim() : undefined;
  const token = bearer || readCookie(input.cookie, SECURE_SESSION_COOKIE) || readCookie(input.cookie, SESSION_COOKIE);
  if (!token) return null;
  const session = await liveSession({ sessionToken: token });
  return session ? { userId: session.userId, sessionId: session.id } : null;
}

function write(stream: Stream, frame: string): void {
  if (stream.res.writableEnded || stream.res.destroyed) return;
  stream.res.write(frame);
}

function remove(stream: Stream): void {
  const set = streamsByUser.get(stream.userId);
  if (!set) return;
  set.delete(stream);
  if (set.size === 0) streamsByUser.delete(stream.userId);
}

function close(stream: Stream): void {
  remove(stream);
  if (!stream.res.writableEnded) stream.res.end();
}

/** GET /api/v1/notifications/stream */
export async function openNotificationStream(req: Request, res: Response): Promise<void> {
  const ticket = typeof req.query.ticket === "string" ? req.query.ticket : undefined;
  const identity = await authenticateStreamRequest({
    ticket,
    authorization: req.headers.authorization,
    cookie: req.headers.cookie,
  });
  if (!identity) throw new UnauthorizedError("Not signed in");

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  // no-transform keeps compression middleware (Next.js, proxies) from buffering the stream.
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true);

  const stream: Stream = { ...identity, res };
  const set = streamsByUser.get(identity.userId) ?? new Set<Stream>();
  streamsByUser.set(identity.userId, set);
  set.add(stream);
  if (set.size > MAX_STREAMS_PER_USER) close(set.values().next().value!);

  res.on("close", () => remove(stream));
  write(stream, `retry: ${CLIENT_RETRY_MS}\n: connected\n\n`);
}

/** Sends `event` to every open stream of one user (all their tabs and devices). */
function emit(userId: string, event: string, payload: unknown): void {
  const set = streamsByUser.get(userId);
  if (!set) return;
  const frame = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const stream of set) write(stream, frame);
}

/** Open streams, for tests and diagnostics. */
export function openStreamCount(userId?: string): number {
  if (userId) return streamsByUser.get(userId)?.size ?? 0;
  let total = 0;
  for (const set of streamsByUser.values()) total += set.size;
  return total;
}

/**
 * Registers the SSE emitter and starts the heartbeat and session re-check. Returns a stop function
 * that closes every open stream, so the HTTP server can finish shutting down.
 */
export function startRealtime(): () => void {
  setRealtimeEmitter(emit);

  const heartbeat = setInterval(() => {
    for (const set of streamsByUser.values()) for (const stream of set) write(stream, ": ping\n\n");
  }, SSE_HEARTBEAT_MS);
  heartbeat.unref();

  const recheck = setInterval(async () => {
    try {
      const all = [...streamsByUser.values()].flatMap((set) => [...set]);
      const sessionIds = [...new Set(all.map((stream) => stream.sessionId))];
      if (sessionIds.length === 0) return;
      const live = await prisma.session.findMany({
        where: { id: { in: sessionIds }, expires: { gt: new Date() } },
        select: { id: true },
      });
      const liveIds = new Set(live.map((session) => session.id));
      for (const stream of all) if (!liveIds.has(stream.sessionId)) close(stream);
    } catch (error) {
      logger.error({ err: error }, "[realtime] session recheck failed");
    }
  }, SESSION_RECHECK_MS);
  recheck.unref();

  logger.info("[realtime] notification stream (SSE) ready");

  return () => {
    clearInterval(heartbeat);
    clearInterval(recheck);
    setRealtimeEmitter(null);
    for (const set of [...streamsByUser.values()]) for (const stream of [...set]) close(stream);
  };
}
