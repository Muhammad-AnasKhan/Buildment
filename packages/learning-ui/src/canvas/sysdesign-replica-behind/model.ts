// Beat 2 of 8.4: the leader's log fills one box per write (one write every
// 100 ms); each replica applies the same boxes later, by its lag. Replica 1
// lags a quarter as much as replica 2, as in the rest of the chapter.

export const WRITE_EVERY_MS = 100;
export const LOG_LENGTH = 10;
export const LAG_BOUNDS = { min: 0, max: 1500, step: 50, default: 600 } as const;
/** Animation seconds per model millisecond. */
export const SECONDS_PER_MS = 0.004;

export function clampLag(value: number): number {
  if (!Number.isFinite(value)) return LAG_BOUNDS.default;
  return Math.max(LAG_BOUNDS.min, Math.min(LAG_BOUNDS.max, Math.round(value / LAG_BOUNDS.step) * LAG_BOUNDS.step));
}

const position = (ms: number) => Math.max(0, Math.min(LOG_LENGTH, Math.floor(ms / WRITE_EVERY_MS)));

/** Model time in one loop: the leader fills its log, the replicas catch up, then a pause. */
export function loopMs(lagMs: number): number {
  return LOG_LENGTH * WRITE_EVERY_MS + clampLag(lagMs) + 500;
}

export type BehindFrame = { leader: number; r1: number; r2: number; lagMs: number; r1LagMs: number; behindWrites: number };

export function replicaBehindFrame(seconds: number, lagMs: number): BehindFrame {
  const lag = clampLag(lagMs);
  const r1Lag = Math.round(lag / 4);
  const total = loopMs(lag);
  // Reduced motion: a moment when the leader is full and replica 2 has not caught up.
  const ms = !Number.isFinite(seconds) || seconds >= 1e5 ? LOG_LENGTH * WRITE_EVERY_MS : (seconds / SECONDS_PER_MS) % total;
  return {
    leader: position(ms),
    r1: position(ms - r1Lag),
    r2: position(ms - lag),
    lagMs: lag,
    r1LagMs: r1Lag,
    behindWrites: Math.round(lag / WRITE_EVERY_MS),
  };
}
