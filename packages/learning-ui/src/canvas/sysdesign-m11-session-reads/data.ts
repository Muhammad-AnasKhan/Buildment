import type { CustomCanvasSpec } from "../registry";
import { SessionReadsCanvas } from "./SessionReadsCanvas";

// 11.5 beat 2 "Switch each promise on and watch". Model: models/session-reads.ts.
export const sysdesignM11SessionReads: CustomCanvasSpec = {
  kind: "custom",
  title: "Switch each promise on",
  purpose: "Amna wrote a comment and Omar only reads it. Switch on my own writes and no going back, and watch where five reads go and which of them show the comment.",
  limits: "One comment, two replicas, made-up lags and read times. The leader is assumed to have every write.",
  component: SessionReadsCanvas,
};
