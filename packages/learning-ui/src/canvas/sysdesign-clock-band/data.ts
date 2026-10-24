import type { CustomCanvasSpec } from "../registry";
import { ClockBandCanvas } from "./ClockBandCanvas";

export const sysdesignClockBand: CustomCanvasSpec = {
  kind: "custom",
  title: "A clock reading is a band around the real time",
  purpose: "Real time and the clock's reading drift apart; an honest clock reports a band that always contains real time.",
  limits: "The clock's error swings smoothly inside epsilon. Real clocks drift between syncs and their uncertainty grows like a sawtooth, from about 1 ms to 7 ms in Spanner's data centres. Epsilon here goes from 1 to 10 ms.",
  component: ClockBandCanvas,
};
