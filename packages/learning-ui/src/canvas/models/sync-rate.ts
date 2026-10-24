import { seededRandom } from "../sim/random";

// 11.6 beat 2: N copies, one write on copy 1 at time 0. Each round (every T
// seconds, all copies at once) every copy picks one other copy at random and
// the pair both end with the newer value if either had it at the start of the
// round. The run ends when every copy has the value. The averages come from
// 20,000 seeded runs per size (a made-up model, not a measurement of a product).

export const INTERVALS: readonly number[] = [0.5, 1, 2, 5, 10, 30];
export const COPIES: readonly number[] = [3, 5, 8, 16, 32];
export const DEFAULT_INTERVAL = 2;
export const DEFAULT_COPIES = 5;

/** Average rounds until all copies agree, from 20,000 runs per size (seed 42). */
export const AVERAGE_ROUNDS: Readonly<Record<number, number>> = { 3: 1.5, 5: 2.36, 8: 3.12, 16: 4.15, 32: 5.11 };
/** 95 of 100 runs finish within this many rounds. */
export const P95_ROUNDS: Readonly<Record<number, number>> = { 3: 2, 5: 3, 8: 4, 16: 5, 32: 6 };
/** Rounds the one fixed run takes (first run of the seeded generator). */
export const FIXED_RUN_ROUNDS: Readonly<Record<number, number>> = { 3: 1, 5: 2, 8: 5, 16: 4, 32: 4 };

export type Round = {
  /** Pairs [picker, partner] chosen in this round (0-based copy numbers). */
  pairs: [number, number][];
  /** Which copies have the value after the round. */
  lit: boolean[];
};

export type FixedRun = { copies: number; start: boolean[]; rounds: Round[] };

/** The partner of copy i: floor(random * (N - 1)), plus 1 if that is at least i. */
export function partnerOf(i: number, n: number, random: number): number {
  const p = Math.floor(random * (n - 1));
  return p >= i ? p + 1 : p;
}

/** The repeatable run for N copies: mulberry32 with seed 42, one draw per copy per round. */
export function fixedRun(copies: number, seed = 42): FixedRun {
  const rng = seededRandom(seed);
  const start = Array.from({ length: copies }, (_, i) => i === 0);
  let lit = start.slice();
  const rounds: Round[] = [];
  for (let guard = 0; guard < 200 && !lit.every(Boolean); guard++) {
    const next = lit.slice();
    const pairs: [number, number][] = [];
    for (let i = 0; i < copies; i++) {
      const p = partnerOf(i, copies, rng.next());
      pairs.push([i, p]);
      if (lit[i] || lit[p]) {
        next[i] = true;
        next[p] = true;
      }
    }
    lit = next;
    rounds.push({ pairs, lit: next });
  }
  return { copies, start, rounds };
}

export const averageSeconds = (copies: number, interval: number) => (AVERAGE_ROUNDS[copies] ?? 0) * interval;

/** One decimal, no trailing noise: 1.18 becomes "1.2", 70.8 stays "70.8". */
export function formatSeconds(s: number): string {
  return (Math.round(s * 10) / 10).toFixed(1);
}

export function syncVerdict(copies: number, interval: number): string {
  return `About ${formatSeconds(averageSeconds(copies, interval))} s until all ${copies} agree`;
}

/** Evenly spaced snap points: position 0 to 1 for a value on a ladder, and back. */
export function ladderFraction(ladder: readonly number[], value: number): number {
  const i = Math.max(0, ladder.indexOf(value));
  return ladder.length <= 1 ? 0 : i / (ladder.length - 1);
}
export function ladderValue(ladder: readonly number[], fraction: number): number {
  const f = Number.isFinite(fraction) ? Math.max(0, Math.min(1, fraction)) : 0;
  return ladder[Math.round(f * (ladder.length - 1))];
}
