// A service registry with leases (12.9 beat 2). Three instances register at
// time 0 and send a beat every I seconds from their own offsets (0, 1 and 2 s).
// A beat that reaches the registry sets the key's expiry to that moment plus
// the lease (TTL). The key is deleted when the clock reaches its expiry, and a
// watcher is told 0.01 s later. A beat that arrives exactly at the expiry is
// too late. A crashed instance sends no more beats; a lost beat never arrives.
// The picture is a pure function of (config, events, time).

export const TTL_LADDER = [4, 6, 8, 10, 15, 30] as const;
export const INTERVAL_LADDER = [1, 2, 3, 5] as const;
export const DEFAULT_TTL = 10;
export const DEFAULT_INTERVAL = 3;
export const OFFSETS = [0, 1, 2] as const;
export const NAMES = ["payments-1", "payments-2", "payments-3"] as const;
export const WATCH_DELAY = 0.01;
/** Model seconds per real second: 1 s of model time takes 0.4 s. */
export const RATE = 2.5;
/** The strip shows this much past and future, in model seconds. */
export const PAST = 6;
export const FUTURE = 30;

export type Config = { ttl: number; interval: number };
export type InstanceId = 0 | 1 | 2;
export type RegEvent = { kind: "crash" | "lose"; inst: InstanceId; at: number };

export type BeatView = { time: number; state: "delivered" | "lost" | "unsent" };
export type WatchEvent = { inst: InstanceId; kind: "added" | "gone"; time: number; told: number };

export type InstanceView = {
  inst: InstanceId;
  crashedAt: number | null;
  /** Beats in the strip window, with what became of them. */
  beats: BeatView[];
  /** Whether the registry lists the key right now. */
  listed: boolean;
  /** Expiry of the newest key: the one listed now, or the last one if none is. */
  expiry: number;
  /** From the crash to the expiry of its key, while the registry still lists a dead instance. */
  stale: { from: number; to: number } | null;
  /** The time its last key ended, for a cross marker. */
  goneAt: number | null;
};

export type Verdict = { text: string; tone: "accent" | "good" | "warn" | "bad" };

export type RegistryView = {
  time: number;
  instances: InstanceView[];
  watch: WatchEvent[];
  verdict: Verdict;
};

const round6 = (v: number) => Math.round(v * 1e6) / 1e6;

/** Beat k of an instance (k from 0). */
export const beatTime = (inst: number, interval: number, k: number) => OFFSETS[inst] + k * interval;

/** Consecutive lost beats a healthy instance survives: the beat after them must arrive before the lease ends. */
export function lostBeatsSurvived(ttl: number, interval: number): number {
  return Math.max(0, Math.ceil(ttl / interval) - 2);
}

/** Longest a dead instance can stay listed: it crashed just after a beat. */
export const worstStale = (ttl: number) => ttl;
/** Average over a crash at a random moment between two beats. */
export const averageStale = (ttl: number, interval: number) => ttl - interval / 2;

type Delivery = { time: number; k: number };

type Timeline = {
  crashedAt: number | null;
  lost: Set<number>;
  deliveries: Delivery[];
  /** Key lifecycle, up to the given time. */
  watch: WatchEvent[];
  listed: boolean;
  expiry: number;
  goneAt: number | null;
  deaths: number[];
  /** Pairs of (delivery time, number of consecutive lost beats it followed) for deliveries that saved the key. */
  recoveries: { time: number; run: number }[];
};

function timeline(cfg: Config, events: readonly RegEvent[], inst: InstanceId, t: number): Timeline {
  const past = events.filter((e) => e.inst === inst && e.at <= t).sort((a, b) => a.at - b.at);
  const crash = past.find((e) => e.kind === "crash");
  const crashedAt = crash ? crash.at : null;
  const lost = new Set<number>();
  for (const e of past) {
    if (e.kind !== "lose") continue;
    let k = Math.max(0, Math.floor((e.at - OFFSETS[inst]) / cfg.interval) + 1);
    while (lost.has(k)) k++;
    lost.add(k);
  }
  const deliveries: Delivery[] = [];
  for (let k = 0; ; k++) {
    const time = beatTime(inst, cfg.interval, k);
    if (time > t) break;
    if (lost.has(k)) continue;
    if (crashedAt !== null && time > crashedAt) break;
    deliveries.push({ time, k });
  }

  const watch: WatchEvent[] = [];
  const deaths: number[] = [];
  const recoveries: { time: number; run: number }[] = [];
  const add = (time: number) => watch.push({ inst, kind: "added", time, told: round6(time + WATCH_DELAY) });
  const gone = (time: number) => {
    watch.push({ inst, kind: "gone", time, told: round6(time + WATCH_DELAY) });
    deaths.push(time);
  };
  let alive = true;
  let expiry = cfg.ttl;
  let previousK = -1;
  add(0);
  for (const d of deliveries) {
    if (alive && d.time >= expiry) {
      gone(expiry);
      alive = false;
    }
    if (!alive) {
      alive = true;
      add(d.time);
    } else if (d.k - previousK > 1) {
      recoveries.push({ time: d.time, run: d.k - previousK - 1 });
    }
    expiry = d.time + cfg.ttl;
    previousK = d.k;
  }
  let goneAt: number | null = deaths.length ? deaths[deaths.length - 1] : null;
  if (alive && expiry <= t) {
    gone(expiry);
    alive = false;
    goneAt = expiry;
  }
  return {
    crashedAt,
    lost,
    deliveries,
    watch: watch.filter((w) => w.told <= t),
    listed: alive,
    expiry,
    goneAt: alive ? null : goneAt,
    deaths,
    recoveries,
  };
}

