// Beat 2 of 10.6: the clock's reading as a band around real time. Real time
// wanders across a 30 ms axis; the clock's error drifts but always stays
// inside epsilon, so the band always contains the real time.

export const BAND_AXIS_MS = 30;
export const EPS_BOUNDS = { min: 1, max: 10, step: 0.5, default: 4 } as const;

export function clampEpsilon(value: number): number {
  if (!Number.isFinite(value)) return EPS_BOUNDS.default;
  const stepped = Math.round(value / EPS_BOUNDS.step) * EPS_BOUNDS.step;
  return Math.max(EPS_BOUNDS.min, Math.min(EPS_BOUNDS.max, stepped));
}

export type BandFrame = { realMs: number; clockMs: number; earliest: number; latest: number; contains: boolean };

export function clockBandFrame(seconds: number, epsilon: number): BandFrame {
  const eps = clampEpsilon(epsilon);
  const t = !Number.isFinite(seconds) || seconds >= 1e5 ? 2.2 : seconds;
  const realMs = 13 + 5 * Math.sin(t * 0.5);
  const error = eps * 0.85 * Math.sin(t * 1.1);
  const clockMs = realMs + error;
  const earliest = clockMs - eps;
  const latest = clockMs + eps;
  return { realMs, clockMs, earliest, latest, contains: earliest <= realMs && realMs <= latest };
}
