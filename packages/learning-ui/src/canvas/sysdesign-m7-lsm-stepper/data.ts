import type { CustomCanvasSpec } from "../registry";
import { LsmStepperCanvas } from "./LsmStepperCanvas";

// 7.3 "Step through writes, flushes and merges": a toy LSM tree with a memory
// table of 4 keys. Counters come from models/lsm-stepper.ts. Toy sizes, made up.
export const sysdesignM7LsmStepper: CustomCanvasSpec = {
  kind: "custom",
  title: "Step through writes, flushes and merges",
  purpose: "Step an LSM tree through puts, flushes and merges, and read two counters: how many files a read must open, and how many disk writes each put causes. A toggle adds Bloom filters.",
  limits: "Toy sizes: 4 keys per memory table. Real engines keep levels, many files, a log and background threads.",
  component: LsmStepperCanvas,
};
