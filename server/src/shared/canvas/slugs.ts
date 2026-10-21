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
] as const;

export type CanvasSlug = (typeof CANVAS_SLUGS)[number];

const canvasSlugSet: ReadonlySet<string> = new Set(CANVAS_SLUGS);

export function isCanvasSlug(value: unknown): value is CanvasSlug {
  return typeof value === "string" && canvasSlugSet.has(value);
}
