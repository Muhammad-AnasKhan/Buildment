import type { CustomCanvasSpec } from "../registry";
import { LatencyOrFreshCanvas } from "./LatencyOrFreshCanvas";

// 11.7 beat 3 "No cut: pay in time or in freshness". Model: models/far-copy.ts.
export const sysdesignM11LatencyOrFresh: CustomCanvasSpec = {
  kind: "custom",
  title: "Pay in time or in freshness",
  purpose: "Drag the far copy farther away and switch whether the write waits for it. Waiting costs a round trip; not waiting leaves far readers stale for one trip.",
  limits: "One writer, one far copy, rounded numbers for reasoning, not benchmarks. Real systems also queue, retry and batch.",
  component: LatencyOrFreshCanvas,
};
