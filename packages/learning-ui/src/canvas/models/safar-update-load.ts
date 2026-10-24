import { withCommas } from "./picture-controls";

// 24.3 beat 3 "Move the dials, see the load". The same stream of location
// reports, planned against a disk database node or a memory node.
// Pure functions, no React.
//
//   reports a second = drivers / seconds between reports
//   disk nodes       = ceil(reports / 2,500)
//   memory nodes     = ceil(reports / 50,000)

export const DRIVER_STEPS = [100_000, 250_000, 500_000, 1_000_000, 2_000_000] as const;
export const GAP_STEPS = [1, 2, 4, 8, 15] as const;
export const DEFAULT_DRIVERS = 1_000_000;
export const DEFAULT_GAP = 4;

/** Writes a second a disk database node is planned at (chapter 20.2). */
export const DISK_NODE_PLAN = 2_500;
/** Updates a second a memory node is planned at (an illustrative course number). */
export const MEMORY_NODE_PLAN = 50_000;
/** Node icons drawn in the store block before "+ n more". */
export const MAX_ICONS = 20;

export type Store = "disk" | "memory";

export type UpdateLoad = {
  reports: number;
  diskNodes: number;
  memoryNodes: number;
};

export function updateLoad(drivers: number, gap: number): UpdateLoad {
  const reports = drivers / gap;
  return { reports, diskNodes: Math.ceil(reports / DISK_NODE_PLAN), memoryNodes: Math.ceil(reports / MEMORY_NODE_PLAN) };
}

export const nodesFor = (r: UpdateLoad, store: Store) => (store === "disk" ? r.diskNodes : r.memoryNodes);

export type Verdict = { text: string; tone: "good" | "warn" | "bad" };

/** At most 38 characters; the number follows the model. */
export function updateVerdict(r: UpdateLoad, store: Store): Verdict {
  const n = nodesFor(r, store);
  if (store === "disk") {
    if (n >= 10) return { text: `${n} disk nodes for old data`, tone: "bad" };
    return { text: "Disk handles it, at a high price", tone: "warn" };
  }
  if (n <= 10) return { text: n === 1 ? "Memory: 1 node carries it" : `Memory: ${n} nodes carry it`, tone: "good" };
  return { text: `Even memory needs ${n} nodes`, tone: "warn" };
}

/** "250,000 /s". */
export const reportsText = (n: number) => `${withCommas(n)} /s`;

export const nodesText = (n: number) => `${withCommas(n)} ${n === 1 ? "node" : "nodes"}`;

/** Icons shown and the count left over for "+ n more". */
export function iconSplit(nodes: number): { shown: number; more: number } {
  const shown = Math.min(MAX_ICONS, nodes);
  return { shown, more: nodes - shown };
}

/** Dots a second along the lane: grows with the log of the reports against 25,000 a second. */
export function laneDotsPerSecond(reports: number): number {
  const ratio = reports / 25_000;
  if (!(ratio > 0)) return 0;
  return Math.max(0.6, Math.min(9, 1.6 * Math.pow(2, 1.1 * Math.log10(ratio) + 0.6)));
}

export function valueText(drivers: number, gap: number, store: Store): string {
  const r = updateLoad(drivers, gap);
  const seconds = gap === 1 ? "second" : "seconds";
  return `${withCommas(drivers)} drivers, a report every ${gap} ${seconds}: ${withCommas(r.reports)} reports a second, ${nodesText(nodesFor(r, store))} on ${store === "disk" ? "disk database" : "memory"}`;
}
