import type { CustomCanvasSpec } from "../registry";
import { HlcSkewedCanvas } from "./HlcSkewedCanvas";

// 10.5 ("Hybrid logical clocks"), beat 6 "Skew the clocks and watch the stamps".
// Model: models/hlc-skewed.ts.
export const sysdesignM10HlcSkewed: CustomCanvasSpec = {
  kind: "custom",
  title: "Skew the clocks and watch the stamps",
  purpose: "Skew three node clocks, send messages between the nodes, and compare wall-clock stamps with hybrid stamps.",
  limits:
    "Every message takes exactly 10 ms of true time, and each node's clock keeps a fixed offset (no drift). Hybrid stamps here follow the rules of chapter 10.5 only; real systems also reject a message whose time is far ahead of the node's own clock.",
  component: HlcSkewedCanvas,
};
