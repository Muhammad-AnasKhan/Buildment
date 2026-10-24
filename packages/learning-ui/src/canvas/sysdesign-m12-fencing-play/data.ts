import type { CustomCanvasSpec } from "../registry";
import { FencingPlayCanvas } from "./FencingPlayCanvas";

// 12.4 ("Leader election, leases and fencing tokens"), beat 3 "Turn on fencing, drag the pause".
// Model: models/fencing-play.ts.
export const sysdesignM12FencingPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Turn on fencing, drag the pause",
  purpose: "Drag how long the old leader sleeps, switch the storage check on or off, and see whose write is kept.",
  limits:
    "One story with fixed numbers: a lease of 10 seconds, A frozen from 2 seconds, B taking over at 10.5 seconds and writing at 11 seconds. A writes the moment it wakes. Storage sees only these two writes, and a tie at 11 seconds goes to B first. Real pauses, clocks and networks are messier.",
  component: FencingPlayCanvas,
};
