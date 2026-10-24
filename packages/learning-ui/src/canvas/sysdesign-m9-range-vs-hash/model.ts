import { hash32 } from "../models/hash32";
import type { Tone } from "../primitives/tones";

// 9.2 beat 3: Suq's orders table over four shards, split by range (one quarter
// of the year each) or by hash of the order id. A 7 day window slides across
// the year. Range keeps the week on one or two shards but sends every new
// write to the newest quarter; hash spreads the writes but scatters the week.
// Pure, no React.

export const YEAR_DAYS = 365;
export const WINDOW_DAYS = 7;
/** 24 October 2026, day 297 of a year that is not a leap year. */
export const TODAY = 297;
export const SHARDS = 4;
export const WRITES_PER_SECOND = 3000;
export const SHARD_LIMIT = 1000;
export const ORDERS_PER_DAY = 7;

/** The first day the window may start on, and the last (so it ends by day 365). */
export const START = { min: 1, max: YEAR_DAYS - WINDOW_DAYS + 1, default: 120 } as const;
/** Windows the drag likes to land on: three that cross a quarter border, and one inside a quarter. */
export const START_SNAPS = [88, 120, 179, 271] as const;

export type Mode = "range" | "hash";

/** Quarters, one per shard: shard 1 is days 1 to 90, shard 2 is 91 to 181, and so on. */
export const QUARTERS = [
  { shard: 0, from: 1, to: 90 },
  { shard: 1, from: 91, to: 181 },
  { shard: 2, from: 182, to: 273 },
  { shard: 3, from: 274, to: 365 },
] as const;

export function clampStart(v: number): number {
  if (!Number.isFinite(v)) return START.default;
  return Math.max(START.min, Math.min(START.max, Math.round(v)));
}

/** The shard (0 to 3) that holds a day under range partitioning. */
export function quarterOf(day: number): number {
  const q = QUARTERS.find((r) => day >= r.from && day <= r.to);
  return q ? q.shard : SHARDS - 1;
}

export function windowDays(start: number): number[] {
  const s = clampStart(start);
  return Array.from({ length: WINDOW_DAYS }, (_, i) => s + i);
}

/** Distinct quarters among days start to start + 6. */
export function shardsTouchedRange(start: number): number {
  return new Set(windowDays(start).map(quarterOf)).size;
}

export const shardsTouchedHash = SHARDS;

/** The shards (0 to 3) a window touches, as a sorted list. */
export function touchedShards(start: number, mode: Mode): number[] {
  if (mode === "hash") return [0, 1, 2, 3];
  return [...new Set(windowDays(start).map(quarterOf))].sort((a, b) => a - b);
}

/** Writes a second on each shard. All writes are dated today, so range sends every one to the newest quarter. */
export function writesPerShard(mode: Mode): number[] {
  if (mode === "range") return QUARTERS.map((q) => (q.from <= TODAY && TODAY <= q.to ? WRITES_PER_SECOND : 0));
  return Array.from({ length: SHARDS }, () => WRITES_PER_SECOND / SHARDS);
}

/** A load as a share of the shard limit, for example 3 for 300%. */
export const loadRatio = (writes: number) => writes / SHARD_LIMIT;

export function loadTone(writes: number): Tone {
  return writes > SHARD_LIMIT ? "bad" : writes >= 0.8 * SHARD_LIMIT ? "warn" : "good";
}

/** Where one order of a day lives under hash partitioning: a fixed pseudo-random shard. */
export function hashShardOfOrder(day: number, i: number): number {
  return hash32(`suq-order:${day}:${i}`) % SHARDS;
}

export type OrderDot = { day: number; slot: number; shard: number };

/** The seven orders of each day in the window, with the shard each one lives on. */
export function orderDots(start: number, mode: Mode): OrderDot[] {
  const out: OrderDot[] = [];
  windowDays(start).forEach((day) => {
    for (let i = 0; i < ORDERS_PER_DAY; i++) out.push({ day, slot: i, shard: mode === "range" ? quarterOf(day) : hashShardOfOrder(day, i) });
  });
  return out;
}

export function rangeVsHashVerdict(mode: Mode, start: number): { text: string; tone: Tone } {
  if (mode === "hash") return { text: "Week: all 4 shards; writes even", tone: "warn" };
  const n = shardsTouchedRange(start);
  return { text: `Week: ${n} shard${n === 1 ? "" : "s"}; all writes: shard 4`, tone: "warn" };
}

export function startFromFraction(f: number): number {
  const t = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : 0;
  const v = START.min + t * (START.max - START.min);
  for (const s of START_SNAPS) if (Math.abs(s - v) <= 2) return s;
  return clampStart(v);
}

export const startToFraction = (start: number) => (clampStart(start) - START.min) / (START.max - START.min);

export function describeWindow(start: number, mode: Mode = "range"): string {
  const s = clampStart(start);
  const n = mode === "hash" ? shardsTouchedHash : shardsTouchedRange(s);
  return `week starting day ${s}, touches ${n} shard${n === 1 ? "" : "s"}`;
}
