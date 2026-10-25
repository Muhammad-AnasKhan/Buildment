// Chapter 4.2: size a fleet for a fixed demand on a made-up price list. One
// server going down takes out one server's share, so the spare you hold back
// is cheapest when servers are small. Pure functions, no React.

import type { Tone } from "../primitives/tones";

/** Requests a second Daftar must carry in exam week. */
export const DEMAND = 500;
/** The busiest a server may get after a failure (chapter 2.5's knee). */
export const CEILING = 0.8;
/** The made-up price of a load balancer, per hour, whenever there is more than one server. */
export const BALANCER_PRICE = 0.05;

export type ServerSize = { id: string; label: string; perSec: number; price: number };

/** The chapter's made-up price list: price grows in step with size. */
export const SIZES: readonly ServerSize[] = [
  { id: "small", label: "Small", perSec: 100, price: 0.1 },
  { id: "medium", label: "Medium", perSec: 200, price: 0.2 },
  { id: "large", label: "Large", perSec: 400, price: 0.4 },
  { id: "xlarge", label: "XLarge", perSec: 800, price: 0.8 },
];

export const COUNT = { min: 1, max: 8, default: 3 } as const;
export const COUNT_LADDER: readonly number[] = Array.from({ length: COUNT.max - COUNT.min + 1 }, (_, i) => COUNT.min + i);
export const COUNT_SNAPS = [3, 5, 8] as const;
export const DEFAULT_SIZE = "medium";

export function sizeById(id: string): ServerSize {
  return SIZES.find((s) => s.id === id) ?? SIZES[0];
}

export function clampCount(v: number): number {
  if (!Number.isFinite(v)) return COUNT.default;
  return Math.max(COUNT.min, Math.min(COUNT.max, Math.round(v)));
}

export const countToFraction = (v: number) => (clampCount(v) - COUNT.min) / (COUNT.max - COUNT.min);
export const countFromFraction = (f: number) => clampCount(COUNT.min + Math.max(0, Math.min(1, f)) * (COUNT.max - COUNT.min));

export type Fleet = {
  size: ServerSize;
  count: number;
  /** Requests a second the whole fleet can finish. */
  capacity: number;
  /** DEMAND / capacity; above 1 the fleet cannot keep up. */
  busy: number;
  /** Capacity with one server gone (0 when there was only one). */
  capacityAfter: number;
  /** Busy share of the survivors after one failure; Infinity when nothing is left. */
  busyAfter: number;
  /** Dollars an hour: servers plus the balancer when there is more than one. */
  cost: number;
  verdict: string;
  tone: Tone;
};

const EPS = 1e-9;

/** Everything the picture shows for one size and one count. */
export function fleet(sizeId: string, rawCount: number): Fleet {
  const size = sizeById(sizeId);
  const count = clampCount(rawCount);
  const capacity = size.perSec * count;
  const capacityAfter = size.perSec * (count - 1);
  const busy = DEMAND / capacity;
  const busyAfter = capacityAfter > 0 ? DEMAND / capacityAfter : Infinity;
  const cost = Math.round((size.price * count + (count > 1 ? BALANCER_PRICE : 0)) * 100) / 100;

  let verdict: string;
  let tone: Tone;
  if (capacity < DEMAND) {
    verdict = `Too small: ${DEMAND}/s will not fit`;
    tone = "bad";
  } else if (count === 1) {
    verdict = "One server: one failure takes all";
    tone = "bad";
  } else if (busyAfter > 1 + EPS) {
    verdict = "Fits, but one failure overloads it";
    tone = "warn";
  } else if (busyAfter > CEILING + EPS) {
    verdict = "Survives one failure, near the knee";
    tone = "warn";
  } else {
    verdict = "Survives one failure: N+1 at 80%";
    tone = "good";
  }
  return { size, count, capacity, busy, capacityAfter, busyAfter, cost, verdict, tone };
}

/** The tone of a busy share on a card: calm up to 80%, near the knee up to 100%, over it past that. */
export function busyTone(busy: number): Tone {
  if (!Number.isFinite(busy) || busy > 1 + EPS) return "bad";
  return busy > CEILING + EPS ? "warn" : "good";
}

export const percent = (busy: number) => `${Math.round(busy * 100)}%`;

export const dollars = (v: number) => `$${v.toFixed(2)}`;

/** The cheapest fleet that survives one failure at or below the ceiling, for a size; null when none fits in the count range. */
export function cheapestSurviving(sizeId: string): Fleet | null {
  let best: Fleet | null = null;
  for (const n of COUNT_LADDER) {
    const f = fleet(sizeId, n);
    if (f.tone !== "good") continue;
    if (!best || f.cost < best.cost) best = f;
  }
  return best;
}
