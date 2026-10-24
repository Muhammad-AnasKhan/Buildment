// Chapter 4.6: traffic jumps at 8 pm and the fleet cannot grow at once. The
// autoscaler checks every 15 seconds, asks for ceil(ready x reading / target)
// servers, and each new server needs the boot time before it takes traffic.
// Requests above the ready servers' capacity are dropped for the picture (a
// real fleet would queue them first, then time out). Pure functions, no React.

import type { Tone } from "../primitives/tones";

/** Requests a second before and after 8 pm. */
export const BEFORE = 300;
export const AFTER = 600;
/** Requests a second one server can finish. */
export const PER_SERVER = 100;
/** Seconds between autoscaler checks (the Kubernetes default). */
export const CHECK_EVERY = 15;
/** The simulation runs this many seconds from the spike. */
export const RUN_SECONDS = 600;
/** The time strip in the picture shows this many seconds; the longest gap ends at 375 s. */
export const STRIP_SECONDS = 400;

export const BOOT = { min: 0, max: 180, step: 30, default: 90 } as const;
export const BOOT_LADDER: readonly number[] = Array.from({ length: BOOT.max / BOOT.step + 1 }, (_, i) => i * BOOT.step);
export const TARGETS = [0.6, 0.8] as const;
export type Target = (typeof TARGETS)[number];

export function clampBoot(v: number): number {
  if (!Number.isFinite(v)) return BOOT.default;
  return Math.max(BOOT.min, Math.min(BOOT.max, Math.round(v / BOOT.step) * BOOT.step));
}
export const bootToFraction = (v: number) => clampBoot(v) / BOOT.max;
export const bootFromFraction = (f: number) => clampBoot(Math.max(0, Math.min(1, f)) * BOOT.max);

/** The fleet before the spike: enough servers for the old load at the target. */
export function startFleet(target: number): number {
  return Math.ceil(BEFORE / (PER_SERVER * target) - 1e-9);
}

export type FleetServer = {
  /** Seconds from the spike when the server was started; null for the starting fleet. */
  startedAt: number | null;
  readyAt: number;
};

export type SpikeRun = {
  boot: number;
  target: number;
  servers: FleetServer[];
  /** Requests dropped in each second 0 to RUN_SECONDS - 1. */
  dropsPerSecond: number[];
  /** Running total after each second. */
  cumulative: number[];
  totalDrops: number;
  /** Servers ready at the end of the run. */
  finalFleet: number;
  /** The second at which drops stop for good, or null if there were none. */
  lastDropAt: number | null;
};

const EPS = 1e-9;

/**
 * Run the 600 seconds. In each second: servers whose time has come become
 * ready, the second's drops are counted, and on every 15th second the
 * autoscaler reads min(1, load / capacity) and starts the servers it is short
 * of. A server started in second t is ready from second t + max(1, boot): a
 * zero boot time still takes the rest of that second.
 */
export function spikeRun(bootRaw: number, target: number): SpikeRun {
  const boot = clampBoot(bootRaw);
  const servers: FleetServer[] = Array.from({ length: startFleet(target) }, () => ({ startedAt: null, readyAt: 0 }));
  const dropsPerSecond: number[] = [];
  const cumulative: number[] = [];
  let total = 0;
  let lastDropAt: number | null = null;

  for (let t = 0; t < RUN_SECONDS; t++) {
    const ready = servers.filter((s) => s.readyAt <= t).length;
    const capacity = ready * PER_SERVER;
    const drops = Math.max(0, AFTER - capacity);
    dropsPerSecond.push(drops);
    total += drops;
    cumulative.push(total);
    if (drops > 0) lastDropAt = t;

    if (t > 0 && t % CHECK_EVERY === 0) {
      const booting = servers.length - ready;
      const reading = Math.min(1, AFTER / Math.max(capacity, EPS));
      const desired = Math.ceil((ready * reading) / target - EPS);
      const add = desired - ready - booting;
      for (let i = 0; i < add; i++) servers.push({ startedAt: t, readyAt: t + Math.max(1, boot) });
    }
  }
  const finalFleet = servers.filter((s) => s.readyAt <= RUN_SECONDS - 1).length;
  return { boot, target, servers, dropsPerSecond, cumulative, totalDrops: total, finalFleet, lastDropAt };
}

export const formatCount = (n: number) => Math.round(n).toLocaleString("en-US");

/** What the picture shows at second `t`: how many servers are ready and booting, and the drops so far. */
export function spikeAt(run: SpikeRun, t: number) {
  const sec = Math.max(0, Math.min(RUN_SECONDS - 1, Math.floor(t)));
  const ready = run.servers.filter((s) => s.readyAt <= sec).length;
  const booting = run.servers.filter((s) => s.startedAt !== null && s.startedAt <= sec && s.readyAt > sec).length;
  return { ready, booting, capacity: ready * PER_SERVER, dropsNow: run.dropsPerSecond[sec], dropsSoFar: run.cumulative[sec] };
}

export function spikeVerdict(run: SpikeRun): { text: string; tone: Tone } {
  if (run.totalDrops === 0) return { text: "No spike drops: headroom covered it", tone: "good" };
  return { text: `Dropped ${formatCount(run.totalDrops)} requests in the gap`, tone: run.totalDrops >= 10_000 ? "bad" : "warn" };
}
