import type { Tone } from "../primitives/tones";
import { withCommas } from "../models/picture-controls";

// 13.4 beat 5: one table provisioned for 2,000 write units a second in four
// partitions. Even share 500 each; three background partitions take 200 each
// (600 in all); the hot partition takes d. Every partition has a ceiling of
// 1,000 writes a second that no spare capacity lifts [S40]. The share rule and
// the borrowing rule are illustrative. Pure, no React.

export const PROVISIONED = 2000;
export const PARTITIONS = 4;
export const SHARE = PROVISIONED / PARTITIONS;
export const BACKGROUND_EACH = 200;
export const BACKGROUND = BACKGROUND_EACH * (PARTITIONS - 1);
export const CEILING = 1000;

export const DEMAND_MAX = 2000;
export const DEMAND_STEP = 100;
export const DEMAND_PAGE = 500;
export const DEFAULT_DEMAND = 800;

export type Outcome = {
  /** The most the hot partition may accept right now. */
  limit: number;
  accepted: number;
  rejected: number;
  /** Writes per second the whole table takes. */
  tableUse: number;
};

export function snapDemand(d: number): number {
  const v = Number.isFinite(d) ? d : 0;
  return Math.max(0, Math.min(DEMAND_MAX, Math.round(v / DEMAND_STEP) * DEMAND_STEP));
}

export function outcome(demand: number, adaptive: boolean): Outcome {
  const d = snapDemand(demand);
  const limit = adaptive ? Math.min(CEILING, PROVISIONED - BACKGROUND) : SHARE;
  const accepted = Math.min(d, limit);
  return { limit, accepted, rejected: d - accepted, tableUse: BACKGROUND + accepted };
}

export function verdict(demand: number, adaptive: boolean): { text: string; tone: Tone } {
  const o = outcome(demand, adaptive);
  const d = snapDemand(demand);
  if (!adaptive) {
    return d <= SHARE
      ? { text: "Within its share: nothing rejected", tone: "good" }
      : { text: `Rejects ${withCommas(o.rejected)}/s: share is only ${SHARE}`, tone: "bad" };
  }
  return d <= CEILING
    ? { text: "Borrowed spare capacity: none rejected", tone: "good" }
    : { text: `Ceiling ${withCommas(CEILING)}/s: ${withCommas(o.rejected)} still rejected`, tone: "bad" };
}

export function describeDemand(demand: number, adaptive: boolean): string {
  const o = outcome(demand, adaptive);
  return `hot key ${withCommas(snapDemand(demand))} writes a second, ${withCommas(o.rejected)} rejected`;
}

/** Share of the bar rejected, 0 to 1. */
export const rejectedShare = (o: Outcome): number => (o.accepted + o.rejected === 0 ? 0 : o.rejected / (o.accepted + o.rejected));
