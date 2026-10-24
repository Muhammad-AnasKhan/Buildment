import { withCommas } from "./picture-controls";
import { HIT_MS, MISS_MS, NODE_PLAN, PEAK_CREATES, PEAK_REDIRECTS } from "./wasla-numbers";

// 20.4 "Drag the hit rate, watch the database". Pure functions, no React.
//
//   average   = h x 0.55 + (1 - h) x 3.05 = 3.05 - 2.5 h   (ms)
//   p99       = 0.55 ms if h is 99% or more, else 3.05 ms
//   database  = 100,000 x (1 - h) + 1,000 operations a second
//   nodes     = ceil(database / 2,500)
//
// The hit rate is a whole percent, so every figure is computed in integers
// (thousandths of a millisecond, whole operations) and the floating point
// noise of 20,999.999999 never appears.

export const HIT_MIN = 0;
export const HIT_MAX = 99;
export const HIT_DEFAULT = 90;
export const HIT_SNAPS = [0, 50, 80, 90, 95, 99] as const;
/** The most nodes the picture can show: the need at a 0% hit rate. */
export const MAX_NODES = Math.ceil((PEAK_REDIRECTS + PEAK_CREATES) / NODE_PLAN);

export type ReadPath = {
  hit: number;
  /** Average time in thousandths of a millisecond (an integer). */
  averageMicro: number;
  averageMs: number;
  p99Ms: number;
  operations: number;
  nodes: number;
};

export function readPath(hitPercent: number): ReadPath {
  const hit = Math.max(HIT_MIN, Math.min(HIT_MAX, Math.round(Number.isFinite(hitPercent) ? hitPercent : HIT_DEFAULT)));
  const missMicro = Math.round(MISS_MS * 1000);
  const hitMicro = Math.round(HIT_MS * 1000);
  const averageMicro = missMicro - ((missMicro - hitMicro) * hit) / 100;
  const operations = (PEAK_REDIRECTS * (100 - hit)) / 100 + PEAK_CREATES;
  return {
    hit,
    averageMicro,
    averageMs: averageMicro / 1000,
    p99Ms: hit >= 99 ? HIT_MS : MISS_MS,
    operations,
    nodes: Math.ceil(Math.round(operations) / NODE_PLAN),
  };
}

/** Milliseconds to two decimals, rounding halves up: 0.575 gives "0.58". */
export function msText(ms: number): string {
  const hundredths = Math.floor(Math.round(ms * 1000) / 10 + 0.5);
  return (hundredths / 100).toFixed(2);
}

export const opsText = (n: number) => `${withCommas(n)} /s`;

export type Verdict = { text: string; tone: "good" | "warn" | "bad" };

/** At most 38 characters. */
export function readPathVerdict(r: ReadPath): Verdict {
  if (r.hit < 90) return { text: `${r.nodes} database nodes for misses`, tone: r.nodes >= 10 ? "bad" : "warn" };
  if (r.hit < 99) return { text: "Fast on average, p99 pays a miss", tone: "warn" };
  return { text: "p99 is now the cache time", tone: "good" };
}

/** The rail's value text for a screen reader. */
export function readPathValueText(r: ReadPath): string {
  return `${r.hit} percent hits, average ${msText(r.averageMs)} ms, p99 ${msText(r.p99Ms)} ms, ${withCommas(r.operations)} database operations a second, ${r.nodes} ${r.nodes === 1 ? "node" : "nodes"}`;
}

/** The hit rate for a 0 to 1 position on the rail, snapped to the chapter's points when close. */
export function hitFromFraction(f: number): number {
  const raw = Math.round(Math.max(0, Math.min(1, Number.isFinite(f) ? f : 0)) * HIT_MAX);
  for (const s of HIT_SNAPS) if (Math.abs(raw - s) <= 1) return s;
  return raw;
}

/** Every whole percent: the ladder the arrow keys walk (one step), Page keys ten. */
export const HIT_LADDER: readonly number[] = Array.from({ length: HIT_MAX + 1 }, (_, i) => i);

/** A latency from 0 to 3.5 ms as a 0 to 1 position on the strip. */
export const stripFraction = (ms: number) => Math.max(0, Math.min(1, ms / 3.5));

/**
 * Distance between dots on the cache-to-database link: set by the miss share,
 * so a 90% hit rate sends one dot in ten. Infinity when nothing misses.
 */
export function missSpacing(hit: number, baseSpacing: number): number {
  const miss = (100 - hit) / 100;
  return miss <= 0 ? Infinity : baseSpacing / miss;
}

/** Dots drawn on that link when motion is reduced: proportional to the miss share. */
export const stillMissDots = (hit: number) => Math.round(((100 - hit) / 100) * 6);
