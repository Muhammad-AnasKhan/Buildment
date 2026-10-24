// 12.8 beat 2: one node knows at round 0. Each round every informed node tells
// f other nodes picked at random. The expected number of informed nodes x
// follows x(r+1) = x + (N - x) * (1 - (1 - 1 / (N - 1))^(f * x)), from x(0) = 1.
// A false suspicion spreads along the same curve; the target's correction
// starts when about half the cluster has heard the rumor and needs the same
// number of rounds again. Pure model, no React.

import { withCommas } from "./picture-controls";

/** Cluster sizes on the log rail, and the fanouts on the snap rail. */
export const SIZES = [7, 16, 100, 1000, 10000] as const;
export const FANOUTS = [1, 2, 3] as const;
export const DEFAULT_SIZE = 100;
export const DEFAULT_FANOUT = 1;

/** "Everyone knows" once fewer than this many nodes are left out. */
const DONE_BELOW = 0.5;
const MAX_ROUNDS = 200;

/** Expected informed nodes after each round: index r is round r, ending when everyone knows. */
export function informedCurve(nodes: number, fanout: number): number[] {
  const n = Math.max(2, Math.round(nodes));
  const keep = 1 - 1 / (n - 1);
  const curve = [1];
  while (n - curve[curve.length - 1] >= DONE_BELOW && curve.length <= MAX_ROUNDS) {
    const x = curve[curve.length - 1];
    curve.push(x + (n - x) * (1 - Math.pow(keep, fanout * x)));
  }
  return curve;
}

/** Rounds until fewer than half a node is still in the dark. */
export function roundsToAll(nodes: number, fanout: number): number {
  return informedCurve(nodes, fanout).length - 1;
}

/** The first round when at least half the cluster knows. */
export function roundsToHalf(nodes: number, fanout: number): number {
  const n = Math.max(2, Math.round(nodes));
  const curve = informedCurve(n, fanout);
  const at = curve.findIndex((x) => x >= n / 2);
  return at === -1 ? curve.length - 1 : at;
}

/** Rounds the cluster stays mixed after a false suspicion: to half, then the correction's own spread. */
export function suspicionRounds(nodes: number, fanout: number): number {
  return roundsToHalf(nodes, fanout) + roundsToAll(nodes, fanout);
}

/** Messages one node sends in a round: the fanout. */
export function messagesPerNode(fanout: number): number {
  return fanout;
}

/** Messages the whole cluster sends in a round, with this many nodes informed. */
export function messagesPerRound(informed: number, fanout: number): number {
  return Math.round(informed * fanout);
}

/** Informed nodes at a fractional round, interpolated along a curve; flat after its end. */
export function informedAt(curve: readonly number[], round: number): number {
  if (round <= 0) return curve[0];
  const last = curve.length - 1;
  if (round >= last) return curve[last];
  const i = Math.floor(round);
  return curve[i] + (curve[i + 1] - curve[i]) * (round - i);
}

/** How many of `dots` sample dots to light for an informed count: at least one, all only when everyone knows. */
export function litDots(informed: number, nodes: number, dots: number, done: boolean): number {
  if (done) return dots;
  const lit = Math.floor((dots * informed) / nodes);
  return Math.max(1, Math.min(dots - 1, lit));
}

/** The sample dots drawn for a cluster: one per node up to 49. */
export function dotCount(nodes: number): number {
  return Math.min(49, nodes);
}

/** A fixed order in which the sample dots light up, so dots fill all over the grid, not row by row. */
export function dotOrder(count: number): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  const key = (i: number) => {
    const v = (i + 1) * 0.6180339887498949;
    return v - Math.floor(v);
  };
  return order.sort((a, b) => key(a) - key(b));
}

/** Where a value sits on a rail through the ladder, 0 to 1: log spacing or even spacing. */
export function railFraction(ladder: readonly number[], value: number, log: boolean): number {
  const pos = (v: number) => (log ? Math.log10(v) : v);
  const lo = pos(ladder[0]);
  const hi = pos(ladder[ladder.length - 1]);
  const v = pos(Math.max(ladder[0], Math.min(ladder[ladder.length - 1], value)));
  return (v - lo) / (hi - lo);
}

/** The ladder rung nearest to a rail position. */
export function railValue(ladder: readonly number[], fraction: number, log: boolean): number {
  const f = Number.isFinite(fraction) ? Math.max(0, Math.min(1, fraction)) : 0;
  let best = ladder[0];
  let bestD = Infinity;
  for (const rung of ladder) {
    const d = Math.abs(railFraction(ladder, rung, log) - f);
    if (d < bestD) {
      bestD = d;
      best = rung;
    }
  }
  return best;
}

export type GossipVerdict = { text: string; tone: "good" | "warn" };

/** The banner, 38 characters or fewer. `finished` is true once the playhead has reached the end. */
export function gossipVerdict(nodes: number, fanout: number, suspected: boolean, finished: boolean): GossipVerdict {
  if (suspected) {
    return finished
      ? { text: `Correction done after about ${suspicionRounds(nodes, fanout)} rounds`, tone: "good" }
      : { text: "A false rumor spreads just as fast", tone: "warn" };
  }
  const word = nodes === 1 ? "node" : "nodes";
  return { text: `${withCommas(nodes)} ${word} hear it in ${roundsToAll(nodes, fanout)} rounds`, tone: "good" };
}

/** The sliders' spoken value. */
export function gossipValueText(nodes: number, fanout: number): string {
  return `${withCommas(nodes)} nodes, fanout ${fanout}, ${roundsToAll(nodes, fanout)} rounds`;
}
