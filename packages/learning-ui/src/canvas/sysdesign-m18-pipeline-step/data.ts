import type { CustomCanvasSpec } from "../registry";
import { PipelineStepCanvas } from "./PipelineStepCanvas";

// 18.5 beat 2, "Play: step through, then break a stage". Model: ./model.ts.
export const sysdesignM18PipelineStep: CustomCanvasSpec = {
  kind: "custom",
  title: "Step a commit through the pipeline and break a stage",
  purpose: "Step a commit through six stages and watch the clock. Tap a stage to break it: it turns red, every later stage is skipped, and the clock shows how long you waited to find out. Switch to a shared runner and every time is ten times longer.",
  limits: "Stage times are one cold-cache run of the course sample service on a laptop (lint, tests, build, smoke test, size gate); the publish time is made up. A shared runner is modelled as ten times slower for every stage, which is a guess: real runners differ stage by stage. Queue time before the run starts, caches and parallel stages are left out.",
  component: PipelineStepCanvas,
};
