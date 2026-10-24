import type { CustomCanvasSpec } from "../registry";
import { SufraWindowFillCanvas } from "./SufraWindowFillCanvas";

export const sufraWindowFillAndCutoff: CustomCanvasSpec = {
  kind: "custom",
  title: "Which orders fit this kitchen window?",
  purpose: "Move order arrivals, prep times and kitchen capacity to see why a dish can close before the whole window fills.",
  limits: "This is one dated 13:00 kitchen window with a fixed 20-minute buffer and two dishes. Times are local labels already resolved by the server. It does not model time-zone conversion, payment, concurrent capacity claims or a live clock. At the exact cutoff, an arrival is closed; production must enforce that rule with the server clock at claim time.",
  component: SufraWindowFillCanvas,
};
