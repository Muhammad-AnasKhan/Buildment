import { HASH_SPACE } from "../models/hash32";
import type { Tone } from "../primitives/tones";

// 13.2 beat 2: a key's copies go to the first N distinct machines clockwise
// from its point. The ring is the one from chapter 9.3 (the geometry helpers
// live in sysdesign-m9-ring-play/model.ts); here its positions are whole
// degrees, 0 to 359, so the numbers can be checked by hand. Five machines own
// two points each (made up, chosen so repeats occur). Pure, no React.

export const COPIES = 3;
export const MACHINES = ["A", "B", "C", "D", "E"] as const;
export type Machine = (typeof MACHINES)[number];

export type Point = { deg: number; machine: Machine };

/** The ten points, sorted by position. */
export const POINTS: readonly Point[] = [
  { deg: 20, machine: "A" },
  { deg: 55, machine: "A" },
  { deg: 90, machine: "B" },
  { deg: 140, machine: "C" },
  { deg: 175, machine: "B" },
  { deg: 215, machine: "D" },
  { deg: 250, machine: "E" },
  { deg: 290, machine: "E" },
  { deg: 320, machine: "C" },
  { deg: 345, machine: "D" },
];

export const DEFAULT_KEY = 10;
export const KEY_MAX = 359;

/** A position in whole degrees as a position in the hash space the chapter 9.3 helpers use. */
export const degToPos = (deg: number): number => Math.round((deg / 360) * HASH_SPACE);

export const clampKey = (deg: number): number => Math.max(0, Math.min(KEY_MAX, Number.isFinite(deg) ? Math.round(deg) : 0));

/** The key degree for an angle in radians from 12 o'clock, clockwise. */
export function angleToDeg(angle: number): number {
  const turn = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return clampKey(Math.round((turn / (Math.PI * 2)) * 360) % 360);
}

export type WalkStep = {
  /** Index in POINTS. */
  index: number;
  machine: Machine;
  deg: number;
  /** Degrees clockwise from the key to this point. */
  dist: number;
  /** 1, 2, 3 when this point holds a copy; null when it was skipped. */
  rank: number | null;
};

export type Walk = {
  steps: WalkStep[];
  /** The machines holding a copy, in order; the first is the coordinator. With repeats allowed the same machine can appear twice. */
  copies: Machine[];
  /** Distinct machines holding a copy. */
  machines: Machine[];
  /** Degrees clockwise from the key to the last point visited. */
  sweep: number;
};

/** The index of the first point at or after a position, wrapping past the last point. */
export function firstPointAtOrAfter(deg: number): number {
  const i = POINTS.findIndex((p) => p.deg >= deg);
  return i === -1 ? 0 : i;
}

/**
 * The walk for a key: start at the first point at or after it and go clockwise.
 * With skipRepeats a machine that already holds a copy is skipped; otherwise
 * the next COPIES points each hold one, whoever owns them.
 */
export function walkFor(key: number, skipRepeats: boolean): Walk {
  const k = clampKey(key);
  const start = firstPointAtOrAfter(k);
  const steps: WalkStep[] = [];
  const copies: Machine[] = [];
  for (let n = 0; n < POINTS.length && copies.length < COPIES; n++) {
    const index = (start + n) % POINTS.length;
    const p = POINTS[index];
    const dist = (((p.deg - k) % 360) + 360) % 360;
    const repeat = copies.includes(p.machine);
    if (skipRepeats && repeat) {
      steps.push({ index, machine: p.machine, deg: p.deg, dist, rank: null });
      continue;
    }
    copies.push(p.machine);
    steps.push({ index, machine: p.machine, deg: p.deg, dist, rank: copies.length });
  }
  const machines = copies.filter((m, i) => copies.indexOf(m) === i);
  return { steps, copies, machines, sweep: steps.length ? steps[steps.length - 1].dist : 0 };
}

/** How many copies each machine holds. */
export function copiesPerMachine(walk: Walk): Record<Machine, number> {
  const out: Record<Machine, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (const m of walk.copies) out[m]++;
  return out;
}

/** "A", "A and B", "A, B and C". */
export function listMachines(names: readonly string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** The points a machine owns, as degrees. */
export const pointsOf = (m: Machine): number[] => POINTS.filter((p) => p.machine === m).map((p) => p.deg);

export function writeVerdict(walk: Walk): { text: string; tone: Tone } {
  if (walk.machines.length < COPIES) return { text: `Only ${walk.machines.length} machines hold a copy`, tone: "bad" };
  return { text: `Copies on ${listMachines(walk.machines)}`, tone: "good" };
}

export const machineCountText = (walk: Walk): string => `${walk.machines.length} machine${walk.machines.length === 1 ? "" : "s"}`;

export function describeKey(key: number, skipRepeats: boolean): string {
  const w = walkFor(key, skipRepeats);
  return `key at ${clampKey(key)}, copies on ${listMachines(w.copies)}`;
}

export type Segment = { x1: number; y1: number; x2: number; y2: number };

/**
 * A stretch of a circle (clockwise from 12 o'clock, angles in radians) cut
 * into short straight segments. Drawn as separate lines, each has a small
 * box, so a label inside the ring is never under the box of a whole arc.
 */
export function arcSegments(from: number, to: number, cx: number, cy: number, r: number, stepDeg = 5): Segment[] {
  if (!(to - from > 1e-6)) return [];
  const n = Math.max(1, Math.ceil(((to - from) * 180) / Math.PI / stepDeg));
  const at = (a: number) => ({ x: Math.round((cx + r * Math.sin(a)) * 100) / 100, y: Math.round((cy - r * Math.cos(a)) * 100) / 100 });
  // Each segment runs a hair past its end so neighbours overlap and no seam shows.
  const overlap = 0.004;
  return Array.from({ length: n }, (_, i) => {
    const a = at(from + ((to - from) * i) / n);
    const b = at(from + ((to - from) * (i + 1)) / n + (i === n - 1 ? 0 : overlap));
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  });
}
