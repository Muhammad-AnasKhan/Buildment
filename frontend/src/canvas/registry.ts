import { CANVAS_SLUGS, isCanvasSlug, type CanvasSlug } from "@/shared/canvas/slugs";
import type { FactorSpec } from "./renderers/factor/types";
import type { SequenceSpec } from "./renderers/sequence/types";
import type { StateMachineSpec } from "./renderers/state-machine/types";
import { freshmarketMarkPacked } from "./freshmarket-mark-packed/data";
import { freshmarketOrderStatus } from "./freshmarket-order-status/data";
import { weightedMatrixTwoOffers } from "./weighted-matrix-two-offers/data";

// The closed set of canvases a chapter can embed, keyed by the slugs in
// server/src/shared/canvas/slugs.ts. Each entry is data for one of the three
// renderers; MDX names a slug, never a component or a file. Add a canvas by
// adding its slug to the shared list (then `pnpm sync-shared`), a folder with
// data.ts and spec.md here, and one line below.
export type CanvasSpec = SequenceSpec | StateMachineSpec | FactorSpec;

export const canvasRegistry: Record<CanvasSlug, CanvasSpec> = {
  "weighted-matrix-two-offers": weightedMatrixTwoOffers,
  "freshmarket-order-status": freshmarketOrderStatus,
  "freshmarket-mark-packed": freshmarketMarkPacked,
};

/** The spec for a slug from MDX, or null for anything not registered. */
export function getCanvasSpec(slug: unknown): CanvasSpec | null {
  return isCanvasSlug(slug) ? canvasRegistry[slug] : null;
}

export { CANVAS_SLUGS };
