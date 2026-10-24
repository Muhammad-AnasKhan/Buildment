// Chapter 4.5: one seeded stream of requests goes through four balancers,
// each in front of four servers. Every server finishes 100 requests a second
// on average (10 ms of work), but 1 request in 20 costs 20 times more than the
// rest. The pickers are random, round robin, least connections (first server
// wins a tie) and two choices (chapter 4.7's exact draw rule). The run uses
// the shared simulation core (sim/), so the same seed gives the same numbers.
// Pure functions, no React.

import { createSimulation, seededRandom } from "../sim";

export const SERVERS = 4;
/** Mean work per request. */
export const MEAN_MS = 10;
/** One request in this many is slow. */
export const SLOW_EVERY = 20;
/** A slow request costs this many times more than a quick one. */
export const SLOW_FACTOR = 20;
/** Work of a quick and of a slow request, in ms, so the mean is exactly MEAN_MS. */
export const QUICK_MS = (MEAN_MS * SLOW_EVERY) / (SLOW_EVERY - 1 + SLOW_FACTOR);
export const SLOW_MS = QUICK_MS * SLOW_FACTOR;
/** Requests a second the four servers finish together at 100% busy. */
export const FLEET_CAPACITY = (SERVERS * 1000) / MEAN_MS;

export const SEED = 4505;
export const REQUESTS = 6000;
/** The first share of requests is warm-up and is not counted in p99. */
const WARM_UP = 0.05;

export type PickerId = "random" | "roundRobin" | "leastConnections" | "twoChoices";
export const PICKERS: readonly { id: PickerId; label: string }[] = [
  { id: "random", label: "Random" },
  { id: "roundRobin", label: "Round robin" },
  { id: "leastConnections", label: "Least connections" },
  { id: "twoChoices", label: "Two choices" },
];

export const LOAD = { min: 10, max: 99, default: 80 } as const;
export const LOAD_SNAPS = [50, 80, 95] as const;
export const LOAD_LADDER: readonly number[] = Array.from({ length: LOAD.max - LOAD.min + 1 }, (_, i) => LOAD.min + i);

export function clampLoad(v: number): number {
  if (!Number.isFinite(v)) return LOAD.default;
  return Math.max(LOAD.min, Math.min(LOAD.max, Math.round(v)));
}
export const loadToFraction = (v: number) => (clampLoad(v) - LOAD.min) / (LOAD.max - LOAD.min);
export const loadFromFraction = (f: number) => clampLoad(LOAD.min + Math.max(0, Math.min(1, f)) * (LOAD.max - LOAD.min));

/** The most requests shown per server line in a snapshot. */
export const QUEUE_SHOWN = 9;
/** Snapshots a second of simulated time, and how many the picture loops over. */
export const SNAPSHOT_HZ = 8;
export const SNAPSHOT_COUNT = 160;

/** One server's line at one moment: the length, and for the first few places whether the request is a slow one. */
export type QueueView = { length: number; slow: boolean[] };

export type RaceRun = {
  picker: PickerId;
  p50: number;
  p99: number;
  /** snapshots[i][server] */
  snapshots: QueueView[][];
};

export type Race = {
  load: number;
  runs: Record<PickerId, RaceRun>;
  /** The picker with the lowest p99. */
  best: PickerId;
  worst: PickerId;
};

type Stream = {
  /** Unit-rate exponential gaps, scaled by the arrival rate at run time. */
  gaps: number[];
  slow: boolean[];
  /** Two uniform draws per request, for random and for two choices. */
  u1: number[];
  u2: number[];
};

let stream: Stream | null = null;

/** The seeded request stream, built once. */
export function requestStream(): Stream {
  if (stream) return stream;
  const rnd = seededRandom(SEED);
  const gaps: number[] = [];
  const slow: boolean[] = [];
  const u1: number[] = [];
  const u2: number[] = [];
  for (let i = 0; i < REQUESTS; i++) {
    gaps.push(-Math.log(1 - rnd.next()));
    slow.push(rnd.next() < 1 / SLOW_EVERY);
    u1.push(rnd.next());
    u2.push(rnd.next());
  }
  stream = { gaps, slow, u1, u2 };
  return stream;
}

/** Chapter 4.7's draw: first pick floor(u1 x n), second floor(u2 x (n - 1)) plus one if it reaches the first; a tie goes to the first pick. */
export function twoChoicesPick(active: readonly number[], u1: number, u2: number): number {
  const n = active.length;
  if (n === 1) return 0;
  const i = Math.floor(u1 * n);
  let j = Math.floor(u2 * (n - 1));
  if (j >= i) j += 1;
  return active[j] < active[i] ? j : i;
}

/** The first server with the fewest requests in flight. */
export function leastConnectionsPick(active: readonly number[]): number {
  let best = 0;
  for (let i = 1; i < active.length; i++) if (active[i] < active[best]) best = i;
  return best;
}

