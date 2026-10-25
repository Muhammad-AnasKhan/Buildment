import { hash32 } from "../models/hash32";
import { withCommas } from "../models/picture-controls";
import type { Tone } from "../primitives/tones";

// 9.4 beat 2: Suq's hot seller. 1,200 writes a second spread over many keys
// (1,200 / S on each of S shards) plus 1,800 a second on one key,
// `seller:noor-crafts`. Salting splits that key into k sub-keys
// `seller:noor-crafts#0` to `#(k-1)`, each taking 1,800 / k. A key goes to
// shard hash32(key) mod S; a shard takes 1,000 writes a second at most.
// Pure, no React.

export const BACKGROUND = 1200;
export const NOOR = 1800;
export const SHARD_LIMIT = 1000;
export const NOOR_KEY = "seller:noor-crafts";
export const SHARDS = { min: 4, max: 16, default: 4 } as const;
export const SHARD_LADDER: readonly number[] = Array.from({ length: SHARDS.max - SHARDS.min + 1 }, (_, i) => SHARDS.min + i);
export const SHARD_SNAPS = [4, 8, 12, 16] as const;
export const SALTS = [1, 2, 4, 8, 16] as const;
export const DEFAULT_SALT = 1;

export function clampShards(v: number): number {
  if (!Number.isFinite(v)) return SHARDS.default;
  return Math.max(SHARDS.min, Math.min(SHARDS.max, Math.round(v)));
}

export const shardsToFraction = (s: number) => (clampShards(s) - SHARDS.min) / (SHARDS.max - SHARDS.min);

export function shardsFromFraction(f: number): number {
  const t = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : 0;
  const v = SHARDS.min + t * (SHARDS.max - SHARDS.min);
  for (const s of SHARD_SNAPS) if (Math.abs(s - v) < 0.6) return s;
  return clampShards(v);
}

/** The keys Noor's traffic is split into: the plain key without salt, else key#0 to key#(k-1). */
export function subKeys(k: number): string[] {
  return k <= 1 ? [NOOR_KEY] : Array.from({ length: k }, (_, j) => `${NOOR_KEY}#${j}`);
}

export type Loads = {
  shards: number;
  salt: number;
  /** Background writes a second on every shard. */
  background: number;
  /** The shard (0 based) each sub-key lands on. */
  landing: number[];
  /** Writes a second per sub-key. */
  perSubKey: number;
  /** Total writes a second per shard, not rounded. */
  load: number[];
  /** The hottest shard (the first one on a tie) and its load, rounded. */
  hottest: number;
  hottestLoad: number;
};

export function loadsFor(shards: number, salt: number): Loads {
  const s = clampShards(shards);
  const k = Math.max(1, Math.round(salt));
  const background = BACKGROUND / s;
  const perSubKey = NOOR / k;
  const load = new Array<number>(s).fill(background);
  const landing = subKeys(k).map((key) => hash32(key) % s);
  for (const shard of landing) load[shard] += perSubKey;
  let hottest = 0;
  for (let i = 1; i < s; i++) if (load[i] > load[hottest]) hottest = i;
  return { shards: s, salt: k, background, landing, perSubKey, load, hottest, hottestLoad: Math.round(load[hottest]) };
}

/** The average load, which hides the hot shard: all 3,000 writes over S shards. */
export const averageLoad = (shards: number) => (BACKGROUND + NOOR) / clampShards(shards);

export function loadTone(writes: number): Tone {
  return writes > SHARD_LIMIT ? "bad" : writes >= 800 ? "warn" : "good";
}

export function hottestVerdict(hottestLoad: number): { text: string; tone: Tone } {
  return { text: `Hottest shard: ${withCommas(hottestLoad)} of 1,000 limit`, tone: loadTone(hottestLoad) };
}

export const readCost = (salt: number) => `Reading Noor's total: ${salt} read${salt === 1 ? "" : "s"}`;
