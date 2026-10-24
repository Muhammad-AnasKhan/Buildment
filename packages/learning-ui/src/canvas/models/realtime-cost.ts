import type { Tone } from "../primitives/tones";

// 3.5: the same chat delivered four ways. Polling spends requests and delay;
// long polling, server-sent events and WebSockets spend open connections
// instead. Pure, no React. All the inputs below are illustrative except the
// one-way delay, which is half the 80 ms round trip from napkin math.
//
//   N users, each getting M = 2 messages a minute.
//   Long polls are held up to H = 30 seconds.
//   Polling every P seconds:  average delay P / 2, requests N / P, no open connections.
//   Long polling:             delay 40 ms, requests N x (M / 60 + 1 / H), N open connections.
//   SSE and WebSocket:        delay 40 ms, about no requests (reconnects only), N open connections.
//                             A WebSocket also carries the app's own messages the other way.

export type WayId = "polling" | "long" | "sse" | "ws";

export const WAYS: readonly { id: WayId; label: string; name: string }[] = [
  { id: "polling", label: "Polling", name: "Polling" },
  { id: "long", label: "Long poll", name: "Long polling" },
  { id: "sse", label: "SSE", name: "Server-sent events" },
  { id: "ws", label: "WebSocket", name: "WebSocket" },
] as const;

export const MESSAGES_PER_MINUTE = 2;
export const HOLD_SECONDS = 30;
export const ONE_WAY_MS = 40;

export const POLL_STEPS: readonly number[] = [1, 5, 30, 60];
export const DEFAULT_POLL = 5;

export const USERS = { min: 100, max: 100_000, default: 10_000 } as const;
export const USER_SNAPS: readonly number[] = [1000, 10_000, 100_000];
export const USER_LADDER: readonly number[] = [100, 200, 500, 1000, 2000, 5000, 10_000, 20_000, 50_000, 100_000];

const LOG_MIN = Math.log10(USERS.min);
const LOG_SPAN = Math.log10(USERS.max) - LOG_MIN;

export function clampUsers(v: number): number {
  if (!Number.isFinite(v)) return USERS.default;
  return Math.max(USERS.min, Math.min(USERS.max, Math.round(v)));
}

export const usersToFraction = (v: number): number => (Math.log10(clampUsers(v)) - LOG_MIN) / LOG_SPAN;

/** A point on the log rail as a round user count, snapping to 1,000, 10,000 and 100,000. */
export function usersFromFraction(f: number): number {
  const t = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : usersToFraction(USERS.default);
  const log = LOG_MIN + t * LOG_SPAN;
  for (const s of USER_SNAPS) if (Math.abs(Math.log10(s) - log) < 0.06) return s;
  return clampUsers(Number(Math.pow(10, log).toPrecision(2)));
}

export type WayCost = {
  /** Requests a second reaching the servers. */
  reqPerSec: number;
  /** Connections the servers hold open. */
  open: number;
  /** Time before a new message shows up: the average for polling, one way trip for the rest. */
  delayMs: number;
  /** True when the same connection also carries the app's own messages. */
  twoWay: boolean;
};

export function wayCost(way: WayId, users: number, pollSeconds: number): WayCost {
  const n = clampUsers(users);
  const p = pollSeconds > 0 ? pollSeconds : DEFAULT_POLL;
  switch (way) {
    case "polling":
      return { reqPerSec: n / p, open: 0, delayMs: (p / 2) * 1000, twoWay: false };
    case "long":
      return { reqPerSec: n * (MESSAGES_PER_MINUTE / 60 + 1 / HOLD_SECONDS), open: n, delayMs: ONE_WAY_MS, twoWay: false };
    case "sse":
      return { reqPerSec: 0, open: n, delayMs: ONE_WAY_MS, twoWay: false };
    case "ws":
      return { reqPerSec: 0, open: n, delayMs: ONE_WAY_MS, twoWay: true };
  }
}

/** Messages a second the servers push out to all users. */
export const messagesPerSecond = (users: number): number => (clampUsers(users) * MESSAGES_PER_MINUTE) / 60;

export const formatCount = (n: number): string => Math.round(n).toLocaleString("en-US");

/** 2500 → "2.5 s", 40 → "40 ms", 30000 → "30 s". */
export function formatDelay(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${String(Number((ms / 1000).toFixed(1)))} s`;
}

/** Requests a second as the card shows it: "2,000", or "~0" when there are almost none. */
export const formatRequests = (r: number): string => (r < 0.5 ? "~0" : formatCount(r));

export type CostTone = Extract<Tone, "good" | "warn" | "bad">;

/** Made-up thresholds for one fleet: 1,000 requests a second or 10,000 connections is a lot; 20,000 and 100,000 is far more. */
export function costTone(cost: WayCost): CostTone {
  if (cost.reqPerSec >= 20_000 || cost.open >= 100_000) return "bad";
  if (cost.reqPerSec >= 1000 || cost.open >= 10_000) return "warn";
  return "good";
}

export type RealtimeVerdict = { text: string; tone: Tone };

/** The one line over the picture. At most 38 characters. */
export function realtimeVerdict(way: WayId, users: number, pollSeconds: number): RealtimeVerdict {
  const c = wayCost(way, users, pollSeconds);
  const tone = costTone(c);
  switch (way) {
    case "polling": {
      const full = `Polling ${pollSeconds} s: ${formatCount(c.reqPerSec)} req/s, ${formatDelay(c.delayMs)} late`;
      // At the top of the scale the full number is too long for the banner: say 100k.
      return { text: full.length <= 38 ? full : `Polling ${pollSeconds} s: ${Math.round(c.reqPerSec / 1000)}k req/s, ${formatDelay(c.delayMs)} late`, tone };
    }
    case "long":
      return { text: `Long poll: ${formatCount(c.open)} open, ${formatCount(c.reqPerSec)} req/s`, tone };
    case "sse":
      return { text: `SSE: ${formatCount(c.open)} open, almost no requests`, tone };
    case "ws":
      return { text: "WebSocket: same, plus two-way", tone };
  }
}

// ---------- Motion ----------

/** How many dots a second a lane draws for a rate; one dot stands for many requests. */
export function dotRate(perSecond: number, ceiling = 7): number {
  if (!Number.isFinite(perSecond) || perSecond < 0.5) return 0;
  return Math.min(ceiling, 0.6 + 1.7 * Math.log10(1 + perSecond / 30));
}
