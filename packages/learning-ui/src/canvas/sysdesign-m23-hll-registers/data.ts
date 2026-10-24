import type { CustomCanvasSpec } from "../registry";
import { HllRegistersCanvas } from "./HllRegistersCanvas";

// 23.4 beat 4: drag the registers of a HyperLogLog and watch the error band shrink.
// Model: models/hll-registers.ts; standard error 1.04 / sqrt(m) [S114], Redis 12 KB and 0.81% [S115].
export const sysdesignM23HllRegisters: CustomCanvasSpec = {
  kind: "custom",
  title: "HyperLogLog counts different shoppers",
  purpose: "Drag the number of registers of a HyperLogLog and watch the typical error band around 50 million shoppers shrink, while the memory stays tiny next to the 400 MB of an exact set.",
  limits:
    "The error is a typical (standard) error, so a single count can fall outside the dark band, and now and then outside the light one. HyperLogLog cannot list the shoppers or remove one. The formula holds for large counts; tiny counts use a built-in correction. The wobbling diamond is a made-up repeat of the count to show the spread, not a real run. A register takes 6 bits and a KB is 1,024 bytes.",
  component: HllRegistersCanvas,
};
