import { spread } from "./picture-controls";
import type { Tone } from "../primitives/tones";

// 5.2 "Add up the path": a shopper in Singapore, a CDN edge near her, the
// origin 160 ms away (EU West), then three stops where a copy can answer.
// Every layer is reached only by the requests that missed all the layers
// above it, so the average wait and the database load are sums over layers.
//
//   T       = (1 - he) x (160 + (1 - hm) x (0.5 + (1 - hv) x 2.5))  ms
//   queries = 1,000 x (1 - he) x (1 - hm) x (1 - hv) x 5  a second

export const PATH = {
  /** Edge to origin round trip, EU West to Singapore (course dossier S3). */
  originMs: 160,
  /** A hit in the app's own memory costs about nothing next to a network trip. */
  memoryMs: 0,
  /** One Valkey read (dossier S3). */
  valkeyMs: 0.5,
  /** The page needs 5 queries of 0.5 ms each (story numbers). */
  databaseMs: 2.5,
  queriesPerPage: 5,
  /** Page views a second reaching the edge (story number). */
  pageViews: 1000,
} as const;

export const HIT_MAX = 99;
export const HIT_SNAPS = [0, 50, 80, 90, 95] as const;
export const DEFAULT_HITS: Hits = { edge: 80, memory: 0, valkey: 90 };

/** Hit rates in percent, whole numbers 0 to 99. */
export type Hits = { edge: number; memory: number; valkey: number };
export type LayerId = "edge" | "memory" | "valkey" | "database";

export type PathNumbers = {
  /** Average time added after the edge, in ms. */
  addedMs: number;
  /** Queries a second reaching the database. */
  queries: number;
  verdict: string;
  tone: Tone;
};

const f = (pct: number) => Math.max(0, Math.min(HIT_MAX, pct)) / 100;

export function pathNumbers(h: Hits): PathNumbers {
  const he = f(h.edge);
  const hm = f(h.memory);
  const hv = f(h.valkey);
  const addedMs = (1 - he) * (PATH.originMs + PATH.memoryMs + (1 - hm) * (PATH.valkeyMs + (1 - hv) * PATH.databaseMs));
  const queries = PATH.pageViews * (1 - he) * (1 - hm) * (1 - hv) * PATH.queriesPerPage;
  const fast = addedMs < 20;
  const calm = queries < 200;
  if (fast && calm) return { addedMs, queries, verdict: "Fast for shoppers, calm database", tone: "good" };
  if (fast) return { addedMs, queries, verdict: "Fast pages, busy database", tone: "warn" };
  if (calm) return { addedMs, queries, verdict: "Calm database, slow far away", tone: "warn" };
  return { addedMs, queries, verdict: "Slow pages and a busy database", tone: "bad" };
}

/** One decimal, rounded half up on the printed digits. */
export function oneDecimal(v: number): string {
  return (Math.round((v + 1e-9) * 10) / 10).toFixed(1);
}

/** Queries a second as a whole number with commas. */
export function queriesText(v: number): string {
  return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Which stop answers request number n. A low-discrepancy value is spent
 * layer by layer, so a few dots already split the way the hit rates say.
 */
export function answeredAt(n: number, h: Hits): LayerId {
  let u = spread(n + 1);
  for (const [id, pct] of [["edge", h.edge], ["memory", h.memory], ["valkey", h.valkey]] as const) {
    const p = f(pct);
    if (u < p) return id;
    u = (u - p) / (1 - p);
  }
  return "database";
}

/** Rows from the shopper (0) down to the database (4). */
export const ROW_INDEX: Record<LayerId, number> = { edge: 1, memory: 2, valkey: 3, database: 4 };
/** Seconds a dot takes to cross each link: the edge to origin trip is the long one. */
export const LINK_SECONDS = [0.35, 1.0, 0.35, 0.35] as const;
const DWELL = 0.14;

const cumulative = LINK_SECONDS.reduce<number[]>((acc, d) => [...acc, acc[acc.length - 1] + d], [0]);

/** Seconds a dot lives when it is answered at a layer: down, a short turn, and back up. */
export function dotLife(layer: LayerId): number {
  return 2 * cumulative[ROW_INDEX[layer]] + DWELL;
}

export type DotPose = { row: number; lane: "down" | "turn" | "up"; across: number };

/** Where a dot is tau seconds after it left the shopper: a fractional row, and whether it is on the way down or back. */
export function dotPose(layer: LayerId, tau: number): DotPose | null {
  const stop = cumulative[ROW_INDEX[layer]];
  if (!(tau >= 0) || tau > 2 * stop + DWELL) return null;
  const at = (t: number) => {
    for (let i = 0; i < LINK_SECONDS.length; i++) if (t <= cumulative[i + 1] + 1e-9) return i + (t - cumulative[i]) / LINK_SECONDS[i];
    return LINK_SECONDS.length;
  };
  if (tau <= stop) return { row: at(tau), lane: "down", across: 0 };
  if (tau <= stop + DWELL) return { row: ROW_INDEX[layer], lane: "turn", across: (tau - stop) / DWELL };
  return { row: at(2 * stop + DWELL - tau), lane: "up", across: 1 };
}

/** Seconds between two requests leaving the shopper. */
export const LAUNCH_EVERY = 0.3;

/** The requests in flight at a moment: their number and the layer that answers each. */
export function dotsAt(seconds: number, h: Hits): { n: number; layer: LayerId; tau: number }[] {
  const longest = dotLife("database");
  const last = Math.floor(seconds / LAUNCH_EVERY);
  const first = Math.max(0, Math.floor((seconds - longest) / LAUNCH_EVERY));
  const out: { n: number; layer: LayerId; tau: number }[] = [];
  for (let n = first; n <= last; n++) {
    const layer = answeredAt(n, h);
    const tau = seconds - n * LAUNCH_EVERY;
    if (tau >= 0 && tau <= dotLife(layer)) out.push({ n, layer, tau });
  }
  return out;
}
