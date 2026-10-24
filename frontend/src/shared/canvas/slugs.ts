// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
// Interactive canvases a chapter may embed as <InteractiveCanvas slug="..." />.
// See agent-ip/10-interactive-canvases.md "Platform integration". The frontend
// registry (frontend/src/canvas/registry.ts) maps each slug to a component and
// a frontend test keeps the two lists identical. A breaking change to a canvas
// gets a new slug, so chapters that already use the old one keep working.
export const CANVAS_SLUGS = [
  "weighted-matrix-two-offers",
  "freshmarket-order-status",
  "freshmarket-mark-packed",
  "freshmarket-cart-split",
  "freshmarket-stock-holds",
  "ticketline-seat-hold-race",
  "rag-hybrid-rerank",
  "retrieval-metrics-at-k",
  "agent-react-loop",
  "langgraph-reducer-merge",
  "sysdesign-two-clocks",
  "sysdesign-clock-band",
  "sysdesign-band-overlap",
  "sysdesign-truetime-bug",
  "sysdesign-commit-wait",
  "sysdesign-comment-flicker",
  "sysdesign-replica-behind",
  "sysdesign-read-routing",
  "sysdesign-position-token",
  "sysdesign-m1-compute-blocks",
  "sysdesign-m1-constraints",
  "sysdesign-m1-data-blocks",
  "sysdesign-m1-driving-number",
  "sysdesign-m1-edge-blocks",
  "sysdesign-m1-front-door",
  "sysdesign-m1-functional-reqs",
  "sysdesign-m1-launch-day",
  "sysdesign-m1-paste-clarify",
  "sysdesign-m1-paste-estimate",
  "sysdesign-m1-paste-failover",
  "sysdesign-m1-paste-ids",
  "sysdesign-m1-paste-no-cache",
  "sysdesign-m1-quality-reqs",
  "sysdesign-m2-across-the-world",
  "sysdesign-m2-average-hides",
  "sysdesign-m2-bursts-wait",
  "sysdesign-m2-cache-vs-memory",
  "sysdesign-m2-chain-fails",
  "sysdesign-m2-chatty-page",
  "sysdesign-m2-disk-fills",
  "sysdesign-m2-fan-out-odds",
  "sysdesign-m2-fan-out-tail",
  "sysdesign-m2-hedged-request",
  "sysdesign-m2-littles-law",
  "sysdesign-m2-peak-hour",
  "sysdesign-m2-queue-grows",
  "sysdesign-m2-region-round-trip",
  "sysdesign-m2-shared-power",
  "sysdesign-m2-ssd-read",
  "sysdesign-m2-storage-piles-up",
  "sysdesign-m2-two-copies",
  "sysdesign-m2-utilisation-knee",
  "sysdesign-m1-requirement-sorter",
  "sysdesign-m1-block-map",
  "sysdesign-m2-knee-play",
  "sysdesign-m2-fan-out-play",
  "sysdesign-m1-design-loop",
  "sysdesign-m2-latency-ladder",
  "sysdesign-m2-estimator",
  "sysdesign-m2-availability-builder",
  "sysdesign-m1-launch-day-illustrated",
] as const;

export type CanvasSlug = (typeof CANVAS_SLUGS)[number];

const canvasSlugSet: ReadonlySet<string> = new Set(CANVAS_SLUGS);

export function isCanvasSlug(value: unknown): value is CanvasSlug {
  return typeof value === "string" && canvasSlugSet.has(value);
}
