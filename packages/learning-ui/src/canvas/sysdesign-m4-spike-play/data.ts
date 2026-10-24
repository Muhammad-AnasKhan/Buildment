import type { CustomCanvasSpec } from "../registry";
import { SpikePlayCanvas } from "./SpikePlayCanvas";

// 4.6 "Set the delay, count the drops": 300 requests a second before 8 pm, 600
// from 8 pm; each server does 100 a second; the autoscaler checks every 15
// seconds. The boot times are made up. Model: models/autoscale-gap.ts.
export const sysdesignM4SpikePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Set the delay, count the drops",
  purpose: "Drag the boot time of a new server and pick a 60% or 80% target; requests spill over while new servers start, and the drops are counted.",
  limits:
    "Requests above the ready servers' capacity are counted as dropped; a real fleet would queue them first and time them out later, and clients would retry. The autoscaler reads a CPU-like signal that cannot go above 100%, checks every 15 seconds, only adds servers, and never scales in. The boot times are made up round numbers; real start-up and warm-up times vary widely with the image, the machine and the app. Traffic is a single step from 300 to 600 requests a second, and the run lasts 600 seconds. The time strip shows the first 400 seconds.",
  component: SpikePlayCanvas,
};
