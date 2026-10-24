// 15.4 beat 5: 1,000 order events in 4 partitions, placed by one of four
// keys. The data set is fixed by a seeded generator (the same mulberry32 as
// the course's toolkit/stats.js, seed 15): 50 customers with a few very
// popular ones, 200 orders of 5 events each. A partition is fnv(key) mod 4,
// or a random one when there is no key. Pure, no React.

import type { Tone } from "../primitives/tones";
import { seededRandom } from "../sim/random";

export const EVENT_COUNT = 1000;
export const PARTITION_COUNT = 4;
export const EVEN_SHARE = 1 / PARTITION_COUNT;

export type KeyId = "order" | "customer" | "country" | "none";
export const KEYS: readonly { id: KeyId; label: string; sample: string }[] = [
  { id: "order", label: "order id", sample: "o17" },
  { id: "customer", label: "customer id", sample: "c3" },
  { id: "country", label: "country", sample: "PS" },
  { id: "none", label: "no key", sample: "random" },
];
export const DEFAULT_KEY: KeyId = "order";

export type OrderEvent = { order: string; customer: string; country: string };

const fnv = (s: string) => {
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
};

function pick(weights: readonly number[], r: number): number {
  let x = r * weights.reduce((a, b) => a + b);
  for (let i = 0; i < weights.length; i++) {
    x -= weights[i];
    if (x <= 0) return i;
  }
  return weights.length - 1;
}

export type Dataset = { events: OrderEvent[]; randomPartition: number[] };

let cached: Dataset | null = null;

/** The 1,000 events, and the partition each gets when there is no key. */
export function dataset(): Dataset {
  if (cached) return cached;
  const R = seededRandom(15).next;
  const popularity = Array.from({ length: 50 }, (_, i) => 1 / (i + 1));
  const customers = Array.from({ length: 50 }, (_, i) => ({ id: `c${i}`, country: ["PS", "EG", "JO"][pick([80, 15, 5], R())] }));
  const orders = Array.from({ length: 200 }, (_, i) => ({ id: `o${i}`, customer: pick(popularity, R()) }));
  const events: OrderEvent[] = [];
  for (const o of orders) {
    for (let k = 0; k < 5; k++) events.push({ order: o.id, customer: customers[o.customer].id, country: customers[o.customer].country });
  }
  const randomPartition = events.map(() => Math.floor(R() * PARTITION_COUNT));
  cached = { events, randomPartition };
  return cached;
}

export type Analysis = {
  key: KeyId;
  /** Events in each partition. */
  counts: number[];
  /** The biggest partition's share of all events, 0 to 1. */
  largest: number;
  /** Which partition is the biggest. */
  hottest: number;
  /** True when every order's events all sit in one partition. */
  ordersInOrder: boolean;
  /** True when every customer's events all sit in one partition. */
  customersInOrder: boolean;
};

export function partitionsFor(key: KeyId): number[] {
  const { events, randomPartition } = dataset();
  if (key === "none") return randomPartition;
  return events.map((e) => fnv(e[key === "order" ? "order" : key === "customer" ? "customer" : "country"]) % PARTITION_COUNT);
}

export function analyse(key: KeyId): Analysis {
  const { events } = dataset();
  const parts = partitionsFor(key);
  const counts = new Array<number>(PARTITION_COUNT).fill(0);
  parts.forEach((p) => counts[p]++);
  const together = (by: "order" | "customer") => {
    const seen = new Map<string, number>();
    for (let i = 0; i < events.length; i++) {
      const id = events[i][by];
      const first = seen.get(id);
      if (first === undefined) seen.set(id, parts[i]);
      else if (first !== parts[i]) return false;
    }
    return true;
  };
  const max = Math.max(...counts);
  return { key, counts, largest: max / EVENT_COUNT, hottest: counts.indexOf(max), ordersInOrder: together("order"), customersInOrder: together("customer") };
}

export const percentText = (share: number) => `${Math.round(share * 100)}%`;
/** One decimal, as in the chapter's table: 25.0%, 32.5%. */
export const exactPercent = (share: number) => `${(Math.round(share * 1000) / 10).toFixed(1)}%`;

export type Verdict = { text: string; tone: Tone };

export function verdictFor(a: Analysis): Verdict {
  if (a.largest > 0.5) return { text: `One partition holds ${percentText(a.largest)} of events`, tone: "bad" };
  if (a.largest > 0.3) return { text: `Hot partition: ${percentText(a.largest)} of all events`, tone: "warn" };
  if (!a.ordersInOrder) return { text: "Even load, but no order at all", tone: "bad" };
  return { text: "Even load, one order stays in order", tone: "good" };
}

/** The hottest bar is amber above 30% and red above 50%; the others stay blue. */
export function barTone(share: number, hottest: boolean): Tone {
  if (!hottest) return "accent";
  return share > 0.5 ? "bad" : share > 0.3 ? "warn" : "accent";
}

export function describe(a: Analysis): string {
  const label = KEYS.find((k) => k.id === a.key)?.label ?? a.key;
  return `key ${label}: ${a.counts.map((c, i) => `partition ${i} holds ${c}`).join(", ")}; largest share ${exactPercent(a.largest)}; one order stays in order: ${a.ordersInOrder ? "yes" : "no"}; one customer stays in order: ${a.customersInOrder ? "yes" : "no"}`;
}
