import type { CustomCanvasSpec } from "../registry";
import { RingWriteCanvas } from "./RingWriteCanvas";

// 13.2 beat 2, Drag the key, skip repeated machines. Model: ./model.ts.
export const sysdesignM13RingWrite: CustomCanvasSpec = {
  kind: "custom",
  title: "Copies go to distinct machines on the ring",
  purpose: "Drag a key round the ring and tap Write: the copies go to the first three different machines clockwise. Turn off Skip repeats and a machine with several points can take two copies.",
  limits:
    "Five machines with two points each, at made-up positions. A real ring hashes the machine name and many points per machine (chapter 9.3), and real stores also spread copies over racks or zones.",
  component: RingWriteCanvas,
};
