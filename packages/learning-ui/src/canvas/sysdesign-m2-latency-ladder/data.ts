import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import type { RulerBand } from "../primitives/log-ruler";
import { LatencyLadderCanvas, type LadderRung } from "./LatencyLadderCanvas";

// 2.2 "Latency numbers you should feel". Values match the chapter: napkin-math
// (2026) for the SSD, network, query and disk rows [S3], Colin Scott's model
// for the L1 and memory rows [S2]. 1 ns of real time lasts 1 human second.
export const LATENCY_RUNGS: readonly LadderRung[] = [
  { id: "l1", name: "L1 cache hit", short: "L1 hit", plural: "L1 hits", ns: 1, place: "L1 cache", kind: "cache" },
  { id: "memory", name: "Memory read", short: "Memory read", plural: "memory reads", ns: 100, place: "Memory", kind: "worker" },
  { id: "switch", name: "Context switch", short: "Context switch", plural: "context switches", ns: 10_000, place: "Kernel", kind: "worker" },
  { id: "ssd", name: "SSD read", short: "SSD read", plural: "SSD reads", ns: 100_000, place: "SSD", kind: "database" },
  { id: "region", name: "Region trip", short: "Region trip", plural: "region trips", ns: 250_000, place: "Next door", kind: "server" },
  { id: "redis", name: "Redis query", short: "Redis query", plural: "Redis queries", ns: 500_000, place: "Redis", kind: "cache" },
  { id: "disk", name: "Disk seek", short: "Disk seek", plural: "disk seeks", ns: 10_000_000, place: "Hard disk", kind: "database" },
  { id: "atlantic", name: "To US East", short: "Atlantic trip", plural: "Atlantic trips", ns: 80_000_000, place: "US East", kind: "cdn" },
  { id: "asia", name: "To Singapore", short: "Asia trip", plural: "Asia trips", ns: 160_000_000, place: "Singapore", kind: "cdn" },
];

/** Human-time words along the ruler, in nanoseconds (= human seconds). */
export const LATENCY_BANDS: readonly RulerBand[] = [
  { label: "seconds", upTo: 60 },
  { label: "minutes", upTo: 3_600 },
  { label: "hours", upTo: 86_400 },
  { label: "days", upTo: 2_628_000 },
  { label: "months", upTo: 31_536_000 },
  { label: "years", upTo: 1e9 },
];

const TITLE = "The latency ladder in human time";
const PURPOSE = "Tap two rungs of the ladder. The slower one runs as a trip while a counter shows how many of the faster one fit inside it.";
const LIMITS =
  "Values are rounded estimates from napkin-math (2026) and Colin Scott's model, and real machines differ by 2 to 3 times. The slower trip always takes about 3 seconds on screen; the faster one moves at the true ratio, so above about 12 it is drawn as a stream. Context switch and disk seek are waits, not trips to a place, but they are drawn the same way.";

function LatencyLadderBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(LatencyLadderCanvas, {
    ...props,
    rungs: LATENCY_RUNGS,
    bands: LATENCY_BANDS,
    min: 1,
    max: 1e9,
    start: { pinned: "memory", current: "asia" },
  });
}

export const sysdesignM2LatencyLadder: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: LatencyLadderBeat,
};
