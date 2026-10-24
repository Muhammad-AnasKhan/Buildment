import type { CustomCanvasSpec } from "../registry";
import { DesignStepperCanvas } from "./DesignStepperCanvas";

// 27.2 beat 4: Lamha's design stepped at peak. Model: models/lamha-design.ts,
// which feeds the house design stepper. Course numbers: models/lamha-numbers.ts.
export const sysdesignM27DesignStepper: CustomCanvasSpec = {
  kind: "custom",
  title: "Step through the design at peak",
  purpose: "Five steps take Lamha's design from one box to object storage, a CDN with a hit rate you can flip, a queue with workers and sharded counters, with the card to watch showing its number at each step.",
  limits:
    "Lamha is made up and its numbers are course assumptions: 12.5 Tbit/s sent at peak, a sending machine planned at 50 Gbit/s, an origin budget of 1 Tbit/s, about 15,600 busy machines at peak and a shard row planned at 500 writes a second. The CDN answers 95 requests in 100 by assumption, and the toggle shows 70. The picture draws one CDN edge, one storage card and one counter. It leaves out copies for safety, many edges with different hit rates, the load balancer, the metadata database and the cost of each part.",
  component: DesignStepperCanvas,
};
