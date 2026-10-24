import type { CustomCanvasSpec } from "../registry";
import { ProbeStepperCanvas } from "./ProbeStepperCanvas";

// 28.3 beat 2: six follow-ups on Wasla's design. Model: models/probe-design.ts,
// which feeds the house design stepper. Course numbers: models/wasla-numbers.ts.
export const sysdesignM28ProbeStepper: CustomCanvasSpec = {
  kind: "custom",
  title: "Step through six follow-ups",
  purpose: "Six steps answer six follow-ups on Wasla's design: today, 10 times the traffic, the fix, an empty cache, a hot link and the cost. Each step shows the load, the database operations and each part's share of its plan.",
  limits:
    "Wasla is made up and its numbers are course assumptions: 100,000 opens and 1,000 creates a second, an app server planned at 5,000 opens a second and a database node planned at 2,500 operations a second. Cache nodes have limits of their own that the picture ignores, and real traffic is not smooth. The 5 second copy is an example value (chapter 20.4 says a few seconds).",
  component: ProbeStepperCanvas,
};
