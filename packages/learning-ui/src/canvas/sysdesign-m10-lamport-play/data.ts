import type { CustomCanvasSpec } from "../registry";
import { LamportPlayCanvas } from "./LamportPlayCanvas";

// 10.3 ("Lamport clocks"), beat 4 "Predict each counter before it appears".
// Model: models/lamport-play.ts.
export const sysdesignM10LamportPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Predict each Lamport counter",
  purpose: "Give three nodes events and messages, and guess each receiver's new counter before it appears.",
  limits:
    "Three nodes and made-up starting counters (0, 5 and 0). A message always arrives, and at once; real networks lose, delay and reorder messages. The picture shows the last six events and then scrolls.",
  component: LamportPlayCanvas,
};