function percentile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return 0;
  const rank = Math.ceil(p * sorted.length);
  return sorted[Math.max(0, Math.min(sorted.length - 1, rank - 1))];
}

/** Run one balancer over the stream at `load` percent of the fleet's capacity. */
export function runPicker(picker: PickerId, load: number): RaceRun {
  const s = requestStream();
  const rate = (clampLoad(load) / 100) * FLEET_CAPACITY; // requests a second
  const sim = createSimulation();
  const active: number[] = Array(SERVERS).fill(0);
  const busy: boolean[] = Array(SERVERS).fill(false);
  const arrivedAt: number[] = new Array(REQUESTS).fill(0);
  const response: number[] = new Array(REQUESTS).fill(0);
  // The line at each server: request numbers, the first being served.
  const ids: number[][] = Array.from({ length: SERVERS }, () => []);
  let turn = 0;

  const workOf = (i: number) => (s.slow[i] ? SLOW_MS : QUICK_MS);

  const startNext = (srv: number) => {
    if (busy[srv] || ids[srv].length === 0) return;
    busy[srv] = true;
    const id = ids[srv][0];
    sim.after(workOf(id), () => {
      response[id] = sim.now() - arrivedAt[id];
      ids[srv].shift();
      active[srv] -= 1;
      busy[srv] = false;
      startNext(srv);
    });
  };

  const arrive = (i: number, at: number) => {
    arrivedAt[i] = at;
    let srv: number;
    switch (picker) {
      case "random":
        srv = Math.floor(s.u1[i] * SERVERS);
        break;
      case "roundRobin":
        srv = turn;
        turn = (turn + 1) % SERVERS;
        break;
      case "leastConnections":
        srv = leastConnectionsPick(active);
        break;
      default:
        srv = twoChoicesPick(active, s.u1[i], s.u2[i]);
    }
    active[srv] += 1;
    ids[srv].push(i);
    startNext(srv);
    if (i + 1 < REQUESTS) {
      const nextAt = at + (s.gaps[i + 1] / rate) * 1000;
      sim.schedule(nextAt, () => arrive(i + 1, nextAt));
    }
  };

  const first = (s.gaps[0] / rate) * 1000;
  sim.schedule(first, () => arrive(0, first));

  // Snapshots of every line, over a window that starts a quarter of the way in.
  let lastArrival = 0;
  for (let i = 0; i < REQUESTS; i++) lastArrival += (s.gaps[i] / rate) * 1000;
  const snapshots: QueueView[][] = [];
  const stepMs = 1000 / SNAPSHOT_HZ;
  const startMs = lastArrival * 0.25;
  for (let k = 0; k < SNAPSHOT_COUNT; k++) {
    const at = startMs + k * stepMs;
    if (at > lastArrival) break;
    sim.schedule(at, () => {
      snapshots.push(
        ids.map((line) => ({
          length: line.length,
          slow: line.slice(0, QUEUE_SHOWN).map((id) => s.slow[id]),
        }))
      );
    });
  }

  sim.runAll(200_000);
  const counted = response.slice(Math.floor(REQUESTS * WARM_UP)).sort((a, b) => a - b);
  return { picker, p50: percentile(counted, 0.5), p99: percentile(counted, 0.99), snapshots };
}

const cache = new Map<number, Race>();

/** The four runs at a load; remembered, so dragging back and forth is instant. */
export function race(load: number): Race {
  const l = clampLoad(load);
  const hit = cache.get(l);
  if (hit) return hit;
  const runs = {} as Record<PickerId, RaceRun>;
  for (const p of PICKERS) runs[p.id] = runPicker(p.id, l);
  let best = PICKERS[0].id;
  let worst = PICKERS[0].id;
  for (const p of PICKERS) {
    if (runs[p.id].p99 < runs[best].p99) best = p.id;
    if (runs[p.id].p99 > runs[worst].p99) worst = p.id;
  }
  const result: Race = { load: l, runs, best, worst };
  cache.set(l, result);
  return result;
}

/** Within this many ms of each other, the four p99 figures read as the same. */
export const ALIKE_MS = 25;

/** "Alike" is decided by the numbers, not the load: the slow requests set a floor every picker shares. */
export function raceVerdict(r: Race): { text: string; tone: "good" | "warn" } {
  const p99s = PICKERS.map((p) => r.runs[p.id].p99);
  const spread = Math.max(...p99s) - Math.min(...p99s);
  return spread <= ALIKE_MS ? { text: "Low load: all four look alike", tone: "good" } : { text: "Queue-blind pickers bend first", tone: "warn" };
}

export function formatMs(ms: number): string {
  if (ms >= 10_000) return `${Math.round(ms / 1000)} s`;
  if (ms >= 1000) return `${(Math.round(ms / 100) / 10).toFixed(1)} s`;
  return `${Math.round(ms)} ms`;
}
