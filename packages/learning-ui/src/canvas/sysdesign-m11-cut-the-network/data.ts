import type { CustomCanvasSpec } from "../registry";
import { CutTheNetworkCanvas } from "./CutTheNetworkCanvas";

// 11.7 beat 1 "Cut the cable: refuse or answer". Model: models/cut-network.ts.
export const sysdesignM11CutTheNetwork: CustomCanvasSpec = {
  kind: "custom",
  title: "Cut the cable: refuse or answer",
  purpose: "Cut the cable between two regions, then switch between Refuse and Answer and see whether the copies stay the same or end up with two values.",
  limits: "Three copies and one value. The majority rule is chapter 12.3. CAP is about linearizable reads and writes; weaker promises can answer on both sides.",
  component: CutTheNetworkCanvas,
};
