import type { CustomCanvasSpec } from "../registry";
import { ClusterHealCanvas } from "./ClusterHealCanvas";

// 13.3 beat 3, Take nodes down, write, bring them back. Model: ./model.ts.
export const sysdesignM13ClusterHeal: CustomCanvasSpec = {
  kind: "custom",
  title: "Strict and sloppy quorums, with and without hints",
  purpose: "Take nodes down and up, write and read. Under Strict a write needs the usual three nodes; under Sloppy it lands on stand-ins as hints, and a read just after the nodes return can miss it until the hints are handed over.",
  limits:
    "One key, five nodes, a perfect failure detector and made-up times. The hint check runs every 2 seconds here; a real node checks on its own timer. The ring order and the stand-ins are fixed.",
  component: ClusterHealCanvas,
};
