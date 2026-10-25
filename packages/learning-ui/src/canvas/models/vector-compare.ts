// 10.4 beat 3: nine events on three nodes, each with a vector clock. Tap two
// and compare slot by slot: before, after, or concurrent.
// Pure model, no React. Uses compareVectors from the sim clocks.

import { compareVectors } from "../sim/clocks";

export const LANES = ["A", "B", "C"] as const;
export type Lane = (typeof LANES)[number];

export type VcEvent = {
  id: string;
  lane: Lane;
  /** Plain words for what happens, for screen readers. */
  what: string;
  vector: readonly [number, number, number];
};

/** The nine events, in the order they happen (left to right in the picture). */
export const EVENTS: readonly VcEvent[] = [
  { id: "A1", lane: "A", what: "A, local event", vector: [1, 0, 0] },
  { id: "A2", lane: "A", what: "A sends to B", vector: [2, 0, 0] },
  { id: "B1", lane: "B", what: "B, local event", vector: [0, 1, 0] },
  { id: "B2", lane: "B", what: "B receives from A2", vector: [2, 2, 0] },
  { id: "C1", lane: "C", what: "C, local event", vector: [0, 0, 1] },
  { id: "B3", lane: "B", what: "B sends to C", vector: [2, 3, 0] },
  { id: "C2", lane: "C", what: "C receives from B3", vector: [2, 3, 2] },
  { id: "C3", lane: "C", what: "C sends to A", vector: [2, 3, 3] },
  { id: "A3", lane: "A", what: "A receives from C3", vector: [3, 3, 3] },
];

/** Messages: from the sending event to the receiving event. */
export const MESSAGES: readonly { from: string; to: string }[] = [
  { from: "A2", to: "B2" },
  { from: "B3", to: "C2" },
  { from: "C3", to: "A3" },
];

export const CONCURRENT_TOTAL = 7;

export function eventById(id: string): VcEvent {
  const e = EVENTS.find((x) => x.id === id);
  if (!e) throw new Error(`unknown event ${id}`);
  return e;
}

export type Relation = "before" | "after" | "concurrent";

/** How x relates to y: x before y, x after y, or concurrent. */
export function relation(x: string, y: string): Relation {
  const r = compareVectors(eventById(x).vector, eventById(y).vector);
  if (r === "equal") throw new Error("the same event twice");
  return r;
}

/** A pair key that does not depend on the order the learner tapped. */
export function pairKey(x: string, y: string): string {
  const [a, b] = [x, y].sort((p, q) => EVENTS.findIndex((e) => e.id === p) - EVENTS.findIndex((e) => e.id === q));
  return `${a}-${b}`;
}

/** Every pair of different events, in event order. */
export function allPairs(): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < EVENTS.length; i++) for (let j = i + 1; j < EVENTS.length; j++) pairs.push([EVENTS[i].id, EVENTS[j].id]);
  return pairs;
}

export function concurrentPairs(): string[] {
  return allPairs()
    .filter(([x, y]) => relation(x, y) === "concurrent")
    .map(([x, y]) => pairKey(x, y));
}

/** Slots that decide the answer: one index (or two) to circle on each side. */
export type Deciders = { x: number | null; y: number | null };

/**
 * The slots to circle. Ordered pair: the first slot where the earlier event is
 * smaller, circled on both sides. Concurrent pair: a slot where x leads on the
 * x side, and a slot where y leads on the y side.
 */
export function deciders(x: string, y: string): Deciders {
  const vx = eventById(x).vector;
  const vy = eventById(y).vector;
  const rel = relation(x, y);
  if (rel === "concurrent") {
    return { x: vx.findIndex((v, i) => v > vy[i]), y: vy.findIndex((v, i) => v > vx[i]) };
  }
  const [small, big] = rel === "before" ? [vx, vy] : [vy, vx];
  const slot = small.findIndex((v, i) => v < big[i]);
  return { x: slot, y: slot };
}

/** The chain of events joining two events (lane steps and messages), earlier first, or null if there is none. */
export function chain(x: string, y: string): string[] | null {
  const rel = relation(x, y);
  if (rel === "concurrent") return null;
  const [from, to] = rel === "before" ? [x, y] : [y, x];
  const next = (id: string): string[] => {
    const e = eventById(id);
    const out: string[] = [];
    const sameLane = EVENTS.filter((o) => o.lane === e.lane);
    const i = sameLane.findIndex((o) => o.id === id);
    if (i >= 0 && i < sameLane.length - 1) out.push(sameLane[i + 1].id);
    for (const m of MESSAGES) if (m.from === id) out.push(m.to);
    return out;
  };
  const queue: string[][] = [[from]];
  const seen = new Set([from]);
  while (queue.length) {
    const path = queue.shift() as string[];
    const last = path[path.length - 1];
    if (last === to) return path;
    for (const n of next(last)) {
      if (seen.has(n)) continue;
      seen.add(n);
      queue.push([...path, n]);
    }
  }
  return null;
}

export type CompareVerdict = { text: string; tone: "accent" | "good" | "warn" };

/** The banner for the tapped events. `found` is the count of concurrent pairs found before this pair. */
export function compareVerdict(x: string | null, y: string | null, foundBefore: Set<string>): CompareVerdict {
  if (!x) return { text: "Tap two events to compare", tone: "accent" };
  if (!y) return { text: `${x} chosen: tap a second event`, tone: "accent" };
  const rel = relation(x, y);
  if (rel === "concurrent") {
    const key = pairKey(x, y);
    const total = new Set([...foundBefore, key]);
    if (!foundBefore.has(key) && total.size === CONCURRENT_TOTAL) return { text: "All 7 concurrent pairs found", tone: "good" };
    return { text: "Concurrent: each leads in one slot", tone: "warn" };
  }
  return { text: `${x} happened ${rel} ${y}`, tone: "good" };
}
