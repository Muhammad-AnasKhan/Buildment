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
  "freelance-job-flowchart",
  "job-application-status",
  "check-the-ai-answer",
  "sysdesign-truetime-commit-wait",
  "sysdesign-replica-lag",
  "five-whys-chain",
  "laptop-charging-detective",
  "after-is-not-because-timeline",
  "and-then-what-chain",
  "bakery-bottleneck-moves",
  "basel-third-factor-split",
  "comparison-group-video-test",
  "drift-back-to-normal",
  "fishbone-check-evidence",
  "halving-booking-chain",
  "huda-causes-add-up",
  "huda-order-drop-chain",
  "huda-review-loop",
  "is-and-is-not-fridge",
  "one-change-price-weeks",
  "order-pile-stock-flow",
  "pilot-with-a-stop-rule",
  "review-without-blame-steps",
  "stop-early-banner-test",
  "symptom-fix-loop",
  "target-looks-good",
  "weak-strong-fixes",
  "who-got-the-survey",
] as const;

export type CanvasSlug = (typeof CANVAS_SLUGS)[number];

const canvasSlugSet: ReadonlySet<string> = new Set(CANVAS_SLUGS);

export function isCanvasSlug(value: unknown): value is CanvasSlug {
  return typeof value === "string" && canvasSlugSet.has(value);
}
