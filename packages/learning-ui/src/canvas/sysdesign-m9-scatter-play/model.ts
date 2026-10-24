import { BACKENDS, pageLoad, slowChance, tallyLoads, type PageLoad, type Tally } from "../models/fan-out";
import { backendGrid } from "../models/fan-out-layout";
import type { Tone } from "../primitives/tones";

// 9.6 beat 4: a search that must ask every shard (a local index) is as slow
// as its slowest shard, so the share of slow searches climbs with the shard
// count: 1 - 0.99^n. A global index answers from one index shard, at 1%, but
// every order is then two writes. This builds on the fan-out model of
// chapter 2.4 (models/fan-out.ts): each shard is slow (200 ms in the story)
// with chance 1 in 100. Pure, no React.

export type IndexMode = "local" | "global";

export const SHARDS = BACKENDS;
export const SLOW_MS_STORY = 200;
export const FAST_MS_STORY = 5;

/** The chance that a search is slow. Local asks all n shards; global asks one. */
export function searchChance(n: number, mode: IndexMode): number {
  return slowChance(mode === "local" ? n : 1);
}

/** Search number k as the fan-out model draws it: n shards asked, or one index shard. */
export function searchLoad(n: number, mode: IndexMode, k: number): PageLoad {
  return pageLoad(mode === "local" ? n : 1, k);
}

export function searchTally(n: number, mode: IndexMode, from: number, to: number, skip: readonly number[], keep: number): Tally {
  return tallyLoads(mode === "local" ? n : 1, from, to, skip, keep);
}

/** How many shards one search asks. */
export const askedShards = (n: number, mode: IndexMode) => (mode === "local" ? n : 1);

/** Writes for one new order: the row, plus its index entry under a global index. */
export const writesPerOrder = (mode: IndexMode) => (mode === "global" ? 2 : 1);

export const writeCostText = (mode: IndexMode) => `Each order = ${writesPerOrder(mode)} write${mode === "global" ? "s" : ""}`;

/** A percentage with a decimal only when it is under 10 and not whole: 1%, 9.6%, 18%. */
export function percentText(chance: number): string {
  const p = chance * 100;
  if (p >= 10) return `${Math.round(p)}%`;
  const one = p.toFixed(1);
  return `${one.endsWith(".0") ? one.slice(0, -2) : one}%`;
}

export function scatterVerdict(n: number, mode: IndexMode): { text: string; tone: Tone; percent: string } {
  const chance = searchChance(n, mode);
  const p = chance * 100;
  const tone: Tone = p < 5 ? "good" : p < 30 ? "warn" : "bad";
  const percent = percentText(chance);
  return { text: `${percent} of searches hit a slow shard`, tone, percent };
}

/**
 * Which shard tile stands for the index shard under a global index: the tile
 * in the bottom row nearest to the wire, so the single line out is short.
 */
export function indexTile(n: number, wireX: number): number {
  const grid = backendGrid(n);
  const bottom = Math.max(...grid.tiles.map((t) => t.y));
  let best = 0;
  let gap = Infinity;
  grid.tiles.forEach((t, i) => {
    if (t.y !== bottom) return;
    const g = Math.abs(t.x - wireX);
    if (g < gap) {
      gap = g;
      best = i;
    }
  });
  return best;
}
