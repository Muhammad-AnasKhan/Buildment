import { withCommas } from "./picture-controls";
import type { Tone } from "../primitives/tones";

// 5.6 "Toggle the fixes, watch the database". Matjar's hot key expires every
// 60 s. Story numbers: 5,000 reads a second, a 50 ms rebuild, 20 app servers,
// and a database that manages about 800 page queries a second.
//
// While the key is being rebuilt, every read that arrives misses:
//   misses = reads a second x rebuild time = 5,000 x 0.05 = 250   (Little's law, S5)
// Coalescing makes each app server send one query: min(20, 250) = 20.
// A shared lease lets one server in the whole fleet rebuild: 1 (S24 describes
// at most one lease per key every 10 s). Serving stale (S23) means readers
// are answered from the old copy, so nobody waits.
// 1,000 keys stored in the same second all expire in the same second: 1,000
// misses in 1 s. Random TTLs of 54 to 66 s spread them over 12 s: about 83 a
// second. That spread is reasoning from S90, not a named source.

export const STORY = {
  readsPerSecond: 5000,
  rebuildMs: 50,
  servers: 20,
  databaseCapacity: 800,
  ttlSeconds: 60,
  keys: 1000,
  jitterWindowSeconds: 12,
} as const;

export type Mode = "one" | "many";
export type Settings = { mode: Mode; coalesce: boolean; lease: boolean; stale: boolean; jitter: boolean };
export const DEFAULT_SETTINGS: Settings = { mode: "one", coalesce: false, lease: false, stale: false, jitter: false };

export type Outcome = {
  /** Queries that reach the database at each expiry (one key), or in the spike (many keys). */
  queries: number;
  /** The same load as a rate at its peak, queries a second. */
  peakPerSecond: number;
  /** How long the spike lasts, in seconds. */
  spikeSeconds: number;
  /** How long a shopper waits during a rebuild, in ms. */
  waitMs: number;
  verdict: string;
  tone: Tone;
  /** Short text for the database card's pill. */
  pill: string;
};

export function stampede(s: Settings): Outcome {
  if (s.mode === "many") {
    if (s.jitter) {
      const perSecond = Math.round(STORY.keys / STORY.jitterWindowSeconds);
      return {
        queries: perSecond,
        peakPerSecond: STORY.keys / STORY.jitterWindowSeconds,
        spikeSeconds: STORY.jitterWindowSeconds,
        waitMs: STORY.rebuildMs,
        verdict: "Misses spread: about 83 a second",
        tone: "good",
        pill: `${perSecond} a second`,
      };
    }
    return {
      queries: STORY.keys,
      peakPerSecond: STORY.keys,
      spikeSeconds: 1,
      waitMs: STORY.rebuildMs,
      verdict: "1,000 misses in the same second",
      tone: "bad",
      pill: "1,000 in 1 s",
    };
  }
  const seconds = STORY.rebuildMs / 1000;
  const misses = Math.round(STORY.readsPerSecond * seconds);
  const queries = s.lease ? 1 : s.coalesce ? Math.min(STORY.servers, misses) : misses;
  const peakPerSecond = queries / seconds;
  const waitMs = s.stale ? 0 : STORY.rebuildMs;
  let verdict: string;
  if (s.lease) verdict = s.stale ? "One query, and nobody waits" : "One query per expiry";
  else if (s.coalesce) verdict = s.stale ? "20 queries, and nobody waits" : "20 queries: one per app server";
  else verdict = s.stale ? "250 queries, but nobody waits" : "250 queries at once: database falls";
  const tone: Tone = peakPerSecond > STORY.databaseCapacity ? "bad" : peakPerSecond > 200 ? "warn" : "good";
  return { queries, peakPerSecond, spikeSeconds: seconds, waitMs, verdict, tone, pill: `${queries} at once` };
}

export const peakText = (o: Outcome) => `${withCommas(o.peakPerSecond)} a second`;

/** Expiries on the 3-minute chart, in seconds. */
export const EXPIRIES = [60, 120, 180] as const;
export const CHART_SECONDS = 180;

// Animation: 60 s of model time pass in 3 s of picture time.
export const CYCLE_SECONDS = 3;
export const LOOP_SECONDS = 10.6;
export const QUEUE_CAP = 24;

/** Where the chart's playhead is, in model seconds, at a moment of the loop. */
export function chartSecond(seconds: number): number {
  if (!Number.isFinite(seconds)) return CHART_SECONDS;
  const t = ((seconds % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
  return Math.min(CHART_SECONDS, (t / CYCLE_SECONDS) * STORY.ttlSeconds);
}

type Burst = { lead: number; fill: number; hold: number; drain: number; peak: number };

/** The shape of one burst in picture seconds, around each expiry, and how many dots it peaks at. */
export function burstShape(s: Settings, o: Outcome): Burst {
  if (s.mode === "many" && s.jitter) return { lead: 0.3, fill: 0.2, hold: 0.4, drain: 0.2, peak: 3 };
  if (s.mode === "many") return { lead: 0, fill: 0.3, hold: 0.5, drain: 1.3, peak: QUEUE_CAP };
  return { lead: 0, fill: 0.3, hold: 0.1, drain: 1.0, peak: Math.min(QUEUE_CAP, o.queries) };
}

/** Dots waiting at the database, and whether more wait beyond what is drawn. */
export function queueAt(s: Settings, o: Outcome, seconds: number, still: boolean): { count: number; more: boolean } {
  const b = burstShape(s, o);
  const more = o.queries > QUEUE_CAP;
  if (still) return { count: b.peak, more };
  const t = ((seconds % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
  for (const e of EXPIRIES) {
    const at = (e / STORY.ttlSeconds) * CYCLE_SECONDS;
    const tau = t - (at - b.lead);
    const total = b.fill + b.hold + b.drain;
    if (tau < 0 || tau >= total) continue;
    if (tau < b.fill) return { count: Math.max(1, Math.ceil((b.peak * tau) / b.fill)), more: more && tau > b.fill * 0.6 };
    if (tau < b.fill + b.hold) return { count: b.peak, more };
    return { count: Math.max(0, Math.ceil(b.peak * (1 - (tau - b.fill - b.hold) / b.drain))), more: false };
  }
  return { count: 0, more: false };
}

/** True while shoppers are waiting on a rebuild (and nothing serves stale). */
export function shoppersWaiting(s: Settings, o: Outcome, seconds: number): boolean {
  if (o.waitMs === 0) return false;
  const b = burstShape(s, o);
  const t = ((seconds % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
  return EXPIRIES.some((e) => {
    const at = (e / STORY.ttlSeconds) * CYCLE_SECONDS;
    return t >= at - b.lead && t < at - b.lead + b.fill + b.hold + b.drain;
  });
}

/** Height of a spike on the chart, 0 to 1, on a square-root scale so 20 a second still shows next to 5,000. */
export function spikeHeight(perSecond: number, max = 5000): number {
  return Math.sqrt(Math.max(0, Math.min(perSecond, max)) / max);
}
