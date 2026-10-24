// 10.2 beat 4: two clocks drift apart in opposite directions and are set right
// at every sync. The gap between them climbs in a sawtooth; while it is above
// the gap between two writes (1 ms), the later write can get the smaller stamp.
// Pure model, no React.

/** Gap between the two writes, in milliseconds. */
export const WRITE_GAP_MS = 1;

/** Drift of each clock in parts per million: one runs this fast, the other this slow. */
export const DRIFT_LADDER = [1, 5, 10, 20, 50, 100] as const;
/** Time between syncs, in seconds: 1 s, 10 s, 1 min, 10 min, 1 h, 1 day. */
export const SYNC_LADDER = [1, 10, 60, 600, 3600, 86400] as const;
export const DEFAULT_DRIFT = 50;
export const DEFAULT_SYNC = 60;

/** Where a value sits on a log rail through the ladder, 0 to 1. */
export function ladderToFraction(ladder: readonly number[], value: number): number {
  const lo = Math.log10(ladder[0]);
  const hi = Math.log10(ladder[ladder.length - 1]);
  const v = Math.log10(Math.max(ladder[0], Math.min(ladder[ladder.length - 1], value)));
  return (v - lo) / (hi - lo);
}

/** The ladder rung nearest to a rail position (log spacing), 0 to 1. */
export function ladderFromFraction(ladder: readonly number[], fraction: number): number {
  const f = Number.isFinite(fraction) ? Math.max(0, Math.min(1, fraction)) : 0;
  const target = f;
  let best = ladder[0];
  let bestD = Infinity;
  for (const rung of ladder) {
    const d = Math.abs(ladderToFraction(ladder, rung) - target);
    if (d < bestD) {
      bestD = d;
      best = rung;
    }
  }
  return best;
}

/** Gap between the two clocks `seconds` after a sync, in milliseconds: 2 x d x t microseconds. */
export function gapMs(driftPpm: number, seconds: number): number {
  return (2 * driftPpm * seconds) / 1000;
}

/** The largest gap in a cycle, just before the next sync. */
export function largestGapMs(driftPpm: number, syncSeconds: number): number {
  return gapMs(driftPpm, syncSeconds);
}

/** Seconds after a sync when the gap passes the write gap: 500 / d. */
export function flipAfterSeconds(driftPpm: number): number {
  return (WRITE_GAP_MS * 1000) / (2 * driftPpm);
}

/** Share of each cycle with the gap above the write gap, 0 to 1. */
export function shareAbove(driftPpm: number, syncSeconds: number): number {
  return Math.max(0, 1 - flipAfterSeconds(driftPpm) / syncSeconds);
}

/** True when the later write can get the smaller stamp, `seconds` after a sync. */
export function flipped(driftPpm: number, seconds: number): boolean {
  return gapMs(driftPpm, seconds) > WRITE_GAP_MS;
}

/** "0.1 ms", "6 ms", "360 ms", "8.64 s": a gap in plain units. */
export function formatGap(ms: number): string {
  if (ms < 0.01) return `${trim(ms, 3)} ms`;
  if (ms < 1) return `${trim(ms, 2)} ms`;
  if (ms < 1000) return `${trim(ms, 1)} ms`;
  return `${trim(ms / 1000, 2)} s`;
}

function trim(value: number, digits: number): string {
  return String(Number(value.toFixed(digits)));
}

/** "1 s", "10 s", "1 min", "10 min", "1 h", "1 day". */
export function formatInterval(seconds: number): string {
  if (seconds >= 86400) return `${seconds / 86400} day`;
  if (seconds >= 3600) return `${seconds / 3600} h`;
  if (seconds >= 60) return `${seconds / 60} min`;
  return `${seconds} s`;
}

/** A share of a cycle as percent text; the top end is cut, never rounded up to 100. */
export function formatShare(share: number): string {
  const pct = share * 100;
  if (pct >= 99) return `${Math.floor(pct * 10) / 10}%`;
  return `${Math.round(pct)}%`;
}

export type DriftVerdict = { text: string; tone: "good" | "warn" | "bad" };

export function driftVerdict(driftPpm: number, syncSeconds: number): DriftVerdict {
  if (largestGapMs(driftPpm, syncSeconds) <= WRITE_GAP_MS) return { text: "Safe: the gap never passes 1 ms", tone: "good" };
  if (syncSeconds >= 86400 && driftPpm > 5) return { text: "A day: wrong almost all the time", tone: "bad" };
  const n = Math.round(flipAfterSeconds(driftPpm));
  return { text: `Flips after ${n} s: ${formatShare(shareAbove(driftPpm, syncSeconds))} of each cycle`, tone: "bad" };
}

/** Teeth drawn in the chart. */
export const TEETH = 3;

/** Where the sweep cursor sits when the picture is still: inside the red part of tooth 2 if there is one. */
export function stillCursor(driftPpm: number, syncSeconds: number): number {
  const share = shareAbove(driftPpm, syncSeconds);
  const within = share > 0 ? 1 - share / 2 : 0.5;
  return (1 + within) / TEETH;
}

/** The sweep position 0 to 1 across the chart at `seconds` of the loop. */
export function sweepAt(seconds: number, period = 7): number {
  const p = seconds % period;
  return (p < 0 ? p + period : p) / period;
}

/** Seconds into the current cycle for a sweep position 0 to 1. */
export function cycleSeconds(sweep: number, syncSeconds: number): number {
  const x = sweep * TEETH;
  return (x - Math.floor(x)) * syncSeconds;
}
