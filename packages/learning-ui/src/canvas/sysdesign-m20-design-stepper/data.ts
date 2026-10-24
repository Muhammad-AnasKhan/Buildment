import type { CustomCanvasSpec } from "../registry";
import { DesignStepperCanvas } from "./DesignStepperCanvas";

// 20.2 beat 3: Wasla's design stepped at peak. Model: models/wasla-design.ts,
// which feeds the house design stepper. Course numbers: models/wasla-numbers.ts.
export const sysdesignM20DesignStepper: CustomCanvasSpec = {
  kind: "custom",
  title: "Step through the design at peak",
  purpose: "Five steps take Wasla's design from one box to app servers, a cache, partitions and click counting off the path, with the database card showing how many times its plan it carries.",
  limits:
    "Wasla is made up and its numbers are course assumptions: 100,000 redirects and 1,000 creates a second at peak, an app server planned at 5,000 redirects a second and a database node planned at 2,500 operations a second. The cache is assumed to answer 9 in 10 redirects. The picture draws one database card with its partitions as small boxes; it leaves out copies of each partition for safety, the cost of more nodes, uneven partitions and the load balancer in front of the apps.",
  component: DesignStepperCanvas,
};
