import type { CustomCanvasSpec } from "../registry";
import { ReadRoutingCanvas } from "./ReadRoutingCanvas";

export const sysdesignReadRouting: CustomCanvasSpec = {
  kind: "custom",
  title: "Three ways to route Amna's reads",
  purpose: "The same three refreshes under three routing rules: any replica, the leader, or a replica at her position.",
  limits: "One writer, one comment, and fixed lags of 150 ms and 600 ms. 'Any replica' takes turns instead of choosing at random. A real router also has to cap how many reads fall back to the leader during a lag spike, which this picture leaves out.",
  component: ReadRoutingCanvas,
};
