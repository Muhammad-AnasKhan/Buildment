import type { CustomCanvasSpec } from "../registry";
import { PatternStepperCanvas } from "./PatternStepperCanvas";

// 5.3 "Pick a pattern, then crash it". Model: models/cache-pattern.ts, which
// turns each pattern into a design-stepper spec.
export const sysdesignM5PatternStepper: CustomCanvasSpec = {
  kind: "custom",
  title: "Pick a pattern, then crash the cache",
  purpose: "Pick one of five cache patterns and step through a read, a price change, a crash of the cache node and one more read. See what the cache holds, whether the database has the write, and how many reads reach the database.",
  limits:
    "One key (p42) and one app, with the cache node crashing at one moment. Real systems have many keys, many apps and a crash that can land in the middle of a write. Cache-aside and write-through come from published descriptions; read-through, write-back and write-around are shown as the trade-offs they usually carry, and real products differ in details such as how long write-back waits before it flushes.",
  component: PatternStepperCanvas,
};
