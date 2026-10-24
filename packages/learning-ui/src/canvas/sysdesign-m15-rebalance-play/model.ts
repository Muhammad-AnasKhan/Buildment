// 15.3 beat 3: six partitions shared by the consumers of one group. Round
// robin: partition p goes to consumer p mod c. Each consumer does 100 events
// a second in total, so the group's top speed is set by the consumer that
// holds the most partitions. Pure, no React.

import type { Tone } from "../primitives/tones";

export const PARTITIONS = 6;
export const PER_CONSUMER = 100;
export const OFFERED = 450;
/** Each partition carries one sixth of the load. */
export const PER_PARTITION = OFFERED / PARTITIONS;
/** The group's best speed: every consumer busy, one partition each. */
export const BEST = PER_CONSUMER * PARTITIONS;
/** The pause while partitions move, in seconds; a course number. */
export const PAUSE_S = 1;
export const CONSUMERS = { min: 1, max: 8, default: 3 } as const;

export function clampConsumers(c: number): number {
  if (!Number.isFinite(c)) return CONSUMERS.default;
  return Math.max(CONSUMERS.min, Math.min(CONSUMERS.max, Math.round(c)));
}

/** The consumer (0 based) that holds each partition. */
export function ownersOf(c: number): number[] {
  const n = clampConsumers(c);
  return Array.from({ length: PARTITIONS }, (_, p) => p % n);
}

/** The partitions each consumer holds; idle consumers hold none. */
export function holdsOf(c: number): number[][] {
  const n = clampConsumers(c);
  const owners = ownersOf(n);
  return Array.from({ length: n }, (_, i) => owners.flatMap((o, p) => (o === i ? [p] : [])));
}

/** The most partitions any one consumer holds. */
export const largestShare = (c: number) => Math.max(...holdsOf(c).map((h) => h.length));
export const groupLimit = (c: number) => BEST / largestShare(c);
export const idleConsumers = (c: number) => Math.max(0, clampConsumers(c) - PARTITIONS);

/** Partitions whose owner changes when the group goes from one size to another. */
export function movedBetween(from: number, to: number): number[] {
  const a = ownersOf(from);
  const b = ownersOf(to);
  return a.flatMap((o, p) => (o !== b[p] ? [p] : []));
}

/** How many partitions move when one more consumer joins; null at the largest group. */
export function movesWhenOneJoins(c: number): number | null {
  const n = clampConsumers(c);
  return n >= CONSUMERS.max ? null : movedBetween(n, n + 1).length;
}

/** What a consumer must handle if the offered load were shared by partitions: partitions x 75 a second. */
export const loadOf = (partitions: number) => partitions * PER_PARTITION;

export type Verdict = { text: string; tone: Tone };

export function verdictFor(c: number): Verdict {
  const n = clampConsumers(c);
  const limit = groupLimit(n);
  if (limit < OFFERED) return { text: `Behind: handles ${limit} of ${OFFERED}`, tone: "bad" };
  const idle = idleConsumers(n);
  if (idle > 0) return { text: idle === 1 ? "1 consumer sits idle" : `${idle} consumers sit idle`, tone: "warn" };
  return { text: "Keeps up: one partition each", tone: "good" };
}

export function valueText(c: number): string {
  const n = clampConsumers(c);
  const idle = idleConsumers(n);
  return `${n} ${n === 1 ? "consumer" : "consumers"}, limit ${groupLimit(n)} events per second, ${idle === 0 ? "none idle" : `${idle} idle`}`;
}

/** The assignment as text, for example "04 / 15 / 2 / 3"; idle consumers show as a dash. */
export function assignmentText(c: number): string {
  return holdsOf(c).map((h) => (h.length ? h.join("") : "-")).join(" / ");
}
