import type { Tone } from "../primitives/tones";

// 5.5 "Move the slow reader, find the race". Delete-on-write has one weak
// spot: a reader that read the old price (999) before the write and stores it
// in the cache AFTER the delete. Nothing removes that set, so the cache keeps
// 999 until its TTL ends. With leases (Facebook's memcache, dossier S24) the
// delete cancels the reader's lease, so the cache refuses the late set.
//
// Fixed events (ms): the reader reads 999 at 10, the writer commits 899 at
// 20 and deletes the key at 25. Only the reader's set moves. Timings are
// course examples.

export const RACE = { read: 10, write: 20, delete: 25, ttlSeconds: 60 } as const;
export const S_MIN = 11;
export const S_MAX = 60;
export const S_SNAPS = [15, 25, 40] as const;
export const DEFAULT_S = 40;
/** The timeline runs from 0 to this many ms. */
export const TIMELINE_MS = 60;

export type RaceResult = {
  /** True when the cache accepts the reader's set. */
  accepted: boolean;
  /** Stale time after the write, as the picture prints it. */
  windowText: string;
  /** Stale span on the timeline in ms; to is null when it runs to the TTL. */
  stale: { from: number; to: number | null } | null;
  /** What the cache holds when the dust settles. */
  finalText: string;
  verdict: string;
  tone: Tone;
};

export function raceResult(s: number, leases: boolean): RaceResult {
  const set = Math.max(S_MIN, Math.min(S_MAX, Math.round(s)));
  if (set < RACE.delete) {
    const from = Math.max(set, RACE.write);
    const ms = RACE.delete - from;
    return {
      accepted: true,
      windowText: `stale ${ms} ms`,
      stale: { from, to: RACE.delete },
      finalText: "empty",
      verdict: "Delete wins: stale for a few ms",
      tone: "warn",
    };
  }
  if (!leases) {
    return {
      accepted: true,
      windowText: `stale up to ${RACE.ttlSeconds} s`,
      stale: { from: set, to: null },
      finalText: "999 (old!)",
      verdict: "Old price back until the TTL",
      tone: "bad",
    };
  }
  return {
    accepted: false,
    windowText: "no stale time",
    stale: null,
    finalText: "empty",
    verdict: "Lease refused the late set",
    tone: "good",
  };
}

export type CacheView = { text: string; tone?: Tone };

/** What the cache holds at time t (ms), given when the reader's set arrives. */
export function cacheAt(t: number, s: number, leases: boolean): CacheView {
  const set = raceResult(s, leases);
  if (set.accepted && t >= s) {
    if (s < RACE.delete) {
      if (t < RACE.write) return { text: "999", tone: "good" };
      if (t < RACE.delete) return { text: "999 (old)", tone: "bad" };
      return { text: "empty" };
    }
    return { text: "999 (old!)", tone: "bad" };
  }
  if (leases && t < RACE.delete) return { text: "lease out", tone: "accent" };
  return { text: "empty" };
}

export type Flight = { id: string; from: "reader" | "writer"; to: "cache" | "db"; start: number; end: number; tone: Tone };

/** The messages of the story as dots that cross a link between start and end (ms). */
export function flights(s: number, leases: boolean): Flight[] {
  const set = raceResult(s, leases);
  return [
    { id: "ask", from: "reader", to: "db", start: 6, end: RACE.read, tone: "accent" },
    { id: "write", from: "writer", to: "db", start: 16, end: RACE.write, tone: "good" },
    { id: "delete", from: "writer", to: "cache", start: 21, end: RACE.delete, tone: "accent" },
    { id: "set", from: "reader", to: "cache", start: Math.max(0, s - 4), end: s, tone: !set.accepted ? "warn" : s >= RACE.write ? "bad" : "accent" },
  ];
}

/** Progress 0 to 1 of a flight at time t, or null while it is not in the air. */
export function flightProgress(f: Flight, t: number): number | null {
  if (t < f.start || t > f.end) return null;
  return f.end === f.start ? 1 : (t - f.start) / (f.end - f.start);
}

export const SWEEP_SECONDS = 6;
export const HOLD_SECONDS = 1.6;

/** The playhead (ms) at a moment of the loop: it sweeps the timeline, then rests at the end. */
export function playhead(seconds: number): number {
  if (!Number.isFinite(seconds)) return TIMELINE_MS;
  const loop = SWEEP_SECONDS + HOLD_SECONDS;
  const t = ((seconds % loop) + loop) % loop;
  return Math.min(TIMELINE_MS, (t / SWEEP_SECONDS) * TIMELINE_MS);
}
