// Request dots on a short lane, for pictures with several lanes side by side.
// Built on the traffic playground's dot stream (flowDots), with a time offset
// per lane so lanes do not move in step, and a fixed still frame for reduced
// motion. Pure functions, no React.

import { flowDots } from "./server-load";

/** Progress values 0 to 1 of the dots on a lane right now. */
export function laneDots(seconds: number, dotsPerSecond: number, still: boolean, lane = 0, travel = 1): number[] {
  if (!Number.isFinite(dotsPerSecond) || dotsPerSecond <= 0) return [];
  if (still) return [0.3, 0.75];
  return flowDots(seconds + lane * 0.37, dotsPerSecond, travel).map((d) => d.progress);
}

/** A busy share (0 to 1 and beyond) as a dot rate that rises gently and never turns the lane into a bar. */
export function dotRate(busy: number, max = 5): number {
  if (!Number.isFinite(busy) || busy <= 0) return 0;
  return Math.min(max, 0.5 + 3.2 * Math.pow(Math.min(busy, 1.4), 0.7));
}
