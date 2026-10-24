import type { Tone } from "../primitives/tones";
import { withCommas } from "./picture-controls";
import { ROW_LIMIT, ROW_PLAN } from "./lamha-numbers";

// 27.5 "Drag the views, count the shards". One row takes at most 1,000 writes a
// second [S40]; we plan at half (500). A viral video's views are spread evenly
// over its shard rows (no random number at play time). Pure, no React.
//
//   per shard          = views a second / shards
//   share of the limit = per shard / 1,000;  share of the plan = per shard / 500
//   a full read        = one read of each shard = shards rows
//   fewest that fit    = ceil(views a second / 500)

export const VIEW_STOPS = [500, 1_000, 2_000, 5_000, 10_000, 30_000] as const;
export const VIEWS_DEFAULT = 5_000;
export const SHARD_STOPS = [1, 2, 4, 8, 16, 32, 64] as const;
export const SHARDS_DEFAULT = 4;
/** Below this many writes a second per shard, the shards are more than the rate needs. */
export const TOO_MANY_BELOW = 50;

export type Shards = {
  views: number;
  shards: number;
  perShard: number;
  /** per shard / 1,000. */
  limitShare: number;
  /** per shard / 500. */
  planShare: number;
  /** Rows touched by one full read of the count. */
  readRows: number;
  fewest: number;
};

export function shardsPlay(views: number, shards: number): Shards {
  const perShard = views / shards;
  return {
    views,
    shards,
    perShard,
    limitShare: perShard / ROW_LIMIT,
    planShare: perShard / ROW_PLAN,
    readRows: shards,
    fewest: Math.ceil(views / ROW_PLAN),
  };
}


/** Tone of a shard box: bad above the limit, warn between the plan and the limit, else good. */
export function boxTone(perShard: number): Tone {
  if (perShard > ROW_LIMIT) return "bad";
  if (perShard > ROW_PLAN) return "warn";
  return "good";
}

export const multipleText = (m: number) => (m < 10 ? (Math.round(m * 10) / 10).toString() : String(Math.round(m)));

export type Verdict = { text: string; tone: Tone };

/** At most 38 characters. */
export function shardsVerdict(m: Shards): Verdict {
  if (m.perShard > ROW_LIMIT) return { text: `Throttled: ${multipleText(m.limitShare)}x the row limit`, tone: "bad" };
  if (m.perShard > ROW_PLAN) return { text: "Over its plan: busy seconds throttle", tone: "warn" };
  if (m.perShard >= TOO_MANY_BELOW) return { text: "Each shard under half its limit", tone: "good" };
  return { text: "Too many shards for this rate", tone: "warn" };
}

const COLOUR_WORD: Record<Tone, string> = { bad: "red", warn: "amber", good: "green", accent: "blue" };

export function valueText(m: Shards): string {
  const tone = boxTone(m.perShard);
  return `${withCommas(m.views)} views a second, ${m.shards} ${m.shards === 1 ? "shard" : "shards"}, ${withCommas(Math.round(m.perShard))} writes a second each, ${Math.round(m.limitShare * 100)} percent of the row limit, a full read touches ${m.readRows} ${m.readRows === 1 ? "row" : "rows"}, boxes are ${COLOUR_WORD[tone]}`;
}

/** The line under the row of boxes about reading. */
export const readText = (m: Shards) => `a full read: ${m.readRows} ${m.readRows === 1 ? "row" : "rows"}`;
export const perShardText = (m: Shards) => `per shard: ${withCommas(Math.round(m.perShard))} writes a second`;

/** Position of a shard count on the rail, 0 to 1, by the log of the count (the stops are powers of two). */
export function railFraction(n: number): number {
  const top = Math.log2(SHARD_STOPS[SHARD_STOPS.length - 1]);
  return Math.max(0, Math.min(1, Math.log2(Math.max(1, n)) / top));
}

/** Layout of the shard boxes: up to 16 to a row, rows stacked. */
export function boxLayout(shards: number, areaWidth: number, areaHeight: number, rowGap = 6) {
  const perRow = Math.min(shards, 16);
  const rows = Math.ceil(shards / 16);
  const gap = shards <= 16 ? 6 : 4;
  const w = Math.min(shards <= 16 ? 56 : 20, (areaWidth - (perRow - 1) * gap) / perRow);
  const h = (areaHeight - (rows - 1) * rowGap) / rows;
  return { perRow, rows, gap, w, h, rowGap };
}