/** Where the lease of an instance ends if it crashes at crashAt and no beat was lost (the last beat sent decides it). */
export function staleWindow(cfg: Config, crashAt: number, inst: InstanceId = 0): { expiry: number; stale: number } {
  let last = 0;
  for (let k = 0; ; k++) {
    const time = beatTime(inst, cfg.interval, k);
    if (time > crashAt) break;
    last = time;
  }
  const expiry = last + cfg.ttl;
  return { expiry, stale: Math.max(0, expiry - crashAt) };
}

function windowBeats(cfg: Config, inst: InstanceId, tl: Timeline, t: number): BeatView[] {
  const from = t - PAST;
  const to = t + FUTURE;
  const out: BeatView[] = [];
  const first = Math.max(0, Math.floor((from - OFFSETS[inst]) / cfg.interval));
  for (let k = first; ; k++) {
    const time = beatTime(inst, cfg.interval, k);
    if (time > to) break;
    if (time < from) continue;
    const afterCrash = tl.crashedAt !== null && time > tl.crashedAt;
    out.push({ time, state: tl.lost.has(k) ? "lost" : afterCrash ? "unsent" : "delivered" });
  }
  return out;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function registryAt(cfg: Config, events: readonly RegEvent[], tIn: number): RegistryView {
  const t = round6(Math.max(0, tIn));
  const tls = ([0, 1, 2] as const).map((i) => timeline(cfg, events, i, t));
  const instances: InstanceView[] = tls.map((tl, i) => {
    const inst = i as InstanceId;
    const stale = tl.crashedAt !== null && tl.listed ? { from: tl.crashedAt, to: tl.expiry } : null;
    return { inst, crashedAt: tl.crashedAt, beats: windowBeats(cfg, inst, tl, t), listed: tl.listed, expiry: tl.expiry, stale, goneAt: tl.goneAt };
  });
  const watch = tls.flatMap((tl) => tl.watch).sort((a, b) => a.told - b.told || a.inst - b.inst);

  // The newest thing that happened decides the banner.
  const candidates: { time: number; verdict: Verdict }[] = [{ time: -1, verdict: defaultVerdict(cfg) }];
  for (const e of events) {
    if (e.at > t || e.kind !== "lose") continue;
    candidates.push({ time: e.at, verdict: { text: `${NAMES[e.inst]} will lose a beat`, tone: "accent" } });
  }
  tls.forEach((tl) => {
    const crashedAt = tl.crashedAt;
    if (crashedAt !== null && crashedAt < tl.expiry) {
      // It crashed while the registry still held its key: the key stays until the lease ends.
      candidates.push(
        t < tl.expiry
          ? { time: crashedAt, verdict: { text: `Dead one listed for ${Math.ceil(round6(tl.expiry - t))} s more`, tone: "warn" } }
          : { time: tl.expiry, verdict: { text: `Gone after ${Math.round(tl.expiry - crashedAt)} s; watcher told`, tone: "good" } }
      );
    }
    for (const d of tl.deaths) {
      if (crashedAt !== null && crashedAt < d && d === tl.expiry) continue;
      candidates.push({ time: d, verdict: { text: "Healthy one expired: lease too short", tone: "bad" } });
    }
    for (const r of tl.recoveries) candidates.push({ time: r.time, verdict: { text: `Survived ${plural(r.run, "lost beat")}`, tone: "good" } });
  });
  candidates.sort((a, b) => a.time - b.time);
  return { time: t, instances, watch, verdict: candidates[candidates.length - 1].verdict };
}

export function defaultVerdict(cfg: Config): Verdict {
  const n = lostBeatsSurvived(cfg.ttl, cfg.interval);
  return { text: `Survives ${plural(n, "lost beat")} in a row`, tone: n >= 2 ? "good" : n === 1 ? "warn" : "bad" };
}

/** Add an event at time t, to a tenth of a second, never in the future. */
export function addEvent(events: readonly RegEvent[], kind: RegEvent["kind"], inst: InstanceId, t: number): RegEvent[] {
  const at = Math.floor(round6(t) * 10) / 10;
  if (kind === "crash" && events.some((e) => e.kind === "crash" && e.inst === inst)) return [...events];
  return [...events, { kind, inst, at }];
}

export const formatSeconds = (s: number) => `${Math.round(s)} s`;

export function ladderFromFraction(ladder: readonly number[], f: number): number {
  const i = Math.round(Math.max(0, Math.min(1, Number.isFinite(f) ? f : 0)) * (ladder.length - 1));
  return ladder[i];
}
export function ladderToFraction(ladder: readonly number[], v: number): number {
  const i = Math.max(0, ladder.indexOf(v));
  return ladder.length > 1 ? i / (ladder.length - 1) : 0;
}
